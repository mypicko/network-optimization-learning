// 划词笔记：选中文字后右键（手机上选中后自动弹出）可以添加释义、评论、收藏
// 数据只存在本浏览器（见 store.js）。评论和收藏会在原文中高亮，悬停或点按可查看、修改
(function () {
  const Store = window.NotesStore;
  if (!Store) return;
  const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const ALLOWED = ".mod-body, .lesson-body, .gl-list";
  const NO_MARK = "svg, .mermaid, .flow, summary, script, style, textarea, input, button, .note-ui";
  const COARSE = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;

  function pageKey() {
    const file = location.pathname.split("/").pop() || "index.html";
    const t = new URLSearchParams(location.search).get("t");
    return t ? `${file}?t=${t}` : file;
  }

  // ---------- 选区 ----------
  function selectionInfo() {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) return null;
    const text = sel.toString().replace(/\s+/g, " ").trim();
    if (!text) return null;
    const range = sel.getRangeAt(0);
    const node = range.commonAncestorContainer;
    const el = node.nodeType === 1 ? node : node.parentElement;
    if (!el || !el.closest(ALLOWED) || el.closest(".note-ui")) return null;
    const scopeEl = el.closest("[data-note-scope]");
    return {
      text,
      rect: range.getBoundingClientRect(),
      scope: scopeEl ? scopeEl.dataset.noteScope : null,
      title: scopeEl ? scopeEl.dataset.noteTitle || "" : ""
    };
  }

  // ---------- 浮层：菜单 / 弹出说明 / 提示 ----------
  function layer(cls) {
    const el = document.createElement("div");
    el.className = `note-ui ${cls}`;
    el.hidden = true;
    document.body.appendChild(el);
    return el;
  }
  const menu = layer("note-menu");
  menu.setAttribute("role", "menu");
  const pop = layer("note-pop");
  const toastEl = layer("note-toast");
  toastEl.setAttribute("role", "status");
  let toastTimer = null;

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, 2600);
  }

  function place(el, x, y) {
    el.hidden = false;
    const w = el.offsetWidth, h = el.offsetHeight;
    const left = Math.max(8, Math.min(x, window.innerWidth - w - 8));
    const top = y + h + 8 > window.innerHeight ? Math.max(8, y - h - 8) : y;
    el.style.left = left + window.scrollX + "px";
    el.style.top = top + window.scrollY + "px";
  }

  let pending = null; // 打开菜单时记下的选区信息
  function openMenu(info, x, y) {
    pending = info;
    const entry = window.Glossary && info.text.length <= Store.LIMITS.term ? window.Glossary.lookup(info.text) : null;
    const canDefine = info.text.length <= Store.LIMITS.term;
    const canAnchor = info.scope && info.text.length <= Store.LIMITS.quote;
    const items = [];
    if (canDefine) {
      const label = entry ? (entry.mine ? "修改我的释义" : "补充 / 修改释义") : "添加释义";
      items.push(`<button role="menuitem" data-act="define">📖 ${label}</button>`);
    }
    if (canAnchor) {
      items.push(`<button role="menuitem" data-act="comment">💬 评论</button>`);
      items.push(`<button role="menuitem" data-act="bookmark">⭐ 收藏</button>`);
    }
    items.push(`<button role="menuitem" data-act="copy">📋 复制</button>`);
    if (!canDefine && !canAnchor) items.unshift(`<div class="note-menu-hint">选中的文字太长，可缩短后再添加释义或评论</div>`);
    menu.innerHTML = items.join("") + `<a class="note-menu-foot" href="notes.html">我的笔记 →</a>`;
    place(menu, x, y);
    const first = menu.querySelector("button");
    if (first && !COARSE) first.focus({ preventScroll: true });
  }
  function closeMenu() { menu.hidden = true; }

  document.addEventListener("contextmenu", (ev) => {
    const info = selectionInfo();
    if (!info) return; // 没选中站内正文时保留浏览器原生菜单
    ev.preventDefault();
    openMenu(info, ev.clientX, ev.clientY);
  });

  // 手机没有右键：选中文字停下来后，在选区下方弹出同样的菜单
  if (COARSE) {
    let t = null;
    document.addEventListener("selectionchange", () => {
      clearTimeout(t);
      t = setTimeout(() => {
        const info = selectionInfo();
        if (info) openMenu(info, info.rect.left, info.rect.bottom + 8);
        else if (!menu.contains(document.activeElement)) closeMenu();
      }, 450);
    });
  }

  menu.addEventListener("click", (ev) => {
    const b = ev.target.closest("button[data-act]");
    if (!b || !pending) return;
    const info = pending;
    closeMenu();
    if (b.dataset.act === "define") openTermDialog(info.text);
    if (b.dataset.act === "comment") openCommentDialog({ info });
    if (b.dataset.act === "bookmark") addBookmark(info);
    if (b.dataset.act === "copy") copyText(info.text);
  });

  document.addEventListener("mousedown", (ev) => {
    if (!menu.hidden && !menu.contains(ev.target)) closeMenu();
    if (!pop.hidden && !pop.contains(ev.target) && !ev.target.closest(".note-mark")) pop.hidden = true;
  });
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") { closeMenu(); pop.hidden = true; }
  });
  window.addEventListener("scroll", () => { if (!COARSE) closeMenu(); }, { passive: true });

  function copyText(text) {
    const done = () => toast("已复制");
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, () => toast("复制失败，请用 Ctrl+C"));
    } else {
      toast("请用 Ctrl+C 复制");
    }
  }

  function addBookmark(info) {
    try {
      Store.addBookmark({ quote: info.text, scope: info.scope, title: info.title, page: pageKey() });
      toast("已收藏，可在「我的笔记」中查看");
      window.getSelection().removeAllRanges();
    } catch (e) {
      toast(e.message);
    }
  }

  // ---------- 对话框 ----------
  const dlg = document.createElement("dialog");
  dlg.className = "note-ui note-dialog";
  document.body.appendChild(dlg);
  dlg.addEventListener("click", (ev) => { if (ev.target === dlg) dlg.close(); }); // 点遮罩关闭

  function showDialog(html, onSubmit, extra) {
    dlg.innerHTML = `<form method="dialog" novalidate>${html}
      <p class="note-err" hidden></p>
      <div class="note-actions">
        ${extra || ""}
        <span class="spacer"></span>
        <button type="button" data-close>取消</button>
        <button type="submit" class="btn">保存</button>
      </div></form>`;
    const form = dlg.querySelector("form");
    const err = form.querySelector(".note-err");
    form.querySelector("[data-close]").onclick = () => dlg.close();
    form.addEventListener("submit", (ev) => {
      ev.preventDefault();
      try {
        onSubmit(new FormData(form), ev.submitter);
        dlg.close();
      } catch (e) {
        err.textContent = e.message;
        err.hidden = false;
      }
    });
    if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
    const first = form.querySelector("textarea, input");
    if (first) first.focus();
    return form;
  }

  function openTermDialog(word) {
    const entry = window.Glossary ? window.Glossary.lookup(word) : null;
    const mine = Store.terms().find((x) => x.t === (entry ? entry.t : word));
    const t = entry ? entry.t : word;
    const official = entry && (entry.mine ? entry.orig : entry);
    const form = showDialog(`
      <h3>${mine ? "修改我的释义" : official ? "补充 / 修改释义" : "添加释义"}</h3>
      <p class="note-sub">只保存在你的浏览器里，正文中出现这个词时会显示你的释义。</p>
      ${official ? `<div class="note-official"><span>术语表原释义：</span>${esc(official.d)}</div>` : ""}
      <label>术语<input name="t" value="${esc(t)}" maxlength="${Store.LIMITS.term}" ${entry ? "readonly" : ""} required></label>
      <label>中文名（可选）<input name="zh" value="${esc((mine && mine.zh) || (official && official.zh) || "")}" maxlength="${Store.LIMITS.zh}"></label>
      <label>释义<textarea name="d" rows="4" maxlength="${Store.LIMITS.d}" required placeholder="用自己的话写下这个词的意思">${esc((mine && mine.d) || "")}</textarea></label>`,
      (fd) => {
        Store.upsertTerm({ t: fd.get("t"), zh: fd.get("zh"), d: fd.get("d") });
        toast("释义已保存");
      },
      mine ? `<button type="button" class="danger" data-del>删除我的释义</button>` : "");
    const del = form.querySelector("[data-del]");
    if (del) del.onclick = () => {
      Store.removeTerm(mine.t);
      dlg.close();
      toast(official ? "已恢复为术语表原释义" : "释义已删除");
    };
  }

  function openCommentDialog({ info, comment }) {
    const quote = comment ? comment.quote : info.text;
    const form = showDialog(`
      <h3>${comment ? "修改评论" : "添加评论"}</h3>
      <blockquote class="note-quote">${esc(quote)}</blockquote>
      <label>评论<textarea name="text" rows="4" maxlength="${Store.LIMITS.text}" required placeholder="写下你的理解、疑问或现网经验（只有你自己能看到）">${esc(comment ? comment.text : "")}</textarea></label>`,
      (fd) => {
        if (comment) Store.updateComment(comment.id, fd.get("text"));
        else Store.addComment({ quote, text: fd.get("text"), scope: info.scope, title: info.title, page: pageKey() });
        toast("评论已保存");
        window.getSelection().removeAllRanges();
      },
      comment ? `<button type="button" class="danger" data-del>删除评论</button>` : "");
    const del = form.querySelector("[data-del]");
    if (del) del.onclick = () => { Store.removeComment(comment.id); dlg.close(); toast("评论已删除"); };
  }

  // 术语提示框、术语表页面里的“补充 / 修改我的释义”链接
  document.addEventListener("click", (ev) => {
    const a = ev.target.closest("[data-edit-term]");
    if (!a) return;
    ev.preventDefault();
    openTermDialog(a.dataset.editTerm);
  });

  // ---------- 原文高亮 ----------
  // 忽略空白匹配引文（选区跨段落时 toString 会带换行），再把命中的每段文字分别包上 <mark>
  function highlight(scopeEl, quote, makeMark) {
    const target = quote.replace(/\s+/g, "");
    if (!target) return false;
    const walker = document.createTreeWalker(scopeEl, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.parentElement && n.parentElement.closest(NO_MARK) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT)
    });
    const map = []; // 去掉空白后的每个字符 → [文本节点, 偏移]
    let flat = "";
    while (walker.nextNode()) {
      const n = walker.currentNode;
      const v = n.nodeValue;
      for (let i = 0; i < v.length; i++) {
        if (!/\s/.test(v[i])) { flat += v[i]; map.push([n, i]); }
      }
    }
    const at = flat.indexOf(target);
    if (at < 0) return false;
    const start = map[at], end = map[at + target.length - 1];
    // 收集涉及的文本节点及各自的起止偏移
    const segs = [];
    let inside = false;
    const seen = new Set();
    for (const [n] of map.slice(at, at + target.length)) {
      if (seen.has(n)) continue;
      seen.add(n);
      inside = true;
      segs.push({ n, from: n === start[0] ? start[1] : 0, to: n === end[0] ? end[1] + 1 : n.nodeValue.length });
    }
    if (!inside) return false;
    segs.forEach(({ n, from, to }) => {
      const mid = from > 0 ? n.splitText(from) : n;
      if (to - from < mid.nodeValue.length) mid.splitText(to - from);
      const mark = makeMark();
      mid.parentNode.replaceChild(mark, mid);
      mark.appendChild(mid);
    });
    return true;
  }

  function clearMarks() {
    document.querySelectorAll(".note-mark").forEach((m) => {
      const parent = m.parentNode;
      while (m.firstChild) parent.insertBefore(m.firstChild, m);
      parent.removeChild(m);
      parent.normalize();
    });
  }

  function applyMarks() {
    clearMarks();
    const page = pageKey();
    const scopeOf = (id) => document.querySelector(`[data-note-scope="${CSS.escape(id)}"]`);
    const mk = (cls, id) => () => {
      const m = document.createElement("mark");
      m.className = `note-mark ${cls}`;
      m.dataset.noteId = id;
      return m;
    };
    Store.bookmarks().filter((b) => b.page === page && b.scope).forEach((b) => {
      const el = scopeOf(b.scope);
      if (el) highlight(el, b.quote, mk("note-bookmark", b.id));
    });
    Store.comments().filter((c) => c.page === page && c.scope).forEach((c) => {
      const el = scopeOf(c.scope);
      if (el) highlight(el, c.quote, mk("note-comment", c.id));
    });
  }

  function showPop(mark) {
    const id = mark.dataset.noteId;
    if (mark.classList.contains("note-comment")) {
      const c = Store.comments().find((x) => x.id === id);
      if (!c) return;
      pop.innerHTML = `<div class="note-pop-label">💬 我的评论</div><div class="note-pop-body">${esc(c.text)}</div>
        <div class="note-pop-actions"><button data-pop="edit">修改</button><button data-pop="del" class="danger">删除</button></div>`;
    } else {
      pop.innerHTML = `<div class="note-pop-label">⭐ 已收藏</div>
        <div class="note-pop-actions"><a href="notes.html">我的笔记</a><button data-pop="unstar" class="danger">取消收藏</button></div>`;
    }
    pop.dataset.noteId = id;
    const r = mark.getBoundingClientRect();
    place(pop, r.left, r.bottom + 6);
  }

  let popTimer = null;
  document.addEventListener("mouseover", (ev) => {
    const m = ev.target.closest && ev.target.closest(".note-mark");
    if (m && !COARSE) { clearTimeout(popTimer); showPop(m); }
  });
  document.addEventListener("mouseout", (ev) => {
    if (ev.target.closest && (ev.target.closest(".note-mark") || ev.target.closest(".note-pop"))) {
      clearTimeout(popTimer);
      popTimer = setTimeout(() => { if (!pop.matches(":hover")) pop.hidden = true; }, 300);
    }
  });
  pop.addEventListener("mouseenter", () => clearTimeout(popTimer));
  document.addEventListener("click", (ev) => {
    const m = ev.target.closest(".note-mark");
    if (m && !ev.target.closest(".term")) { showPop(m); }
  });
  pop.addEventListener("click", (ev) => {
    const b = ev.target.closest("button[data-pop]");
    if (!b) return;
    const id = pop.dataset.noteId;
    pop.hidden = true;
    if (b.dataset.pop === "edit") openCommentDialog({ comment: Store.comments().find((x) => x.id === id) });
    if (b.dataset.pop === "del") { Store.removeComment(id); toast("评论已删除"); }
    if (b.dataset.pop === "unstar") { Store.removeBookmark(id); toast("已取消收藏"); }
  });

  window.addEventListener("notes-change", (ev) => {
    applyMarks();
    if (ev.detail && ev.detail.saved === false) toast("浏览器禁止保存数据（可能是隐私模式），笔记只在本次打开期间有效");
  });
  // 页面内容由各页面的内联脚本同步渲染，DOMContentLoaded 时已经就绪
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", applyMarks);
  else applyMarks();

  window.Notes = { openTermDialog, openCommentDialog, applyMarks, pageKey, toast };
})();
