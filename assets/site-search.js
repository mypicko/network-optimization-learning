// 顶栏：按 / 键聚焦搜索框（正在输入时不拦截）；导航里高亮当前页面
(function () {
  const page = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".site-nav a").forEach((a) => {
    if (a.getAttribute("href").split("?")[0] === page) a.setAttribute("aria-current", "page");
  });

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
