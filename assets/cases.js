// 网优案例库：先看现象和数据、选出最可能的原因，再展开定位过程、根因、措施和验证
// 数据在 data/cases/<主题>.js；做过的案例记在 localStorage（pathway-cases-v1：{ 案例 id: { pick, ok, at } }）
(function (root) {
  const KEY = "pathway-cases-v1";
  const CATS = ["覆盖", "切换", "掉线", "接入", "速率", "干扰", "核心网"];

  // 纯函数：按分类和关联模块筛选
  const filterCases = (list, { cat, module } = {}) =>
    (list || []).filter((c) => (!cat || c.cat === cat) && (!module || (c.modules || []).includes(module)));
  const countByCat = (list) => CATS.map((cat) => ({ cat, n: filterCases(list, { cat }).length })).filter((x) => x.n);

  const pure = { KEY, CATS, filterCases, countByCat };
  if (typeof module !== "undefined" && module.exports) { module.exports = pure; return; }

  // ---------- 浏览器 ----------
  const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const LETTERS = "ABCDEFGH";
  const TOOL_NAMES = { budget: "链路预算与覆盖半径", report: "测量上报值换算", kpi: "KPI 计算", pci: "PCI 规划核查" };
  const read = () => { try { const v = JSON.parse(localStorage.getItem(KEY)); return v && typeof v === "object" ? v : {}; } catch (e) { return {}; } };
  const save = (v) => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* 存储不可用时只在本次有效 */ } };

  function analysisHtml(c) {
    const list = (arr) => `<ol>${arr.map((x) => `<li>${esc(x)}</li>`).join("")}</ol>`;
    const tools = (c.tools || []).filter((t) => TOOL_NAMES[t]).map((t) => `<a href="tools.html#${t}">🧮 ${TOOL_NAMES[t]}</a>`).join("");
    return `<div class="case-analysis">
      <h4>定位过程</h4>${list(c.locate)}
      <h4>根因</h4><p>${esc(c.cause)}</p>
      <h4>优化措施</h4>${list(c.actions)}
      <h4>效果验证</h4><p>${esc(c.verify)}</p>
      <p class="case-takeaway">💡 ${esc(c.takeaway)}</p>
      ${tools ? `<div class="mod-tools">${tools}</div>` : ""}
    </div>`;
  }

  function caseHtml(c, done) {
    const data = c.data.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join("");
    const opts = c.options.map((o, i) => `<li><button type="button" class="case-opt" data-i="${i}"><span class="case-letter">${LETTERS[i]}</span>${esc(o)}</button></li>`).join("");
    const badge = done ? `<span class="badge ${done.ok ? "badge-ok" : "badge-due"}">${done.ok ? "已答对" : "做过"}</span>` : "";
    return `<details class="case" id="${esc(c.id)}" data-case="${esc(c.id)}">
      <summary><span class="badge">${esc(c.cat)}</span><span class="case-title">${esc(c.title)}</span><span class="meta">${esc(c.level)}</span>${badge}</summary>
      <div class="case-body">
        <h4>现象</h4><p>${esc(c.symptom)}</p>
        <div class="table-wrap"><table class="case-data"><tbody>${data}</tbody></table></div>
        <h4>${esc(c.question)}</h4>
        <ol class="case-opts">${opts}</ol>
        <p class="case-feedback" aria-live="polite"></p>
        <button type="button" class="btn btn-ghost case-reveal">直接看分析</button>
        <div class="case-more" hidden></div>
      </div>
    </details>`;
  }

  function reveal(el, c, pick) {
    el.querySelectorAll(".case-opt").forEach((b) => {
      const i = Number(b.dataset.i);
      b.disabled = true;
      b.classList.toggle("right", i === c.answer);
      b.classList.toggle("wrong", pick !== null && i === pick && i !== c.answer);
    });
    const fb = el.querySelector(".case-feedback");
    const note = pick !== null && c.why && c.why[pick] ? `${esc(c.why[pick])} ` : "";
    fb.innerHTML = pick === null ? `参考答案：<strong>${LETTERS[c.answer]}</strong>。`
      : pick === c.answer ? "✅ 判断正确。下面看看完整的定位过程。"
        : `❌ ${note}参考答案是 <strong>${LETTERS[c.answer]}</strong>。`;
    el.querySelector(".case-reveal").hidden = true;
    const more = el.querySelector(".case-more");
    more.innerHTML = analysisHtml(c);
    more.hidden = false;
  }

  function bind(container, list) {
    const byId = Object.fromEntries(list.map((c) => [c.id, c]));
    container.addEventListener("click", (e) => {
      const el = e.target.closest("[data-case]");
      if (!el) return;
      const c = byId[el.dataset.case];
      const opt = e.target.closest(".case-opt");
      if (opt && !opt.disabled) {
        const pick = Number(opt.dataset.i);
        reveal(el, c, pick);
        save({ ...read(), [c.id]: { pick, ok: pick === c.answer, at: Date.now() } });
      } else if (e.target.closest(".case-reveal")) {
        reveal(el, c, null);
      }
    });
  }

  function renderPage(fallback = "5g") {
    const params = new URLSearchParams(location.search);
    const topic = (root.CASES || {})[params.get("t")] ? params.get("t") : fallback;
    const list = (root.CASES || {})[topic] || [];
    const el = document.getElementById("cases");
    const done = read();
    let cat = CATS.includes(params.get("cat")) ? params.get("cat") : "";
    const finished = list.filter((c) => done[c.id]).length;
    const sw = root.TopicSwitch ? root.TopicSwitch.html(topic, "cases.html", (id) => ((root.CASES || {})[id] || []).length > 0) : "";
    el.innerHTML = `<section class="hero">
        <h1>网优案例库</h1>${sw}
        <p>${list.length} 个典型问题，覆盖、切换、掉线、接入、速率、干扰都有。每个案例先给现象和数据，你先判断原因，再看完整的定位过程和优化措施。</p>
        <p class="meta">已做 ${finished} / ${list.length}。案例为原创教学示例，数值是虚构的，不对应任何真实网络；参数取值仅作示意，实际以设备厂家和运营商规范为准。</p>
      </section>
      <div class="case-filter" role="group" aria-label="按问题分类筛选"></div>
      <div class="case-list"></div>`;
    const filter = el.querySelector(".case-filter"), box = el.querySelector(".case-list");
    const draw = () => {
      filter.innerHTML = [{ cat: "", n: list.length }, ...countByCat(list)].map((x) =>
        `<button type="button" class="chip${x.cat === cat ? " on" : ""}" data-cat="${esc(x.cat)}">${x.cat || "全部"} ${x.n}</button>`).join("");
      box.innerHTML = filterCases(list, { cat }).map((c) => caseHtml(c, done[c.id])).join("");
    };
    filter.addEventListener("click", (e) => {
      const b = e.target.closest("[data-cat]");
      if (!b) return;
      cat = b.dataset.cat;
      draw();
    });
    bind(box, list);
    draw();
    // 从路线页跳过来时，展开对应的案例
    const target = location.hash && document.getElementById(location.hash.slice(1));
    if (target && target.matches("details.case")) { target.open = true; target.scrollIntoView(); }
  }

  // 路线页：模块里列出相关案例，点进案例库作答
  function moduleLinks(topic, mid) {
    const list = filterCases((root.CASES || {})[topic], { module: mid });
    if (!list.length) return "";
    return `<h4>网优案例</h4><ul class="case-links">${list.map((c) =>
      `<li><a href="cases.html?t=${encodeURIComponent(topic)}#${esc(c.id)}"><span class="badge">${esc(c.cat)}</span> ${esc(c.title)}</a></li>`).join("")}</ul>`;
  }

  root.CaseLib = { ...pure, renderPage, moduleLinks };
})(typeof window !== "undefined" ? window : globalThis);
