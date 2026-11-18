"""第 2 步：按模块搜索 B 站候选视频，抓取统计、热门评论和字幕。

用法（在项目根目录下运行）：
    python tools/bili_fetch.py                       # 抓全部模块
    python tools/bili_fetch.py --modules s4-pdu s4-qos
    python tools/bili_fetch.py --per-query 10 --top 15

结果按模块缓存在 tools/out/bili/<模块>.json，中断后重跑会跳过已完成的部分。
字幕需要登录 Cookie：把浏览器里 bilibili.com 的 Cookie 字符串存到 tools/bili_cookie.txt，
或设置环境变量 BILI_COOKIE。不提供也能跑，只是没有字幕和部分评论。
"""
import argparse
import json
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bili_client import BiliClient, BiliError, load_cookie_string  # noqa: E402
from score import is_on_topic  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.join(HERE, "out", "bili")
SUB_DIR = os.path.join(HERE, "out", "subs")
COOKIE_FILE = os.path.join(HERE, "bili_cookie.txt")


def load_json(path, default):
    if not os.path.exists(path):
        return default
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def save_json(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    os.replace(tmp, path)


def log(msg):
    print(time.strftime("%H:%M:%S"), msg, flush=True)


BACKOFF_SECONDS = (20, 45)


def search_with_backoff(client, q):
    """连续搜索过快时 B 站会悄悄返回空结果：遇到空结果先等一会儿再试。"""
    for attempt in range(len(BACKOFF_SECONDS) + 1):
        try:
            results = client.search_videos(q)
        except BiliError as e:
            log(f"  搜索失败「{q}」：{e}")
            results = []
        if results or attempt == len(BACKOFF_SECONDS):
            return results
        wait = BACKOFF_SECONDS[attempt]
        log(f"  搜索「{q}」返回空结果，可能触发限流，{wait} 秒后重试")
        time.sleep(wait)
    return []


def search_module(client, queries, per_query, cache):
    """每个搜索词取前 per_query 条；记录每个视频被哪些搜索词命中（重复命中是重要信号）。"""
    hits = cache.setdefault("hits", {})
    done = set(cache.setdefault("queries_done", []))
    for q in queries:
        if q in done:
            continue
        results = search_with_backoff(client, q)[:per_query]
        if not results:
            log(f"  搜索「{q}」仍为空，跳过（下次运行会重试）")
            continue
        for rank, r in enumerate(results):
            entry = hits.setdefault(r["bvid"], {"title": r["title"], "queries": {}})
            entry["queries"][q] = rank + 1
        cache["queries_done"] = sorted(done | {q})
        done.add(q)
        log(f"  搜索「{q}」→ {len(results)} 条")
    return hits


def preliminary_rank(hits, topic=None):
    """详情抓取前的粗排：先去掉标题明显不对题的，再按命中搜索词越多、排名越靠前越优先。"""
    def key(item):
        qs = item[1]["queries"]
        return (-len(qs), sum(qs.values()) / len(qs))
    items = [(b, h) for b, h in hits.items() if topic is None or is_on_topic(h.get("title", ""), topic)]
    return [bvid for bvid, _ in sorted(items, key=key)]


def fetch_details(client, bvids, cache, with_subs):
    videos = cache.setdefault("videos", {})
    for bvid in bvids:
        v = videos.get(bvid)
        if v is None:
            try:
                v = client.video_info(bvid)
            except BiliError as e:
                log(f"  详情失败 {bvid}：{e}")
                continue
            videos[bvid] = v
            log(f"  详情 {bvid} {v['title'][:30]}")
        if "comments" not in v:
            try:
                v["comments"] = client.hot_comments(v["aid"])
            except BiliError as e:
                log(f"  评论失败 {bvid}：{e}")
                v["comments"] = []
        sub_path = os.path.join(SUB_DIR, bvid + ".txt")
        if with_subs and not v.get("subtitle_checked"):
            try:
                text = client.subtitle_text(v["aid"], v.get("cid"))
            except BiliError as e:
                log(f"  字幕失败 {bvid}：{e}")
                text = ""
            if text:
                os.makedirs(SUB_DIR, exist_ok=True)
                with open(sub_path, "w", encoding="utf-8") as f:
                    f.write(text)
            v["subtitle_checked"] = True
        v["has_subtitle"] = os.path.exists(sub_path)


def main():
    ap = argparse.ArgumentParser(description="按模块抓取 B 站候选视频")
    ap.add_argument("--topic", default="5g")
    ap.add_argument("--modules", nargs="*", help="只抓这些模块（默认全部）")
    ap.add_argument("--per-query", type=int, default=10, help="每个搜索词取前几条")
    ap.add_argument("--top", type=int, default=15, help="每个模块抓详情的视频数")
    ap.add_argument("--no-subs", action="store_true", help="不抓字幕")
    args = ap.parse_args()

    queries = load_json(os.path.join(HERE, "queries", f"{args.topic}.json"), {})
    modules = [m for m in queries if not m.startswith("_")]
    if args.modules:
        unknown = set(args.modules) - set(modules)
        if unknown:
            sys.exit(f"未知模块：{', '.join(sorted(unknown))}")
        modules = args.modules

    client = BiliClient(cookie=load_cookie_string(COOKIE_FILE))
    try:
        client.warm_up()
    except BiliError as e:
        sys.exit(f"连接 B 站失败：{e}")
    with_subs = not args.no_subs and client.logged_in
    log(f"登录状态：{'已登录' if client.logged_in else '未登录（不抓字幕）'}；模块 {len(modules)} 个")

    for mid in modules:
        path = os.path.join(OUT_DIR, f"{args.topic}-{mid}.json")
        cache = load_json(path, {"module": mid})
        log(f"[{mid}]")
        try:
            hits = search_module(client, queries[mid], args.per_query, cache)
            save_json(path, cache)
            fetch_details(client, preliminary_rank(hits, args.topic)[: args.top], cache, with_subs)
        finally:
            save_json(path, cache)  # 中途出错或 Ctrl+C 也保留已抓数据
    log("完成。下一步：python tools/score.py")


if __name__ == "__main__":
    main()
