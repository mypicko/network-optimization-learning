// 模块学习状态：四种状态互斥、统计、导入合并。运行：node --test tools/tests/roadmap.test.cjs
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const M = require(path.join(__dirname, "..", "..", "assets/roadmap.js"));

const mods = [{ id: "a" }, { id: "b" }, { id: "c" }, { id: "d" }];

test("状态互斥：完成 / 学习中 / 跳过 / 重置，且不修改旧对象", () => {
  const p0 = { "5g": { a: 100 } }, s0 = {};
  assert.equal(M.statusOf(p0, s0, "5g", "a"), "done");
  assert.equal(M.statusOf(p0, s0, "5g", "b"), "todo");
  let r = M.applyStatus(p0, s0, "5g", "b", "learning", 200);
  assert.equal(M.statusOf(r.progress, r.status, "5g", "b"), "learning");
  r = M.applyStatus(r.progress, r.status, "5g", "b", "done", 300);
  assert.deepEqual([M.statusOf(r.progress, r.status, "5g", "b"), r.status["5g"].b], ["done", undefined]);
  r = M.applyStatus(r.progress, r.status, "5g", "a", "skip", 400);
  assert.deepEqual([M.statusOf(r.progress, r.status, "5g", "a"), r.progress["5g"].a], ["skip", undefined]);
  r = M.applyStatus(r.progress, r.status, "5g", "a", "todo", 500);
  assert.equal(M.statusOf(r.progress, r.status, "5g", "a"), "todo");
  assert.deepEqual(p0, { "5g": { a: 100 } });
  assert.deepEqual(s0, {});
  assert.throws(() => M.applyStatus({}, {}, "5g", "a", "weird", 1), /未知状态/);
});

test("重复标已完成保留原完成时间；其他主题的数据不受影响", () => {
  const r = M.applyStatus({ "5g": { a: 100 }, qs: { x: 1 } }, {}, "5g", "a", "done", 999);
  assert.equal(r.progress["5g"].a, 100);
  assert.deepEqual(r.progress.qs, { x: 1 });
});

test("统计：完成 + 跳过算学完；下一个优先取学习中", () => {
  const progress = { "5g": { a: 1 } }, status = { "5g": { b: "skip", d: "learning" } };
  const s = M.summarize(mods, progress, status, "5g");
  assert.deepEqual([s.done, s.skip, s.learning, s.todo, s.finished, s.pct], [1, 1, 1, 1, 2, 50]);
  assert.equal(s.next.id, "d");
  assert.equal(M.summarize(mods, progress, { "5g": { b: "skip" } }, "5g").next.id, "c");
  assert.equal(M.summarize(mods, { "5g": { a: 1, b: 1, c: 1, d: 1 } }, {}, "5g").next, null);
});

test("导入合并：本机已有状态或完成记录的模块不被覆盖，非法值丢弃", () => {
  const cur = { "5g": { a: "learning" } };
  const inc = { "5g": { a: "skip", b: "skip", c: "bogus", d: "learning" }, x: "nope" };
  assert.deepEqual(M.mergeStatus(cur, inc, { "5g": { d: 5 } }), { "5g": { a: "learning", b: "skip" } });
  assert.equal(M.countStatus({ "5g": { a: "skip", b: "learning" } }), 2);
});
