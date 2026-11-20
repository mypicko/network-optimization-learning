// 站内搜索：把路径模块、讲解小节、自测题、术语表、入门快线和“我的笔记”拼成一个索引，前端直接匹配
// 文档结构：{ type, title, text, href, crumb }
// 匹配规则：关键词按空格拆开，全部出现在标题或正文里才算命中（不区分大小写）；标题命中的排在前面
// 纯函数，Node 里可单元测试
(function (root) {
  const TYPES = [
    { id: "term", label: "术语" },
    { id: "tool", label: "工具箱" },
    { id: "module", label: "学习模块" },
    { id: "section", label: "知识讲解" },
    { id: "log", label: "信令日志" },
    { id: "quiz", label: "自测题" },
    { id: "quick", label: "入门快线" },
    { id: "note", label: "我的笔记" }
  ];

  const strip = (s) => String(s ?? "").replace(/\*\*/g, "");
  const join = (...parts) => parts.flat(Infinity).filter(Boolean).map(strip).join(" ");
  // 与 glossary.js 的锚点规则保持一致
  const glossarySlug = (t) => "g-" + Array.from(t).map((c) => (/[A-Za-z0-9]/.test(c) ? c : `_${c.codePointAt(0).toString(16)}`)).join("");

  function sectionText(s) {
    const table = s.table ? [s.table.head, ...(s.table.rows || [])] : [];
    return join(s.p, s.list, s.steps, s.after, s.tip, table);
  }

  // 小节编号与 lesson.js 的 outline 一致：只给有标题的小节编号，id 用原始下标
  function headedSections(sections, prefix, idBase) {
    let n = 0;
    return (sections || []).map((s, i) => (s.h ? { s, id: `${idBase}-x${i + 1}`, no: `${prefix}.${++n}` } : null)).filter(Boolean);
  }

  // 工具箱里的计算器（tools.html）
  const TOOL_DOCS = [
    { type: "tool", title: "NR-ARFCN 与频率换算", href: "tools.html#arfcn", crumb: "工具箱", text: "NR-ARFCN 频点 频率 换算 信道栅格 全球栅格 频段 n1 n3 n28 n41 n77 n78 n79 n258 TS 38.104" },
    { type: "tool", title: "参数集与 RB 数", href: "tools.html#numerology", crumb: "工具箱", text: "参数集 numerology μ 子载波间隔 SCS 时隙 符号 CP 循环前缀 RB 资源块 带宽 TS 38.211 38.101" },
    { type: "tool", title: "峰值速率估算", href: "tools.html#rate", crumb: "工具箱", text: "峰值速率 吞吐量 理论速率 MIMO 层数 调制 256QAM TDD 帧结构 上下行配比 DDDSU TS 38.306" }
  ];

  function buildIndex({ pathways = {}, lessons = {}, glossary = [], quickstart = {}, notes = null, logs = {} }) {
    const docs = [...TOOL_DOCS];
    Object.values(pathways).forEach((p) => {
      const page = `pathway.html?t=${encodeURIComponent(p.id)}`;
      const pl = lessons[p.id] || {};
      p.stages.forEach((st, si) => st.modules.forEach((m, mj) => {
        const no = `${si}.${mj + 1}`;
        const crumb = `${p.title} · ${si} ${st.title}`;
        docs.push({
          type: "module", title: `${no} ${m.title}`, href: `${page}#${m.id}`, crumb,
          text: join(m.goals, m.concepts, (m.specs || []).map((s) => `${s.id} ${s.note}`), m.practice)
        });
        const lesson = pl[m.id];
        if (lesson) {
          headedSections(lesson.sections, no, m.id).forEach(({ s, id, no: sno }) => docs.push({
            type: "section", title: `${sno} ${s.h}`, href: `${page}#${id}`, crumb: `${crumb} · ${no} ${m.title}`, text: sectionText(s)
          }));
        }
        const log = (logs[p.id] || {})[m.id];
        if (log) {
          log.steps.forEach((st, i) => docs.push({
            type: "log", title: st.msg, href: `${page}#${m.id}-log${i + 1}`, crumb: `${crumb} · ${no} ${m.title} · ${st.dir}`,
            text: join(st.iface, st.fields.map((f) => f.join(" ")), st.explain, st.spec)
          }));
        }
        (m.quiz || []).forEach((q, i) => docs.push({
          type: "quiz", title: q.q, href: `${page}#${m.id}-q${i + 1}`, crumb: `${crumb} · ${no} ${m.title}`, text: strip(q.a)
        }));
      }));
    });
    glossary.forEach((e) => docs.push({
      type: "term", title: e.zh ? `${e.t}（${e.zh}）` : e.t, href: `glossary.html#${glossarySlug(e.t)}`,
      crumb: `术语表 · ${e.c || ""}`, text: join(e.en, e.alias, e.d), key: e.t
    }));
    Object.entries(quickstart).forEach(([pid, q]) => {
      const page = `quickstart.html?t=${encodeURIComponent(pid)}`;
      q.lessons.forEach((l, i) => {
        docs.push({ type: "quick", title: `第 ${i} 课 ${l.title}`, href: `${page}#${l.id}`, crumb: q.title, text: join(l.summary, l.practice) });
        (l.sections || []).filter((s) => s.h).forEach((s) => docs.push({
          type: "quick", title: s.h, href: `${page}#${l.id}`, crumb: `${q.title} · 第 ${i} 课 ${l.title}`, text: sectionText(s)
        }));
      });
    });
    if (notes) {
      const link = (it) => `${it.page || "pathway.html?t=5g"}#${encodeURIComponent(it.scope || "")}`;
      (notes.terms || []).forEach((t) => docs.push({ type: "note", title: `我的释义：${t.t}`, href: "notes.html#terms", crumb: "我的笔记", text: join(t.zh, t.d) }));
      (notes.comments || []).forEach((c) => docs.push({ type: "note", title: `评论：${c.text}`, href: link(c), crumb: c.title || "我的笔记", text: strip(c.quote) }));
      (notes.bookmarks || []).forEach((b) => docs.push({ type: "note", title: `收藏：${b.quote}`, href: link(b), crumb: b.title || "我的笔记", text: "" }));
    }
    return docs.map((d) => ({ ...d, _t: d.title.toLowerCase(), _x: d.text.toLowerCase() }));
  }

  const tokens = (q) => String(q || "").toLowerCase().trim().split(/\s+/).filter(Boolean);

  function score(doc, q, terms) {
    if (!terms.every((t) => doc._t.includes(t) || doc._x.includes(t))) return 0;
    let s = 1;
    if (doc.key && doc.key.toLowerCase() === q) s += 50;             // 术语精确命中
    if (doc._t === q) s += 30;
    if (doc._t.includes(q)) s += 10;
    terms.forEach((t) => { if (doc._t.includes(t)) s += 3; });
    if (doc._t.startsWith(q) || doc._t.includes(` ${q}`)) s += 2;
    return s;
  }

  // 返回 [{ type, label, items: [doc…] }]，按 TYPES 顺序分组，组内按得分排序
  function search(docs, query, perGroup = 20) {
    const q = String(query || "").toLowerCase().trim();
    const terms = tokens(q);
    if (!terms.length) return [];
    const hits = docs.map((d) => ({ d, s: score(d, q, terms) })).filter((h) => h.s > 0).sort((a, b) => b.s - a.s);
    return TYPES.map((t) => {
      const all = hits.filter((h) => h.d.type === t.id).map((h) => h.d);
      return { type: t.id, label: t.label, total: all.length, items: all.slice(0, perGroup) };
    }).filter((g) => g.total);
  }

  // 摘要：正文里第一个命中词前后各取一段；没命中正文就取开头
  function snippet(text, query, radius = 40) {
    const s = String(text || "");
    const terms = tokens(query);
    const low = s.toLowerCase();
    const pos = terms.map((t) => low.indexOf(t)).filter((i) => i >= 0).sort((a, b) => a - b)[0];
    if (pos === undefined) return s.slice(0, radius * 2) + (s.length > radius * 2 ? "…" : "");
    const start = Math.max(0, pos - radius);
    const end = Math.min(s.length, pos + radius * 2);
    return (start > 0 ? "…" : "") + s.slice(start, end) + (end < s.length ? "…" : "");
  }

  // 先转义，再把命中词包上 <mark>
  function highlight(text, query) {
    const esc = (x) => x.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    const terms = tokens(query).sort((a, b) => b.length - a.length);
    if (!terms.length) return esc(String(text || ""));
    const re = new RegExp(terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), "gi");
    const s = String(text || "");
    let out = "", last = 0;
    s.replace(re, (m, idx) => { out += esc(s.slice(last, idx)) + `<mark>${esc(m)}</mark>`; last = idx + m.length; return m; });
    return out + esc(s.slice(last));
  }

  const api = { TYPES, buildIndex, search, snippet, highlight, glossarySlug };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.SearchIndex = api;
})(typeof window !== "undefined" ? window : globalThis);
