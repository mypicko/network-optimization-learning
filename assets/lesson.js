// 结构化讲解的共用渲染器：入门快线的课程和完整路径的模块讲解都用它
// 小节结构：{ h 标题, p [段落], list [列表], table {head, rows}, flow Mermaid, tip 提示, routes（由调用方渲染） }
(function () {
  const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  // 先转义再支持 **加粗**
  const rich = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  function renderSection(sec, opts) {
    const parts = [];
    if (sec.h) parts.push(`<h4${sec.id ? ` id="${esc(sec.id)}"` : ""}>${esc(sec.h)}</h4>`);
    (sec.p || []).forEach((t) => parts.push(`<p>${rich(t)}</p>`));
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

  // 模块讲解：带小目录，便于长文跳读
  function renderExplain(moduleId, sections) {
    const withIds = sections.map((s, i) => ({ ...s, id: s.h ? `${moduleId}-x${i + 1}` : undefined }));
    const toc = withIds.filter((s) => s.h)
      .map((s, i) => `<li><a href="#${s.id}">${i + 1}. ${esc(s.h)}</a></li>`).join("");
    return `<div class="explain">
      ${toc ? `<nav class="explain-toc no-gloss"><span class="meta">本节目录</span><ol>${toc}</ol></nav>` : ""}
      <div class="lesson-body">${withIds.map((s) => renderSection(s)).join("")}</div>
    </div>`;
  }

  window.Lesson = { esc, rich, renderSection, renderExplain };
})();
