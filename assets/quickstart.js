// 入门快线页面：课程渲染、判分自测、进度
(function () {
  const { esc, bar, isDone, setDone, renderFlows } = window.App.util;

  const { rich } = window.Lesson;

  function moduleIndex(pathway) {
    const map = {};
    (pathway ? pathway.stages : []).forEach((s, i) => s.modules.forEach((m, j) => {
      map[m.id] = { title: m.title, no: `${i}.${j + 1}`, hours: m.hours };
    }));
    return map;
  }

  function moduleLink(pid, mods, id) {
    const m = mods[id];
    return m ? `<a class="mod-link" href="pathway.html?t=${esc(pid)}#${esc(id)}"><span class="meta">${m.no}</span> ${esc(m.title)}</a>` : "";
  }

  function renderSection(sec, pid, mods) {
    return window.Lesson.renderSection(sec, {
      renderRoutes: (routes) => routes.map((r) => `<div class="route">
        <div class="route-head"><strong>${esc(r.role)}</strong> <span class="meta">${esc(r.desc)} · ${r.modules.length} 个模块 · 约 ${r.modules.reduce((a, id) => a + ((mods[id] || {}).hours || 0), 0)} 小时</span></div>
        <ol class="route-mods">${r.modules.map((id) => `<li>${moduleLink(pid, mods, id)}</li>`).join("")}</ol>
      </div>`).join("")
    });
  }

  function renderQuiz(quiz) {
    if (!quiz || !quiz.length) return "";
    return `<h4>自测</h4>` + quiz.map((q, i) => `
      <div class="mcq" data-answer="${q.answer}">
        <p class="mcq-q">Q${i + 1}. ${esc(q.q)}</p>
        <div class="mcq-opts">${q.options.map((o, j) =>
          `<button type="button" class="mcq-opt" data-i="${j}">${String.fromCharCode(65 + j)}. ${esc(o)}</button>`).join("")}</div>
        <p class="mcq-explain" hidden>${esc(q.explain)}</p>
      </div>`).join("");
  }

  function renderLesson(q, l, idx, mods) {
    const done = isDone(q.id, l.id);
    const deeper = (l.deeper || []).map((id) => moduleLink(q.pathway, mods, id)).filter(Boolean);
    const isLast = idx === q.lessons.length - 1;
    return `<details class="module lesson${done ? " done" : ""}" id="${l.id}">
      <summary>
        <label class="check" title="标记完成"><input type="checkbox" data-lid="${l.id}" ${done ? "checked" : ""}></label>
        <span class="mod-index">第 ${idx} 课</span>
        <span class="mod-title">${esc(l.title)}</span>
        <span class="mod-hours">约 ${l.minutes} 分钟</span>
      </summary>
      <div class="mod-body lesson-body">
        <p class="lesson-summary">${esc(l.summary)}</p>
        ${l.sections.map((s) => renderSection(s, q.pathway, mods)).join("")}
        ${l.practice ? `<h4>动手练习</h4><p class="practice">${rich(l.practice)}</p>` : ""}
        ${renderQuiz(l.quiz)}
        ${deeper.length ? `<h4>想深入，看完整路径的这些模块</h4><div class="deeper">${deeper.join("")}</div>` : ""}
        <div class="lesson-next">
          <button class="btn" data-finish="${l.id}">${isLast ? "完成入门快线 🎉" : "完成本课，下一课 →"}</button>
        </div>
      </div>
    </details>`;
  }

  function render() {
    const pid = new URLSearchParams(location.search).get("t") || "5g";
    const q = (window.QUICKSTART || {})[pid];
    const root = document.getElementById("quickstart");
    if (!q) {
      root.innerHTML = `<section class="hero"><h1>该主题的入门快线还在建设中</h1><p><a href="index.html">返回主题列表</a></p></section>`;
      return;
    }
    document.title = q.title + " · 通信学习路径";
    const mods = moduleIndex((window.PATHWAYS || {})[q.pathway]);
    const totalMin = q.lessons.reduce((a, l) => a + l.minutes, 0);

    root.innerHTML = `
      <section class="hero pathway-hero">
        <a class="back" href="index.html">← 全部主题</a>
        <h1>${esc(q.title)}</h1>
        <p>${esc(q.subtitle)}</p>
        <p class="meta">适合：${esc(q.audience)} · ${q.lessons.length} 节课 · 约 ${Math.round(totalMin / 60)} 小时（含动手练习）</p>
        <div class="overall"></div>
        <button class="btn" id="continue">开始学习</button>
        <a class="btn btn-ghost" href="pathway.html?t=${esc(q.pathway)}">直接看完整路径</a>
      </section>
      <div class="layout">
        <nav class="stage-nav"><ol>${q.lessons.map((l, i) =>
          `<li><a href="#${l.id}"><span class="stage-no">${i}</span>${esc(l.title)}</a><span class="nav-stat" data-lesson="${l.id}"></span></li>`).join("")}</ol></nav>
        <div class="stages">${q.lessons.map((l, i) => renderLesson(q, l, i, mods)).join("")}</div>
      </div>`;

    if (window.Glossary) root.querySelectorAll(".lesson-body").forEach(window.Glossary.annotate);

    function openLesson(id, scroll) {
      const el = document.getElementById(id);
      if (!el) return;
      el.open = true;
      renderFlows(el);
      if (scroll) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function refresh() {
      const done = q.lessons.filter((l) => isDone(q.id, l.id)).length;
      const pct = Math.round((done / q.lessons.length) * 100);
      root.querySelector(".overall").innerHTML = `${bar(pct)}<div class="meta">已完成 ${done}/${q.lessons.length} 节课（${pct}%）</div>`;
      q.lessons.forEach((l) => {
        root.querySelector(`[data-lesson="${l.id}"]`).textContent = isDone(q.id, l.id) ? "✓" : "";
      });
      const next = q.lessons.find((l) => !isDone(q.id, l.id));
      const btn = root.querySelector("#continue");
      btn.textContent = done === 0 ? "开始学习" : next ? "继续学习" : "已全部完成 🎉";
      btn.disabled = !next;
      btn.onclick = () => next && openLesson(next.id, true);
    }

    function mark(lid, value) {
      setDone(q.id, lid, value);
      const el = document.getElementById(lid);
      el.classList.toggle("done", value);
      el.querySelector("input[data-lid]").checked = value;
      refresh();
    }

    root.addEventListener("click", (e) => {
      if (e.target.closest(".check")) { e.stopPropagation(); return; }
      const opt = e.target.closest(".mcq-opt");
      if (opt) {
        const box = opt.closest(".mcq");
        if (box.classList.contains("answered")) return;
        const answer = Number(box.dataset.answer);
        box.classList.add("answered");
        box.querySelectorAll(".mcq-opt").forEach((b) => {
          const i = Number(b.dataset.i);
          b.disabled = true;
          if (i === answer) b.classList.add("correct");
          else if (b === opt) b.classList.add("wrong");
        });
        const ex = box.querySelector(".mcq-explain");
        ex.hidden = false;
        ex.textContent = (Number(opt.dataset.i) === answer ? "✅ 答对了。" : "❌ 再想想。") + ex.textContent;
        return;
      }
      const fin = e.target.closest("[data-finish]");
      if (fin) {
        const lid = fin.dataset.finish;
        mark(lid, true);
        document.getElementById(lid).open = false;
        const i = q.lessons.findIndex((l) => l.id === lid);
        const next = q.lessons.slice(i + 1).find((l) => !isDone(q.id, l.id));
        if (next) openLesson(next.id, true);
        else root.querySelector(".pathway-hero").scrollIntoView({ behavior: "smooth" });
      }
    });
    root.addEventListener("change", (e) => {
      const cb = e.target.closest("input[data-lid]");
      if (cb) mark(cb.dataset.lid, cb.checked);
    });
    root.addEventListener("toggle", (e) => {
      if (e.target.classList && e.target.classList.contains("lesson") && e.target.open) renderFlows(e.target);
    }, true);

    refresh();
    if (location.hash) openLesson(location.hash.slice(1), false);
  }

  window.Quickstart = { render };
})();
