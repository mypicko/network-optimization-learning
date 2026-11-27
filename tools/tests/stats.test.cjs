// 首页学习统计：连续天数、近 7 天、累计、最近 14 天
const test = require("node:test");
const assert = require("node:assert");
const S = require("../../assets/stats.js");

const NOW = new Date(2026, 10, 27, 15, 0).getTime();   // 2026-11-27 15:00
const day = (n, h = 10) => new Date(2026, 10, 27 + n, h).getTime();

test("连续学习：今天没学时从昨天往回数，中断就停", () => {
  const s = S.learningStats({ days: [S.dayKey(day(-1)), S.dayKey(day(-2)), S.dayKey(day(-4))], now: NOW });
  assert.strictEqual(s.streak, 2);
  assert.strictEqual(s.todayActive, false);
  const t = S.learningStats({ days: [S.dayKey(day(0)), S.dayKey(day(-1))], now: NOW });
  assert.strictEqual(t.streak, 2);
  assert.strictEqual(t.todayActive, true);
  assert.strictEqual(S.learningStats({ days: [S.dayKey(day(-3))], now: NOW }).streak, 0);
});

test("模块完成、错题、考试都算活跃日；只统计路线主题的模块数", () => {
  const s = S.learningStats({
    progress: { "5g": { a: day(0), b: day(-3), c: day(-20) }, "qs-5g": { x: day(-1) } },
    review: { items: { k: { updated: new Date(day(-2)).toISOString() } } },
    exams: [{ id: day(-5) }], topics: ["5g", "lte"], now: NOW
  });
  assert.strictEqual(s.total, 3);
  assert.strictEqual(s.week, 2);
  assert.strictEqual(s.streak, 4);   // 今天、-1（入门快线）、-2（错题）、-3（模块）
  assert.strictEqual(s.recent.length, 14);
  assert.strictEqual(s.recent[13].active, true);
});

test("记录今天：重复记录不增加，最多保留 400 天", () => {
  const a = S.touch([], NOW);
  assert.deepStrictEqual(S.touch(a, NOW), a);
  const many = Array.from({ length: 400 }, (_, i) => `2025-01-${i}`);
  assert.strictEqual(S.touch(many, NOW).length, 400);
});
