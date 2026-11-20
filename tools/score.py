"""第 5 步：给候选视频打分，生成审核页用的数据。

用法：python tools/score.py [--topic 5g] [--keep 10]

输入：
  tools/out/bili/<主题>-<模块>.json         bili_fetch.py 的抓取结果
  tools/out/mentions-<主题>.json（可选）    跨平台提及：{"BV号": 次数}，来自知乎 / 通信人家园
  tools/out/claude_review-<主题>.json（可选）Claude 读字幕后的审核：
        {"BV号": {"relevant": true, "accurate": true, "depth": "入门|进阶|深入", "reason": "一句推荐理由"}}
输出：
  tools/out/candidates-<主题>.js            审核页 tools/review.html 读取
"""
import argparse
import glob
import json
import math
import os
import re
import time

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "out")

# 评论里的推荐话语：说明“有人看完觉得好、并且会回来看”
PRAISE_PATTERNS = [
    r"讲[得的]?(最|很|太|超|非常)?(清楚|清晰|明白|透彻|好)", r"通俗易懂", r"深入浅出", r"醍醐灌顶",
    r"(终于|一下子?)(懂|明白|搞懂|理解)", r"(工作|入职|上班)(以?后|了).{0,6}(回来|再)看", r"回来(复习|看)",
    r"干货", r"宝藏", r"良心", r"比.{0,6}(老师|教材|书).{0,4}(讲得|好)", r"收藏(了|夹)",
    r"(必看|强烈推荐|推荐给)", r"(面试|考研|入职).{0,6}(用|帮|靠)", r"一遍就懂", r"神作|神仙",
]
PRAISE_RE = re.compile("|".join(PRAISE_PATTERNS))

WEIGHTS = {
    "fav_rate": 35,      # 收藏率（收藏 ÷ 播放），权重最高
    "praise": 15,        # 评论推荐话语
    "consistency": 15,   # 被同一模块的多个搜索词命中
    "cross": 20,         # 跨平台被提到
    "engagement": 8,     # 点赞 + 投币率
    "popularity": 7,     # 播放量（对数）
    "series": 5,         # 系列 / 合集
}
FAV_RATE_FULL = 0.04     # 收藏率达到 4% 记满分（教程类视频的高水平）
OUTDATED_BEFORE = {"5g": 2019}  # 早于该年份的视频降权（R15 2018 年底冻结）

# 领域关键词：标题和简介里一个都没有的视频基本不对题（如“PDU”搜到电源插座、PMP 证书）
TOPIC_KEYWORDS = {
    "5g": ["5g", "nr", "lte", "4g", "6g", "5.5g", "3gpp", "通信", "信令", "核心网", "基站", "无线",
           "移动网", "蜂窝", "网优", "射频", "ofdm", "mimo", "调制", "信道", "天线", "波束", "amf",
           "smf", "upf", "rrc", "nas", "ims", "vonr", "volte", "gnb", "空口", "协议栈", "切片"],
}


def is_on_topic(text, topic):
    words = TOPIC_KEYWORDS.get(topic)
    if not words:
        return True
    low = text.lower()
    return any(w in low for w in words)


def clamp01(x):
    return max(0.0, min(1.0, x))


def praise_quotes(comments, limit=3, max_len=40):
    hits = [c for c in comments if PRAISE_RE.search(c.get("text", ""))]
    hits.sort(key=lambda c: -c.get("like", 0))
    quotes = []
    for c in hits[:limit]:
        t = re.sub(r"\s+", " ", c["text"]).strip()
        quotes.append(t if len(t) <= max_len else t[: max_len - 1] + "…")
    return hits, quotes


