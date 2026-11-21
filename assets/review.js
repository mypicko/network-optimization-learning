// 错题本：记录自测题的作答结果。只保存在当前浏览器（localStorage），不上传
// 数据结构：{ items: { [key]: { key, q, a, title, page, scope, wrong, right, status: "wrong" | "ok", updated } } }
//   key 形如 "5g/s0-ofdm/0"（路径模块第 1 题）或 "qs-5g/qs-01/2"（入门快线）
// 间隔复习：答错后 1 天复习；到期复习答对依次推后 3 / 7 / 14 天，第 4 轮再答对视为掌握、移出错题本；
//   任何一轮答错都回到第 0 轮。字段 stage（已通过的复习轮数）、due（下次复习日，本地日期 YYYY-MM-DD）
// 纯函数（apply* / list*）不修改旧对象，便于在 Node 里单元测试；浏览器里由 ReviewStore 包一层存取
(function (root) {
  const KEY = "pathway-review-v1";
  const EMPTY = { items: {} };
  const LIMITS = { q: 300, a: 1200, title: 120, page: 200, scope: 80, key: 120 };
  const clean = (s, max) => String(s ?? "").trim().slice(0, max);
  const INTERVALS = [1, 3, 7, 14];
  const ROUNDS = INTERVALS.length;

  // "YYYY-MM-DD" 加 n 天（按日历日计算，与时区无关）；日期不合法返回 null（该题视为随时到期）
  function addDays(day, n) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(day));
    if (!m) return null;
    return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3] + n)).toISOString().slice(0, 10);
  }
  const isDue = (it, today) => it.status === "wrong" && (!it.due || it.due <= today);

  function normalize(v) {
    return v && typeof v === "object" && v.items && typeof v.items === "object" ? { items: { ...v.items } } : { items: {} };
  }

  // 下一次复习安排：答错回到第 0 轮；在错题本里且已到期的题答对，推进一轮；未到期提前答对不改变安排
  function schedule(prev, correct, today) {
    if (!correct) return { status: "wrong", stage: 0, due: addDays(today, INTERVALS[0]) };
    if (prev.status !== "wrong") return { status: "ok", stage: 0, due: null };
    if (!isDue(prev, today)) return { status: "wrong", stage: prev.stage || 0, due: prev.due };
    const stage = (prev.stage || 0) + 1;
    return stage >= ROUNDS ? { status: "ok", stage, due: null } : { status: "wrong", stage, due: addDays(today, INTERVALS[stage]) };
  }

  // 记一次作答。now：ISO 时间戳；today：本地日期（浏览器传入，缺省取 now 的日期部分）
  function applyRecord(state, meta, correct, now, today = String(now).slice(0, 10)) {
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
      ...schedule(prev, correct, today),
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

  // 今天到期的题：先到期的在前
  const listDue = (state, today) => listWrong(state).filter((it) => isDue(it, today))
    .sort((a, b) => String(a.due || "").localeCompare(String(b.due || "")));

  // 复习概况：到期数、错题总数、最近一次复习日
  function dueSummary(state, today) {
    const wrong = listWrong(state);
    const later = wrong.filter((it) => !isDue(it, today)).map((it) => it.due).sort();
    return { due: wrong.length - later.length, total: wrong.length, next: later[0] || null };
  }

  // 显示用："3月5日"
  const fmtDay = (day) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(day || ""));
    if (!m) return "";
    const year = +m[1] === new Date().getFullYear() ? "" : `${m[1]}年`;
    return `${year}${+m[2]}月${+m[3]}日`;
  };

  // 一次作答之后给考生的提示：prev 为作答前的条目（可为 null），item 为记录后的条目
  function afterText(prev, item, correct) {
    const wasWrong = !!(prev && prev.status === "wrong");
    if (!item) return "";
    if (correct) {
      if (!wasWrong) return "答对了。";
      if (item.status === "ok") return `答对了，已连续通过 ${ROUNDS} 轮复习，移出错题本。`;
      if (item.stage === (prev.stage || 0)) return `答对了。这道题 ${fmtDay(item.due)}才到复习时间，到时再答对才算通过这一轮。`;
      return `答对了，第 ${item.stage}/${ROUNDS} 轮复习通过，下次复习 ${fmtDay(item.due)}。`;
    }
    return wasWrong ? `没答对，复习轮次清零，${fmtDay(item.due)}再复习。` : `已记入错题本，${fmtDay(item.due)}复习。`;
  }

  const pure = { fmtDay, afterText, applyRecord, applyMaster, applyRemove, applyMerge, listWrong, listDue, dueSummary, addDays, isDue, normalize, KEY, INTERVALS, ROUNDS };

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
  const pad = (n) => String(n).padStart(2, "0");
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };

  root.addEventListener("storage", (e) => {
    if (e.key === KEY) { state = read(); root.dispatchEvent(new CustomEvent("review-change", { detail: { saved: true, external: true } })); }
  });

  root.ReviewStore = {
    all: () => state,
    get: (key) => state.items[key] || null,
    wrong: () => listWrong(state),
    due: () => listDue(state, today()),
    summary: () => dueSummary(state, today()),
    today,
    INTERVALS,
    ROUNDS,
    fmtDay,
    afterText,
    isDue,
    record: (meta, correct) => commit(applyRecord(state, meta, correct, now(), today())),
    master: (key) => commit(applyMaster(state, key, now())),
    remove: (key) => commit(applyRemove(state, key)),
    merge: (data) => { const before = listWrong(state).length; commit(applyMerge(state, data)); return listWrong(state).length - before; }
  };
})(typeof window !== "undefined" ? window : globalThis);
