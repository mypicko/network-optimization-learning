// 网优案例库：数据完整性 + 筛选函数。运行：node --test tools/tests/cases.test.cjs
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const root = path.join(__dirname, "..", "..");
const L = require(path.join(root, "assets/cases.js"));
global.window = {};
["data/pathways/5g.js", "data/cases/5g.js"].forEach((f) => require(path.join(root, f)));
const W = global.window;
const cases = W.CASES["5g"];
const moduleIds = new Set(W.PATHWAYS["5g"].stages.flatMap((s) => s.modules.map((m) => m.id)));
const TOOLS = new Set(["arfcn", "numerology", "rate", "budget", "report", "kpi", "pci"]);

test("案例数据完整：字段齐全、答案合法、模块和计算器都存在", () => {
  assert.ok(cases.length >= 10);
  assert.equal(new Set(cases.map((c) => c.id)).size, cases.length, "案例 id 重复");
  cases.forEach((c) => {
    ["id", "title", "cat", "level", "symptom", "question", "cause", "verify", "takeaway"].forEach((k) => assert.ok(c[k], `${c.id} 缺 ${k}`));
    assert.ok(L.CATS.includes(c.cat), `${c.id} 分类未知：${c.cat}`);
    assert.ok(["入门", "进阶"].includes(c.level), c.id);
    assert.ok(c.data.length >= 2 && c.data.every((d) => d.length === 2 && d[0] && d[1]), `${c.id} 数据格式`);
    assert.ok(c.options.length >= 3 && c.options.length <= 5, c.id);
    assert.ok(Number.isInteger(c.answer) && c.answer >= 0 && c.answer < c.options.length, `${c.id} 答案越界`);
    if (c.why) {
      assert.equal(c.why.length, c.options.length, `${c.id} 点评数与选项数不一致`);
      assert.equal(c.why[c.answer], "", `${c.id} 正确选项不需要点评`);
      c.why.forEach((w, i) => { if (i !== c.answer) assert.ok(w, `${c.id} 选项 ${i} 缺点评`); });
    }
    assert.ok(c.locate.length >= 2 && c.actions.length >= 2, c.id);
    assert.ok(c.modules.length >= 1, c.id);
    c.modules.forEach((m) => assert.ok(moduleIds.has(m), `${c.id} 关联的模块不存在：${m}`));
    (c.tools || []).forEach((t) => assert.ok(TOOLS.has(t), `${c.id} 关联的计算器不存在：${t}`));
  });
});

test("每个分类至少一个案例，答案不全是同一个选项", () => {
  L.CATS.forEach((cat) => assert.ok(cases.some((c) => c.cat === cat), `${cat} 没有案例`));
  assert.ok(new Set(cases.map((c) => c.answer)).size >= 2, "正确答案位置过于单一");
});

test("筛选：按分类、按模块、计数", () => {
  const list = [{ id: "a", cat: "覆盖", modules: ["m1"] }, { id: "b", cat: "切换", modules: ["m1", "m2"] }, { id: "c", cat: "覆盖", modules: ["m2"] }];
  assert.deepEqual(L.filterCases(list, { cat: "覆盖" }).map((c) => c.id), ["a", "c"]);
  assert.deepEqual(L.filterCases(list, { module: "m2" }).map((c) => c.id), ["b", "c"]);
  assert.deepEqual(L.filterCases(list, { cat: "覆盖", module: "m2" }).map((c) => c.id), ["c"]);
  assert.deepEqual(L.filterCases(list).length, 3);
  assert.deepEqual(L.filterCases(undefined), []);
  assert.deepEqual(L.countByCat(list), [{ cat: "覆盖", n: 2 }, { cat: "切换", n: 1 }]);
});
