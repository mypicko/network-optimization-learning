// 无线网络规划计算器的纯函数：链路预算、传播模型反推覆盖半径、站点数、测量上报映射、KPI、PCI 核查
// 公式出处：
//   热噪声与接收灵敏度：kTB（−174 dBm/Hz，常温 290 K）+ 噪声系数 + 解调门限
//   传播模型：TR 38.901 表 7.4.1-1（UMa / UMi 街道峡谷 / RMa 的 NLOS 公式）
//   测量上报映射：TS 38.133 §10.1.6（SS-RSRP）、§10.1.11（SS-RSRQ）、§10.1.16（SS-SINR）
//   PCI：TS 38.211 §7.4.2.1（PCI = 3 × N_ID(1) + N_ID(2)）
// 浏览器里挂到 window.PlanCalc，Node 里 module.exports，便于单元测试
(function (root) {
  const log10 = Math.log10;
  const round = (x, d) => Math.round(x * 10 ** d) / 10 ** d;
  const num = (v, name) => {
    const n = Number(v);
    if (!Number.isFinite(n)) throw new Error(`${name}必须是数字`);
    return n;
  };

  // ---------- 接收灵敏度 ----------
  // 灵敏度（dBm）= −174 + 10·lg(B) + NF + SINR_req，B 为占用带宽（Hz）
  function sensitivity({ rb, scsKHz, nf, sinr }) {
    const nRb = num(rb, "RB 数");
    const scs = num(scsKHz, "子载波间隔");
    if (nRb < 1 || !Number.isInteger(nRb)) throw new Error("RB 数必须是正整数");
    const bwHz = nRb * 12 * scs * 1000;
    const noise = -174 + 10 * log10(bwHz);
    return { bwHz, noiseDbm: round(noise, 2), sensDbm: round(noise + num(nf, "噪声系数") + num(sinr, "解调门限"), 2) };
  }

  // ---------- 链路预算 ----------
  // MAPL = 发射功率 + 发射天线增益 − 发射端损耗 + 接收天线增益 − 接收端损耗 − 灵敏度 − 各项余量与损耗
  const GAINS = [["txPower", "发射功率"], ["txGain", "发射天线增益"], ["rxGain", "接收天线增益"]];
  const LOSSES = [["txLoss", "发射端损耗"], ["rxLoss", "接收端损耗"], ["shadow", "阴影衰落余量"],
    ["penetration", "穿透损耗"], ["interference", "干扰余量"], ["body", "人体 / 植被损耗"]];

  function linkBudget(p) {
    const sens = num(p.sensDbm, "接收灵敏度");
    const items = [
      ...GAINS.map(([k, label]) => ({ key: k, label, value: num(p[k] ?? 0, label) })),
      ...LOSSES.map(([k, label]) => ({ key: k, label, value: -num(p[k] ?? 0, label) })),
      { key: "sens", label: "接收灵敏度（取反）", value: -sens }
    ];
    const mapl = items.reduce((a, x) => a + x.value, 0);
    return { mapl: round(mapl, 2), items };
  }

  // ---------- 传播模型（TR 38.901 NLOS） ----------
  // 都写成 PL = A + B·lg(d3D) 的形式，便于由 MAPL 反推距离；fc 单位 GHz，高度单位 m
  const MODELS = {
    uma: {
      label: "UMa 城区宏站（NLOS）", hBS: 25, fcMax: 100, d2dMax: 5000,
      coef: ({ fc, hUT }) => ({ A: 13.54 + 20 * log10(fc) - 0.6 * (hUT - 1.5), B: 39.08 })
    },
    umi: {
      label: "UMi 街道微站（NLOS）", hBS: 10, fcMax: 100, d2dMax: 5000,
      coef: ({ fc, hUT }) => ({ A: 22.4 + 21.3 * log10(fc) - 0.3 * (hUT - 1.5), B: 35.3 })
    },
    rma: {
      label: "RMa 农村宏站（NLOS）", hBS: 35, fcMax: 7, d2dMax: 5000,
      // 平均建筑高度 h = 5 m、平均街道宽度 W = 20 m（规范的默认值）
      coef: ({ fc, hUT, hBS, h = 5, W = 20 }) => {
        const B = 43.42 - 3.1 * log10(hBS);
        const A = 161.04 - 7.1 * log10(W) + 7.5 * log10(h) - (24.37 - 3.7 * (h / hBS) ** 2) * log10(hBS)
          - 3 * B + 20 * log10(fc) - (3.2 * log10(11.75 * hUT) ** 2 - 4.97);
        return { A, B };
      }
    }
  };

  function checkGeometry(model, fc, hBS, hUT) {
    const m = MODELS[model];
    if (!m) throw new Error(`未知传播模型：${model}`);
    if (!(fc >= 0.5 && fc <= m.fcMax)) throw new Error(`${m.label}适用频率 0.5–${m.fcMax} GHz`);
    if (!(hUT >= 1 && hUT <= 22.5)) throw new Error("终端高度取 1–22.5 m");
    if (!(hBS > hUT)) throw new Error("基站天线必须高于终端");
    return m;
  }

  // 由距离算路径损耗
  function pathLoss({ model, fc, hBS, hUT, d2d }) {
    const m = checkGeometry(model, fc, hBS, hUT);
    const d3d = Math.hypot(d2d, hBS - hUT);
    const { A, B } = m.coef({ fc, hUT, hBS });
    return round(A + B * log10(d3d), 2);
  }

  // 由 MAPL 反推覆盖半径
  function coverageRadius({ model, mapl, fc, hBS, hUT }) {
    const m = checkGeometry(model, num(fc, "频率"), num(hBS, "基站高度"), num(hUT, "终端高度"));
    const { A, B } = m.coef({ fc, hUT, hBS });
    const d3d = 10 ** ((num(mapl, "MAPL") - A) / B);
    const dh = hBS - hUT;
    const d2d = d3d > dh ? Math.sqrt(d3d ** 2 - dh ** 2) : 0;
    const warn = d2d < 10 ? "半径小于 10 m，链路预算太紧，模型已不适用"
      : d2d > m.d2dMax ? `半径超过 ${m.d2dMax / 1000} km，超出模型适用范围，结果偏乐观` : "";
    return { d3d: round(d3d, 1), d2d: round(d2d, 1), warn };
  }

  // ---------- 站点数 ----------
  // 正六边形蜂窝：全向站面积 = (3√3/2)R²；三扇区站面积 = (9√3/8)R²（R 为站点到小区最远边缘的距离）
  const SITE_FACTOR = { 1: (3 * Math.sqrt(3)) / 2, 3: (9 * Math.sqrt(3)) / 8 };

  function siteCount({ areaKm2, radiusM, sectors = 3, margin = 0 }) {
    const f = SITE_FACTOR[sectors];
    if (!f) throw new Error("扇区数只支持 1（全向）或 3");
    const r = num(radiusM, "覆盖半径") / 1000;
    const area = num(areaKm2, "区域面积");
    if (!(r > 0) || !(area > 0)) throw new Error("面积和半径都必须大于 0");
    const siteArea = f * r * r;
    const raw = area / siteArea;
    return { siteAreaKm2: round(siteArea, 4), raw: round(raw, 2), sites: Math.ceil(raw * (1 + num(margin, "冗余") / 100)) };
  }

  // ---------- 测量上报映射（TS 38.133） ----------
  // 索引 0 表示低于下限，127 表示不低于上限，1–126 等间隔
  const REPORT = {
    rsrp: { label: "SS-RSRP", unit: "dBm", min: -156, step: 1 },
    rsrq: { label: "SS-RSRQ", unit: "dB", min: -43, step: 0.5 },
    sinr: { label: "SS-SINR", unit: "dB", min: -23, step: 0.5 }
  };

  function reportToValue(kind, index) {
    const r = REPORT[kind];
    if (!r) throw new Error(`未知测量量：${kind}`);
    const n = Number(index);
    if (!Number.isInteger(n) || n < 0 || n > 127) throw new Error("上报索引取 0–127 的整数");
    const hi = r.min + r.step * 126;
    if (n === 0) return { low: null, high: r.min, text: `< ${r.min} ${r.unit}` };
    if (n === 127) return { low: hi, high: null, text: `≥ ${hi} ${r.unit}` };
    const low = r.min + r.step * (n - 1);
    return { low, high: low + r.step, text: `${low} ≤ ${r.label} < ${low + r.step} ${r.unit}` };
  }

  function valueToReport(kind, value) {
    const r = REPORT[kind];
    if (!r) throw new Error(`未知测量量：${kind}`);
    const v = num(value, "测量值");
    if (v < r.min) return 0;
    return Math.min(127, Math.floor((v - r.min) / r.step) + 1);
  }

  // ---------- KPI ----------
  const pct = (a, b) => (b > 0 ? round((a / b) * 100, 2) : null);

  function kpi(c) {
    const n = (k) => {
      const v = Number(c[k] ?? 0);
      if (!Number.isFinite(v) || v < 0) throw new Error("计数器必须是非负数");
      return v;
    };
    for (const [ok, all, name] of [["rrcSucc", "rrcReq", "RRC"], ["qosSucc", "qosReq", "QoS 流"], ["hoSucc", "hoAtt", "切换"], ["drop", "ctxSucc", "掉线"]]) {
      if (n(ok) > n(all)) throw new Error(`${name}：成功（或异常）次数不能大于请求（或建立）次数`);
    }
    const rrc = pct(n("rrcSucc"), n("rrcReq"));
    const qos = pct(n("qosSucc"), n("qosReq"));
    return {
      rrc, qos,
      access: rrc !== null && qos !== null ? round((rrc * qos) / 100, 2) : null,
      drop: pct(n("drop"), n("ctxSucc")),
      ho: pct(n("hoSucc"), n("hoAtt"))
    };
  }

  // ---------- PCI 核查 ----------
  // 相邻小区之间：PCI 相同（冲突 / 混淆）、模 3 相同（PSS 序列相同）、
  // 模 4 相同（PBCH DMRS 频域位置相同）、模 30 相同（上行 DMRS / SRS 序列组相同）都尽量避开
  const PCI_RULES = [
    { mod: 0, label: "PCI 相同", level: "严重", why: "终端无法区分两个小区，会导致切换到错误小区、解调失败" },
    { mod: 3, label: "模 3 相同", level: "注意", why: "PSS 序列相同（N_ID(2) 相同），同步与小区检测相互干扰" },
    { mod: 4, label: "模 4 相同", level: "注意", why: "PBCH DMRS 的频域位置相同，信号重叠时信道估计变差" },
    { mod: 30, label: "模 30 相同", level: "注意", why: "上行 DMRS / SRS 的序列组相同，上行解调和测量相互干扰" }
  ];

  function parsePci(v) {
    const n = Number(v);
    if (!Number.isInteger(n) || n < 0 || n > 1007) throw new Error(`PCI 必须是 0–1007 的整数：${v}`);
    return n;
  }

  function pciInfo(pci) {
    const p = parsePci(pci);
    return { pci: p, nid1: Math.floor(p / 3), nid2: p % 3, mod4: p % 4, mod30: p % 30 };
  }

  function pciCheck(serving, neighbors) {
    const s = parsePci(serving);
    const list = neighbors.map(parsePci);
    const issues = [];
    list.forEach((n) => {
      PCI_RULES.forEach((r) => {
        const hit = r.mod === 0 ? n === s : n % r.mod === s % r.mod;
        if (hit && !(r.mod !== 0 && n === s)) issues.push({ pci: n, ...r });
      });
    });
    return { serving: pciInfo(s), issues };
  }

  const api = { MODELS, REPORT, PCI_RULES, SITE_FACTOR, sensitivity, linkBudget, pathLoss, coverageRadius, siteCount,
    reportToValue, valueToReport, kpi, pciInfo, pciCheck };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.PlanCalc = api;
})(typeof window !== "undefined" ? window : globalThis);
