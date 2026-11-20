// 顶栏搜索框：按 / 键聚焦（正在输入时不拦截）
(function () {
  document.addEventListener("keydown", (e) => {
    if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    const input = document.querySelector(".site-search input");
    if (!input) return;
    e.preventDefault();
    input.focus();
    input.select();
  });
})();
