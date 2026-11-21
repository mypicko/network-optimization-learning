// 模块学习状态：未开始 / 学习中 / 已完成 / 已掌握（跳过）
// 存储：
//   pathway-progress-v1  { [主题]: { [模块]: 完成时间戳 } }   —— 沿用原来的“已完成”记录，入门快线也在用
//   pathway-status-v1    { [主题]: { [模块]: "learning" | "skip" } }
// 同一模块只会处于一种状态：标“已完成”会清掉学习中 / 跳过，反之亦然
// 纯函数不修改旧对象，可在 Node 里单元测试；浏览器里由 ModuleStatus 包一层存取
(function (root) {
  const PROGRESS_KEY = "pathway-progress-v1";
  const STATUS_KEY = "pathway-status-v1";
  const STATES = [
    { id: "todo", label: "未开始" },
    { id: "learning", label: "学习中" },
    { id: "done", label: "已完成" },
    { id: "skip", label: "已掌握，跳过" }
  ];
  const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);
  const EXTRA = new Set(["learning", "skip"]);

  function statusOf(progress, status, pid, mid) {
    if (isObj(progress) && isObj(progress[pid]) && progress[pid][mid]) return "done";
    const s = isObj(status) && isObj(status[pid]) ? status[pid][mid] : null;
    return EXTRA.has(s) ? s : "todo";
  }

  // 设置状态，返回新的 { progress, status }
  function applyStatus(progress, status, pid, mid, value, now) {
    if (!STATES.some((s) => s.id === value)) throw new Error(`未知状态：${value}`);
    const { [mid]: _p, ...restP } = (isObj(progress) && progress[pid]) || {};
    const { [mid]: _s, ...restS } = (isObj(status) && status[pid]) || {};
    const keepDone = value === "done" && _p ? _p : now;
    return {
      progress: { ...progress, [pid]: value === "done" ? { ...restP, [mid]: keepDone } : restP },
      status: { ...status, [pid]: EXTRA.has(value) ? { ...restS, [mid]: value } : restS }
    };
  }

  // 统计：已完成与跳过都算“已学完”；下一个要学的模块优先取“学习中”，否则取第一个未开始的
  function summarize(modules, progress, status, pid) {
    const by = { todo: 0, learning: 0, done: 0, skip: 0 };
    modules.forEach((m) => { by[statusOf(progress, status, pid, m.id)]++; });
    const total = modules.length;
    const finished = by.done + by.skip;
    const next = modules.find((m) => statusOf(progress, status, pid, m.id) === "learning")
      || modules.find((m) => statusOf(progress, status, pid, m.id) === "todo") || null;
    return { ...by, total, finished, pct: total ? Math.round((finished / total) * 100) : 0, next };
  }

  // 导入合并：只补当前没有状态、也没有完成记录的模块（本机已有的记录优先）
  function mergeStatus(cur, inc, progress) {
    const out = {};
    Object.entries(isObj(cur) ? cur : {}).forEach(([pid, mods]) => { if (isObj(mods)) out[pid] = { ...mods }; });
    Object.entries(isObj(inc) ? inc : {}).forEach(([pid, mods]) => {
      if (!isObj(mods)) return;
      Object.entries(mods).forEach(([mid, v]) => {
        if (!EXTRA.has(v) || (out[pid] && out[pid][mid])) return;
        if (isObj(progress) && isObj(progress[pid]) && progress[pid][mid]) return;
        out[pid] = { ...(out[pid] || {}), [mid]: v };
      });
    });
    return out;
  }

  const countStatus = (s) => Object.values(isObj(s) ? s : {}).reduce((a, m) => a + (isObj(m) ? Object.keys(m).length : 0), 0);

  const pure = { STATES, PROGRESS_KEY, STATUS_KEY, statusOf, applyStatus, summarize, mergeStatus, countStatus };
  if (typeof module !== "undefined" && module.exports) { module.exports = pure; return; }

  // ---------- 浏览器 ----------
  const read = (k) => { try { const v = JSON.parse(localStorage.getItem(k)); return isObj(v) ? v : {}; } catch (e) { return {}; } };
  let progress = read(PROGRESS_KEY);
  let status = read(STATUS_KEY);
  function save() {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
      localStorage.setItem(STATUS_KEY, JSON.stringify(status));
    } catch (e) { /* 存储不可用：状态只在本次打开期间有效 */ }
    root.dispatchEvent(new CustomEvent("status-change"));
  }
  root.addEventListener("storage", (e) => {
    if (e.key === PROGRESS_KEY || e.key === STATUS_KEY) {
      progress = read(PROGRESS_KEY); status = read(STATUS_KEY);
      root.dispatchEvent(new CustomEvent("status-change", { detail: { external: true } }));
    }
  });

  root.ModuleStatus = {
    STATES,
    get: (pid, mid) => statusOf(progress, status, pid, mid),
    set(pid, mid, value) { ({ progress, status } = applyStatus(progress, status, pid, mid, value, Date.now())); save(); },
    summary: (pid, modules) => summarize(modules, progress, status, pid),
    allStatus: () => status,
    mergeStatus(inc) {
      const before = countStatus(status);
      progress = read(PROGRESS_KEY);
      status = mergeStatus(status, inc, progress);
      save();
      return countStatus(status) - before;
    },
    reload() { progress = read(PROGRESS_KEY); status = read(STATUS_KEY); }
  };
})(typeof window !== "undefined" ? window : globalThis);
