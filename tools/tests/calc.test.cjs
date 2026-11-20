// 计算器纯函数单元测试。运行：node --test tools/tests/calc.test.cjs
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const C = require(path.join(__dirname, "..", "..", "assets/calc.js"));

test("ARFCN → 频率：三段全球栅格的边界和典型值", () => {
  assert.equal(C.arfcnToFreq(0), 0);
  assert.equal(C.arfcnToFreq(599999), 2999.995);
  assert.equal(C.arfcnToFreq(600000), 3000);
  assert.equal(C.arfcnToFreq(636666), 3549.99);   // n78 常见中心频点附近
  assert.equal(C.arfcnToFreq(504990), 2524.95);   // n41 中国移动常用频点
  assert.equal(C.arfcnToFreq(2016667), 24250.08);
  assert.throws(() => C.arfcnToFreq(3279166), /有效范围/);
  assert.throws(() => C.arfcnToFreq(1.5), /整数/);
});

test("频率 → ARFCN：取最近的栅格点，且与反向换算一致", () => {
  assert.equal(C.freqToArfcn(3500), 633333);
  assert.equal(C.freqToArfcn(2110), 422000);
  assert.equal(C.freqToArfcn(4900), 726667);
  [151600, 422000, 504990, 633334, 726666, 2070000].forEach((n) => assert.equal(C.freqToArfcn(C.arfcnToFreq(n)), n));
  assert.throws(() => C.freqToArfcn(-1), /频率/);
});

test("频段识别：n78 与 n77 重叠、FDD 给出上行频率、信道栅格判断", () => {
  const b = C.bandsFor(633334).map((x) => x.band);
  assert.deepEqual(b, ["n77", "n78"]);
  const n78 = C.bandsFor(633334).find((x) => x.band === "n78");
  assert.deepEqual(n78.onRaster, [15, 30]);           // 偶数偏移，15 / 30 kHz 栅格都在
  assert.deepEqual(C.bandsFor(633335).find((x) => x.band === "n78").onRaster, [15]);
  const n1 = C.bandsFor(428000)[0];
  assert.equal(n1.band, "n1");
  assert.equal(n1.dlFreq, 2140);
  assert.equal(n1.ulFreq, 1950);
  assert.deepEqual(C.bandsFor(428010)[0].onRaster, []); // 不是 20 的倍数偏移
  assert.equal(C.bandsFor(10).length, 0);
});

test("参数集：子载波间隔、时隙、符号与 CP 长度", () => {
  const m0 = C.numerology(0);
  assert.equal(m0.scsKHz, 15);
  assert.equal(m0.slotsPerFrame, 10);
  assert.equal(m0.usefulSymbolUs, 66.667);
  assert.equal(m0.cpUs, 4.688);
  assert.equal(m0.longCpUs, 5.208);
  const m1 = C.numerology(1);
  assert.equal(m1.slotMs, 0.5);
  assert.equal(m1.slotsPerFrame, 20);
  assert.equal(m1.rbWidthKHz, 360);
  assert.equal(C.numerology(2).extendedCp, true);
  assert.equal(C.numerology(3).slotMs, 0.125);
  assert.throws(() => C.numerology(5), /μ/);
  // 一个时隙 = 14 个符号（含 CP），0.5 ms 内恰好有一个长 CP
  const slotUs = 13 * (m1.usefulSymbolUs + m1.cpUs) + m1.usefulSymbolUs + (m1.longCpUs);
  assert.ok(Math.abs(slotUs - 500) < 0.01);
});

test("最大 RB 数查表", () => {
  assert.equal(C.maxRb("FR1", 30, 100), 273);
  assert.equal(C.maxRb("FR1", 15, 20), 106);
  assert.equal(C.maxRb("FR2", 120, 400), 264);
  assert.equal(C.maxRb("FR1", 15, 100), null);
});

test("TDD 上下行比例", () => {
  const r = C.tddRatio("DDDSUDDSUU", [10, 2, 2]);
  assert.ok(Math.abs(r.dl - (5 + 20 / 14) / 10) < 1e-9);
  assert.ok(Math.abs(r.ul - (3 + 4 / 14) / 10) < 1e-9);
  const m = C.tddRatio("DDDDDDDSUU", [6, 4, 4]);
  assert.ok(Math.abs(m.dl - (7 + 6 / 14) / 10) < 1e-9);
  assert.deepEqual(C.tddRatio("DDDD"), { dl: 1, ul: 0 });
  assert.throws(() => C.tddRatio("DDXU"), /D、S、U/);
  assert.throws(() => C.tddRatio("DSU", [10, 2, 1]), /14/);
});

test("峰值速率：TS 38.306 公式", () => {
  // FR1、30 kHz、100 MHz、4 层、256QAM、下行：每层约 584.3 Mbps，4 层约 2337 Mbps
  const r = C.peakRate({ fr: "FR1", dir: "DL", scsKHz: 30, bwMHz: 100, layers: 4, mod: "256QAM" });
  assert.equal(r.nprb, 273);
  assert.equal(r.fullMbps, 2337);  // 32 × 948/1024 × 3276 × 28000 × 0.86 × 1e-6
  const tdd = C.peakRate({ fr: "FR1", dir: "DL", scsKHz: 30, bwMHz: 100, layers: 4, mod: "256QAM", ratio: C.tddRatio("DDDSUDDSUU", [10, 2, 2]).dl });
  assert.ok(tdd.mbps > 1490 && tdd.mbps < 1510);
  // 上行开销 8%
  const ul = C.peakRate({ fr: "FR1", dir: "UL", scsKHz: 30, bwMHz: 100, layers: 1, mod: "64QAM" });
  assert.equal(ul.overhead, 0.08);
  assert.throws(() => C.peakRate({ fr: "FR1", scsKHz: 15, bwMHz: 100, layers: 1, mod: "QPSK" }), /不支持/);
  assert.throws(() => C.peakRate({ fr: "FR1", scsKHz: 30, bwMHz: 100, layers: 9, mod: "QPSK" }), /层数/);
});
