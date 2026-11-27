// 通途：渲染与本地进度
(function () {
  // ---------- 学习状态：统一由 assets/roadmap.js 的 ModuleStatus 读写（入门快线的“已完成”也走这里） ----------
  const MS = window.ModuleStatus;
  const statusOf = (pid, mid) => MS.get(pid, mid);
  const isDone = (pid, mid) => statusOf(pid, mid) === "done";
  const setDone = (pid, mid, done) => MS.set(pid, mid, done ? "done" : "todo");
  const STATE_LABEL = Object.fromEntries(MS.STATES.map((x) => [x.id, x.label]));

  // ---------- 工具 ----------
  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  // 主题图标：data/topics.js 的 mark / color
  function topicOf(id) { return (window.TOPICS || []).find((t) => t.id === id) || { id, title: id }; }
  function topicMark(t, cls = "") {
    return t && t.mark ? `<span class="topic-mark ${cls}" style="--tc:${esc(t.color || "#1f6feb")}" aria-hidden="true">${esc(t.mark)}</span>` : "";
  }
  // 模块编号（如 3.2）与前后模块
  function moduleNo(p, id) {
    for (let i = 0; i < p.stages.length; i++) {
      const j = p.stages[i].modules.findIndex((m) => m.id === id);
      if (j >= 0) return `${i}.${j + 1}`;
    }
    return "";
  }
  function allModules(p) {
    return p.stages.flatMap((s) => s.modules);
  }
  // done = 已学完（已完成 + 已掌握跳过）
  function stats(p, modules) {
    const mods = modules || allModules(p);
    const sum = MS.summary(p.id, mods);
    const hours = mods.reduce((a, m) => a + (m.hours || 0), 0);
    return { ...sum, done: sum.finished, hours };
  }
  // "TS 38.211" / "TR 38.913" → 3GPP 官方 FTP 归档目录（含全部版本）
  function specUrl(id) {
    const m = /^T[SR]\s+(\d{2})\.(\d{3}(?:-\d+)?)$/.exec(String(id).trim());
    return m ? `https://www.3gpp.org/ftp/Specs/archive/${m[1]}_series/${m[1]}.${m[2]}/` : null;
  }

  const RESOURCE_TYPES = { video: "视频", article: "文章", book: "书籍", lab: "实验", doc: "官方", tool: "工具" };
  const RESOURCE_ORDER = ["video", "article", "book", "lab", "tool", "doc"];

  // 资源按模块 id 索引：data/resources/<主题>.js（手工精选）+ <主题>-community.js（社区挖掘）
  function moduleResources(pid, m) {
    const pick = (src) => ((src && src[pid]) || {})[m.id] || [];
    const list = [...(m.resources || []), ...pick(window.RESOURCES_COMMUNITY), ...pick(window.RESOURCES)];
    return list.sort((a, b) => RESOURCE_ORDER.indexOf(a.type) - RESOURCE_ORDER.indexOf(b.type));
  }

  function renderResource(r) {
    const type = RESOURCE_TYPES[r.type] ? `<span class="rtype rtype-${r.type}">${RESOURCE_TYPES[r.type]}</span>` : "";
    const title = /^https?:\/\//.test(r.url || "")
      ? `<a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.title)}</a>`
      : `<strong>${esc(r.title)}</strong>`;
    const meta = r.meta ? ` <span class="rmeta">${esc(r.meta)}</span>` : "";
    const note = r.note ? `<div class="rnote">${esc(r.note)}</div>` : "";
    return `<li>${type}<div class="rbody">${title}${meta}${note}</div></li>`;
  }

  function bar(pct) {
    return `<div class="bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><span style="width:${pct}%"></span></div>`;
  }

  // ---------- 首页 ----------
  const LAST_KEY = "pathway-last-v1";   // 最近打开的模块：{ t 主题, m 模块 id, at 时间 }

  // 继续学习的目标：优先最近打开的模块（已学完则取该路径的下一个），否则取有进度的路径里的下一个模块
  function continueTarget() {
    let last = null;
    try { last = JSON.parse(localStorage.getItem(LAST_KEY)); } catch (e) { /* 忽略 */ }
    const live = (window.TOPICS || []).filter((t) => t.status === "live" && window.PATHWAYS[t.id]);
    const info = (t) => { const p = window.PATHWAYS[t.id]; return { t, p, s: stats(p) }; };
    let pick = null;
    const lt = last && live.find((t) => t.id === last.t);
    if (lt) {
      const x = info(lt);
      const mods = allModules(x.p);
      const m = mods.find((mm) => mm.id === last.m);
      const st = m && statusOf(x.p.id, m.id);
      pick = { ...x, m: m && st !== "done" && st !== "skip" ? m : x.s.next };
    } else {
      const started = live.map(info).filter((x) => x.s.done + x.s.learning > 0).sort((a, b) => b.s.done + b.s.learning - (a.s.done + a.s.learning));
      if (started[0]) pick = { ...started[0], m: started[0].s.next };
    }
    if (!pick || !pick.m) return null;
    const mods = allModules(pick.p);
    const si = pick.p.stages.findIndex((st) => st.modules.some((mm) => mm.id === pick.m.id));
    const mi = pick.p.stages[si].modules.findIndex((mm) => mm.id === pick.m.id);
    return { ...pick, no: `${si}.${mi + 1}`, idx: mods.indexOf(pick.m) };
  }

  function renderContinueCard() {
    const el = document.getElementById("continue-card");
    if (!el) return;
    const c = continueTarget();
    if (!c) { el.hidden = true; return; }
    el.hidden = false;
    el.innerHTML = `<div class="cc-main">
        <span class="meta cc-topic">${topicMark(c.t, "sm")}继续学习 · ${esc(c.t.title)}</span>
        <h2><span class="cc-no">${esc(c.no)}</span> ${esc(c.m.title)}</h2>
        <div class="cc-progress">${bar(c.s.pct)}<span class="meta">已学完 ${c.s.done}/${c.s.total} · 约 ${c.m.hours} 小时</span></div>
      </div>
      <a class="btn" href="pathway.html?t=${encodeURIComponent(c.t.id)}#${encodeURIComponent(c.m.id)}">继续 →</a>`;
  }

  function renderHome() {
    renderContinueCard();
    renderReviewCard();
    window.addEventListener("review-change", renderReviewCard);
    const el = document.getElementById("topics");
    const live = window.TOPICS.filter((t) => t.status === "live" && window.PATHWAYS[t.id]);
    const planned = window.TOPICS.filter((t) => !live.includes(t));
    el.innerHTML = live.map((t) => {
      const p = window.PATHWAYS[t.id];
      const s = stats(p);
      const quick = t.quick ? `<a class="tc-link" href="${esc(t.quick)}">零基础入门快线 →</a>` : "";
      return `<div class="topic-card live" style="--tc:${esc(t.color || "#1f6feb")}">
          <div class="topic-head">${topicMark(t)}<h3><a href="pathway.html?t=${t.id}">${esc(t.title)}</a></h3><span class="badge live">已上线</span></div>
          <p>${esc(t.desc)}</p>
          <div class="meta">${p.stages.length} 个阶段 · ${s.total} 个模块 · 约 ${s.hours} 小时</div>
          ${bar(s.pct)}
          <div class="meta">已学完 ${s.done}/${s.total}${s.learning ? ` · 学习中 ${s.learning}` : ""}</div>
          <div class="tc-actions"><a class="btn" href="pathway.html?t=${t.id}">${s.done + s.learning ? "进入路径" : "开始学习"}</a>${quick}
            <a class="tc-link" href="exam.html?t=${t.id}">模拟考试</a></div>
        </div>`;
    }).join("");
    const pl = document.getElementById("topics-planned");
    if (pl) pl.innerHTML = planned.length ? `<span class="meta">规划中：</span>${planned.map((t) => `<span class="chip" title="${esc(t.desc)}">${esc(t.title)}</span>`).join("")}` : "";
  }

  // ---------- 路径页 ----------
  function statusRow(m) {
    return `<div class="mod-status" role="group" aria-label="学习状态"><span class="meta">学习状态：</span>${MS.STATES.map((x) =>
      `<button type="button" class="st-btn" data-set-status="${x.id}" data-mid="${m.id}">${x.label}</button>`).join("")}</div>`;
  }

  function renderModule(p, m, idx) {
    const st = statusOf(p.id, m.id);
    const done = st === "done";
    const goals = m.goals.map((g) => `<li>${esc(g)}</li>`).join("");
    // 结构化讲解单独存放在 data/lessons/<主题>/<阶段>.js
    const lesson = ((window.LESSONS || {})[p.id] || {})[m.id];
    const figures = ((window.FIGURES || {})[p.id] || {})[m.id];
    const explain = lesson && window.Lesson
      ? `<h4>知识讲解</h4>${window.Lesson.renderExplain(m.id, lesson.sections, { prefix: idx, figures })}` : "";
    const concepts = m.concepts.map((c) => `<span class="chip">${esc(c)}</span>`).join("");
    const specs = (m.specs || []).map((s) => {
      const url = specUrl(s.id);
      const id = url
        ? `<a href="${esc(url)}" target="_blank" rel="noopener"><code>${esc(s.id)}</code></a>`
        : `<code>${esc(s.id)}</code>`;
      return `<li>${id} ${esc(s.note)}</li>`;
    }).join("");
    const quiz = (m.quiz || []).map((q, i) => renderSelfQuiz(p, m, idx, q, i)).join("");
    const flow = m.flow
      ? `<h4>信令流程</h4><div class="flow"><pre class="mermaid">${esc(m.flow)}</pre></div>`
      : "";
    const list = moduleResources(p.id, m);
    const community = list.some((r) => r.type === "video" || r.type === "article");
    const resources = list.length
      ? `<ul class="resources">${list.map(renderResource).join("")}</ul>` +
        (community ? "" : `<p class="muted">社区资源（B 站、知乎、通信人家园中被反复推荐的视频和文章）筛选中。</p>`)
      : `<p class="muted">待补充：将从通信社区（B 站、知乎、通信人家园）中被反复推荐的资源里精选。</p>`;

    return `<details class="module st-${st}" id="${m.id}" data-note-scope="${m.id}" data-note-title="${esc(idx + " " + m.title)}">
      <summary>
        <label class="check" title="标记完成">
          <input type="checkbox" data-mid="${m.id}" ${done ? "checked" : ""}>
        </label>
        <span class="mod-index">${idx}</span>
        <span class="mod-title">${esc(m.title)}</span>
        <span class="mod-state" data-pill="${m.id}"></span>
        <span class="mod-hours">约 ${m.hours} 小时</span>
      </summary>
      <div class="mod-body">
        ${statusRow(m)}
        <h4>学完你能</h4><ul class="goals">${goals}</ul>
        ${xrefHtml(m)}
        ${explain}
        <h4>${explain ? "核心概念回顾" : "核心概念"}</h4><div class="chips">${concepts}</div>
        ${specs ? `<h4>规范出处</h4><ul class="specs">${specs}</ul>` : ""}
        ${flow}
        ${sigLogHtml(p, m)}
        ${window.CaseLib ? window.CaseLib.moduleLinks(p.id, m.id) : ""}
        ${quiz ? `<h4>自测</h4>${quiz}` : ""}
        ${m.practice ? `<h4>实操任务</h4><p class="practice">${esc(m.practice)}</p>` : ""}
        ${toolsHtml(m)}
        <h4>精选资源</h4>${resources}
        ${pagerHtml(p, m)}
      </div>
    </details>`;
  }

  // ---------- 自测：先回忆，再看参考答案并自评；没答对的题进错题本 ----------
  const quizKey = (pid, mid, i) => `${pid}/${mid}/${i}`;

  function renderSelfQuiz(p, m, idx, q, i) {
    const key = quizKey(p.id, m.id, i);
    const rec = window.ReviewStore && window.ReviewStore.get(key);
    const tag = rec && rec.status === "wrong" ? `<span class="badge badge-wrong">错题本</span>` : "";
    return `<div class="sq" id="${esc(m.id)}-q${i + 1}" data-qkey="${esc(key)}" data-qmod="${esc(m.id)}" data-qi="${i}" data-qtitle="${esc(idx + " " + m.title)}">
      <p class="sq-q">Q${i + 1}. ${esc(q.q)} ${tag}</p>
      <button type="button" class="btn-small" data-sq-show>先想一想，再看参考答案</button>
      <div class="sq-answer" hidden>
        <p>${esc(q.a)}</p>
        <div class="sq-grade"><span class="meta">对照参考答案，你答对了吗？</span>
          <button type="button" class="btn-small ok" data-sq-grade="1">✅ 答对了</button>
          <button type="button" class="btn-small bad" data-sq-grade="0">❌ 没答对</button>
        </div>
        <p class="sq-result meta" hidden></p>
      </div>
    </div>`;
  }

  function handleSelfQuiz(e, p) {
    const box = e.target.closest(".sq");
    if (!box) return false;
    if (e.target.closest("[data-sq-show]")) {
      box.querySelector(".sq-answer").hidden = false;
      e.target.closest("[data-sq-show]").hidden = true;
      return true;
    }
    const g = e.target.closest("[data-sq-grade]");
    if (!g || !window.ReviewStore) return !!g;
    const correct = g.dataset.sqGrade === "1";
    const mod = allModules(p).find((m) => m.id === box.dataset.qmod);
    const q = mod && mod.quiz[Number(box.dataset.qi)];
    if (!q) return true;
    const prev = window.ReviewStore.get(box.dataset.qkey);
    window.ReviewStore.record({
      key: box.dataset.qkey, q: q.q, a: q.a, title: box.dataset.qtitle,
      page: `pathway.html?t=${p.id}`, scope: box.id
    }, correct);
    const item = window.ReviewStore.get(box.dataset.qkey);
    const res = box.querySelector(".sq-result");
    res.hidden = false;
    res.textContent = window.ReviewStore.afterText(prev, item, correct);
    const tag = box.querySelector(".badge-wrong");
    const inBook = item && item.status === "wrong";
    if (!inBook && tag) tag.remove();
    if (inBook && !tag) box.querySelector(".sq-q").insertAdjacentHTML("beforeend", ` <span class="badge badge-wrong">错题本</span>`);
    return true;
  }

  function reviewLink() {
    const s = window.ReviewStore ? window.ReviewStore.summary() : { due: 0, total: 0 };
    if (s.due) return `<a class="review-link due" href="notes.html#review">📒 今天该复习 ${s.due} 题</a>`;
    return s.total ? `<a class="review-link" href="notes.html#review">📒 错题本 ${s.total} 题，下次复习 ${window.ReviewStore.fmtDay(s.next)}</a>` : "";
  }

  // 首页：今日复习卡片
  function renderReviewCard() {
    const el = document.getElementById("review-today");
    if (!el || !window.ReviewStore) return;
    const s = window.ReviewStore.summary();
    if (!s.total) { el.hidden = true; return; }
    el.hidden = false;
    const intervals = window.ReviewStore.INTERVALS.join(" / ");
    el.innerHTML = s.due
      ? `<div><h2>今天该复习 <strong>${s.due}</strong> 题</h2><p class="meta">错题本共 ${s.total} 题，按 ${intervals} 天的间隔安排复习，连续答对 ${window.ReviewStore.ROUNDS} 轮后移出。每天花 10 分钟，记得更牢。</p></div>
         <div class="review-actions"><a class="btn" href="exam.html?scope=due">开始今日复习</a><a class="btn btn-ghost" href="notes.html#review">查看错题本</a></div>`
      : `<div><h2>今天的复习已完成 ✅</h2><p class="meta">错题本还有 ${s.total} 题，下次复习：${window.ReviewStore.fmtDay(s.next)}。</p></div>
         <div class="review-actions"><a class="btn btn-ghost" href="notes.html#review">查看错题本</a></div>`;
  }

  // 示意信令日志：data/logs/<主题>.js，逐条消息可展开看字段解读
  // 跨路线互链：xref: [{ t: 主题 id, m: 模块 id, note: 一句说明 }]，目标路径数据没加载就不显示
  function xrefHtml(m) {
    const items = (m.xref || []).map((x) => {
      const p = (window.PATHWAYS || {})[x.t];
      const target = p && p.stages.flatMap((s) => s.modules).find((mm) => mm.id === x.m);
      return target ? `<li><a href="pathway.html?t=${encodeURIComponent(x.t)}#${encodeURIComponent(x.m)}">${esc(p.title)} · ${esc(target.title)}</a>${x.note ? ` <span class="meta">${esc(x.note)}</span>` : ""}</li>` : "";
    }).join("");
    return items ? `<div class="xref"><span class="meta">相关路线：</span><ul>${items}</ul></div>` : "";
  }

  function sigLogHtml(p, m) {
    const log = ((window.SIGLOGS || {})[p.id] || {})[m.id];
    if (!log) return "";
    const steps = log.steps.map((st, i) => `<li><details class="sl-step" id="${m.id}-log${i + 1}">
      <summary><span class="sl-no">${i + 1}</span><span class="sl-dir">${esc(st.dir)}</span><span class="sl-msg">${esc(st.msg)}</span><span class="sl-if">${esc(st.iface)}</span></summary>
      <div class="sl-body">
        <table class="sl-fields"><tbody>${st.fields.map(([f, n]) => `<tr><td><code>${esc(f)}</code></td><td>${esc(n || "")}</td></tr>`).join("")}</tbody></table>
        <p>${esc(st.explain)}</p>
        <p class="meta">规范：${esc(st.spec)}</p>
      </div>
    </details></li>`).join("");
    return `<h4>信令日志解读 <span class="badge">示意</span></h4>
      <p class="sl-title"><strong>${esc(log.title)}</strong></p>
      <p>${esc(log.intro)}</p>
      <p class="sl-note">示意日志：按 3GPP 规范的消息结构编写，用于教学，字段取值为虚构示例，不是现网实测；不同厂商工具的显示格式会有差异。点开每条消息看关键字段和解读。</p>
      <ol class="siglog no-gloss">${steps}</ol>`;
  }

  // 工具箱里与本模块相关的计算器
  const TOOL_NAMES = { arfcn: "NR-ARFCN 与频率换算", numerology: "参数集与 RB 数", rate: "峰值速率估算", budget: "链路预算与覆盖半径", report: "测量上报值换算", kpi: "KPI 计算", pci: "PCI 规划核查" };
  function toolsHtml(m) {
    const links = (m.tools || []).filter((t) => TOOL_NAMES[t])
      .map((t) => `<a href="tools.html#${t}">🧮 ${TOOL_NAMES[t]}</a>`).join("");
    return links ? `<h4>动手算一算</h4><div class="mod-tools">${links}</div>` : "";
  }

  // 选学方向（如“网优方向”）的阶段标签
  const trackBadge = (s) => (s.track ? ` <span class="badge badge-track">${esc(s.track)} · 选学</span>` : "");

  // ---------- 路线总览：全部阶段与模块一屏看完，点模块设置状态或跳过去 ----------
  const OVERVIEW_KEY = "pathway-roadmap-open";
  function overviewHtml(p) {
    let open = true;
    try { open = localStorage.getItem(OVERVIEW_KEY) !== "0"; } catch (e) { /* 默认展开 */ }
    const stages = p.stages.map((s, i) => `<div class="rm-stage">
        <div class="rm-stage-title"><span class="stage-no">${i}</span><a href="#${s.id}">${esc(s.title)}</a>${trackBadge(s)}<span class="rm-stat" data-stage="${s.id}"></span></div>
        <ol>${s.modules.map((m, j) => `<li><button type="button" class="rm-node" data-rm="${m.id}" aria-haspopup="true">
          <span class="rm-dot" aria-hidden="true"></span><span class="sec-no">${i}.${j + 1}</span><span class="rm-name">${esc(m.title)}</span></button></li>`).join("")}</ol>
      </div>`).join("");
    const legend = MS.STATES.map((x) => `<span class="rm-key st-${x.id}"><span class="rm-dot"></span>${x.label} <b data-count="${x.id}">0</b></span>`).join("");
    return `<details class="roadmap"${open ? " open" : ""}>
      <summary><h2>路线总览</h2><span class="rm-legend">${legend}</span></summary>
      <p class="meta rm-tip">阶段按学习顺序排列，后面的阶段默认你已掌握前面的内容。点任一模块可以标记状态或直接跳过去；已经会的模块标“已掌握，跳过”，同样计入进度。</p>
      <div class="rm-grid">${stages}</div>
      <div class="rm-menu" role="menu" hidden></div>
    </details>`;
  }

  function openRmMenu(root, p, btn) {
    const menu = root.querySelector(".rm-menu");
    const mid = btn.dataset.rm;
    const m = allModules(p).find((x) => x.id === mid);
    const cur = statusOf(p.id, mid);
    menu.innerHTML = `<p class="rm-menu-title">${esc(btn.querySelector(".sec-no").textContent)} ${esc(m.title)}</p>
      ${MS.STATES.map((x) => `<button type="button" role="menuitemradio" aria-checked="${x.id === cur}" class="st-${x.id}${x.id === cur ? " on" : ""}" data-set-status="${x.id}" data-mid="${mid}"><span class="rm-dot"></span>${x.label}</button>`).join("")}
      <a href="#${mid}" data-mod="${mid}" class="rm-go">打开模块学习 →</a>`;
    menu.hidden = false;
    const box = root.querySelector(".roadmap").getBoundingClientRect();
    const r = btn.getBoundingClientRect();
    const left = Math.min(r.left - box.left, box.width - 230);
    menu.style.left = `${Math.max(0, left)}px`;
    menu.style.top = `${r.bottom - box.top + 4}px`;
    menu.dataset.for = mid;
    const first = menu.querySelector("button.on") || menu.querySelector("button");
    if (first) first.focus();
  }
  function closeRmMenu(root) {
    const menu = root.querySelector(".rm-menu");
    if (menu && !menu.hidden) { menu.hidden = true; menu.innerHTML = ""; }
  }

  function quickBanner(pid) {
    const t = (window.TOPICS || []).find((x) => x.id === pid);
    return t && t.quick
      ? `<p class="quick-banner">刚接触这个领域？建议先走 <a href="${esc(t.quick)}">入门快线</a>（约 11 小时，带讲解和判分自测），再回来按岗位学习。</p>`
      : "";
  }

  // 路线页头部的标签页：把同一主题的入门快线、考试、案例、术语收拢到一起
  function topicTabs(pid) {
    const t = topicOf(pid);
    const enc = encodeURIComponent(pid);
    const tabs = [["路线", null, true]];
    if (t.quick) tabs.push(["入门快线", t.quick]);
    tabs.push(["模拟考试", `exam.html?t=${enc}`]);   // 每条路线都有考试：至少有模块自测问答题
    if (((window.CASES || {})[pid] || []).length) tabs.push(["网优案例", `cases.html?t=${enc}`]);
    tabs.push(["术语表", "glossary.html"]);
    return `<nav class="topic-tabs" aria-label="${esc(t.title)} 相关页面">${tabs.map(([label, href, cur]) => cur
      ? `<span class="tt on" aria-current="page">${label}</span>` : `<a class="tt" href="${esc(href)}">${label}</a>`).join("")}</nav>`;
  }

  // 模块底部：上一模块 / 下一模块，以及“标为已完成并学下一个”
  function pagerHtml(p, m) {
    const mods = allModules(p);
    const i = mods.findIndex((x) => x.id === m.id);
    const prev = mods[i - 1], next = mods[i + 1];
    const link = (x, dir) => x
      ? `<a class="pg pg-${dir}" href="#${esc(x.id)}" data-goto="${esc(x.id)}"><span class="meta">${dir === "prev" ? "← 上一模块" : "下一模块 →"}</span><span>${esc(moduleNo(p, x.id))} ${esc(x.title)}</span></a>`
      : `<span class="pg pg-${dir} pg-empty"></span>`;
    const finish = next ? `<button type="button" class="btn btn-ghost pg-finish" data-finish="${esc(m.id)}" data-next="${esc(next.id)}">标为已完成，学下一个</button>` : "";
    return `<div class="pager">${link(prev, "prev")}${finish}${link(next, "next")}</div>`;
  }

  function gotoModule(root, id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.open = true;
    renderFlows(el);
    history.replaceState(null, "", `#${id}`);
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderPathway() {
    const params = new URLSearchParams(location.search);
    const pid = params.get("t") || "5g";
    const p = window.PATHWAYS[pid];
    const root = document.getElementById("pathway");
    if (!p) {
      root.innerHTML = `<section class="hero"><h1>该主题还在建设中</h1><p><a href="index.html">返回主题列表</a></p></section>`;
      return;
    }
    document.title = p.title + " · 通途";

    const nav = p.stages.map((s, i) =>
      `<li class="nav-stage" data-nav-stage="${s.id}">
        <div class="nav-row"><a href="#${s.id}"><span class="stage-no">${i}</span>${esc(s.title)}</a><span class="nav-stat" data-stage="${s.id}"></span></div>
        <ol class="nav-sub" hidden></ol>
      </li>`).join("");
    const stagesHtml = p.stages.map((s, i) => {
      const mods = s.modules.map((m, j) => renderModule(p, m, `${i}.${j + 1}`)).join("");
      return `<section class="stage" id="${s.id}">
        <div class="stage-head">
          <span class="stage-no big">${i}</span>
          <div><h2>${esc(s.title)}${trackBadge(s)}</h2><p>${esc(s.summary)}${s.track ? `<span class="meta">（${esc(s.track)}内容，只想学协议原理可以先跳过，在路线总览里标“已掌握，跳过”）</span>` : ""}</p></div>
        </div>
        <div class="stage-progress" data-stage="${s.id}"></div>
        ${mods}
      </section>`;
    }).join("");

    root.innerHTML = `
      <section class="hero pathway-hero" style="--tc:${esc(topicOf(pid).color || "#1f6feb")}">
        <a class="back" href="index.html">← 全部主题</a>
        <h1 class="ph-title">${topicMark(topicOf(pid), "lg")}<span>${esc(p.title)}</span></h1>
        <p>${esc(p.subtitle)}</p>
        <p class="meta">适合：${esc(p.audience)} · ${esc(p.version)}</p>
        ${topicTabs(pid)}
        <div class="overall"></div>
        <button class="btn" id="continue">继续学习</button>
        <span class="review-slot">${reviewLink()}</span>
        ${quickBanner(pid)}
      </section>
      ${overviewHtml(p)}
      <div class="layout">
        <nav class="stage-nav"><ol>${nav}</ol></nav>
        <div class="stages">${stagesHtml}</div>
      </div>`;

    if (window.Glossary) root.querySelectorAll(".mod-body").forEach(window.Glossary.annotate);

    function refresh() {
      const s = stats(p);
      const parts = [`已学完 ${s.done}/${s.total} 个模块（${s.pct}%）`];
      if (s.skip) parts.push(`其中跳过 ${s.skip} 个`);
      if (s.learning) parts.push(`学习中 ${s.learning} 个`);
      root.querySelector(".overall").innerHTML =
        `${bar(s.pct)}<div class="meta">${parts.join(" · ")} · 全程约 ${s.hours} 小时</div>`;
      p.stages.forEach((st) => {
        const ss = stats(p, st.modules);
        root.querySelectorAll(`[data-stage="${st.id}"]`).forEach((el) => {
          el.innerHTML = el.classList.contains("nav-stat") || el.classList.contains("rm-stat")
            ? `${ss.done}/${ss.total}`
            : `${bar(ss.pct)}<span class="meta">${ss.done}/${ss.total} · 约 ${ss.hours} 小时</span>`;
        });
      });
      MS.STATES.forEach((x) => { const c = root.querySelector(`[data-count="${x.id}"]`); if (c) c.textContent = x.id === "done" ? s.finished - s.skip : s[x.id]; });
      allModules(p).forEach((m) => {
        const st = statusOf(p.id, m.id);
        const cls = (el) => { MS.STATES.forEach((x) => el.classList.remove(`st-${x.id}`)); el.classList.add(`st-${st}`); };
        const mod = document.getElementById(m.id);
        if (mod) {
          cls(mod);
          mod.querySelector("input[data-mid]").checked = st === "done";
          const pill = mod.querySelector("[data-pill]");
          pill.textContent = st === "learning" ? "学习中" : st === "skip" ? "已跳过" : "";
          mod.querySelectorAll(".mod-status [data-set-status]").forEach((b) => {
            b.classList.toggle("on", b.dataset.setStatus === st);
            b.setAttribute("aria-pressed", String(b.dataset.setStatus === st));
          });
        }
        const node = root.querySelector(`.rm-node[data-rm="${m.id}"]`);
        if (node) { cls(node); node.title = STATE_LABEL[st]; }
      });
      const btn = root.querySelector("#continue");
      const next = s.next;
      btn.textContent = s.done === 0 && !s.learning ? "开始学习" : next ? `继续学习：${next.title}` : "已全部学完 🎉";
      btn.disabled = !next;
      btn.onclick = () => {
        if (!next) return;
        const el = document.getElementById(next.id);
        el.open = true;
        renderFlows(el);
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      };
    }

    root.addEventListener("click", (e) => {
      // 点击复选框只切换完成状态，不展开 / 收起模块
      if (e.target.closest(".check")) e.stopPropagation();
      if (handleSelfQuiz(e, p)) return;
      const go = e.target.closest("[data-goto]");
      if (go) { e.preventDefault(); gotoModule(root, go.dataset.goto); return; }
      const fin = e.target.closest("[data-finish]");
      if (fin) { MS.set(p.id, fin.dataset.finish, "done"); document.getElementById(fin.dataset.finish).open = false; gotoModule(root, fin.dataset.next); return; }
      const setBtn = e.target.closest("[data-set-status]");
      if (setBtn) {
        MS.set(p.id, setBtn.dataset.mid, setBtn.dataset.setStatus);
        closeRmMenu(root);
        return;
      }
      const node = e.target.closest(".rm-node");
      if (node) {
        const menu = root.querySelector(".rm-menu");
        if (!menu.hidden && menu.dataset.for === node.dataset.rm) closeRmMenu(root);
        else openRmMenu(root, p, node);
        return;
      }
      if (!e.target.closest(".rm-menu")) closeRmMenu(root);
      if (e.target.closest(".rm-go")) closeRmMenu(root);
      // 点左侧导航里的模块名：展开该模块再跳过去（收起的 <details> 只跳转不展开）
      const navMod = e.target.closest("a[data-mod]");
      if (navMod) {
        const mod = document.getElementById(navMod.dataset.mod);
        if (mod && !mod.open) { mod.open = true; renderFlows(mod); }
      }
    });
    root.addEventListener("change", (e) => {
      const cb = e.target.closest("input[data-mid]");
      if (!cb) return;
      setDone(p.id, cb.dataset.mid, cb.checked);
    });
    window.addEventListener("status-change", refresh);
    root.addEventListener("keydown", (e) => { if (e.key === "Escape") closeRmMenu(root); });
    root.querySelector(".roadmap").addEventListener("toggle", (e) => {
      try { localStorage.setItem(OVERVIEW_KEY, e.target.open ? "1" : "0"); } catch (err) { /* 忽略 */ }
      if (!e.target.open) closeRmMenu(root);
    });
    root.addEventListener("toggle", (e) => {
      if (!(e.target.classList && e.target.classList.contains("module"))) return;
      if (e.target.open) {
        renderFlows(e.target);
        try { localStorage.setItem(LAST_KEY, JSON.stringify({ t: p.id, m: e.target.id, at: Date.now() })); } catch (err) { /* 存储不可用时首页不显示“继续学习” */ }
      }
      updateSubNav(root, p, e.target.id);
    }, true);

    window.addEventListener("review-change", () => {
      root.querySelector(".review-slot").innerHTML = reviewLink();
    });

    refresh();
    if (location.hash) {
      const el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (el && el.classList.contains("sl-step")) el.open = true;
      const mod = el && (el.classList.contains("module") ? el : el.closest("details.module"));
      if (mod) {
        mod.open = true;
        renderFlows(mod);
        // 展开后再滚动；浏览器在 load 时可能把滚动位置复原，所以 load 之后再滚一次
        const go = () => el.scrollIntoView({ block: "start" });
        go();
        if (document.readyState === "complete") setTimeout(go, 0);
        else window.addEventListener("load", () => setTimeout(go, 0), { once: true });
      }
    }
  }

  // ---------- 左侧导航：展开的模块在所属阶段下列出小节目录 ----------
  function updateSubNav(root, p, moduleId) {
    const si = p.stages.findIndex((s) => s.modules.some((m) => m.id === moduleId));
    if (si < 0) return;
    const stage = p.stages[si];
    const sub = root.querySelector(`[data-nav-stage="${stage.id}"] .nav-sub`);
    if (!sub) return;
    const lessons = (window.LESSONS || {})[p.id] || {};
    const isOpen = (m) => { const el = document.getElementById(m.id); return !!(el && el.open); };
    // 阶段里只要有一个模块展开，就列出该阶段的全部模块（不能只列展开的那个，否则 0.1/0.2 会“消失”）；
    // 小节目录只挂在展开的模块下面
    if (!stage.modules.some(isOpen)) {
      sub.innerHTML = "";
      sub.hidden = true;
      observeSections(root);
      return;
    }
    const html = stage.modules.map((m, j) => {
      const prefix = `${si}.${j + 1}`;
      const open = isOpen(m);
      const lesson = lessons[m.id];
      const secs = open && lesson && window.Lesson ? window.Lesson.outline(m.id, lesson.sections, prefix) : [];
      const secHtml = secs.map((it) =>
        `<li><a href="#${it.id}" data-sec="${it.id}"><span class="sec-no">${it.no}</span>${esc(it.h)}</a></li>`).join("");
      return `<li class="nav-mod${open ? " open" : ""}"><a href="#${m.id}" data-mod="${m.id}"><span class="sec-no">${prefix}</span>${esc(m.title)}</a>${secHtml ? `<ol class="nav-sec">${secHtml}</ol>` : ""}</li>`;
    }).join("");
    sub.innerHTML = html;
    sub.hidden = false;
    observeSections(root);
  }

  // 滚动时高亮左侧导航里当前所在的小节
  let sectionObserver = null;
  function observeSections(root) {
    if (!("IntersectionObserver" in window)) return;
    if (sectionObserver) sectionObserver.disconnect();
    const links = new Map([...root.querySelectorAll(".nav-sec a[data-sec]")].map((a) => [a.dataset.sec, a]));
    if (!links.size) return;
    sectionObserver = new IntersectionObserver((entries) => {
      entries.filter((en) => en.isIntersecting).forEach((en) => {
        links.forEach((a) => a.classList.remove("active"));
        const a = links.get(en.target.id);
        if (a) a.classList.add("active");
      });
    }, { rootMargin: "0px 0px -70% 0px" });
    links.forEach((_, id) => { const h = document.getElementById(id); if (h) sectionObserver.observe(h); });
  }

  // Mermaid 约 1 MB，国内访问 GitHub Pages 时下载可能要几十秒：
  // 不在页面里同步引入，第一次需要画流程图时才在后台加载，加载完补画所有已展开的流程图
  const MERMAID_SRC = "assets/vendor/mermaid-10.9.1.min.js";
  let mermaidLoading = null;
  const pendingScopes = new Set();
  function loadMermaid() {
    if (!mermaidLoading) {
      mermaidLoading = new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = MERMAID_SRC;
        s.async = true;
        s.onload = resolve;
        s.onerror = () => { mermaidLoading = null; reject(new Error("流程图组件加载失败")); };
        document.head.appendChild(s);
      });
    }
    return mermaidLoading;
  }

  // 只在模块展开时渲染流程图（隐藏元素中 Mermaid 无法正确计算尺寸）
  let mermaidReady = false;
  let renderQueue = Promise.resolve();
  let mermaidSeq = 0;
  function renderFlows(scope) {
    const nodes = scope.querySelectorAll("pre.mermaid:not([data-processed])");
    if (!nodes.length) return;
    if (!window.mermaid) {
      pendingScopes.add(scope);
      nodes.forEach((n) => n.closest(".flow") && n.closest(".flow").classList.add("flow-loading"));
      loadMermaid().then(() => {
        const scopes = [...pendingScopes];
        pendingScopes.clear();
        scopes.forEach((sc) => { if (!sc.matches("details") || sc.open) renderFlows(sc); });
      }).catch(() => {
        scope.querySelectorAll(".flow-loading").forEach((f) => f.classList.replace("flow-loading", "flow-failed"));
      });
      return;
    }
    nodes.forEach((n) => n.closest(".flow") && n.closest(".flow").classList.remove("flow-loading", "flow-failed"));
    if (!mermaidReady) {
      const dark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      window.mermaid.initialize({ startOnLoad: false, theme: dark ? "dark" : "default", securityLevel: "strict" });
      mermaidReady = true;
    }
    // Mermaid 不能并发渲染，且同一批里用毫秒时间戳做 id 会重复，几张图会画到一起。
    // 所以逐张调用 render 并用自增 id，排队执行，跳过排队期间已画好的节点
    Array.from(nodes).forEach((node) => {
      renderQueue = renderQueue.then(async () => {
        if (!node.isConnected || node.hasAttribute("data-processed")) return;
        node.setAttribute("data-processed", "true");
        try {
          const { svg, bindFunctions } = await window.mermaid.render(`mmd-${++mermaidSeq}`, node.textContent);
          node.innerHTML = svg;
          if (bindFunctions) bindFunctions(node);
        } catch (e) {
          const flow = node.closest(".flow");
          if (flow) flow.classList.add("flow-failed");
        }
      });
    });
  }

  // 供入门快线、术语表等页面复用
  window.App = {
    renderHome,
    renderPathway,
    util: { esc, bar, isDone, setDone, renderFlows }
  };
})();
