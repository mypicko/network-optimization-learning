"""给站点 HTML 里引用的本地 JS / CSS 加上版本号，避免浏览器缓存旧文件。

GitHub Pages 默认让浏览器缓存静态文件 10 分钟。只更新 HTML 而浏览器仍用旧 JS，
会出现“新页面 + 旧脚本”的错配。改了 assets/ 或 data/ 下的文件后，提交前运行：

    python tools/bump_version.py

它把根目录每个 .html 中的 src="assets/..." / href="data/..." 等本地引用统一改成
?v=<文件内容摘要>：文件没变，版本号就不变；文件变了，版本号才变，老访客也不会白白重新下载。
"""
import glob
import hashlib
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REF_RE = re.compile(r'((?:src|href)=")((?:assets|data)/[^"?#]+\.(?:js|css))(?:\?v=[^"]*)?(")')


def file_version(rel_path):
    path = os.path.join(ROOT, rel_path)
    if not os.path.exists(path):
        return None
    with open(path, "rb") as f:
        return hashlib.sha1(f.read()).hexdigest()[:8]


def bump(html_path):
    with open(html_path, encoding="utf-8") as f:
        text = f.read()
    missing = []

    def repl(m):
        ver = file_version(m.group(2))
        if ver is None:
            missing.append(m.group(2))
            return m.group(0)
        return f"{m.group(1)}{m.group(2)}?v={ver}{m.group(3)}"

    new_text = REF_RE.sub(repl, text)
    if new_text != text:
        with open(html_path, "w", encoding="utf-8") as f:
            f.write(new_text)
    return new_text != text, missing


def main():
    changed, all_missing = [], []
    for html in sorted(glob.glob(os.path.join(ROOT, "*.html"))):
        did, missing = bump(html)
        if did:
            changed.append(os.path.basename(html))
        all_missing += [f"{os.path.basename(html)} → {m}" for m in missing]
    print("已更新：" + ("、".join(changed) if changed else "无（版本号已是最新）"))
    if all_missing:
        print("找不到以下被引用的文件：\n  " + "\n  ".join(all_missing))
        sys.exit(1)


if __name__ == "__main__":
    main()
