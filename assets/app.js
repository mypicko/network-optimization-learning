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
    const concepts = m.concepts.map((c) => `<span class="chip">${esc(c)}</span>`).join("");
    const specs = (m.specs || []).map((s) => {
      const url = specUrl(s.id);
      const id = url
        ? `<a href="${esc(url)}" target="_blank" rel="noopener"><code>${esc(s.id)}</code></a>`
        : `<code>${esc(s.id)}</code>`;
      return `<li>${id} ${esc(s.note)}</li>`;
    }).join("");
    const quiz = (m.quiz || []).map((q, i) =>
      `<details class="quiz"><summary>Q${i + 1}. ${esc(q.q)}</summary><p>${esc(q.a)}</p></details>`).join("");
    const flow = m.flow
      ? `<h4>信令流程</h4><div class="flow"><pre class="mermaid">${esc(m.flow)}</pre></div>`
      : "";
    const list = moduleResources(p.id, m);
    const community = list.some((r) => r.type === "video" || r.type === "article");
    const resources = list.length
      ? `<ul class="resources">${list.map(renderResource).join("")}</ul>` +
        (community ? "" : `<p class="muted">社区资源（B 站、知乎、通信人家园中被反复推荐的视频和文章）筛选中。</p>`)
      : `<p class="muted">待补充：将从通信社区（B 站、知乎、通信人家园）中被反复推荐的资源里精选。</p>`;

    return `<details class="module${done ? " done" : ""}" id="${m.id}">
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
        <h4>核心概念</h4><div class="chips">${concepts}</div>
        ${specs ? `<h4>规范出处</h4><ul class="specs">${specs}</ul>` : ""}
        ${flow}
        ${quiz ? `<h4>自测</h4>${quiz}` : ""}
        ${m.practice ? `<h4>实操任务</h4><p class="practice">${esc(m.practice)}</p>` : ""}
        <h4>精选资源</h4>${resources}
      </div>
    </details>`;
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
      `<li><a href="#${s.id}"><span class="stage-no">${i}</span>${esc(s.title)}</a><span class="nav-stat" data-stage="${s.id}"></span></li>`).join("");
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
      </section>
      <div class="layout">
        <nav class="stage-nav"><ol>${nav}</ol></nav>
        <div class="stages">${stagesHtml}</div>
      </div>`;

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
    });
    root.addEventListener("change", (e) => {
      const cb = e.target.closest("input[data-mid]");
      if (!cb) return;
      setDone(p.id, cb.dataset.mid, cb.checked);
      cb.closest(".module").classList.toggle("done", cb.checked);
      refresh();
    });
    root.addEventListener("toggle", (e) => {
      if (e.target.classList && e.target.classList.contains("module") && e.target.open) renderFlows(e.target);
    }, true);

    refresh();
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el && el.tagName === "DETAILS") { el.open = true; renderFlows(el); }
    }
  }

  // 只在模块展开时渲染流程图（隐藏元素中 Mermaid 无法正确计算尺寸）
  let mermaidReady = false;
  function renderFlows(scope) {
    const nodes = scope.querySelectorAll("pre.mermaid:not([data-processed])");
    if (!nodes.length || !window.mermaid) return;
    if (!mermaidReady) {
      const dark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      window.mermaid.initialize({ startOnLoad: false, theme: dark ? "dark" : "default", securityLevel: "strict" });
      mermaidReady = true;
    }
    window.mermaid.run({ nodes: Array.from(nodes) }).catch(() => {});
  }

  window.App = { renderHome, renderPathway };
})();
