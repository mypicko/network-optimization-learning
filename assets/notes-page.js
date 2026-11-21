// “我的笔记”页面：查看、修改、删除自定义释义、评论、收藏和错题本，支持导出 / 导入备份（含学习进度）
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
    { id: "bookmarks", label: "收藏" },
    { id: "review", label: "错题本" }
  ];
  const Review = window.ReviewStore;
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

  function reviewItem(it, today) {
    const due = Review.isDue(it, today);
    const when = due ? `<span class="badge badge-due">今天复习</span>` : `<span class="badge">${esc(Review.fmtDay(it.due))}复习</span>`;
    return `<li>
      <div class="nb-head"><strong>${esc(it.q)}</strong> ${when} <span class="badge badge-wrong">答错 ${it.wrong} 次</span>
        <span class="meta nb-date">第 ${it.stage || 0}/${Review.ROUNDS} 轮</span></div>
      <details class="nb-answer"><summary>参考答案</summary><div class="nb-body">${esc(it.a)}</div></details>
      <div class="nb-foot">${link(it)}</div>
      <div class="nb-actions"><button data-master-review="${esc(it.key)}">已掌握，不再复习</button><button class="danger" data-del-review="${esc(it.key)}">删除</button></div>
    </li>`;
  }

  function reviewHtml() {
    const list = Review ? Review.wrong() : [];
    if (!list.length) return empty("错题本是空的。在模块自测、入门快线或模拟考试里没答对的题，会自动记到这里。");
    const today = Review.today();
    const due = Review.due();
    const later = list.filter((it) => !Review.isDue(it, today)).sort((a, b) => String(a.due).localeCompare(String(b.due)));
    return `<div class="review-plan">
        <p><strong>间隔复习：</strong>答错的题 1 天后复习；到期复习答对，依次推后 3 / 7 / 14 天，连续通过 ${Review.ROUNDS} 轮移出错题本；中途答错就从头再来。</p>
        ${due.length ? `<a class="btn" href="exam.html?scope=due">开始今日复习（${due.length} 题，自动判分）</a>` : `<p class="meta">今天没有到期的题 ✅ 下次复习：${esc(Review.fmtDay(later[0] && later[0].due))}</p>`}
      </div>
      ${due.length ? `<h3 class="nb-sub">今天该复习（${due.length}）</h3><ul class="nb-list">${due.map((it) => reviewItem(it, today)).join("")}</ul>` : ""}
      ${later.length ? `<h3 class="nb-sub">以后复习（${later.length}）</h3><ul class="nb-list">${later.map((it) => reviewItem(it, today)).join("")}</ul>` : ""}`;
  }

  const empty = (msg) => `<p class="muted nb-empty">${esc(msg)}</p>`;

  function render() {
    const root = document.getElementById("notes");
    const counts = { terms: Store.terms().length, comments: Store.comments().length, bookmarks: Store.bookmarks().length, review: Review ? Review.wrong().length : 0 };
    const body = { terms: termsHtml, comments: commentsHtml, bookmarks: bookmarksHtml, review: reviewHtml }[tab]();
    root.innerHTML = `
      <section class="hero">
        <h1>我的笔记</h1>
        <p>在网站正文中选中文字后右键（手机上选中后会自动弹出菜单），可以添加自己的释义、写评论或收藏。笔记、学习进度和错题本只保存在当前浏览器里，换设备或清理浏览器数据会丢失。“导出备份”会把三者打包成一个文件，在另一台设备上“导入备份”即可接着学。</p>
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
        download(`通信学习备份-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}.json`, window.Backup.exportText());
        return;
      }
      const master = t.closest("[data-master-review]");
      if (master) { Review.master(master.dataset.masterReview); toast("已标记掌握，移出错题本"); }
      const delR = t.closest("[data-del-review]");
      if (delR && confirm("从错题本删除这道题？")) { Review.remove(delR.dataset.delReview); toast("已删除"); }
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
        const r = window.Backup.importText(text);
        toast(`已导入：完成进度 ${r.progress} 项、学习状态 ${r.status} 项、释义 ${r.terms} 条、评论 ${r.comments} 条、收藏 ${r.bookmarks} 条、错题 ${r.review} 道`);
        render();
      }).catch((e) => toast("导入失败：" + e.message)).finally(() => { ev.target.value = ""; });
    });
    window.addEventListener("notes-change", render);
    window.addEventListener("review-change", render);
  }

  window.NotesPage = { render: () => { render(); bind(); } };
})();
