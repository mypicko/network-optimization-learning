// 模拟考试的纯逻辑：组装题库、随机抽题、判分、生成错题本条目
// 题库来源：data/exam/<主题>.js（单选 / 多选 / 判断）+ 路径模块的自测问答题 + 入门快线的单选题
// 统一题目结构：{ key, id, type, module, lesson, q, options, answer, explain, page, scope }
//   key 与错题本一致：路径问答题沿用 "5g/<模块>/<序号>"，入门快线沿用 "qs-<快线 id>/<课>/<序号>"，
//   新题为 "exam-5g/<题号>"——同一道题无论在哪里答错，都落在错题本的同一条记录上
(function (root) {
  const TYPES = [
    { id: "judge", label: "判断题" },
    { id: "single", label: "单选题" },
    { id: "multi", label: "多选题" },
    { id: "essay", label: "问答题" }
  ];
  const TYPE_ORDER = TYPES.map((t) => t.id);
  const letter = (i) => String.fromCharCode(65 + i);

  function buildBank({ topic, bank = [], pathway = null, quickstart = null }) {
    const page = `pathway.html?t=${topic}`;
    const out = bank.map((x) => ({
      key: `exam-${topic}/${x.id}`, id: x.id, type: x.t, module: x.m, q: x.q,
      options: x.o || null, answer: x.a, explain: x.e || "", page, scope: x.m
    }));
    if (pathway) {
      pathway.stages.forEach((st) => st.modules.forEach((m) => (m.quiz || []).forEach((qz, i) => out.push({
        key: `${pathway.id}/${m.id}/${i}`, id: `${m.id}-q${i + 1}`, type: "essay", module: m.id, q: qz.q,
        options: null, answer: qz.a, explain: "", page, scope: `${m.id}-q${i + 1}`
      }))));
    }
    if (quickstart) {
      quickstart.lessons.forEach((l) => (l.quiz || []).forEach((qz, i) => out.push({
        key: `qs-${quickstart.id}/${l.id}/${i}`, id: `${l.id}-q${i + 1}`, type: "single",
        module: (l.deeper || [])[0] || null, lesson: l.id, q: qz.q, options: qz.options, answer: qz.answer,
        explain: qz.explain || "", page: `quickstart.html?t=${topic}`, scope: `${l.id}-q${i + 1}`
      })));
    }
    return out;
  }

  // 可复现的伪随机数（mulberry32），测试时可传固定种子
  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffle(list, rand) {
    const a = [...list];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // 筛选：题型、模块范围、只考错题（onlyKeys）
  function filterBank(bank, { types, modules, onlyKeys } = {}) {
    const ts = types && types.length ? new Set(types) : null;
    const ms = modules && modules.length ? new Set(modules) : null;
    const ks = onlyKeys ? new Set(onlyKeys) : null;
    return bank.filter((x) => (!ts || ts.has(x.type)) && (!ms || ms.has(x.module)) && (!ks || ks.has(x.key)));
  }

  // 抽题：在各题型之间尽量均衡地轮流抽取，再按 判断 → 单选 → 多选 → 问答 排序，像正式试卷一样
  function draw(bank, opts, rand = Math.random) {
    const pool = filterBank(bank, opts);
    const count = Math.max(1, Math.min(Number(opts.count) || 0, pool.length));
    const byType = TYPE_ORDER.map((t) => shuffle(pool.filter((x) => x.type === t), rand)).filter((g) => g.length);
    const picked = [];
    let i = 0;
    while (picked.length < count && byType.some((g) => g.length)) {
      const g = byType[i % byType.length];
      if (g.length) picked.push(g.shift());
      i++;
    }
    return picked.sort((a, b) => TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type));
  }

  // 客观题判分：多选题要求完全一致（多选、少选都算错）；问答题返回 null，由考生自评
  function grade(q, response) {
    if (q.type === "essay") return null;
    if (response === undefined || response === null || (Array.isArray(response) && !response.length)) return false;
    if (q.type === "multi") {
      const want = [...q.answer].sort().join(",");
      const got = [...new Set(response.map(Number))].sort().join(",");
      return want === got;
    }
    if (q.type === "judge") return response === q.answer;
    return Number(response) === q.answer;
  }

  // 只传 q 时返回正确答案；显式传入 value（哪怕是 undefined，即未作答）时返回考生答案
  function answerText(q, ...rest) {
    const value = rest.length ? rest[0] : q.answer;
    if (q.type === "essay") return String(value || "");
    if (q.type === "judge") return value === true ? "正确" : value === false ? "错误" : "未作答";
    if (value === undefined || value === null || (Array.isArray(value) && !value.length)) return "未作答";
    const idx = Array.isArray(value) ? [...value].map(Number).sort() : [Number(value)];
    return idx.map((i) => `${letter(i)}. ${q.options[i]}`).join("；");
  }

  // 汇总：客观题自动判分；问答题按考生自评计入（未自评的不计入得分，单独提示）
  function summarize(paper, responses, selfGrades = {}) {
    const rows = paper.map((q) => {
      const ok = q.type === "essay" ? (q.key in selfGrades ? selfGrades[q.key] : null) : grade(q, responses[q.key]);
      return { key: q.key, type: q.type, ok };
    });
    const graded = rows.filter((r) => r.ok !== null);
    const correct = graded.filter((r) => r.ok).length;
    const byType = TYPES.map((t) => {
      const rs = rows.filter((r) => r.type === t.id);
      return { type: t.id, label: t.label, total: rs.length, correct: rs.filter((r) => r.ok).length, pending: rs.filter((r) => r.ok === null).length };
    }).filter((x) => x.total);
    return {
      total: rows.length, correct, graded: graded.length,
      pending: rows.length - graded.length,
      percent: graded.length ? Math.round((correct / graded.length) * 100) : 0,
      byType, rows
    };
  }

  // 错题本条目：参考答案里带上正确选项和解析
  function reviewMeta(q, titleOf) {
    const a = q.type === "essay" ? q.answer : `正确答案：${answerText(q)}。${q.explain}`;
    return { key: q.key, q: q.q, a, title: titleOf ? titleOf(q) : "模拟考试", page: q.page, scope: q.scope };
  }

  const api = { TYPES, buildBank, rng, shuffle, filterBank, draw, grade, answerText, summarize, reviewMeta, letter };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Exam = api;
})(typeof window !== "undefined" ? window : globalThis);
