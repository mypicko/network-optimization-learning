#!/usr/bin/env bash
# 国内站访问统计：在服务器上用 GoAccess 分析 learn.promptso.top 最近 14 天的访问日志，报告下载到本机并打开
# 用法：bash tools/stats.sh            （需要能用 SSH 密钥以 root 登录服务器）
# 隐私：页面里没有任何统计代码、不设 Cookie；报告里的 IP 做了匿名化处理，搜索引擎爬虫不计入
set -euo pipefail

HOST="${STATS_HOST:-root@82.156.6.167}"
OUT_DIR="$(cd "$(dirname "$0")" && pwd)/out"
OUT="$OUT_DIR/stats-$(date +%Y%m%d).html"
mkdir -p "$OUT_DIR"

ssh -o BatchMode=yes "$HOST" 'set -e
  ls /var/log/nginx/learn.access.log* >/dev/null 2>&1 || { echo "还没有访问日志" >&2; exit 1; }
  zcat -f /var/log/nginx/learn.access.log* \
    | goaccess - --log-format=COMBINED --ignore-crawlers --anonymize-ip \
        --html-report-title="通途 · 访问统计（最近 14 天）" -o /tmp/learn-stats.html >/dev/null 2>&1
  cat /tmp/learn-stats.html && rm -f /tmp/learn-stats.html' > "$OUT"

echo "报告已生成：$OUT"
[ -n "${STATS_NO_OPEN:-}" ] || { command -v open >/dev/null && open "$OUT"; } || true
