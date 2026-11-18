// 我的笔记：自定义释义、评论、收藏。只保存在当前浏览器（localStorage），不上传
// 数据结构：{ terms: [{t, zh, d, updated}], comments: [{id, quote, text, scope, title, page, created, updated}],
//            bookmarks: [{id, quote, scope, title, page, created}] }
// 所有更新都返回新对象，不修改旧数据；变化后在 window 上派发 "notes-change" 事件
(function () {
  const KEY = "pathway-notes-v1";
  const EMPTY = { terms: [], comments: [], bookmarks: [] };
  const LIMITS = { term: 40, zh: 40, d: 500, quote: 500, text: 1000 };

  function read() {
    try {
      const v = JSON.parse(localStorage.getItem(KEY));
      return v && typeof v === "object" ? { ...EMPTY, ...v } : { ...EMPTY };
    } catch (e) {
      return { ...EMPTY };
    }
  }
  let state = read();

  function commit(next) {
    state = next;
    let saved = true;
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { saved = false; }
    window.dispatchEvent(new CustomEvent("notes-change", { detail: { saved } }));
    return saved;
  }

  const now = () => new Date().toISOString();
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const clean = (s, max) => String(s ?? "").trim().slice(0, max);

  function validateTerm(entry) {
    const t = clean(entry.t, 200);
    if (!t) return "请填写术语";
    if (t.length > LIMITS.term) return `术语最多 ${LIMITS.term} 个字`;
    if (/\n/.test(t)) return "术语不能换行";
    if (!clean(entry.d, 2000)) return "请填写释义";
    if (String(entry.d).trim().length > LIMITS.d) return `释义最多 ${LIMITS.d} 个字`;
    return null;
  }

  const api = {
    LIMITS,
    all: () => state,
    terms: () => state.terms,
    comments: () => state.comments,
    bookmarks: () => state.bookmarks,
    validateTerm,

    upsertTerm(entry) {
      const err = validateTerm(entry);
      if (err) throw new Error(err);
      const item = { t: clean(entry.t, LIMITS.term), zh: clean(entry.zh, LIMITS.zh), d: clean(entry.d, LIMITS.d), updated: now() };
      return commit({ ...state, terms: [...state.terms.filter((x) => x.t !== item.t), item] });
    },
    removeTerm(t) {
      return commit({ ...state, terms: state.terms.filter((x) => x.t !== t) });
    },

    addComment({ quote, text, scope, title, page }) {
      const q = clean(quote, LIMITS.quote), tx = clean(text, LIMITS.text);
      if (!q) throw new Error("没有选中文字");
      if (!tx) throw new Error("请填写评论");
      const item = { id: uid(), quote: q, text: tx, scope, title, page, created: now(), updated: now() };
      commit({ ...state, comments: [...state.comments, item] });
      return item;
    },
    updateComment(id, text) {
      const tx = clean(text, LIMITS.text);
      if (!tx) throw new Error("请填写评论");
      return commit({ ...state, comments: state.comments.map((c) => (c.id === id ? { ...c, text: tx, updated: now() } : c)) });
    },
    removeComment(id) {
      return commit({ ...state, comments: state.comments.filter((c) => c.id !== id) });
    },

    addBookmark({ quote, scope, title, page }) {
      const q = clean(quote, LIMITS.quote);
      if (!q) throw new Error("没有选中文字");
      const dup = state.bookmarks.find((b) => b.quote === q && b.scope === scope && b.page === page);
      if (dup) return dup;
      const item = { id: uid(), quote: q, scope, title, page, created: now() };
      commit({ ...state, bookmarks: [...state.bookmarks, item] });
      return item;
    },
    removeBookmark(id) {
      return commit({ ...state, bookmarks: state.bookmarks.filter((b) => b.id !== id) });
    },

    exportJson() {
      return JSON.stringify({ app: "pathway-notes", version: 1, exported: now(), ...state }, null, 2);
    },
    // 导入时合并：同名释义以导入的为准，评论和收藏按 id 去重
    importJson(text) {
      let data;
      try { data = JSON.parse(text); } catch (e) { throw new Error("文件不是有效的 JSON"); }
      if (!data || data.app !== "pathway-notes") throw new Error("不是本站导出的笔记文件");
      const terms = (Array.isArray(data.terms) ? data.terms : []).filter((t) => !validateTerm(t));
      const byId = (list, add) => [...list.filter((x) => !add.some((y) => y.id === x.id)), ...add];
      const comments = (Array.isArray(data.comments) ? data.comments : []).filter((c) => c && c.id && c.quote && c.text);
      const bookmarks = (Array.isArray(data.bookmarks) ? data.bookmarks : []).filter((b) => b && b.id && b.quote);
      commit({
        terms: [...state.terms.filter((x) => !terms.some((y) => y.t === x.t)), ...terms],
        comments: byId(state.comments, comments),
        bookmarks: byId(state.bookmarks, bookmarks)
      });
      return { terms: terms.length, comments: comments.length, bookmarks: bookmarks.length };
    }
  };

  // 其他标签页修改了笔记时同步
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) {
      state = read();
      window.dispatchEvent(new CustomEvent("notes-change", { detail: { saved: true, external: true } }));
    }
  });

  window.NotesStore = api;
})();