def score_video(v, n_queries, query_hits, mentions, topic, review=None):
    view = max(v.get("view", 0), 1)
    fav_rate = v.get("favorite", 0) / view
    hits, quotes = praise_quotes(v.get("comments", []))
    parts = {
        "fav_rate": clamp01(fav_rate / FAV_RATE_FULL),
        "praise": clamp01(sum(1 + math.log10(c.get("like", 0) + 1) for c in hits) / 8),
        "consistency": clamp01((query_hits - 1) / max(n_queries - 1, 1) * 2),
        "cross": clamp01(mentions / 3),
        "engagement": clamp01((v.get("like", 0) + 2 * v.get("coin", 0)) / view / 0.10),
        "popularity": clamp01(math.log10(view) / 6),
        "series": 1.0 if (v.get("pages", 1) > 1 or v.get("season")) else 0.0,
    }
    score = sum(WEIGHTS[k] * parts[k] for k in WEIGHTS)

    flags = []
    year = time.localtime(v.get("pubdate", 0)).tm_year if v.get("pubdate") else None
    cutoff = OUTDATED_BEFORE.get(topic)
    if cutoff and year and year < cutoff:
        score -= 15
        flags.append(f"{year} 年发布，可能过时")
    if v.get("duration", 0) and v["duration"] < 180:
        score -= 10
        flags.append("时长不足 3 分钟")
    if view < 1000:
        score *= 0.7
        flags.append("播放量低，数据不可靠")
    if not is_on_topic(v.get("title", "") + " " + v.get("desc", ""), topic):
        score *= 0.2
        flags.append("标题和简介里没有通信相关词，可能不对题")
    if review:
        if review.get("relevant") is False:
            score *= 0.2
            flags.append("Claude 审核：不对题")
        if review.get("accurate") is False:
            score *= 0.3
            flags.append("Claude 审核：有技术错误")

    return {
        "score": round(score, 1),
        "parts": {k: round(p, 2) for k, p in parts.items()},
        "fav_rate": round(fav_rate * 100, 2),
        "praise": quotes,
        "praise_count": len(hits),
        "year": year,
        "flags": flags,
    }


def fmt_duration(sec):
    sec = int(sec or 0)
    h, m = divmod(sec // 60, 60)
    return f"{h}小时{m}分" if h else f"{m}分钟"


def build_module(cache, topic, mentions, reviews, keep):
    hits = cache.get("hits", {})
    n_queries = len(cache.get("queries_done", [])) or 1
    out = []
    for bvid, v in cache.get("videos", {}).items():
        q = len(hits.get(bvid, {}).get("queries", {})) or 1
        # 审核可以按模块写（"s2-ssb:BV…"），优先于通用审核（"BV…"）：同一门大课可能只对部分模块对题
        review = reviews.get(f"{cache.get('module')}:{bvid}") or reviews.get(bvid)
        s = score_video(v, n_queries, q, mentions.get(bvid, 0), topic, review)
        out.append({
            "bvid": bvid,
            "url": f"https://www.bilibili.com/video/{bvid}",
            "title": v.get("title", ""),
            "owner": v.get("owner", ""),
            "duration": fmt_duration(v.get("duration")),
            "pages": v.get("pages", 1),
            "view": v.get("view", 0),
            "favorite": v.get("favorite", 0),
            "queries": sorted(hits.get(bvid, {}).get("queries", {})),
            "has_subtitle": v.get("has_subtitle", False),
            "review": review or None,
            **s,
        })
    out.sort(key=lambda x: -x["score"])
    return out[:keep]


def main():
    ap = argparse.ArgumentParser(description="候选视频打分")
    ap.add_argument("--topic", default="5g")
    ap.add_argument("--keep", type=int, default=10, help="每个模块保留前几名供审核")
    args = ap.parse_args()

    def load(path, default):
        if os.path.exists(path):
            with open(path, encoding="utf-8") as f:
                return json.load(f)
        return default

    mentions = load(os.path.join(OUT, f"mentions-{args.topic}.json"), {})
    reviews = load(os.path.join(OUT, f"claude_review-{args.topic}.json"), {})
    files = sorted(glob.glob(os.path.join(OUT, "bili", f"{args.topic}-*.json")))
    if not files:
        raise SystemExit("没有抓取结果，请先运行 python tools/bili_fetch.py")

    result = {}
    for path in files:
        cache = load(path, {})
        result[cache.get("module")] = build_module(cache, args.topic, mentions, reviews, args.keep)

    target = os.path.join(OUT, f"candidates-{args.topic}.js")
    payload = json.dumps({"topic": args.topic, "generated": time.strftime("%Y-%m-%d %H:%M"),
                          "modules": result}, ensure_ascii=False, indent=1)
    with open(target, "w", encoding="utf-8") as f:
        f.write("window.CANDIDATES = " + payload + ";\n")
    total = sum(len(v) for v in result.values())
    print(f"已生成 {target}：{len(result)} 个模块，{total} 个候选。用浏览器打开 tools/review.html 审核。")


if __name__ == "__main__":
    main()
