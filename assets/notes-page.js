// “我的笔记”页面：查看、修改、删除自定义释义、评论和收藏，支持导出 / 导入备份
(function () {
  const Store = window.NotesStore;
  const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const fmt = (iso) => {
    const d = new Date(iso);
    return isNaN(d) ? "" : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const TABS = [
    { id: "terms", label: "我的释义" },
    { id: "comments", label: "评论" },
    { id: "bookmarks", label: "收藏" }
  ];
  let tab = (location.hash || "").slice(1);
  if (!TABS.some((t) => t.id === tab)) tab = "terms";

  const link = (item) => {
    const href = `${item.page || "pathway.html?t=5g"}#${encodeURIComponent(item.scope || "")}`;
    return `<a href="${esc(href)}">${esc(item.title || "查看原文")} →</a>`;
  };

  function termsHtml() {
    const list = [...Store.terms()].sort((a, b) => a.t.localeCompare(b.t, "zh"));
    if (!list.length) return empty("还没有自己的释义。在正文或术语表中选中一个词，右键选择“添加释义”。");
    const official = new Map((window.GLOSSARY || []).map((e) => [e.t, e]));
    return `<ul class="nb-list">${list.map((t) => `<li>
      <div class="nb-head"><strong>${esc(t.t)}</strong> ${t.zh ? `<span class="meta">${esc(t.zh)}</span>` : ""}
        ${official.has(t.t) ? `<span class="badge">修改了术语表</span>` : `<span class="badge badge-mine">新术语</span>`}
        <span class="meta nb-date">${fmt(t.updated)}</span></div>
      <div class="nb-body">${esc(t.d)}</div>
      ${official.has(t.t) ? `<div class="gl-orig">原释义：${esc(official.get(t.t).d)}</div>` : ""}
      <div class="nb-actions"><button data-edit-term="${esc(t.t)}">修改</button><button class="danger" data-del-term="${esc(t.t)}">删除</button></div>
    </li>`).join("")}</ul>`;
  }

  function commentsHtml() {
    const list = [...Store.comments()].sort((a, b) => (b.updated || "").localeCompare(a.updated || ""));
    if (!list.length) return empty("还没有评论。在课程或模块正文中选中一段文字，右键选择“评论”。");
    return `<ul class="nb-list">${list.map((c) => `<li>
      <blockquote class="note-quote">${esc(c.quote)}</blockquote>
      <div class="nb-body">${esc(c.text)}</div>
      <div class="nb-foot">${link(c)} <span class="meta nb-date">${fmt(c.updated)}</span></div>
      <div class="nb-actions"><button data-edit-comment="${esc(c.id)}">修改</button><button class="danger" data-del-comment="${esc(c.id)}">删除</button></div>
    </li>`).join("")}</ul>`;
  }

  function bookmarksHtml() {
    const list = [...Store.bookmarks()].sort((a, b) => (b.created || "").localeCompare(a.created || ""));
    if (!list.length) return empty("还没有收藏。在正文中选中一段文字，右键选择“收藏”。");
    return `<ul class="nb-list">${list.map((b) => `<li>
      <blockquote class="note-quote">${esc(b.quote)}</blockquote>
      <div class="nb-foot">${link(b)} <span class="meta nb-date">${fmt(b.created)}</span></div>
      <div class="nb-actions"><button class="danger" data-del-bookmark="${esc(b.id)}">取消收藏</button></div>
    </li>`).join("")}</ul>`;
  }

  const empty = (msg) => `<p class="muted nb-empty">${esc(msg)}</p>`;

  function render() {
    const root = document.getElementById("notes");
    const counts = { terms: Store.terms().length, comments: Store.comments().length, bookmarks: Store.bookmarks().length };
    const body = tab === "terms" ? termsHtml() : tab === "comments" ? commentsHtml() : bookmarksHtml();
    root.innerHTML = `
      <section class="hero">
        <h1>我的笔记</h1>
        <p>在网站正文中选中文字后右键（手机上选中后会自动弹出菜单），可以添加自己的释义、写评论或收藏。笔记只保存在当前浏览器里，换设备或清理浏览器数据会丢失，建议定期导出备份。</p>
        <div class="nb-tools">
          <button class="btn" id="nb-export">导出备份</button>
          <label class="btn btn-ghost">导入备份<input type="file" id="nb-import" accept="application/json,.json" hidden></label>
        </div>
      </section>
      <div class="nb-tabs" role="tablist">${TABS.map((t) =>
        `<button role="tab" class="chip-btn${t.id === tab ? " active" : ""}" data-tab="${t.id}" aria-selected="${t.id === tab}">${t.label} ${counts[t.id]}</button>`).join("")}</div>
      <section class="nb-panel">${body}</section>`;
  }

  function download(name, text) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "application/json" }));
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  function bind() {
    const root = document.getElementById("notes");
    const toast = (m) => window.Notes && window.Notes.toast(m);
    root.addEventListener("click", (ev) => {
      const t = ev.target;
      const tabBtn = t.closest("[data-tab]");
      if (tabBtn) { tab = tabBtn.dataset.tab; history.replaceState(null, "", "#" + tab); render(); return; }
      if (t.closest("#nb-export")) {
        const d = new Date();
        download(`通信学习笔记-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}.json`, Store.exportJson());
        return;
      }
      const delTerm = t.closest("[data-del-term]");
      if (delTerm && confirm(`删除“${delTerm.dataset.delTerm}”的释义？`)) { Store.removeTerm(delTerm.dataset.delTerm); toast("已删除"); }
      const editC = t.closest("[data-edit-comment]");
      if (editC) window.Notes.openCommentDialog({ comment: Store.comments().find((c) => c.id === editC.dataset.editComment) });
      const delC = t.closest("[data-del-comment]");
      if (delC && confirm("删除这条评论？")) { Store.removeComment(delC.dataset.delComment); toast("已删除"); }
      const delB = t.closest("[data-del-bookmark]");
      if (delB) { Store.removeBookmark(delB.dataset.delBookmark); toast("已取消收藏"); }
    });
    root.addEventListener("change", (ev) => {
      if (ev.target.id !== "nb-import" || !ev.target.files[0]) return;
      const file = ev.target.files[0];
      if (file.size > 5 * 1024 * 1024) { toast("文件太大"); return; }
      file.text().then((text) => {
        const r = Store.importJson(text);
        toast(`已导入：释义 ${r.terms} 条、评论 ${r.comments} 条、收藏 ${r.bookmarks} 条`);
      }).catch((e) => toast("导入失败：" + e.message));
    });
    window.addEventListener("notes-change", render);
  }

  window.NotesPage = { render: () => { render(); bind(); } };
})();
