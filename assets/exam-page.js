// 模拟考试页面：设置 → 答题 → 交卷判分 → 问答题自评；答错的题记入错题本，成绩记录保存在本浏览器
(function () {
  const E = window.Exam;
  const R = window.ReviewStore;
  const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const HISTORY_KEY = "pathway-exam-v1";
  const SETTINGS_KEY = "pathway-exam-settings-v1";
  const COUNTS = [10, 20, 30, 50];

  // 主题：?t= 指定；从首页 / 错题本“开始今日复习”进来时（不带 t），选到期题最多的主题
  const topic = (() => {
    const qs = new URLSearchParams(location.search);
    if (qs.get("t")) return qs.get("t");
    if (qs.get("scope") === "due" && R) {
      const ids = Object.keys(window.PATHWAYS || {});
      const quickOf = (id) => (Object.values(window.QUICKSTART || {}).find((q) => q.pathway === id) || {}).id;
      const count = (id) => R.due().filter((w) => w.key.startsWith(`${id}/`) || w.key.startsWith(`exam-${id}/`)
        || (quickOf(id) && w.key.startsWith(`qs-${quickOf(id)}/`))).length;
      const best = ids.map((id) => [id, count(id)]).sort((a, b) => b[1] - a[1])[0];
      if (best && best[1]) return best[0];
    }
    return "5g";
  })();
  const pathway = (window.PATHWAYS || {})[topic];
  const quick = Object.values(window.QUICKSTART || {}).find((q) => q.pathway === topic) || null;
  const bank = E.buildBank({ topic, bank: (window.EXAM_BANK || {})[topic] || [], pathway, quickstart: quick });

  // 模块编号与标题，用于题目出处
  const modInfo = {};
  (pathway ? pathway.stages : []).forEach((s, i) => s.modules.forEach((m, j) => { modInfo[m.id] = { no: `${i}.${j + 1}`, title: m.title, stage: s.id }; }));
  const lessonInfo = {};
  (quick ? quick.lessons : []).forEach((l, i) => { lessonInfo[l.id] = `入门快线 第 ${i} 课 ${l.title}`; });
  const sourceOf = (q) => (q.lesson ? lessonInfo[q.lesson] : modInfo[q.module] ? `${modInfo[q.module].no} ${modInfo[q.module].title}` : "模拟考试");
  const stageOf = (q) => (modInfo[q.module] || {}).stage;

  const store = {
    get(key, dflt) { try { const v = JSON.parse(localStorage.getItem(key)); return v ?? dflt; } catch (e) { return dflt; } },
    set(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) { /* 存储不可用时只影响历史记录 */ } }
  };

  let state = { view: "setup" };
  const root = () => document.getElementById("exam");

  // ---------- 设置 ----------
  function defaults() {
    const stored = { count: 20, types: E.TYPES.map((t) => t.id), scope: "all", stages: [], ...store.get(SETTINGS_KEY, {}) };
    // 设置跨主题共用：只保留当前主题存在的阶段，切到别的主题时“按阶段”的选择不会串
    const own = new Set((pathway ? pathway.stages : []).map((st) => st.id));
    const saved = { ...stored, stages: (stored.stages || []).filter((id) => own.has(id)) };
    // 从首页“开始今日复习”进来：只考今天到期的题，题型不限，题数取全部到期题
    if (new URLSearchParams(location.search).get("scope") === "due" && dueKeys().length) {
      return { ...saved, scope: "due", types: E.TYPES.map((t) => t.id), count: Math.max(1, dueKeys().length) };
    }
    return saved.scope === "due" && !dueKeys().length ? { ...saved, scope: "all" } : saved;
  }

  const inBank = (keys) => keys.filter((k) => bank.some((q) => q.key === k));
  const dueKeys = () => (R ? inBank(R.due().map((w) => w.key)) : []);

  function poolFor(s) {
    const wrongKeys = R ? R.wrong().map((w) => w.key) : [];
    const only = s.scope === "wrong" ? wrongKeys : s.scope === "due" ? dueKeys() : null;
    const opts = { types: s.types, onlyKeys: only };
    const pool = E.filterBank(bank, opts);
    return s.scope === "stages" && s.stages.length ? pool.filter((q) => s.stages.includes(stageOf(q))) : pool;
  }

  function setupHtml(s) {
    const pool = poolFor(s);
    const wrongN = R ? inBank(R.wrong().map((w) => w.key)).length : 0;
    const dueN = dueKeys().length;
    const typeCount = (t) => bank.filter((q) => q.type === t).length;
    const history = store.get(HISTORY_KEY, []).slice(0, 8);
    return `
      <section class="hero">
        <h1>模拟考试${pathway ? `：${esc(pathway.title)}` : ""}</h1>
        ${window.TopicSwitch ? window.TopicSwitch.html(topic, "exam.html", (id) => ((window.EXAM_BANK || {})[id] || []).length > 0) : ""}
        <p>每次从题库随机抽题组卷。单选、多选、判断题交卷后自动判分；问答题交卷后给出参考答案，由你自己评分。答错的题自动记入<a href="notes.html#review">错题本</a>。</p>
        <p class="meta">题库共 ${bank.length} 题：${E.TYPES.map((t) => `${t.label} ${typeCount(t.id)}`).join(" · ")}。题目依据 3GPP 规范和本站讲解内容编写。</p>
      </section>
      <section class="ex-card">
        <h2>题目数量</h2>
        <div class="ex-row">${COUNTS.map((n) => `<button type="button" class="chip-btn${s.count === n ? " active" : ""}" data-count="${n}">${n} 题</button>`).join("")}
          <label class="ex-custom">自定义 <input type="number" id="ex-count" min="1" max="${bank.length}" value="${COUNTS.includes(s.count) ? "" : s.count}" placeholder="题数"></label></div>
        <h2>题型</h2>
        <div class="ex-row">${E.TYPES.map((t) => `<label class="ex-check"><input type="checkbox" data-type="${t.id}"${s.types.includes(t.id) ? " checked" : ""}> ${t.label}</label>`).join("")}</div>
        <h2>范围</h2>
        <div class="ex-row ex-col">
          <label class="ex-check"><input type="radio" name="scope" value="all"${s.scope === "all" ? " checked" : ""}> 全部内容</label>
          <label class="ex-check"><input type="radio" name="scope" value="stages"${s.scope === "stages" ? " checked" : ""}> 按阶段选择</label>
          <div class="ex-stages"${s.scope === "stages" ? "" : " hidden"}>${(pathway ? pathway.stages : []).map((st, i) =>
            `<label class="ex-check"><input type="checkbox" data-stage="${st.id}"${s.stages.includes(st.id) ? " checked" : ""}> ${i} ${esc(st.title)}</label>`).join("")}</div>
          <label class="ex-check"><input type="radio" name="scope" value="due"${s.scope === "due" ? " checked" : ""}${dueN ? "" : " disabled"}> 今天该复习的错题（${dueN} 道，按 1 / 3 / 7 / 14 天间隔安排）</label>
          <label class="ex-check"><input type="radio" name="scope" value="wrong"${s.scope === "wrong" ? " checked" : ""}${wrongN ? "" : " disabled"}> 只考错题本里的题（${wrongN} 道）</label>
        </div>
        <p class="ex-avail">当前条件下可抽 <strong>${pool.length}</strong> 题${pool.length < s.count ? `，将全部抽出（${pool.length} 题）` : `，本次抽 ${s.count} 题`}</p>
        <button class="btn" id="ex-start"${pool.length ? "" : " disabled"}>开始考试</button>
      </section>
      ${history.length ? `<section class="ex-card"><h2>最近成绩</h2><table class="ex-history"><thead><tr><th>时间</th><th>题数</th><th>得分</th><th>用时</th></tr></thead><tbody>${history.map((h) =>
        `<tr><td>${esc(h.at)}</td><td>${h.total}</td><td>${h.correct}/${h.graded}（${h.percent}%）${h.pending ? `<span class="meta">，${h.pending} 道问答未自评</span>` : ""}</td><td>${esc(h.time)}</td></tr>`).join("")}</tbody></table></section>` : ""}`;
  }

  function readSetup() {
    const r = root();
    const custom = Number(r.querySelector("#ex-count").value);
    const active = r.querySelector("[data-count].active");
    return {
      count: custom > 0 ? Math.min(Math.floor(custom), bank.length) : active ? Number(active.dataset.count) : 20,
      types: [...r.querySelectorAll("[data-type]:checked")].map((x) => x.dataset.type),
      scope: (r.querySelector("[name=scope]:checked") || {}).value || "all",
      stages: [...r.querySelectorAll("[data-stage]:checked")].map((x) => x.dataset.stage)
    };
  }

  // ---------- 答题 ----------
  function questionInput(q, i) {
    const name = `q-${i}`;
    if (q.type === "essay") return `<textarea class="ex-essay" data-key="${esc(q.key)}" rows="4" placeholder="写下你的答案（可选）。交卷后对照参考答案自己评分。"></textarea>`;
    if (q.type === "judge") return `<div class="ex-opts ex-judge">${[[true, "正确"], [false, "错误"]].map(([v, t]) =>
      `<label class="ex-opt"><input type="radio" name="${name}" data-key="${esc(q.key)}" value="${v}"> ${t}</label>`).join("")}</div>`;
    const kind = q.type === "multi" ? "checkbox" : "radio";
    return `<div class="ex-opts">${q.options.map((o, j) =>
      `<label class="ex-opt"><input type="${kind}" name="${name}" data-key="${esc(q.key)}" value="${j}"> ${E.letter(j)}. ${esc(o)}</label>`).join("")}</div>`;
  }

  function groupedPaper(paper, render) {
    let n = 0;
    const cn = ["一", "二", "三", "四"];
    return E.TYPES.map((t) => paper.map((q, i) => ({ q, i })).filter((x) => x.q.type === t.id)).filter((g) => g.length).map((g, gi) => {
      const t = E.TYPES.find((x) => x.id === g[0].q.type);
      const tip = t.id === "multi" ? "（多选、少选均不得分）" : t.id === "essay" ? "（交卷后自评）" : "";
      return `<section class="ex-group"><h2>${cn[gi]}、${t.label}<span class="meta">（共 ${g.length} 题）${tip}</span></h2>${g.map(({ q, i }) => render(q, i, ++n)).join("")}</section>`;
    }).join("");
  }

  function examHtml() {
    const p = state.paper;
    return `
      <div class="ex-bar"><span id="ex-progress">已答 0 / ${p.length}</span><span id="ex-timer">00:00</span><button class="btn" id="ex-submit">交卷</button></div>
      ${groupedPaper(p, (q, i, no) => `<div class="ex-q" id="exq-${i}"><p class="ex-qt"><span class="ex-no">${no}</span>${esc(q.q)}</p>${questionInput(q, i)}</div>`)}
      <div class="ex-foot"><button class="btn" id="ex-submit2">交卷</button></div>`;
  }

  function collect() {
    const r = root();
    const resp = {};
    state.paper.forEach((q, i) => {
      if (q.type === "essay") { resp[q.key] = r.querySelector(`textarea[data-key="${CSS.escape(q.key)}"]`).value.trim(); return; }
      const checked = [...r.querySelectorAll(`[name="q-${i}"]:checked`)];
      if (!checked.length) return;
      if (q.type === "multi") resp[q.key] = checked.map((x) => Number(x.value));
      else if (q.type === "judge") resp[q.key] = checked[0].value === "true";
      else resp[q.key] = Number(checked[0].value);
    });
    return resp;
  }

  const answered = (q, resp) => (q.type === "essay" ? !!resp[q.key] : resp[q.key] !== undefined);
  const fmtTime = (ms) => { const s = Math.round(ms / 1000); return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`; };

  // ---------- 交卷与结果 ----------
  function submit() {
    const resp = collect();
    const blank = state.paper.filter((q) => q.type !== "essay" && !answered(q, resp)).length;
    if (blank && !confirm(`还有 ${blank} 道客观题没有作答，未作答按答错计。确定交卷吗？`)) return;
    clearInterval(state.timer);
    state = { ...state, view: "result", responses: resp, selfGrades: {}, elapsed: Date.now() - state.startedAt };
    // 客观题判分后立即记入错题本：答错进本，原来在错题本里的题答对了则移出
    if (R) state.paper.filter((q) => q.type !== "essay").forEach((q) => R.record(E.reviewMeta(q, sourceOf), E.grade(q, resp[q.key])));
    saveHistory(true);
    render();
    window.scrollTo(0, 0);
  }

  function saveHistory(isNew) {
    const s = E.summarize(state.paper, state.responses, state.selfGrades);
    const d = new Date(state.startedAt);
    const entry = { id: state.startedAt, at: `${d.getMonth() + 1}-${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
      total: s.total, correct: s.correct, graded: s.graded, pending: s.pending, percent: s.percent, time: fmtTime(state.elapsed) };
    const list = store.get(HISTORY_KEY, []).filter((h) => h.id !== entry.id);
    store.set(HISTORY_KEY, [entry, ...list].slice(0, 30));
    return isNew ? s : s;
  }

  function resultHtml() {
    const s = E.summarize(state.paper, state.responses, state.selfGrades);
    const wrong = s.rows.filter((r) => r.ok === false).length;
    const card = (q, i, no) => {
      const ok = q.type === "essay" ? (q.key in state.selfGrades ? state.selfGrades[q.key] : null) : E.grade(q, state.responses[q.key]);
      const badge = ok === null ? `<span class="badge">待自评</span>` : ok ? `<span class="badge badge-mine">✅ 正确</span>` : `<span class="badge badge-wrong">❌ 错误</span>`;
      const src = `<a href="${esc(q.page)}#${esc(q.lesson || q.module || "")}">${esc(sourceOf(q))} →</a>`;
      if (q.type === "essay") {
        const mine = state.responses[q.key];
        return `<div class="ex-q ex-r ${ok === null ? "" : ok ? "ok" : "bad"}"><p class="ex-qt"><span class="ex-no">${no}</span>${esc(q.q)} ${badge}</p>
          <div class="ex-ans"><span class="meta">你的答案：</span>${mine ? esc(mine) : `<span class="meta">（未填写）</span>`}</div>
          <div class="ex-ref"><span class="meta">参考答案：</span>${esc(q.answer)}</div>
          <div class="ex-grade"><span class="meta">对照参考答案，你答对了吗？</span>
            <button type="button" class="btn-small ok${ok === true ? " on" : ""}" data-self="${esc(q.key)}" data-v="1">✅ 答对了</button>
            <button type="button" class="btn-small bad${ok === false ? " on" : ""}" data-self="${esc(q.key)}" data-v="0">❌ 没答对</button></div>
          <p class="meta ex-src">出处：${src}</p></div>`;
      }
      return `<div class="ex-q ex-r ${ok ? "ok" : "bad"}"><p class="ex-qt"><span class="ex-no">${no}</span>${esc(q.q)} ${badge}</p>
        ${q.options ? `<ul class="ex-olist">${q.options.map((o, j) => {
          const right = q.type === "multi" ? q.answer.includes(j) : q.answer === j;
          const picked = q.type === "multi" ? (state.responses[q.key] || []).includes(j) : state.responses[q.key] === j;
          return `<li class="${right ? "right" : ""}${picked ? " picked" : ""}">${E.letter(j)}. ${esc(o)}${picked ? ` <span class="meta">← 你的选择</span>` : ""}</li>`;
        }).join("")}</ul>` : ""}
        <div class="ex-ans"><span class="meta">你的答案：</span>${esc(E.answerText(q, state.responses[q.key]))}　<span class="meta">正确答案：</span><strong>${esc(E.answerText(q))}</strong></div>
        ${q.explain ? `<div class="ex-ref"><span class="meta">解析：</span>${esc(q.explain)}</div>` : ""}
        <p class="meta ex-src">出处：${src}</p></div>`;
    };
    return `
      <section class="ex-card ex-score">
        <div class="ex-big">${s.percent}<span>分</span></div>
        <div>
          <p>答对 <strong>${s.correct}</strong> / ${s.graded} 题（已判分）${s.pending ? `，还有 <strong>${s.pending}</strong> 道问答题等你自评` : ""} · 用时 ${fmtTime(state.elapsed)}</p>
          <table class="ex-history"><tbody>${s.byType.map((t) => `<tr><td>${t.label}</td><td>${t.correct} / ${t.total}${t.pending ? `<span class="meta">（${t.pending} 道待自评）</span>` : ""}</td></tr>`).join("")}</tbody></table>
          <p class="meta">答错的题已记入<a href="notes.html#review">错题本</a>，明天复习。错题本里到期的题这次答对，推进到下一轮（间隔 3 / 7 / 14 天），连续通过 ${R ? R.ROUNDS : 4} 轮后移出；还没到复习时间的题提前答对，不改变安排。</p>
          <div class="ex-row">
            <button class="btn" data-act="again">按同样设置再考一次</button>
            ${wrong ? `<button class="btn btn-ghost" data-act="retry-wrong">只重做本次错题（${wrong} 道）</button>` : ""}
            <button class="btn btn-ghost" data-act="setup">重新设置</button>
          </div>
        </div>
      </section>
      ${groupedPaper(state.paper, card)}`;
  }

  // ---------- 渲染与事件 ----------
  function start(settings, paper) {
    store.set(SETTINGS_KEY, settings);
    state = { view: "exam", settings, paper: paper || E.draw(poolFor(settings), { count: settings.count }), startedAt: Date.now() };
    render();
    window.scrollTo(0, 0);
    state.timer = setInterval(() => {
      const el = document.getElementById("ex-timer");
      if (el) el.textContent = fmtTime(Date.now() - state.startedAt);
    }, 1000);
  }

  function render() {
    const r = root();
    if (state.view === "setup") r.innerHTML = setupHtml(state.settings || defaults());
    else if (state.view === "exam") r.innerHTML = examHtml();
    else r.innerHTML = resultHtml();
  }

  function bind() {
    const r = root();
    r.addEventListener("click", (e) => {
      const t = e.target;
      if (state.view === "setup") {
        const c = t.closest("[data-count]");
        if (c) { state.settings = { ...readSetup(), count: Number(c.dataset.count) }; r.querySelector("#ex-count").value = ""; render(); return; }
        if (t.closest("#ex-start")) { start(readSetup()); return; }
      }
      if (state.view === "exam" && t.closest("#ex-submit, #ex-submit2")) { submit(); return; }
      if (state.view === "result") {
        const sg = t.closest("[data-self]");
        if (sg) {
          const key = sg.dataset.self, ok = sg.dataset.v === "1";
          state.selfGrades = { ...state.selfGrades, [key]: ok };
          const q = state.paper.find((x) => x.key === key);
          if (R && q) R.record(E.reviewMeta(q, sourceOf), ok);
          saveHistory(false);
          const y = window.scrollY;
          render();
          window.scrollTo(0, y);
          return;
        }
        const act = t.closest("[data-act]");
        if (act) {
          const a = act.dataset.act;
          if (a === "again") start(state.settings);
          else if (a === "setup") { state = { view: "setup", settings: state.settings }; render(); }
          else if (a === "retry-wrong") {
            const s = E.summarize(state.paper, state.responses, state.selfGrades);
            const keys = new Set(s.rows.filter((x) => x.ok === false).map((x) => x.key));
            start(state.settings, state.paper.filter((q) => keys.has(q.key)));
          }
        }
      }
    });
    r.addEventListener("change", (e) => {
      if (state.view === "setup") {
        if (e.target.id === "ex-count") { const v = Number(e.target.value); if (v > 0) state.settings = { ...readSetup(), count: Math.min(Math.floor(v), bank.length) }; }
        else state.settings = readSetup();
        render();
      } else if (state.view === "exam") updateProgress();
    });
    r.addEventListener("input", (e) => { if (state.view === "exam" && e.target.matches("textarea")) updateProgress(); });
    window.addEventListener("beforeunload", (e) => { if (state.view === "exam") { e.preventDefault(); e.returnValue = ""; } });
  }

  function updateProgress() {
    const resp = collect();
    const n = state.paper.filter((q) => answered(q, resp)).length;
    const el = document.getElementById("ex-progress");
    if (el) el.textContent = `已答 ${n} / ${state.paper.length}`;
  }

  window.ExamPage = { render: () => { state = { view: "setup", settings: defaults() }; render(); bind(); } };
})();
