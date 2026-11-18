"""B 站公开接口的最小客户端：只用 Python 标准库，Windows / macOS 通用。

合规约束（见项目交接总结）：
- 只读公开接口，慢速请求（每次请求间隔随机 3–6 秒）
- 登录 Cookie 只从本地文件 / 环境变量读取，绝不写入仓库
- 不保存评论者用户名，只保存评论文本和点赞数
"""
import gzip
import html
import hashlib
import http.cookiejar
import json
import os
import random
import re
import time
import urllib.error
import urllib.parse
import urllib.request
import zlib
from functools import reduce

UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
)
MIN_DELAY, MAX_DELAY = 3.0, 6.0

# WBI 签名的混淆表（来源：社区整理的 bilibili-API-collect 文档）
MIXIN_KEY_ENC_TAB = [
    46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49,
    33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40,
    61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11,
    36, 20, 34, 44, 52,
]


class BiliError(RuntimeError):
    pass


def mixin_key(img_key, sub_key):
    orig = img_key + sub_key
    return reduce(lambda s, i: s + orig[i], MIXIN_KEY_ENC_TAB, "")[:32]


def sign_wbi(params, img_key, sub_key, now=None):
    """返回带 wts 和 w_rid 的新参数字典（不修改传入的 params）。"""
    signed = dict(params)
    signed["wts"] = int(now if now is not None else time.time())
    signed = dict(sorted(signed.items()))
    signed = {k: "".join(c for c in str(v) if c not in "!'()*") for k, v in signed.items()}
    query = urllib.parse.urlencode(signed)
    w_rid = hashlib.md5((query + mixin_key(img_key, sub_key)).encode()).hexdigest()
    return {**signed, "w_rid": w_rid}


def load_cookie_string(path):
    """优先读环境变量 BILI_COOKIE，其次读本地 cookie 文件（已在 .gitignore 中）。"""
    env = os.environ.get("BILI_COOKIE", "").strip()
    if env:
        return env
    if path and os.path.exists(path):
        with open(path, encoding="utf-8") as f:
            return f.read().strip()
    return ""


