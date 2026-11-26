// LTE 路线数据完整性：模块、讲解、题库、案例、信令日志、术语、跨路线互链
const test = require("node:test");
const assert = require("node:assert");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");
global.window = {};
const load = (rel) => require(path.join(ROOT, rel));
["data/pathways/5g.js", "data/pathways/lte.js", "data/exam/lte.js", "data/cases/lte.js", "data/logs/lte.js", "data/glossary.js", "data/topics.js"]
  .forEach(load);
for (let i = 0; i < 8; i++) load(`data/lessons/lte/L${i}.js`);

const lte = window.PATHWAYS.lte;
const mods = lte.stages.flatMap((s) => s.modules);
const ids = new Set(mods.map((m) => m.id));

test("LTE 路线：8 个阶段、39 个模块，id 唯一且带 lte- 前缀", () => {
  assert.strictEqual(lte.stages.length, 8);
  assert.strictEqual(mods.length, 39);
  assert.strictEqual(ids.size, mods.length);
  mods.forEach((m) => assert.match(m.id, /^lte-[a-z0-9-]+$/, m.id));
  const all5g = new Set(window.PATHWAYS["5g"].stages.flatMap((s) => s.modules.map((m) => m.id)));
  mods.forEach((m) => assert.ok(!all5g.has(m.id), `与 5G 模块 id 冲突：${m.id}`));
});

test("每个模块字段齐全，并有讲解", () => {
  mods.forEach((m) => {
    assert.ok(m.title && m.hours > 0, m.id);
    assert.ok(m.goals.length >= 2 && m.concepts.length >= 3 && m.specs.length >= 1, `${m.id} 目标/概念/规范不足`);
    assert.ok(m.quiz.length >= 1 && m.quiz.every((q) => q.q && q.a), `${m.id} 自测`);
    assert.ok(m.practice, `${m.id} 实操`);
    const lesson = window.LESSONS.lte[m.id];
    assert.ok(lesson && lesson.sections.length >= 3, `${m.id} 讲解小节不足`);
    lesson.sections.forEach((s) => assert.ok(s.p || s.list || s.steps || s.table || s.flow || s.after, `${m.id} 空小节 ${s.h}`));
  });
  assert.deepStrictEqual(Object.keys(window.LESSONS.lte).filter((k) => !ids.has(k)), [], "讲解里有多余模块");
});

test("题库：每个模块至少 3 题，id 唯一，答案合法", () => {
  const bank = window.EXAM_BANK.lte;
  assert.strictEqual(new Set(bank.map((q) => q.id)).size, bank.length);
  mods.forEach((m) => assert.ok(bank.filter((q) => q.m === m.id).length >= 3, `${m.id} 题目不足`));
  bank.forEach((q) => {
    assert.ok(ids.has(q.m), `${q.id} 模块不存在`);
    assert.ok(q.q && q.e, q.id);
    if (q.t === "judge") assert.strictEqual(typeof q.a, "boolean", q.id);
    else if (q.t === "single") assert.ok(Number.isInteger(q.a) && q.a >= 0 && q.a < q.o.length, q.id);
    else if (q.t === "multi") assert.ok(Array.isArray(q.a) && q.a.length >= 2 && q.a.every((i) => i >= 0 && i < q.o.length), q.id);
    else assert.fail(`${q.id} 题型未知 ${q.t}`);
  });
});

test("案例、信令日志、术语、互链都指向存在的模块", () => {
  const cases = window.CASES.lte;
  assert.ok(cases.length >= 8);
  cases.forEach((c) => {
    assert.ok(c.modules.length && c.modules.every((m) => ids.has(m)), `${c.id} 模块`);
    assert.ok(c.answer >= 0 && c.answer < c.options.length, `${c.id} 答案`);
  });
  Object.keys(window.SIGLOGS.lte).forEach((mid) => assert.ok(ids.has(mid), `日志 ${mid}`));
  window.GLOSSARY.filter((e) => e.lm).forEach((e) => assert.ok(ids.has(e.lm), `术语 ${e.t} → ${e.lm}`));
  const terms = window.GLOSSARY.map((e) => e.t);
  assert.strictEqual(new Set(terms).size, terms.length, "术语重复");
  const find = (t, m) => window.PATHWAYS[t].stages.some((s) => s.modules.some((x) => x.id === m));
  Object.values(window.PATHWAYS).forEach((p) => p.stages.forEach((s) => s.modules.forEach((m) =>
    (m.xref || []).forEach((x) => assert.ok(find(x.t, x.m), `${m.id} → ${x.t}/${x.m}`)))));
  assert.strictEqual(window.TOPICS.find((t) => t.id === "lte").status, "live");
});

test("主题切换条只列已上线且有数据的主题", () => {
  const TS = require(path.join(ROOT, "assets/topic-switch.js"));
  const topics = [{ id: "5g", status: "live" }, { id: "lte", status: "live" }, { id: "ims", status: "planned" }];
  assert.deepStrictEqual(TS.liveTopics(topics, () => true).map((t) => t.id), ["5g", "lte"]);
  assert.deepStrictEqual(TS.liveTopics(topics, (id) => id === "5g").map((t) => t.id), ["5g"]);
});
