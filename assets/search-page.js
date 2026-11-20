// 搜索页：search.html?q=关键词。输入时实时出结果，并同步到地址栏便于分享 / 返回
(function () {
  const S = window.SearchIndex;
  const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  let docs = null;

  function index() {
    if (!docs) {
      docs = S.buildIndex({
        pathways: window.PATHWAYS || {},
        lessons: window.LESSONS || {},
        glossary: window.GLOSSARY || [],
        quickstart: window.QUICKSTART || {},
        notes: window.NotesStore ? window.NotesStore.all() : null
      });
    }
    return docs;
  }

  function resultsHtml(q) {
    if (!q.trim()) return `<p class="muted">输入缩写、英文或中文关键词，例如 <a href="?q=BWP">BWP</a>、<a href="?q=随机接入">随机接入</a>、<a href="?q=PDU 会话">PDU 会话</a>、<a href="?q=EPS Fallback">EPS Fallback</a>。多个词用空格隔开表示同时包含。</p>`;
    const groups = S.search(index(), q);
    if (!groups.length) return `<p class="muted">没有找到包含“${esc(q)}”的内容。试试换个写法（缩写 / 英文全称 / 中文），或减少关键词。</p>`;
    const total = groups.reduce((a, g) => a + g.total, 0);
    return `<p class="meta">共 ${total} 条结果</p>` + groups.map((g) => `
      <section class="sr-group">
        <h2>${esc(g.label)} <span class="meta">${g.total}</span></h2>
        <ul class="sr-list">${g.items.map((d) => `<li>
          <a class="sr-title" href="${esc(d.href)}">${S.highlight(d.title, q)}</a>
          <div class="sr-crumb meta">${esc(d.crumb)}</div>
          ${d.text ? `<div class="sr-snippet">${S.highlight(S.snippet(d.text, q), q)}</div>` : ""}
        </li>`).join("")}</ul>
        ${g.total > g.items.length ? `<p class="meta">还有 ${g.total - g.items.length} 条，请加关键词缩小范围</p>` : ""}
      </section>`).join("");
  }

  function render() {
    const root = document.getElementById("search");
    const q = new URLSearchParams(location.search).get("q") || "";
    root.innerHTML = `
      <section class="hero">
        <h1>站内搜索</h1>
        <form class="sr-form" role="search" action="search.html">
          <input type="search" name="q" id="sr-q" value="${esc(q)}" placeholder="搜索模块、讲解、术语、自测题、我的笔记" autocomplete="off" autofocus>
        </form>
      </section>
      <div id="sr-results">${resultsHtml(q)}</div>`;
    const input = root.querySelector("#sr-q");
    let timer = null;
    input.addEventListener("input", () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const v = input.value;
        history.replaceState(null, "", v.trim() ? `?q=${encodeURIComponent(v)}` : location.pathname);
        root.querySelector("#sr-results").innerHTML = resultsHtml(v);
      }, 120);
    });
    root.querySelector(".sr-form").addEventListener("submit", (e) => e.preventDefault());
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  }

  window.SearchPage = { render };
})();
