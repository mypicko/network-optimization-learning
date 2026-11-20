"""把“浏览器模式”抓到的数据合并进 tools/out/bili/<主题>-<模块>.json（与 bili_fetch.py 的缓存格式相同）。

浏览器模式：不导出 Cookie，而是在已登录 B 站的浏览器页面里运行 tools/bili_browser.js，
它调用 B 站网页本身使用的公开接口（搜索、视频详情、热门评论、字幕），结果复制成 JSON 文件后用本脚本导入：

    python tools/bili_import.py dump.json            # 合并搜索命中和视频详情
    python tools/bili_import.py dump.json --pick 15  # 额外打印每个模块应抓详情的前 15 个 BV 号

dump.json 格式：
    { "<模块 id>": { "hits": {BV: {title, queries: {搜索词: 名次}}}, "queries_done": [...],
                    "videos": {BV: {...bili_client.video_info 的字段, comments: [...], subtitle: "..."}} } }
"""
import argparse
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bili_fetch import OUT_DIR, SUB_DIR, load_json, preliminary_rank, save_json  # noqa: E402

VIDEO_KEYS = ("bvid", "aid", "cid", "title", "desc", "owner", "pubdate", "duration", "pages", "season",
              "view", "favorite", "like", "coin", "share", "reply", "danmaku", "comments")


def clean_video(v):
    """只保留打分需要的字段；评论只留文本和点赞数（不存用户名）。"""
    out = {k: v[k] for k in VIDEO_KEYS if k in v}
    out["desc"] = str(out.get("desc", ""))[:300]
    out["comments"] = [{"text": str(c.get("text", ""))[:200], "like": int(c.get("like", 0))} for c in v.get("comments", [])]
    return out


def merge_module(cache, data):
    hits = cache.setdefault("hits", {})
    for bvid, h in (data.get("hits") or {}).items():
        e = hits.setdefault(bvid, {"title": h.get("title", ""), "queries": {}})
        e["queries"].update(h.get("queries") or {})
    cache["queries_done"] = sorted(set(cache.get("queries_done", [])) | set(data.get("queries_done") or []))
    videos = cache.setdefault("videos", {})
    subs_written = 0
    for bvid, v in (data.get("videos") or {}).items():
        videos[bvid] = clean_video(v)
        text = (v.get("subtitle") or "").strip()
        sub_path = os.path.join(SUB_DIR, bvid + ".txt")
        if text:
            os.makedirs(SUB_DIR, exist_ok=True)
            with open(sub_path, "w", encoding="utf-8") as f:
                f.write(text)
            subs_written += 1
        videos[bvid]["subtitle_checked"] = True
        videos[bvid]["has_subtitle"] = os.path.exists(sub_path)
    return subs_written


def main():
    ap = argparse.ArgumentParser(description="导入浏览器模式抓取的 B 站数据")
    ap.add_argument("dump")
    ap.add_argument("--topic", default="5g")
    ap.add_argument("--pick", type=int, default=0, help="打印每个模块粗排后的前 N 个 BV 号（JSON）")
    args = ap.parse_args()
    data = load_json(args.dump, {})
    picks = {}
    for mid, d in data.items():
        path = os.path.join(OUT_DIR, f"{args.topic}-{mid}.json")
        cache = load_json(path, {"module": mid})
        cache["module"] = mid
        subs = merge_module(cache, d)
        save_json(path, cache)
        print(f"{mid}: 命中 {len(cache['hits'])} 个，详情 {len(cache.get('videos', {}))} 个，新字幕 {subs} 份", file=sys.stderr)
        if args.pick:
            have = set(cache.get("videos", {}))
            picks[mid] = [b for b in preliminary_rank(cache["hits"], args.topic)[: args.pick] if b not in have]
    if args.pick:
        print(json.dumps(picks, ensure_ascii=False))


if __name__ == "__main__":
    main()
