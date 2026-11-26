// 把各阶段编写稿合成 LTE 路线数据和题库：
//   tools/lte-parts/stage-N.modules.js → data/pathways/lte.js
//   tools/lte-parts/exam-N.js          → data/exam/lte.js
// 用法：node tools/lte-parts/build.cjs
const fs = require("fs");
const path = require("path");

const DIR = __dirname;
const ROOT = path.join(DIR, "..", "..");
const STAGES = [0, 1, 2, 3, 4, 5, 6, 7];

// 跨路线互链（LTE → 5G）
const XREF = {
  "lte-evolution": [{ t: "5g", m: "s1-scenarios", note: "5G 要解决什么新问题" }],
  "lte-ofdma": [{ t: "5g", m: "s0-ofdm", note: "NR 的灵活参数集" }],
  "lte-stack": [{ t: "5g", m: "s3-stack", note: "NR 协议栈新增的 SDAP" }],
  "lte-access": [{ t: "5g", m: "s3-access", note: "NR 随机接入与两步 RACH" }],
  "lte-ho": [{ t: "5g", m: "s3-mobility", note: "NR 的测量与切换" }],
  "lte-attach": [{ t: "5g", m: "s4-registration", note: "5G 注册流程对比" }],
  "lte-bearer": [{ t: "5g", m: "s4-qos", note: "5G QoS Flow 模型" }],
  "lte-security": [{ t: "5g", m: "s4-security", note: "5G-AKA 与 SUCI" }],
  "lte-volte": [{ t: "5g", m: "s5-voice", note: "5G 语音：EPS Fallback 与 VoNR" }],
  "lte-interwork": [{ t: "5g", m: "s1-deploy", note: "NSA / SA 部署方式" }],
  "lte-plan": [{ t: "5g", m: "s6-budget", note: "5G 链路预算" }],
  "lte-kpi": [{ t: "5g", m: "s6-kpi", note: "5G KPI 与测量" }]
};

const stages = STAGES.map((n) => {
  const s = require(path.join(DIR, `stage-${n}.modules.js`));
  return { ...s, modules: s.modules.map((m) => (XREF[m.id] ? { ...m, xref: XREF[m.id] } : m)) };
});

const pathway = {
  id: "lte",
  title: "4G LTE",
  subtitle: "从 OFDMA 物理层到 EPC 核心网、语音互操作与网优，面向一线从业者的 LTE 系统化路径",
  audience: "无线 / 核心网 / 网优工程师，以及需要系统掌握 LTE 的通信从业者",
  version: "以 3GPP R8–R14 为主线",
  stages
};

const header = `// 4G LTE 学习路径数据（由 tools/lte-parts/build.cjs 从各阶段编写稿合成，改内容请改 tools/lte-parts/ 后重新生成）
// 结构同 data/pathways/5g.js：pathway → stages（阶段）→ modules（模块）；xref 为跨路线互链
window.PATHWAYS = window.PATHWAYS || {};

window.PATHWAYS["lte"] = `;
fs.writeFileSync(path.join(ROOT, "data/pathways/lte.js"), header + JSON.stringify(pathway, null, 2) + ";\n");

const bank = STAGES.flatMap((n) => require(path.join(DIR, `exam-${n}.js`)));
const examHeader = `// 4G LTE 模拟考试题库（客观题，由 tools/lte-parts/build.cjs 合成），字段同 data/exam/5g.js
// 问答题自动复用路径模块的自测问答题（data/pathways/lte.js 的 quiz）
window.EXAM_BANK = window.EXAM_BANK || {};

window.EXAM_BANK["lte"] = `;
fs.writeFileSync(path.join(ROOT, "data/exam/lte.js"),
  examHeader + "[\n" + bank.map((q) => "  " + JSON.stringify(q)).join(",\n") + "\n];\n");

const mods = stages.flatMap((s) => s.modules);
const hours = mods.reduce((a, m) => a + m.hours, 0);
const byType = bank.reduce((a, q) => ({ ...a, [q.t]: (a[q.t] || 0) + 1 }), {});
console.log(`stages ${stages.length} · modules ${mods.length} · hours ${hours} · exam ${bank.length}`, byType);
