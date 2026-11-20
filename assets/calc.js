// 5G NR 计算器的纯函数：NR-ARFCN 换算、参数集、峰值速率
// 公式出处：
//   NR-ARFCN：TS 38.104 §5.4.2.1（全球频率栅格）与 §5.4.2.3（各频段信道栅格）
//   参数集：TS 38.211 §4.2、§4.3、§5.3.1（子载波间隔、时隙、符号与 CP 长度）
//   最大 RB 数：TS 38.101-1 表 5.3.2-1（FR1）、TS 38.101-2 表 5.3.2-1（FR2）
//   峰值速率：TS 38.306 §4.1.2
// 浏览器里挂到 window.Calc，Node 里 module.exports，便于单元测试
(function (root) {
  // ---------- NR-ARFCN ----------
  // F_REF = F_REF-Offs + ΔF_Global × (N_REF − N_REF-Offs)
  const RASTER = [
    { fMin: 0, fMax: 3000, dF: 0.005, fOffs: 0, nOffs: 0, nMin: 0, nMax: 599999 },
    { fMin: 3000, fMax: 24250, dF: 0.015, fOffs: 3000, nOffs: 600000, nMin: 600000, nMax: 2016666 },
    { fMin: 24250, fMax: 100000, dF: 0.06, fOffs: 24250.08, nOffs: 2016667, nMin: 2016667, nMax: 3279165 }
  ];

  // 常用频段（下行 / TDD 的 N_REF 范围与步长）；duplex 为上行相对下行的频率偏移（MHz），TDD 为 0
  // steps：{ 信道栅格 kHz: N_REF 步长 }；cn：国内使用情况
  const BANDS = [
    { band: "n1", mode: "FDD", dl: [2110, 2170], ul: [1920, 1980], duplex: -190, n: [422000, 434000], steps: { 100: 20 }, cn: "中国电信 / 中国联通 2.1 GHz" },
    { band: "n3", mode: "FDD", dl: [1805, 1880], ul: [1710, 1785], duplex: -95, n: [361000, 376000], steps: { 100: 20 }, cn: "1.8 GHz（重耕）" },
    { band: "n28", mode: "FDD", dl: [758, 803], ul: [703, 748], duplex: -55, n: [151600, 160600], steps: { 100: 20 }, cn: "中国广电 / 中国移动 700 MHz" },
    { band: "n41", mode: "TDD", dl: [2496, 2690], n: [499200, 537999], steps: { 15: 3, 30: 6 }, cn: "中国移动 2.6 GHz（2515–2675 MHz）" },
    { band: "n77", mode: "TDD", dl: [3300, 4200], n: [620000, 680000], steps: { 15: 1, 30: 2 }, cn: "包含 n78 的更宽频段" },
    { band: "n78", mode: "TDD", dl: [3300, 3800], n: [620000, 653333], steps: { 15: 1, 30: 2 }, cn: "中国电信 + 中国联通 3.5 GHz（3400–3600 MHz）" },
    { band: "n79", mode: "TDD", dl: [4400, 5000], n: [693334, 733333], steps: { 15: 1, 30: 2 }, cn: "中国移动 4.9 GHz（4800–4900 MHz）、中国广电（4900–5000 MHz）" },
    { band: "n258", mode: "TDD", dl: [24250, 27500], n: [2016667, 2070832], steps: { 60: 1, 120: 2 }, cn: "毫米波（国内尚未商用）" }
  ];

  const round = (x, d) => Math.round(x * 10 ** d) / 10 ** d;

  function arfcnToFreq(n) {
    const N = Number(n);
    if (!Number.isInteger(N)) throw new Error("NR-ARFCN 必须是整数");
    const r = RASTER.find((x) => N >= x.nMin && N <= x.nMax);
    if (!r) throw new Error("NR-ARFCN 的有效范围是 0–3279165");
    return round(r.fOffs + r.dF * (N - r.nOffs), 3);
  }

  // 频率 → 最接近的全球栅格点
  function freqToArfcn(f) {
    const F = Number(f);
    if (!isFinite(F) || F < 0 || F > 100000) throw new Error("频率需在 0–100000 MHz 之间");
    const r = RASTER.find((x) => F >= x.fMin && F < x.fMax) || RASTER[RASTER.length - 1];
    const N = Math.round((F - r.fOffs) / r.dF + r.nOffs);
    return Math.min(Math.max(N, r.nMin), r.nMax);
  }

  // 某个 N_REF 落在哪些频段里，以及是否落在该频段的信道栅格上
  function bandsFor(n) {
    const N = Number(n);
    return BANDS.filter((b) => N >= b.n[0] && N <= b.n[1]).map((b) => {
      const onRaster = Object.entries(b.steps)
        .filter(([, step]) => (N - b.n[0]) % step === 0)
        .map(([kHz]) => Number(kHz));
      const dl = arfcnToFreq(N);
      return { ...b, onRaster, dlFreq: dl, ulFreq: b.mode === "FDD" ? round(dl + b.duplex, 3) : null };
    });
  }

  // ---------- 参数集 ----------
  // 最大可用 RB 数：带宽（MHz）→ N_RB
  const NRB = {
    FR1: {
      15: { 5: 25, 10: 52, 15: 79, 20: 106, 25: 133, 30: 160, 40: 216, 50: 270 },
      30: { 5: 11, 10: 24, 15: 38, 20: 51, 25: 65, 30: 78, 40: 106, 50: 133, 60: 162, 70: 189, 80: 217, 90: 245, 100: 273 },
      60: { 10: 11, 15: 18, 20: 24, 25: 31, 30: 38, 40: 51, 50: 65, 60: 79, 70: 93, 80: 107, 90: 121, 100: 135 }
    },
    FR2: {
      60: { 50: 66, 100: 132, 200: 264 },
      120: { 50: 32, 100: 66, 200: 132, 400: 264 }
    }
  };

  const KAPPA = 64;
  const TC = 1 / (480e3 * 4096); // 基本时间单位 Tc（秒）

  function numerology(mu) {
    const m = Number(mu);
    if (![0, 1, 2, 3, 4].includes(m)) throw new Error("μ 取 0–4");
    const scs = 15 * 2 ** m;
    const usefulUs = 2048 * KAPPA * 2 ** -m * TC * 1e6;
    const cpUs = 144 * KAPPA * 2 ** -m * TC * 1e6;
    const longCpUs = cpUs + 16 * KAPPA * TC * 1e6; // 每 0.5 ms 的第一个符号多 16κ·Tc
    return {
      mu: m,
      scsKHz: scs,
      slotsPerSubframe: 2 ** m,
      slotsPerFrame: 10 * 2 ** m,
      slotMs: 1 / 2 ** m,
      symbolsPerSlot: 14,
      extendedCp: m === 2,
      usefulSymbolUs: round(usefulUs, 3),
      cpUs: round(cpUs, 3),
      longCpUs: round(longCpUs, 3),
      rbWidthKHz: 12 * scs,
      fr: m <= 2 ? (m === 2 ? "FR1 / FR2" : "FR1") : "FR2",
      ssb: m === 0 || m === 1 ? "FR1 SSB 可用" : m === 3 || m === 4 ? "FR2 SSB 可用" : "不用于 SSB"
    };
  }

  function maxRb(fr, scsKHz, bwMHz) {
    const t = (NRB[fr] || {})[scsKHz];
    return t && t[bwMHz] ? t[bwMHz] : null;
  }

  // ---------- TDD 帧结构 ----------
  // pattern 如 "DDDSUDDSUU"；special 为特殊时隙 D:G:U 符号数，如 [10, 2, 2]
  function tddRatio(pattern, special) {
    const p = String(pattern || "").toUpperCase();
    if (!/^[DSU]+$/.test(p)) throw new Error("帧结构只能由 D、S、U 组成");
    const [sd, sg, su] = (special || [0, 0, 0]).map(Number);
    if (p.includes("S") && sd + sg + su !== 14) throw new Error("特殊时隙的 D:G:U 加起来必须是 14 个符号");
    let dl = 0, ul = 0;
    for (const c of p) {
      if (c === "D") dl += 1;
      else if (c === "U") ul += 1;
      else { dl += sd / 14; ul += su / 14; }
    }
    return { dl: dl / p.length, ul: ul / p.length };
  }

  // ---------- 峰值速率（TS 38.306 §4.1.2） ----------
  // 速率（Mbps）= 10^-6 × v × Qm × f × Rmax × (N_PRB × 12) / Ts × (1 − OH)，Ts = 10^-3 / (14 × 2^μ)
  const RMAX = 948 / 1024;
  const OVERHEAD = { FR1: { DL: 0.14, UL: 0.08 }, FR2: { DL: 0.18, UL: 0.1 } };
  const QM = { QPSK: 2, "16QAM": 4, "64QAM": 6, "256QAM": 8, "1024QAM": 10 };

  function peakRate({ fr = "FR1", dir = "DL", scsKHz, bwMHz, layers, mod, scaling = 1, ratio = 1 }) {
    const mu = Math.log2(Number(scsKHz) / 15);
    const nprb = maxRb(fr, Number(scsKHz), Number(bwMHz));
    if (nprb === null) throw new Error(`${fr} 下 ${scsKHz} kHz 子载波间隔不支持 ${bwMHz} MHz 带宽`);
    const qm = QM[mod];
    if (!qm) throw new Error("不支持的调制方式");
    const v = Number(layers);
    if (!(v >= 1 && v <= 8)) throw new Error("MIMO 层数取 1–8");
    const ts = 1e-3 / (14 * 2 ** mu);
    const oh = OVERHEAD[fr][dir];
    const full = 1e-6 * v * qm * Number(scaling) * RMAX * (nprb * 12) / ts * (1 - oh);
    return { nprb, mu, overhead: oh, fullMbps: round(full, 1), mbps: round(full * Number(ratio), 1) };
  }

  const api = { RASTER, BANDS, NRB, QM, arfcnToFreq, freqToArfcn, bandsFor, numerology, maxRb, tddRatio, peakRate };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Calc = api;
})(typeof window !== "undefined" ? window : globalThis);
