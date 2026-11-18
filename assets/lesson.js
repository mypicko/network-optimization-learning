// 结构化讲解的共用渲染器：入门快线的课程和完整路径的模块讲解都用它
// 小节结构：{ h 标题, p [段落], figures [图], list [列表], steps [步骤], table {head, rows},
//            flow Mermaid, after [段落], tip 提示, routes（由调用方渲染） }
// 图：{ svg: "<svg…>" 或 flow: "Mermaid 源码", caption: "图注" }，由 data/figures/<主题>.js 按模块挂到小节上
(function () {
  const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  // 先转义再支持 **加粗**
  const rich = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  function renderFigure(fig) {
    // svg 来自仓库内的数据文件（不是用户输入），可以直接插入
    const body = fig.svg
      ? `<div class="figure-svg">${fig.svg}</div>`
      : `<div class="flow"><pre class="mermaid">${esc(fig.flow)}</pre></div>`;
    const cap = fig.caption ? `<figcaption>${fig.no ? `<span class="fig-no">${esc(fig.no)}</span> ` : ""}${rich(fig.caption)}</figcaption>` : "";
    return `<figure class="figure">${body}${cap}</figure>`;
  }

  function renderSection(sec, opts) {
    const parts = [];
    if (sec.h) {
      const no = sec.no ? `<span class="sec-no">${esc(sec.no)}</span> ` : "";
      parts.push(`<h4${sec.id ? ` id="${esc(sec.id)}"` : ""}>${no}${esc(sec.h)}</h4>`);
    }
    (sec.p || []).forEach((t) => parts.push(`<p>${rich(t)}</p>`));
    (sec.figures || []).forEach((f) => parts.push(renderFigure(f)));
    if (sec.list) parts.push(`<ul class="lesson-list">${sec.list.map((t) => `<li>${rich(t)}</li>`).join("")}</ul>`);
    if (sec.steps) parts.push(`<ol class="lesson-list">${sec.steps.map((t) => `<li>${rich(t)}</li>`).join("")}</ol>`);
    if (sec.table) {
      const head = sec.table.head.map((h) => `<th>${esc(h)}</th>`).join("");
      const rows = sec.table.rows.map((r) => `<tr>${r.map((c) => `<td>${rich(c)}</td>`).join("")}</tr>`).join("");
      parts.push(`<div class="table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>`);
    }
    if (sec.flow) parts.push(`<div class="flow"><pre class="mermaid">${esc(sec.flow)}</pre></div>`);
    if (sec.after) sec.after.forEach((t) => parts.push(`<p>${rich(t)}</p>`));
    if (sec.routes && opts && opts.renderRoutes) parts.push(opts.renderRoutes(sec.routes));
    if (sec.tip) parts.push(`<div class="tip">💡 ${rich(sec.tip)}</div>`);
    return parts.join("");
  }

  // 把图按 at（小节标题里的关键词）挂到对应小节；找不到对应小节的图放在最后一节
  function attachFigures(sections, figures, prefix) {
    if (!figures || !figures.length) return sections;
    const extra = sections.map(() => []);
    figures.forEach((f) => {
      const i = sections.findIndex((s) => s.h && f.at && s.h.includes(f.at));
      extra[i >= 0 ? i : sections.length - 1].push(f);
    });
    let n = 0;
    return sections.map((s, i) => {
      if (!extra[i].length) return s;
      const figs = extra[i].map((f) => ({ ...f, no: prefix ? `图 ${prefix}-${++n}` : "" }));
      return { ...s, figures: [...(s.figures || []), ...figs] };
    });
  }

  // 小节大纲：编号形如 0.1.1（模块编号 + 小节序号），左侧导航和正文共用同一套 id
  function outline(moduleId, sections, prefix) {
    let n = 0;
    return sections.map((s, i) => s.h
      ? { idx: i, id: `${moduleId}-x${i + 1}`, no: prefix ? `${prefix}.${++n}` : String(++n), h: s.h }
      : null).filter(Boolean);
  }

  // 模块讲解：带小目录，便于长文跳读
  function renderExplain(moduleId, sections, opts) {
    const prefix = (opts && opts.prefix) || "";
    const withFigs = attachFigures(sections, opts && opts.figures, prefix);
    const items = outline(moduleId, withFigs, prefix);
    const byIdx = new Map(items.map((it) => [it.idx, it]));
    const numbered = withFigs.map((s, i) => (byIdx.has(i) ? { ...s, id: byIdx.get(i).id, no: byIdx.get(i).no } : s));
    const toc = items.map((it) =>
      `<li><a href="#${esc(it.id)}"><span class="sec-no">${esc(it.no)}</span> ${esc(it.h)}</a></li>`).join("");
    return `<div class="explain">
      ${toc ? `<nav class="explain-toc no-gloss"><span class="meta">本节目录</span><ul>${toc}</ul></nav>` : ""}
      <div class="lesson-body">${numbered.map((s) => renderSection(s)).join("")}</div>
    </div>`;
  }

  window.Lesson = { esc, rich, renderSection, renderFigure, renderExplain, outline };
})();
