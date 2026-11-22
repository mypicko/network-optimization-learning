// 备用地址（GitHub Pages）顶部提示：国内用户改用 learn.promptso.top，打开更快
// 只在 *.github.io 上显示；本地调试可在网址后加 ?mirror-notice=1。关闭后 7 天内不再显示
// 不做自动跳转：国内服务器出问题时，GitHub Pages 要能作为备用继续使用
(function () {
  const PRIMARY = "https://learn.promptso.top";
  const DISMISS_KEY = "mirror-notice-dismissed";
  const HIDE_DAYS = 7;

  const forced = new URLSearchParams(location.search).get("mirror-notice") === "1";
  if (!forced && !/\.github\.io$/.test(location.hostname)) return;

  try {
    const at = Number(localStorage.getItem(DISMISS_KEY));
    if (!forced && at && Date.now() - at < HIDE_DAYS * 86400000) return;
  } catch (e) { /* 存储不可用时照常显示 */ }

  // GitHub Pages 项目站点的路径带仓库名前缀（/network-optimization-learning/xxx.html），换到主站时去掉
  const path = /\.github\.io$/.test(location.hostname)
    ? location.pathname.replace(/^\/[^/]+\//, "/")
    : location.pathname.replace(/^.*\//, "/");
  const params = new URLSearchParams(location.search);
  params.delete("mirror-notice");
  const query = params.toString();
  const target = `${PRIMARY}${path}${query ? `?${query}` : ""}${location.hash}`;

  const bar = document.createElement("div");
  bar.className = "mirror-notice";
  bar.setAttribute("role", "note");
  bar.innerHTML = `<div class="wrap">
      <span>🚀 国内访问请用 <a class="mirror-go" href="#"><strong>learn.promptso.top</strong></a>，打开更快。
        <span class="mirror-tip">在这里的学习进度、笔记和错题本，可以先到<a href="notes.html">我的笔记</a>“导出备份”，再到新地址“导入备份”。</span></span>
      <button type="button" class="mirror-close" aria-label="关闭提示">×</button>
    </div>`;
  // 链接文字固定，只把 href 设成拼好的地址，避免把网址里的内容当 HTML 解析
  bar.querySelector(".mirror-go").href = target;
  bar.querySelector(".mirror-close").addEventListener("click", () => {
    bar.remove();
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch (e) { /* 忽略 */ }
  });

  const header = document.querySelector(".site-header");
  if (header) header.insertAdjacentElement("afterend", bar);
  else document.body.prepend(bar);
})();
