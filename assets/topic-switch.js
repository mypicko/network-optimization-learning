// 主题切换条：考试、案例库等按主题分开的页面顶部用。只列出已上线、且本页有数据的主题
(function (root) {
  const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  // 纯函数：topics 主题目录，has(id) 判断本页是否有该主题的数据
  function liveTopics(topics, has) {
    return (topics || []).filter((t) => t.status === "live" && has(t.id));
  }

  function html(current, page, has) {
    const list = liveTopics(root.TOPICS, has);
    if (list.length < 2) return "";
    return `<nav class="topic-switch" aria-label="切换主题">${list.map((t) =>
      `<a class="chip${t.id === current ? " on" : ""}" href="${esc(page)}?t=${encodeURIComponent(t.id)}"${t.id === current ? ' aria-current="page"' : ""}>${esc(t.title)}</a>`).join("")}</nav>`;
  }

  const api = { liveTopics, html };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.TopicSwitch = api;
})(typeof window !== "undefined" ? window : globalThis);
