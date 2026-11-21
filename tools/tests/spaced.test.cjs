// 间隔复习：1 / 3 / 7 / 14 天推进、答错回到第 0 轮、未到期不推进、到期列表。运行：node --test tools/tests/spaced.test.cjs
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const R = require(path.join(__dirname, "..", "..", "assets/review.js"));

const meta = { key: "exam-5g/x", q: "题", a: "答", title: "t", page: "p", scope: "s" };
const rec = (s, ok, day) => R.applyRecord(s, meta, ok, `${day}T08:00:00.000Z`, day);
const item = (s) => s.items[meta.key];

test("日期加减跨月、跨年", () => {
  assert.equal(R.addDays("2026-01-31", 1), "2026-02-01");
  assert.equal(R.addDays("2026-12-25", 14), "2027-01-08");
  assert.equal(R.addDays("2028-02-28", 1), "2028-02-29");
});

test("答错 → 1 天后复习；到期答对依次推后 3 / 7 / 14 天，第 4 轮答对掌握", () => {
  let s = rec({ items: {} }, false, "2026-03-01");
  assert.deepEqual([item(s).stage, item(s).due, item(s).status], [0, "2026-03-02", "wrong"]);
  s = rec(s, true, "2026-03-02");
  assert.deepEqual([item(s).stage, item(s).due], [1, "2026-03-05"]);
  s = rec(s, true, "2026-03-05");
  assert.deepEqual([item(s).stage, item(s).due], [2, "2026-03-12"]);
  s = rec(s, true, "2026-03-12");
  assert.deepEqual([item(s).stage, item(s).due], [3, "2026-03-26"]);
  s = rec(s, true, "2026-03-30");
  assert.equal(item(s).status, "ok", "逾期复习答对同样算通过");
  assert.equal(item(s).due, null);
  assert.equal(R.listWrong(s).length, 0);
});

test("未到期提前答对不改变安排；任何一轮答错回到第 0 轮", () => {
  let s = rec({ items: {} }, false, "2026-03-01");
  s = rec(s, true, "2026-03-02");
  const early = rec(s, true, "2026-03-03");
  assert.deepEqual([item(early).stage, item(early).due], [1, "2026-03-05"]);
  assert.equal(item(early).right, 2, "答对次数照常累加");
  const fail = rec(s, false, "2026-03-05");
  assert.deepEqual([item(fail).stage, item(fail).due], [0, "2026-03-06"]);
});

test("不在错题本里的题答对：记为 ok，不进复习队列", () => {
  const s = rec({ items: {} }, true, "2026-03-01");
  assert.equal(item(s).status, "ok");
  assert.equal(R.listDue(s, "2026-03-01").length, 0);
});

test("到期列表与概况；旧数据没有 due 视为今天到期", () => {
  let s = rec({ items: {} }, false, "2026-03-01");
  s = R.applyRecord(s, { ...meta, key: "b" }, false, "2026-03-03T00:00:00Z", "2026-03-03");
  s = { items: { ...s.items, old: { key: "old", q: "旧", status: "wrong", wrong: 1, right: 0, updated: "2025" } } };
  assert.deepEqual(R.listDue(s, "2026-03-02").map((x) => x.key), ["old", meta.key]);
  assert.deepEqual(R.dueSummary(s, "2026-03-02"), { due: 2, total: 3, next: "2026-03-04" });
  assert.deepEqual(R.dueSummary({ items: {} }, "2026-03-02"), { due: 0, total: 0, next: null });
});

test("作答后的提示文字", () => {
  const s1 = rec({ items: {} }, false, "2026-03-01");
  assert.equal(R.afterText(null, item(s1), false), "已记入错题本，3月2日复习。");
  const s2 = rec(s1, true, "2026-03-02");
  assert.equal(R.afterText(item(s1), item(s2), true), "答对了，第 1/4 轮复习通过，下次复习 3月5日。");
  const s3 = rec(s2, true, "2026-03-03");
  assert.match(R.afterText(item(s2), item(s3), true), /3月5日才到复习时间/);
  const s4 = rec(s2, false, "2026-03-05");
  assert.equal(R.afterText(item(s2), item(s4), false), "没答对，复习轮次清零，3月6日再复习。");
  assert.equal(R.afterText(null, item(rec({ items: {} }, true, "2026-03-01")), true), "答对了。");
});
