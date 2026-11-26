// 规划计算器纯函数单元测试。运行：node --test tools/tests/plan-calc.test.cjs
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const P = require(path.join(__dirname, "..", "..", "assets/plan-calc.js"));

const near = (a, b, tol = 0.05) => assert.ok(Math.abs(a - b) <= tol, `${a} 与 ${b} 相差超过 ${tol}`);

test("接收灵敏度：kTB + NF + SINR", () => {
  // 10 个 RB × 12 × 30 kHz = 3.6 MHz → 10·lg(3.6e6) = 65.56
  const s = P.sensitivity({ rb: 10, scsKHz: 30, nf: 3, sinr: 0 });
  assert.equal(s.bwHz, 3.6e6);
  near(s.noiseDbm, -108.44);
  near(s.sensDbm, -105.44);
  assert.throws(() => P.sensitivity({ rb: 0, scsKHz: 30, nf: 3, sinr: 0 }), /正整数/);
  assert.throws(() => P.sensitivity({ rb: 5, scsKHz: "x", nf: 3, sinr: 0 }), /数字/);
});

test("链路预算：增益相加、损耗和余量相减、减去灵敏度", () => {
  const r = P.linkBudget({ txPower: 23, txGain: 0, txLoss: 0, rxGain: 12, rxLoss: 1, sensDbm: -110,
    shadow: 8, penetration: 15, interference: 3, body: 2 });
  assert.equal(r.mapl, 23 + 12 - 1 + 110 - 8 - 15 - 3 - 2);
  assert.equal(r.items.length, 10);
  assert.throws(() => P.linkBudget({ sensDbm: "abc" }), /灵敏度/);
});

test("传播模型：与 TR 38.901 公式逐项一致", () => {
  // UMa NLOS：d3D = 100 m 时 PL = 13.54 + 39.08·2 + 20·lg(fc)
  const hBS = 25, hUT = 1.5, d2d = Math.sqrt(100 ** 2 - (hBS - hUT) ** 2);
  near(P.pathLoss({ model: "uma", fc: 2.6, hBS, hUT, d2d }), 13.54 + 78.16 + 20 * Math.log10(2.6), 0.01);
  // UMi NLOS：d3D = 1000 m
  const d2 = Math.sqrt(1000 ** 2 - 8.5 ** 2);
  near(P.pathLoss({ model: "umi", fc: 4.9, hBS: 10, hUT: 1.5, d2d: d2 }), 35.3 * 3 + 22.4 + 21.3 * Math.log10(4.9), 0.01);
  // RMa NLOS：d3D = 1000 m 时 (lg d − 3) 项为 0
  const h = 5, W = 20, hb = 35, fc = 0.7, hu = 1.5;
  const expect = 161.04 - 7.1 * Math.log10(W) + 7.5 * Math.log10(h) - (24.37 - 3.7 * (h / hb) ** 2) * Math.log10(hb)
    + 20 * Math.log10(fc) - (3.2 * Math.log10(11.75 * hu) ** 2 - 4.97);
  near(P.pathLoss({ model: "rma", fc, hBS: hb, hUT: hu, d2d: Math.sqrt(1000 ** 2 - 33.5 ** 2) }), expect, 0.01);
  assert.throws(() => P.pathLoss({ model: "rma", fc: 26, hBS: 35, hUT: 1.5, d2d: 100 }), /0.5–7 GHz/);
  assert.throws(() => P.pathLoss({ model: "uma", fc: 3.5, hBS: 1, hUT: 1.5, d2d: 100 }), /高于终端/);
});

test("覆盖半径：反推结果代回模型等于 MAPL", () => {
  for (const model of ["uma", "umi", "rma"]) {
    const g = { model, fc: model === "rma" ? 0.7 : 3.5, hBS: P.MODELS[model].hBS, hUT: 1.5 };
    const r = P.coverageRadius({ ...g, mapl: 125 });
    near(P.pathLoss({ ...g, d2d: r.d2d }), 125, 0.01);
    assert.ok(r.d3d > r.d2d);
  }
  assert.match(P.coverageRadius({ model: "uma", mapl: 60, fc: 3.5, hBS: 25, hUT: 1.5 }).warn, /不适用/);
  assert.match(P.coverageRadius({ model: "uma", mapl: 175, fc: 3.5, hBS: 25, hUT: 1.5 }).warn, /超出/);
});

