// 模拟考试：题库完整性 + 抽题 + 判分。运行：node --test tools/tests/exam.test.cjs
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const root = path.join(__dirname, "..", "..");
const E = require(path.join(root, "assets/exam.js"));
global.window = {};
["data/pathways/5g.js", "data/quickstart/5g.js", "data/exam/5g.js"].forEach((f) => require(path.join(root, f)));
const W = global.window;
const bank = E.buildBank({ topic: "5g", bank: W.EXAM_BANK["5g"], pathway: W.PATHWAYS["5g"], quickstart: W.QUICKSTART["5g"] });
const moduleIds = W.PATHWAYS["5g"].stages.flatMap((s) => s.modules.map((m) => m.id));

test("题库完整性：题号唯一、答案合法、每个模块都有客观题", () => {
  const raw = W.EXAM_BANK["5g"];
  assert.equal(new Set(raw.map((x) => x.id)).size, raw.length, "题号重复");
  raw.forEach((x) => {
    assert.ok(moduleIds.includes(x.m), `${x.id} 的模块不存在`);
    assert.ok(x.q && x.e, `${x.id} 缺题干或解析`);
    if (x.t === "single") { assert.ok(Number.isInteger(x.a) && x.a >= 0 && x.a < x.o.length, x.id); assert.ok(x.o.length >= 3, x.id); }
    else if (x.t === "multi") { assert.ok(Array.isArray(x.a) && x.a.length >= 2, `${x.id} 多选至少两个正确项`); x.a.forEach((i) => assert.ok(i >= 0 && i < x.o.length, x.id)); }
    else if (x.t === "judge") { assert.equal(typeof x.a, "boolean", x.id); assert.equal(x.o, undefined, x.id); }
    else assert.fail(`${x.id} 题型未知：${x.t}`);
  });
  moduleIds.forEach((m) => assert.ok(raw.some((x) => x.m === m), `${m} 没有客观题`));
  assert.equal(new Set(bank.map((x) => x.key)).size, bank.length, "错题本 key 重复");
});

test("题库组装：复用问答题和入门快线单选题，key 与错题本一致", () => {
  const essays = bank.filter((x) => x.type === "essay");
  const quizCount = W.PATHWAYS["5g"].stages.flatMap((s) => s.modules).reduce((a, m) => a + (m.quiz || []).length, 0);
  assert.equal(essays.length, quizCount);
  assert.ok(bank.some((x) => x.key === "5g/s0-ofdm/0" && x.scope === "s0-ofdm-q1"));
  assert.ok(bank.some((x) => x.key === "qs-5g-quick/q0/0" && x.type === "single"));
  assert.ok(bank.some((x) => x.key === "exam-5g/s0-ofdm-1"));
  ["judge", "single", "multi", "essay"].forEach((t) => assert.ok(bank.some((x) => x.type === t), t));
});

test("抽题：数量、题型筛选、不重复、按题型排序、可复现", () => {
  const p = E.draw(bank, { count: 20 }, E.rng(1));
  assert.equal(p.length, 20);
  assert.equal(new Set(p.map((x) => x.key)).size, 20);
  const order = ["judge", "single", "multi", "essay"];
  for (let i = 1; i < p.length; i++) assert.ok(order.indexOf(p[i - 1].type) <= order.indexOf(p[i].type));
  assert.deepEqual(new Set(p.map((x) => x.type)), new Set(order), "20 题应覆盖四种题型");
  assert.deepEqual(E.draw(bank, { count: 20 }, E.rng(1)).map((x) => x.key), p.map((x) => x.key));
  const only = E.draw(bank, { count: 10, types: ["multi"] }, E.rng(2));
  assert.ok(only.every((x) => x.type === "multi"));
  const scoped = E.draw(bank, { count: 100, modules: ["s0-ofdm"] }, E.rng(3));
  assert.ok(scoped.length > 0 && scoped.every((x) => x.module === "s0-ofdm"));
  assert.equal(E.draw(bank, { count: 9999 }).length, bank.length, "数量超过题库时全部抽出");
  const wrongOnly = E.draw(bank, { count: 10, onlyKeys: ["exam-5g/s0-ofdm-1", "5g/s0-ofdm/0"] });
  assert.deepEqual(wrongOnly.map((x) => x.key).sort(), ["5g/s0-ofdm/0", "exam-5g/s0-ofdm-1"]);
});

test("判分：单选、多选（须完全一致）、判断、未作答、问答", () => {
  const single = { type: "single", answer: 1 };
  assert.equal(E.grade(single, 1), true);
  assert.equal(E.grade(single, "1"), true);
  assert.equal(E.grade(single, 0), false);
  assert.equal(E.grade(single, undefined), false);
  const multi = { type: "multi", answer: [0, 2] };
  assert.equal(E.grade(multi, [2, 0]), true);
  assert.equal(E.grade(multi, [0]), false, "少选算错");
  assert.equal(E.grade(multi, [0, 1, 2]), false, "多选算错");
  assert.equal(E.grade(multi, []), false);
  assert.equal(E.grade({ type: "judge", answer: false }, false), true);
  assert.equal(E.grade({ type: "judge", answer: false }, true), false);
  assert.equal(E.grade({ type: "essay", answer: "x" }, "anything"), null);
});

test("汇总：问答题按自评计入，未自评的单列", () => {
  const paper = [
    { key: "a", type: "single", answer: 0 },
    { key: "b", type: "judge", answer: true },
    { key: "c", type: "essay", answer: "ref" },
    { key: "d", type: "essay", answer: "ref" }
  ];
  const s = E.summarize(paper, { a: 0, b: false }, { c: true });
  assert.equal(s.total, 4);
  assert.equal(s.graded, 3);
  assert.equal(s.correct, 2);
  assert.equal(s.pending, 1);
  assert.equal(s.percent, 67);
  assert.deepEqual(s.byType.map((t) => t.type), ["judge", "single", "essay"]);
});

test("答案文字与错题本条目", () => {
  const q = { key: "k", type: "multi", q: "题", options: ["甲", "乙", "丙"], answer: [2, 0], explain: "因为", page: "p", scope: "s" };
  assert.equal(E.answerText(q), "A. 甲；C. 丙");
  assert.equal(E.answerText(q, []), "未作答");
  assert.equal(E.answerText(q, undefined), "未作答", "未作答不能显示成正确答案");
  assert.equal(E.answerText({ type: "judge", answer: true }, undefined), "未作答");
  assert.equal(E.answerText({ type: "single", options: ["甲", "乙"], answer: 1 }, undefined), "未作答");
  assert.equal(E.answerText({ type: "judge" }, true), "正确");
  const m = E.reviewMeta(q, () => "标题");
  assert.equal(m.a, "正确答案：A. 甲；C. 丙。因为");
  assert.equal(m.title, "标题");
});