class BiliClient:
    def __init__(self, cookie="", min_delay=MIN_DELAY, max_delay=MAX_DELAY):
        self.cookie = cookie
        self.min_delay, self.max_delay = min_delay, max_delay
        self.jar = http.cookiejar.CookieJar()
        self.opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(self.jar))
        self._last = 0.0
        self._wbi = None
        self.logged_in = False

    # ---------- 底层请求 ----------
    def _wait(self):
        gap = random.uniform(self.min_delay, self.max_delay)
        sleep = self._last + gap - time.time()
        if sleep > 0:
            time.sleep(sleep)
        self._last = time.time()

    def _get(self, url, params=None, referer="https://www.bilibili.com/", raw=False):
        if params:
            url = url + "?" + urllib.parse.urlencode(params)
        headers = {"User-Agent": UA, "Referer": referer, "Accept-Encoding": "gzip, deflate"}
        if self.cookie:
            headers["Cookie"] = self.cookie
        self._wait()
        req = urllib.request.Request(url, headers=headers)
        try:
            with self.opener.open(req, timeout=20) as resp:
                body = resp.read()
                enc = resp.headers.get("Content-Encoding", "")
        except urllib.error.HTTPError as e:
            raise BiliError(f"HTTP {e.code}：{url}（412 通常表示请求过快或缺少 Cookie）") from e
        except urllib.error.URLError as e:
            raise BiliError(f"网络错误：{e.reason}（需要在国内网络下运行）") from e
        if enc == "gzip":
            body = gzip.decompress(body)
        elif enc == "deflate":
            body = zlib.decompress(body)
        if raw:
            return body
        data = json.loads(body.decode("utf-8"))
        if data.get("code") != 0:
            raise BiliError(f"接口返回 code={data.get('code')} {data.get('message')}：{url}")
        return data.get("data")

    def warm_up(self):
        """访问首页拿匿名 Cookie（buvid3），再取 WBI 密钥。"""
        self._get("https://www.bilibili.com/", raw=True)
        nav_url = "https://api.bilibili.com/x/web-interface/nav"
        req_headers = {"User-Agent": UA, "Referer": "https://www.bilibili.com/"}
        if self.cookie:
            req_headers["Cookie"] = self.cookie
        self._wait()
        with self.opener.open(urllib.request.Request(nav_url, headers=req_headers), timeout=20) as r:
            body = r.read()
            if r.headers.get("Content-Encoding") == "gzip":
                body = gzip.decompress(body)
        nav = json.loads(body.decode("utf-8"))  # 未登录时 code=-101，但仍返回 wbi_img
        data = nav.get("data") or {}
        self.logged_in = bool(data.get("isLogin"))
        img = data.get("wbi_img") or {}
        stem = lambda u: os.path.splitext(os.path.basename(urllib.parse.urlparse(u).path))[0]
        if not img.get("img_url"):
            raise BiliError("无法获取 WBI 密钥")
        self._wbi = (stem(img["img_url"]), stem(img["sub_url"]))

    def _get_wbi(self, url, params):
        if not self._wbi:
            self.warm_up()
        return self._get(url, sign_wbi(params, *self._wbi))

    # ---------- 业务接口 ----------
    def search_videos(self, keyword, page=1, order="totalrank"):
        data = self._get_wbi(
            "https://api.bilibili.com/x/web-interface/wbi/search/type",
            {"search_type": "video", "keyword": keyword, "page": page, "order": order},
        )
        return [
            {"bvid": r["bvid"], "title": strip_tags(r.get("title", ""))}
            for r in (data or {}).get("result") or []
            if r.get("bvid")
        ]

    def video_info(self, bvid):
        d = self._get("https://api.bilibili.com/x/web-interface/view", {"bvid": bvid})
        st = d.get("stat", {})
        return {
            "bvid": d["bvid"],
            "aid": d["aid"],
            "cid": d.get("cid"),
            "title": d.get("title", ""),
            "desc": (d.get("desc") or "")[:300],
            "owner": (d.get("owner") or {}).get("name", ""),
            "pubdate": d.get("pubdate", 0),
            "duration": d.get("duration", 0),
            "pages": len(d.get("pages") or []),
            "season": bool(d.get("ugc_season")),
            "view": st.get("view", 0),
            "favorite": st.get("favorite", 0),
            "like": st.get("like", 0),
            "coin": st.get("coin", 0),
            "share": st.get("share", 0),
            "reply": st.get("reply", 0),
            "danmaku": st.get("danmaku", 0),
        }

    def hot_comments(self, aid, limit=20):
        """按点赞排序的热门评论，只保留文本和点赞数（不保存用户名）。"""
        d = self._get("https://api.bilibili.com/x/v2/reply",
                      {"type": 1, "oid": aid, "sort": 2, "ps": limit, "pn": 1})
        replies = (d or {}).get("replies") or []
        return [
            {"text": (r.get("content") or {}).get("message", "")[:200], "like": r.get("like", 0)}
            for r in replies
        ]

    def subtitle_text(self, aid, cid):
        """字幕（含 AI 字幕）需要登录 Cookie；拿不到时返回空字符串。"""
        if not cid:
            return ""
        d = self._get_wbi("https://api.bilibili.com/x/player/wbi/v2", {"aid": aid, "cid": cid})
        subs = ((d or {}).get("subtitle") or {}).get("subtitles") or []
        if not subs:
            return ""
        zh = next((s for s in subs if "zh" in s.get("lan", "")), subs[0])
        url = zh.get("subtitle_url", "")
        if url.startswith("//"):
            url = "https:" + url
        if not url:
            return ""
        body = json.loads(self._get(url, raw=True).decode("utf-8"))
        return "\n".join(line.get("content", "") for line in body.get("body", []))


def strip_tags(s):
    return html.unescape(re.sub(r"<[^>]+>", "", s))
