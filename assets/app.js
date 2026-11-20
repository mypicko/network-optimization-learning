// 通信学习路径：渲染与本地进度
(function () {
  const STORE_KEY = "pathway-progress-v1";

  // ---------- 本地存储（隐私模式等情况下可能不可用，全部容错） ----------
  function loadProgress() {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }
  let progress = loadProgress();
  function saveProgress() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(progress));
    } catch (e) { /* 忽略：进度仅在本次会话内有效 */ }
  }
  function isDone(pid, mid) {
    return !!(progress[pid] && progress[pid][mid]);
  }
  function setDone(pid, mid, done) {
    progress[pid] = progress[pid] || {};
    if (done) progress[pid][mid] = Date.now();
    else delete progress[pid][mid];
    saveProgress();
  }

  // ---------- 工具 ----------
  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function allModules(p) {
    return p.stages.flatMap((s) => s.modules);
  }
  function stats(p, modules) {
    const mods = modules || allModules(p);
    const done = mods.filter((m) => isDone(p.id, m.id)).length;
    const hours = mods.reduce((a, m) => a + (m.hours || 0), 0);
    return { done, total: mods.length, hours, pct: mods.length ? Math.round((done / mods.length) * 100) : 0 };
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
  function renderHome() {
    const el = document.getElementById("topics");
    el.innerHTML = window.TOPICS.map((t) => {
      const p = window.PATHWAYS[t.id];
      if (t.status === "live" && p) {
        const s = stats(p);
        return `<a class="topic-card live" href="pathway.html?t=${t.id}">
          <div class="topic-head"><h3>${esc(t.title)}</h3><span class="badge live">已上线</span></div>
          <p>${esc(t.desc)}</p>
          <div class="meta">${p.stages.length} 个阶段 · ${s.total} 个模块 · 约 ${s.hours} 小时</div>
          ${bar(s.pct)}
          <div class="meta">已完成 ${s.done}/${s.total}</div>
        </a>`;
      }
      return `<div class="topic-card planned">
        <div class="topic-head"><h3>${esc(t.title)}</h3><span class="badge">规划中</span></div>
        <p>${esc(t.desc)}</p>
      </div>`;
    }).join("");
  }

  // ---------- 路径页 ----------
  function renderModule(p, m, idx) {
    const done = isDone(p.id, m.id);
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

    return `<details class="module${done ? " done" : ""}" id="${m.id}" data-note-scope="${m.id}" data-note-title="${esc(idx + " " + m.title)}">
      <summary>
        <label class="check" title="标记完成">
          <input type="checkbox" data-mid="${m.id}" ${done ? "checked" : ""}>
        </label>
        <span class="mod-index">${idx}</span>
        <span class="mod-title">${esc(m.title)}</span>
        <span class="mod-hours">约 ${m.hours} 小时</span>
      </summary>
      <div class="mod-body">
        <h4>学完你能</h4><ul class="goals">${goals}</ul>
        ${explain}
        <h4>${explain ? "核心概念回顾" : "核心概念"}</h4><div class="chips">${concepts}</div>
        ${specs ? `<h4>规范出处</h4><ul class="specs">${specs}</ul>` : ""}
        ${flow}
        ${sigLogHtml(p, m)}
        ${quiz ? `<h4>自测</h4>${quiz}` : ""}
        ${m.practice ? `<h4>实操任务</h4><p class="practice">${esc(m.practice)}</p>` : ""}
        ${toolsHtml(m)}
        <h4>精选资源</h4>${resources}
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
    const wasWrong = (window.ReviewStore.get(box.dataset.qkey) || {}).status === "wrong";
    window.ReviewStore.record({
      key: box.dataset.qkey, q: q.q, a: q.a, title: box.dataset.qtitle,
      page: `pathway.html?t=${p.id}`, scope: box.id
    }, correct);
    const res = box.querySelector(".sq-result");
    res.hidden = false;
    res.textContent = correct
      ? (wasWrong ? "答对了，已从错题本移出。" : "答对了。")
      : "已记入错题本，可以在“我的笔记 → 错题本”里复习。";
    const tag = box.querySelector(".badge-wrong");
    if (correct && tag) tag.remove();
    if (!correct && !tag) box.querySelector(".sq-q").insertAdjacentHTML("beforeend", ` <span class="badge badge-wrong">错题本</span>`);
    return true;
  }

  function reviewLink() {
    const n = window.ReviewStore ? window.ReviewStore.wrong().length : 0;
    return n ? `<a class="review-link" href="notes.html#review">📒 错题本：${n} 题待复习</a>` : "";
  }

  // 示意信令日志：data/logs/<主题>.js，逐条消息可展开看字段解读
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
  const TOOL_NAMES = { arfcn: "NR-ARFCN 与频率换算", numerology: "参数集与 RB 数", rate: "峰值速率估算" };
  function toolsHtml(m) {
    const links = (m.tools || []).filter((t) => TOOL_NAMES[t])
      .map((t) => `<a href="tools.html#${t}">🧮 ${TOOL_NAMES[t]}</a>`).join("");
    return links ? `<h4>动手算一算</h4><div class="mod-tools">${links}</div>` : "";
  }

  function quickBanner(pid) {
    const t = (window.TOPICS || []).find((x) => x.id === pid);
    return t && t.quick
      ? `<p class="quick-banner">刚接触这个领域？建议先走 <a href="${esc(t.quick)}">入门快线</a>（约 11 小时，带讲解和判分自测），再回来按岗位学习。</p>`
      : "";
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
    document.title = p.title + " · 学习路径";

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
          <div><h2>${esc(s.title)}</h2><p>${esc(s.summary)}</p></div>
        </div>
        <div class="stage-progress" data-stage="${s.id}"></div>
        ${mods}
      </section>`;
    }).join("");

    root.innerHTML = `
      <section class="hero pathway-hero">
        <a class="back" href="index.html">← 全部主题</a>
        <h1>${esc(p.title)}</h1>
        <p>${esc(p.subtitle)}</p>
        <p class="meta">适合：${esc(p.audience)} · ${esc(p.version)}</p>
        <div class="overall"></div>
        <button class="btn" id="continue">继续学习</button>
        <span class="review-slot">${reviewLink()}</span>
        ${quickBanner(pid)}
      </section>
      <div class="layout">
        <nav class="stage-nav"><ol>${nav}</ol></nav>
        <div class="stages">${stagesHtml}</div>
      </div>`;

    if (window.Glossary) root.querySelectorAll(".mod-body").forEach(window.Glossary.annotate);

    function refresh() {
      const s = stats(p);
      root.querySelector(".overall").innerHTML =
        `${bar(s.pct)}<div class="meta">已完成 ${s.done}/${s.total} 个模块（${s.pct}%）· 全程约 ${s.hours} 小时</div>`;
      p.stages.forEach((st) => {
        const ss = stats(p, st.modules);
        root.querySelectorAll(`[data-stage="${st.id}"]`).forEach((el) => {
          el.innerHTML = el.classList.contains("nav-stat")
            ? `${ss.done}/${ss.total}`
            : `${bar(ss.pct)}<span class="meta">${ss.done}/${ss.total} · 约 ${ss.hours} 小时</span>`;
        });
      });
      const btn = root.querySelector("#continue");
      const next = allModules(p).find((m) => !isDone(p.id, m.id));
      btn.textContent = s.done === 0 ? "开始学习" : next ? "继续学习" : "已全部完成 🎉";
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
      cb.closest(".module").classList.toggle("done", cb.checked);
      refresh();
    });
    root.addEventListener("toggle", (e) => {
      if (!(e.target.classList && e.target.classList.contains("module"))) return;
      if (e.target.open) renderFlows(e.target);
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