test("站点数：三扇区 ≈ 1.95R²，全向 ≈ 2.6R²，向上取整并计入冗余", () => {
  const s = P.siteCount({ areaKm2: 10, radiusM: 500 });
  near(s.siteAreaKm2, 0.4871, 0.001);
  assert.equal(s.sites, Math.ceil(10 / 0.48714));
  assert.equal(P.siteCount({ areaKm2: 10, radiusM: 500, margin: 20 }).sites, Math.ceil((10 / 0.48714) * 1.2));
  near(P.siteCount({ areaKm2: 1, radiusM: 1000, sectors: 1 }).siteAreaKm2, 2.598, 0.001);
  assert.throws(() => P.siteCount({ areaKm2: 1, radiusM: 100, sectors: 6 }), /扇区/);
  assert.throws(() => P.siteCount({ areaKm2: 0, radiusM: 100 }), /大于 0/);
});

test("测量上报映射：边界与互逆", () => {
  assert.equal(P.reportToValue("rsrp", 0).text, "< -156 dBm");
  assert.deepEqual([P.reportToValue("rsrp", 50).low, P.reportToValue("rsrp", 50).high], [-107, -106]);
  assert.equal(P.reportToValue("rsrp", 127).low, -30);
  assert.equal(P.reportToValue("rsrq", 127).low, 20);
  assert.equal(P.reportToValue("sinr", 127).low, 40);
  assert.equal(P.reportToValue("sinr", 47).low, 0);
  assert.equal(P.valueToReport("rsrp", -107), 50);
  assert.equal(P.valueToReport("rsrp", -106.5), 50);
  assert.equal(P.valueToReport("rsrp", -200), 0);
  assert.equal(P.valueToReport("rsrq", -10.5), 66);
  assert.equal(P.valueToReport("sinr", 99), 127);
  for (const k of ["rsrp", "rsrq", "sinr"]) for (let n = 1; n <= 126; n++) assert.equal(P.valueToReport(k, P.reportToValue(k, n).low), n);
  assert.throws(() => P.reportToValue("rsrp", 128), /0–127/);
});

test("KPI：成功率、无线接通率、掉线率，分母为 0 返回 null", () => {
  const k = P.kpi({ rrcReq: 2000, rrcSucc: 1990, qosReq: 1980, qosSucc: 1970, ctxSucc: 1950, drop: 6, hoAtt: 800, hoSucc: 792 });
  assert.equal(k.rrc, 99.5);
  assert.equal(k.qos, 99.49);
  near(k.access, 98.99, 0.01);
  assert.equal(k.drop, 0.31);
  assert.equal(k.ho, 99);
  assert.equal(P.kpi({}).rrc, null);
  assert.equal(P.kpi({}).access, null);
  assert.throws(() => P.kpi({ rrcReq: 1, rrcSucc: 2 }), /不能大于/);
  assert.throws(() => P.kpi({ rrcReq: -1 }), /非负/);
});

test("PCI：分解与相邻小区冲突核查", () => {
  assert.deepEqual(P.pciInfo(100), { pci: 100, nid1: 33, nid2: 1, mod4: 0, mod30: 10 });
  const r = P.pciCheck(100, [100, 103, 104, 130, 101]);
  const by = (pci) => r.issues.filter((x) => x.pci === pci).map((x) => x.label);
  assert.deepEqual(by(100), ["PCI 相同"]);
  assert.deepEqual(by(103), ["模 3 相同"]);
  assert.deepEqual(by(104), ["模 4 相同"]);
  assert.deepEqual(by(130), ["模 3 相同", "模 30 相同"]);
  assert.deepEqual(by(101), []);
  assert.throws(() => P.pciCheck(1008, []), /0–1007/);
});
