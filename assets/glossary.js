// 术语表：正文自动标注 + 悬停 / 点按解释 + 术语表页面
(function () {
  const ENTRIES = window.GLOSSARY || [];
  const SKIP = "a, code, pre, summary, button, textarea, input, label, script, style, h1, .term, .mermaid, .flow, .resources, .no-gloss";

  const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const slug = (t) => "g-" + t.replace(/[^A-Za-z0-9]/g, "_");

  // ---------- 索引与匹配 ----------
  const byWord = new Map();
  ENTRIES.forEach((e) => [e.t, ...(e.alias || [])].forEach((w) => byWord.set(w, e)));
  const words = [...byWord.keys()].sort((a, b) => b.length - a.length);
  const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // 只匹配完整的词：前后不能紧挨字母或数字（中文、空格、标点都可以）
  const PATTERN = words.length
    ? new RegExp(`(?<![A-Za-z0-9_\\-])(${words.map(escRe).join("|")})(?![A-Za-z0-9_])`, "g")
    : null;

  // 在 root 内给术语加标注；同一个 root 里每个术语只标第一次，避免满屏下划线
  function annotate(root) {
    if (!PATTERN || !root) return;
    const seen = new Set();
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        return node.parentElement && node.parentElement.closest(SKIP)
          ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach((node) => {
      const text = node.nodeValue;
      PATTERN.lastIndex = 0;
      let match, last = 0;
      const frag = document.createDocumentFragment();
      while ((match = PATTERN.exec(text))) {
        const entry = byWord.get(match[1]);
        if (!entry || seen.has(entry.t)) continue;
        seen.add(entry.t);
        frag.appendChild(document.createTextNode(text.slice(last, match.index)));
        const span = document.createElement("span");
        span.className = "term";
        span.tabIndex = 0;
        span.dataset.term = entry.t;
        span.textContent = match[1];
        frag.appendChild(span);
        last = match.index + match[1].length;
      }
      if (last === 0) return;
      frag.appendChild(document.createTextNode(text.slice(last)));
      node.parentNode.replaceChild(frag, node);
    });
  }

  // ---------- 浮动解释框 ----------
  let tip = null, current = null, hideTimer = null;

  function moduleTitle(mid) {
    const p = (window.PATHWAYS || {})["5g"];
    if (!p) return null;
    const m = p.stages.flatMap((s) => s.modules).find((x) => x.id === mid);
    return m ? m.title : null;
  }

  function tipHtml(e) {
    const name = [e.en, e.zh].filter(Boolean).map(esc).join(" · ");
    const deeper = e.m && moduleTitle(e.m)
      ? `<a href="pathway.html?t=5g#${esc(e.m)}">深入：${esc(moduleTitle(e.m))}</a> · ` : "";
    return `<div class="tip-head"><strong>${esc(e.t)}</strong> <span>${name}</span></div>
      <div class="tip-body">${esc(e.d)}</div>
      <div class="tip-foot">${deeper}<a href="glossary.html#${slug(e.t)}">术语表</a></div>`;
  }

  function show(el) {
    const e = byWord.get(el.dataset.term);
    if (!e) return;
    clearTimeout(hideTimer);
    if (!tip) {
      tip = document.createElement("div");
      tip.className = "term-tip";
      tip.setAttribute("role", "tooltip");
      tip.addEventListener("mouseenter", () => clearTimeout(hideTimer));
      tip.addEventListener("mouseleave", scheduleHide);
      document.body.appendChild(tip);
    }
    current = el;
    tip.innerHTML = tipHtml(e);
    tip.hidden = false;
    const r = el.getBoundingClientRect();
    const w = Math.min(320, window.innerWidth - 24);
    tip.style.width = w + "px";
    const left = Math.max(12, Math.min(r.left + window.scrollX, window.scrollX + window.innerWidth - w - 12));
    tip.style.left = left + "px";
    const below = r.bottom + window.scrollY + 6;
    tip.style.top = below + "px";
    // 下方放不下就放到上方
    const h = tip.offsetHeight;
    if (r.bottom + h + 12 > window.innerHeight && r.top > h + 12) {
      tip.style.top = (r.top + window.scrollY - h - 6) + "px";
    }
  }
  function hide() {
    if (tip) tip.hidden = true;
    current = null;
  }
  function scheduleHide() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hide, 200);
  }

  document.addEventListener("mouseover", (ev) => {
    const el = ev.target.closest && ev.target.closest(".term");
    if (el) show(el);
  });
  document.addEventListener("mouseout", (ev) => {
    if (ev.target.closest && ev.target.closest(".term")) scheduleHide();
  });
  document.addEventListener("focusin", (ev) => {
    if (ev.target.classList && ev.target.classList.contains("term")) show(ev.target);
  });
  document.addEventListener("focusout", (ev) => {
    if (ev.target.classList && ev.target.classList.contains("term")) scheduleHide();
  });
  // 手机上点按切换；点其他地方关闭
  document.addEventListener("click", (ev) => {
    const el = ev.target.closest && ev.target.closest(".term");
    if (el) {
      ev.preventDefault();
      ev.stopPropagation();
      if (current === el && tip && !tip.hidden) hide(); else show(el);
    } else if (tip && !tip.hidden && !tip.contains(ev.target)) {
      hide();
    }
  }, true);
  document.addEventListener("keydown", (ev) => { if (ev.key === "Escape") hide(); });
  window.addEventListener("resize", hide);

  // ---------- 术语表页面 ----------
  function renderPage() {
    const root = document.getElementById("glossary");
    const cats = [...new Set(ENTRIES.map((e) => e.c))];
    root.innerHTML = `
      <section class="hero">
        <h1>术语表</h1>
        <p>收录 ${ENTRIES.length} 个 5G 常用术语和缩写。网站正文中带虚线下划线的词，鼠标悬停（手机上点一下）就能看到解释。</p>
      </section>
      <div class="gl-tools">
        <input type="search" id="gl-q" placeholder="搜索缩写、英文或中文，如 PRB、会话、干扰" autocomplete="off">
        <div class="gl-cats">
          <button class="chip-btn active" data-cat="">全部</button>
          ${cats.map((c) => `<button class="chip-btn" data-cat="${esc(c)}">${esc(c)}</button>`).join("")}
        </div>
      </div>
      <p class="meta" id="gl-count"></p>
      <dl class="gl-list">
        ${[...ENTRIES].sort((a, b) => a.t.localeCompare(b.t, "en", { sensitivity: "base" })).map((e) => {
          const mt = e.m && moduleTitle(e.m);
          return `<div class="gl-item" id="${slug(e.t)}" data-cat="${esc(e.c)}"
              data-search="${esc([e.t, e.en, e.zh, e.d, ...(e.alias || [])].join(" ").toLowerCase())}">
            <dt><strong>${esc(e.t)}</strong> ${e.en ? `<span class="gl-en">${esc(e.en)}</span>` : ""}
              <span class="gl-zh">${esc(e.zh || "")}</span> <span class="badge">${esc(e.c)}</span></dt>
            <dd>${esc(e.d)}${mt ? ` <a href="pathway.html?t=5g#${esc(e.m)}">深入学习：${esc(mt)} →</a>` : ""}</dd>
          </div>`;
        }).join("")}
      </dl>`;

    const q = root.querySelector("#gl-q");
    let cat = "";
    function filter() {
      const kw = q.value.trim().toLowerCase();
      let n = 0;
      root.querySelectorAll(".gl-item").forEach((it) => {
        const ok = (!cat || it.dataset.cat === cat) && (!kw || it.dataset.search.includes(kw));
        it.hidden = !ok;
        if (ok) n++;
      });
      root.querySelector("#gl-count").textContent = `显示 ${n} 个术语`;
    }
    q.addEventListener("input", filter);
    root.querySelector(".gl-cats").addEventListener("click", (ev) => {
      const b = ev.target.closest("button[data-cat]");
      if (!b) return;
      cat = b.dataset.cat;
      root.querySelectorAll(".chip-btn").forEach((x) => x.classList.toggle("active", x === b));
      filter();
    });
    filter();
    root.querySelectorAll(".gl-item dd").forEach(annotate);
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) el.scrollIntoView({ block: "center" });
    }
  }

  window.Glossary = { annotate, renderPage };
})();
