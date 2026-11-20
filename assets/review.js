// 错题本：记录自测题的作答结果。只保存在当前浏览器（localStorage），不上传
// 数据结构：{ items: { [key]: { key, q, a, title, page, scope, wrong, right, status: "wrong" | "ok", updated } } }
//   key 形如 "5g/s0-ofdm/0"（路径模块第 1 题）或 "qs-5g/qs-01/2"（入门快线）
// 纯函数（apply* / list*）不修改旧对象，便于在 Node 里单元测试；浏览器里由 ReviewStore 包一层存取
(function (root) {
  const KEY = "pathway-review-v1";
  const EMPTY = { items: {} };
  const LIMITS = { q: 300, a: 1200, title: 120, page: 200, scope: 80, key: 120 };
  const clean = (s, max) => String(s ?? "").trim().slice(0, max);

  function normalize(v) {
    return v && typeof v === "object" && v.items && typeof v.items === "object" ? { items: { ...v.items } } : { items: {} };
  }

  // 记一次作答：答错进错题本；错题答对一次视为已掌握，移出错题本
  function applyRecord(state, meta, correct, now) {
    const key = clean(meta && meta.key, LIMITS.key);
    if (!key) throw new Error("缺少题目标识");
    const prev = state.items[key] || { wrong: 0, right: 0 };
    const item = {
      key,
      q: clean(meta.q, LIMITS.q),
      a: clean(meta.a, LIMITS.a),
      title: clean(meta.title, LIMITS.title),
      page: clean(meta.page, LIMITS.page),
      scope: clean(meta.scope, LIMITS.scope),
      wrong: prev.wrong + (correct ? 0 : 1),
      right: prev.right + (correct ? 1 : 0),
      status: correct ? "ok" : "wrong",
      updated: now
    };
    return { items: { ...state.items, [key]: item } };
  }

  function applyMaster(state, key, now) {
    const it = state.items[key];
    if (!it) return state;
    return { items: { ...state.items, [key]: { ...it, status: "ok", updated: now } } };
  }

  function applyRemove(state, key) {
    const { [key]: _drop, ...rest } = state.items;
    return { items: rest };
  }

  // 合并导入的数据：同一道题以更新时间较新的为准
  function applyMerge(state, incoming) {
    const add = normalize(incoming).items;
    const merged = { ...state.items };
    Object.values(add).forEach((it) => {
      if (!it || !it.key || !it.q || (it.status !== "wrong" && it.status !== "ok")) return;
      const cur = merged[it.key];
      if (!cur || String(it.updated || "") > String(cur.updated || "")) merged[it.key] = { ...it };
    });
    return { items: merged };
  }

  const listWrong = (state) => Object.values(state.items)
    .filter((it) => it.status === "wrong")
    .sort((a, b) => String(b.updated).localeCompare(String(a.updated)));

  const pure = { applyRecord, applyMaster, applyRemove, applyMerge, listWrong, normalize, KEY };

  if (typeof module !== "undefined" && module.exports) { module.exports = pure; return; }

  // ---------- 浏览器：localStorage 存取（隐私模式下可能不可用，全部容错） ----------
  function read() {
    try { return normalize(JSON.parse(localStorage.getItem(KEY))); } catch (e) { return { ...EMPTY, items: {} }; }
  }
  let state = read();
  function commit(next) {
    state = next;
    let saved = true;
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { saved = false; }
    root.dispatchEvent(new CustomEvent("review-change", { detail: { saved } }));
    return saved;
  }
  const now = () => new Date().toISOString();

  root.addEventListener("storage", (e) => {
    if (e.key === KEY) { state = read(); root.dispatchEvent(new CustomEvent("review-change", { detail: { saved: true, external: true } })); }
  });

  root.ReviewStore = {
    all: () => state,
    get: (key) => state.items[key] || null,
    wrong: () => listWrong(state),
    record: (meta, correct) => commit(applyRecord(state, meta, correct, now())),
    master: (key) => commit(applyMaster(state, key, now())),
    remove: (key) => commit(applyRemove(state, key)),
    merge: (data) => { const before = listWrong(state).length; commit(applyMerge(state, data)); return listWrong(state).length - before; }
  };
})(typeof window !== "undefined" ? window : globalThis);
