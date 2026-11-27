// 首页学习统计：连续学习天数、本周学完模块数、累计学完、最近 14 天活跃情况
// 数据都来自本浏览器已有的记录，不额外上传：
//   pathway-progress-v1 模块完成时间  pathway-review-v1 错题本作答时间  pathway-exam-v1 考试时间
//   pathway-days-v1     打开模块讲解的日期（由路线页记录，只留最近 400 天）
(function (root) {
  const DAYS_KEY = "pathway-days-v1";
  const pad = (n) => String(n).padStart(2, "0");
  const dayKey = (t) => { const d = new Date(t); return isNaN(d) ? null : `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
  const addDays = (t, n) => { const d = new Date(t); d.setDate(d.getDate() + n); return d; };

  // 纯函数：progress { 主题: { 模块: 时间戳 } }、days ["YYYY-MM-DD"]、review { items }、exams [{ id: 时间戳 }]
  // topics 只统计这些主题的模块（入门快线等不算进“模块”数）
  function learningStats({ progress = {}, days = [], review = {}, exams = [], topics = [], now = Date.now() }) {
    const active = new Set(days.filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)));
    const doneTimes = [];
    Object.entries(progress || {}).forEach(([pid, mods]) => {
      Object.values(mods || {}).forEach((ts) => {
        const k = dayKey(ts);
        if (k) active.add(k);
        if (topics.includes(pid)) doneTimes.push(ts);
      });
    });
    Object.values((review && review.items) || {}).forEach((it) => { const k = dayKey(it.updated); if (k) active.add(k); });
    (exams || []).forEach((e) => { const k = dayKey(e.id); if (k) active.add(k); });

    const today = dayKey(now);
    let cur = active.has(today) ? new Date(now) : addDays(now, -1);   // 今天还没学，不算断：从昨天往回数
    let streak = 0;
    while (active.has(dayKey(cur))) { streak++; cur = addDays(cur, -1); }

    const weekStart = addDays(now, -6); weekStart.setHours(0, 0, 0, 0);
    const week = doneTimes.filter((ts) => ts >= weekStart.getTime()).length;
    const recent = Array.from({ length: 14 }, (_, i) => { const k = dayKey(addDays(now, i - 13)); return { day: k, active: active.has(k) }; });
    return { streak, week, total: doneTimes.length, activeDays: active.size, recent, todayActive: active.has(today) };
  }

  // 记录今天打开过讲解；保留最近 400 天
  function touch(list, now = Date.now()) {
    const k = dayKey(now);
    const arr = Array.isArray(list) ? list : [];
    return arr.includes(k) ? arr : [...arr, k].slice(-400);
  }

  const pure = { DAYS_KEY, dayKey, learningStats, touch };
  if (typeof module !== "undefined" && module.exports) { module.exports = pure; return; }

  // ---------- 浏览器 ----------
  const read = (key, dflt) => { try { const v = JSON.parse(localStorage.getItem(key)); return v ?? dflt; } catch (e) { return dflt; } };
  function record() {
    try { localStorage.setItem(DAYS_KEY, JSON.stringify(touch(read(DAYS_KEY, [])))); } catch (e) { /* 忽略 */ }
  }
  function current() {
    return learningStats({
      progress: read("pathway-progress-v1", {}), days: read(DAYS_KEY, []), review: read("pathway-review-v1", {}),
      exams: read("pathway-exam-v1", []), topics: Object.keys(root.PATHWAYS || {})
    });
  }
  function render(el) {
    if (!el) return;
    const s = current();
    if (!s.activeDays) { el.hidden = true; return; }
    el.hidden = false;
    const dots = s.recent.map((d) => `<span class="sd${d.active ? " on" : ""}" title="${d.day}${d.active ? " 有学习记录" : ""}"></span>`).join("");
    el.innerHTML = `<div class="st-item"><strong>${s.streak}</strong><span>连续学习（天）</span></div>
      <div class="st-item"><strong>${s.week}</strong><span>近 7 天学完模块</span></div>
      <div class="st-item"><strong>${s.total}</strong><span>累计学完模块</span></div>
      <div class="st-days"><div class="st-dots" aria-label="最近 14 天学习记录">${dots}</div><span>最近 14 天${s.todayActive ? " · 今天已学习 ✅" : " · 今天还没学"}</span></div>`;
  }
  root.Stats = { ...pure, record, current, render };
})(typeof window !== "undefined" ? window : globalThis);
