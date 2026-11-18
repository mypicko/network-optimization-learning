// 阶段 0–2 的配图：OFDM、MIMO、三大场景、帧结构、资源网格、SSB、波束扫描
import { svg, text, lines, rect, line, path, arrow, circle, ellipse, box, polyline, tower, phone } from "./svg.mjs";

// 子载波频谱：每条 sinc 曲线在其他子载波中心频点处过零
export function ofdmSpectrum() {
  const W = 760, H = 270, base = 200, amp = 140, df = 80, c0 = 330;
  const b = [];
  b.push(line(60, base, 680, base, "grid", { width: 1 }));
  for (let k = -2; k <= 2; k++) {
    const fc = c0 + k * df;
    const pts = [];
    for (let x = 70; x <= 650; x += 2) {
      const u = (x - fc) / df;
      const v = Math.abs(u) < 1e-9 ? 1 : Math.sin(Math.PI * u) / (Math.PI * u);
      pts.push([x, base - v * amp]);
    }
    b.push(polyline(pts, k === 0 ? "acc-l" : "line", k === 0 ? 2.4 : 1.1));
    b.push(line(fc, base + 4, fc, base - amp - 6, "grid", { dash: "3 3" }));
    b.push(text(fc, base + 20, `f${k + 3}`, { cls: "mute", anchor: "middle" }));
  }
  b.push(arrow(c0, base + 34, c0 + df, base + 34, { both: true, head: "mute", cls: "grid" }));
  b.push(text(c0 + df / 2, base + 52, "子载波间隔 Δf", { cls: "mute", anchor: "middle" }));
  b.push(circle(c0 + df, base, 4, "acc"));
  b.push(arrow(c0 + df + 118, 44, c0 + df + 4, base - 6, { head: "acc", cls: "acc-l", dash: "3 3" }));
  b.push(lines(c0 + df + 124, 22, ["高亮的子载波在 f4 处正好为零，", "不干扰 f4 上的数据——这就是“正交”"], { size: 12 }));
  b.push(text(70, 30, "幅度", { cls: "mute" }));
  b.push(text(675, base - 8, "频率", { cls: "mute", anchor: "end" }));
  return svg(W, H, b, "OFDM 子载波频谱：每个子载波在其他子载波中心频点处幅度为零");
}

// 循环前缀：把符号尾部复制到前面；延迟路径落在 CP 内不会串到下一个符号
export function cyclicPrefix() {
  const W = 720, H = 250, y1 = 60, h = 40;
  const b = [];
  const sym = (x, y, cls, label) => {
    const cp = 50, body = 230;
    return rect(x, y, cp, h, "warn-s", 3) + text(x + cp / 2, y + 25, "CP", { anchor: "middle" }) +
      rect(x + cp, y, body, h, cls, 3) + rect(x + cp + body - cp, y, cp, h, "warn-s", 3) +
      text(x + cp + (body - cp) / 2, y + 25, label, { anchor: "middle" });
  };
  b.push(text(30, y1 + 25, "直达路径", { cls: "mute" }));
  b.push(sym(110, y1, "acc-s", "符号 1"));
  b.push(sym(390, y1, "box", "符号 2"));
  b.push(path(`M ${110 + 255} ${y1 - 4} C ${110 + 255} ${y1 - 34}, ${135} ${y1 - 34}, ${135} ${y1 - 4}`, "line", { width: 1.2, dash: "4 3" }));
  b.push(text(250, y1 - 30, "把尾部复制一份放到前面", { cls: "mute", anchor: "middle", size: 12 }));
  const y2 = 130, d = 30;
  b.push(text(30, y2 + 25, "延迟路径", { cls: "mute" }));
  b.push(sym(110 + d, y2, "acc-s", "符号 1"));
  b.push(sym(390 + d, y2, "box", "符号 2"));
  // FFT 窗
  b.push(rect(160, y1 - 8, 230, y2 + h + 8 - (y1 - 8), "grid", 4));
  b.push(text(275, y2 + h + 26, "接收端只取框内这段做 FFT（去掉 CP）", { anchor: "middle", size: 12 }));
  b.push(text(360, y2 + h + 50, "延迟 τ 小于 CP 时，框内只有符号 1 的内容，没有混入符号 2", { anchor: "middle", size: 12, cls: "mute" }));
  return svg(W, H, b, "循环前缀示意：延迟小于 CP 的多径不会造成符号间干扰");
}

// 多天线的三种用法
export function mimoUses() {
  const W = 720, H = 230, b = [];
  const panel = (x0, title, sub, draw) => {
    b.push(rect(x0, 10, 225, 210, "grid", 8));
    b.push(text(x0 + 112, 34, title, { anchor: "middle", weight: 600 }));
    b.push(draw(x0));
    b.push(text(x0 + 112, 205, sub, { anchor: "middle", cls: "mute", size: 12 }));
  };
  panel(5, "发射分集", "同一份数据多路发 → 更可靠", (x) =>
    tower(x + 40, 80) + tower(x + 40, 130) + phone(x + 185, 125) +
    arrow(x + 50, 80, x + 172, 118, { cls: "acc-l", head: "acc" }) + arrow(x + 50, 130, x + 172, 128, { cls: "acc-l", head: "acc" }) +
    text(x + 105, 88, "s", { cls: "acc" }) + text(x + 105, 145, "s", { cls: "acc" }));
  panel(247, "空间复用", "不同数据并行发 → 速率成倍提升", (x) =>
    tower(x + 40, 80) + tower(x + 40, 130) + phone(x + 180, 105) + phone(x + 200, 140) +
    arrow(x + 50, 80, x + 168, 102, { cls: "acc-l", head: "acc" }) + arrow(x + 50, 130, x + 188, 138, { cls: "ok-l", head: "ink" }) +
    text(x + 100, 82, "s1", { cls: "acc" }) + text(x + 100, 148, "s2"));
  panel(490, "波束赋形", "能量集中到用户方向 → 覆盖更远", (x) =>
    tower(x + 35, 100) + ellipse(x + 115, 112, 78, 18, 8, "acc-s") + phone(x + 190, 125) +
    text(x + 112, 160, "多根天线调相位，信号同向叠加", { anchor: "middle", size: 11, cls: "mute" }));
  return svg(W, H, b, "多天线的三种用法：发射分集、空间复用、波束赋形");
}

// 三大场景三角
export function scenarios() {
  const W = 720, H = 300, b = [];
  const A = [360, 40], B = [150, 250], C = [570, 250];
  b.push(path(`M${A[0]} ${A[1]} L${B[0]} ${B[1]} L${C[0]} ${C[1]} Z`, "grid", { width: 1.5 }));
  b.push(circle(A[0], A[1], 9, "acc")); b.push(circle(B[0], B[1], 9, "acc")); b.push(circle(C[0], C[1], 9, "acc"));
  b.push(text(A[0] + 18, A[1] + 5, "eMBB 增强移动宽带", { weight: 600 }));
  b.push(lines(A[0] + 18, A[1] + 24, ["大带宽、高速率", "高清视频、云游戏、XR、FWA"], { cls: "mute", size: 12 }));
  b.push(text(B[0] - 10, B[1] + 28, "mMTC 海量机器类通信", { weight: 600, anchor: "start" }));
  b.push(text(B[0] - 10, B[1] + 46, "海量连接、低功耗：表计、传感器", { cls: "mute", size: 12 }));
  b.push(text(C[0] + 10, C[1] + 28, "URLLC 超可靠低时延", { weight: 600, anchor: "end" }));
  b.push(text(C[0] + 10, C[1] + 46, "毫秒级时延、高可靠：工业控制、远程操控", { cls: "mute", size: 12, anchor: "end" }));
  b.push(text(360, 185, "一张物理网络，", { anchor: "middle", cls: "mute", size: 12 }));
  b.push(text(360, 203, "靠切片、参数集、边缘计算分别满足", { anchor: "middle", cls: "mute", size: 12 }));
  return svg(W, H + 20, b, "5G 三大场景：eMBB、URLLC、mMTC");
}

// 帧结构：10 ms 帧 → 1 ms 子帧 → 不同参数集的时隙 → 14 个符号
export function frameStructure() {
  const W = 800, H = 340, x0 = 130, span = 600, b = [];
  b.push(text(10, 42, "无线帧 10 ms", { weight: 600 }));
  for (let i = 0; i < 10; i++) b.push(box(x0 + i * 60, 22, 60, 30, `#${i}`, { cls: i === 0 ? "acc-s" : "box", size: 12 }));
  b.push(text(x0 + span / 2, 14, "10 个子帧，每个 1 ms", { cls: "mute", anchor: "middle", size: 12 }));
  b.push(line(x0, 52, x0, 78, "grid", { dash: "3 3" })); b.push(line(x0 + 60, 52, x0 + span, 78, "grid", { dash: "3 3" }));
  const rows = [[0, 15, 1, "1 ms"], [1, 30, 2, "0.5 ms"], [2, 60, 4, "0.25 ms"], [3, 120, 8, "0.125 ms"]];
  rows.forEach(([mu, scs, n, dur], r) => {
    const y = 84 + r * 40;
    b.push(text(10, y + 20, `μ=${mu}  ${scs} kHz`, { size: 12 }));
    for (let i = 0; i < n; i++) b.push(box(x0 + i * (span / n), y, span / n, 28, n <= 4 ? `时隙 ${i}` : `${i}`, { cls: r === 1 && i === 0 ? "acc-s" : "box", size: 11 }));
    b.push(text(x0 + span + 6, y + 19, dur, { cls: "mute", size: 11 }));
  });
  b.push(text(10, 260, "1 个时隙", { weight: 600 }));
  b.push(line(x0, 112, x0, 238, "grid", { dash: "3 3" })); b.push(line(x0 + 300, 112, x0 + span, 238, "grid", { dash: "3 3" }));
  for (let i = 0; i < 14; i++) b.push(box(x0 + i * (span / 14), 242, span / 14, 28, `${i}`, { cls: "box", size: 11 }));
  b.push(text(x0 + span / 2, 292, "正常 CP 下每个时隙固定 14 个 OFDM 符号；子载波间隔翻倍，符号和时隙长度减半", { cls: "mute", anchor: "middle", size: 12 }));
  b.push(text(x0 + span / 2, 312, "所以一个子帧里的时隙数 = 2^μ", { cls: "mute", anchor: "middle", size: 12 }));
  return svg(W, H, b, "NR 帧结构：无线帧、子帧、时隙与符号，以及不同参数集下的时隙长度");
}

// 资源网格：RE 与 RB
export function resourceGrid() {
  const W = 790, H = 300, x0 = 160, y0 = 30, cw = 26, ch = 18, b = [];
  for (let r = 0; r < 12; r++) for (let c = 0; c < 14; c++) {
    const hl = r === 5 && c === 6;
    b.push(rect(x0 + c * cw, y0 + r * ch, cw, ch, hl ? "acc" : (r + c) % 2 ? "box" : "grid", 0));
  }
  b.push(rect(x0, y0, 14 * cw, 12 * ch, "line", 0));
  b.push(arrow(x0 - 18, y0 + 12 * ch, x0 - 18, y0, { both: true, head: "mute", cls: "grid" }));
  b.push(lines(x0 - 28, y0 + 90, ["1 个 RB", "= 12 个子载波", "（30 kHz 时 360 kHz）"], { anchor: "end", size: 12 }));
  b.push(arrow(x0, y0 + 12 * ch + 16, x0 + 14 * cw, y0 + 12 * ch + 16, { both: true, head: "mute", cls: "grid" }));
  b.push(text(x0 + 7 * cw, y0 + 12 * ch + 36, "1 个时隙 = 14 个 OFDM 符号", { anchor: "middle", size: 12 }));
  b.push(arrow(x0 + 6 * cw + cw + 80, y0 + 5 * ch - 10, x0 + 7 * cw + 2, y0 + 5 * ch + 8, { head: "acc", cls: "acc-l" }));
  b.push(lines(x0 + 14 * cw + 16, y0 + 70, ["高亮的一格是 1 个 RE（资源粒子）：", "1 个子载波 × 1 个符号，", "放一个调制符号", "（如 256QAM 一个符号 8 比特）"], { size: 12 }));
  b.push(text(x0 + 14 * cw + 16, y0 + 160, "调度的基本单位是 RB，", { size: 12, cls: "mute" }));
  b.push(text(x0 + 14 * cw + 16, y0 + 177, "100 MHz（30 kHz）最多 273 个 RB", { size: 12, cls: "mute" }));
  b.push(text(x0 - 4, y0 - 10, "频率 ↑", { cls: "mute", anchor: "end", size: 12 }));
  b.push(text(x0 + 14 * cw, y0 - 10, "时间 →", { cls: "mute", anchor: "end", size: 12 }));
  return svg(W, H, b, "资源网格：一个 RB 为 12 个子载波，一个时隙为 14 个符号，一格为一个 RE");
}

// SSB 结构：4 个符号 × 240 个子载波
export function ssbStructure() {
  const W = 720, H = 320, x0 = 150, y0 = 20, cw = 80, sc = 1.1, b = [];
  const y = (k) => y0 + (239 - k) * sc; // 频率向上
  const block = (sym, k0, k1, cls, label) => {
    b.push(rect(x0 + sym * cw, y(k1), cw, (k1 - k0 + 1) * sc, cls, 0));
    if (label) b.push(text(x0 + sym * cw + cw / 2, (y(k1) + y(k0) + sc) / 2 + 4, label, { anchor: "middle", size: 12 }));
  };
  block(0, 56, 182, "warn-s", "PSS");
  block(1, 0, 239, "acc-s", "PBCH");
  block(2, 56, 182, "ok-s", "SSS");
  block(2, 0, 47, "acc-s", "PBCH");
  block(2, 192, 239, "acc-s", "PBCH");
  block(3, 0, 239, "acc-s", "PBCH");
  b.push(rect(x0, y0, 4 * cw, 240 * sc, "line", 0));
  for (let s = 0; s < 4; s++) b.push(text(x0 + s * cw + cw / 2, y0 + 240 * sc + 18, `符号 ${s}`, { anchor: "middle", cls: "mute", size: 12 }));
  [[0, "0"], [56, "56"], [182, "182"], [239, "239"]].forEach(([k, l]) => b.push(text(x0 - 6, y(k) + 4, l, { anchor: "end", cls: "mute", size: 11 })));
  b.push(text(x0 - 40, y0 + 120, "子载波", { anchor: "end", cls: "mute", size: 12 }));
  const lx = x0 + 4 * cw + 30;
  b.push(lines(lx, y0 + 20, [
    "PSS / SSS：各 127 个子载波，位于中间",
    "· 终端靠它们完成时间、频率同步",
    "· 联合起来确定 PCI（1008 个之一）",
    "",
    "PBCH：携带 MIB（含系统帧号、",
    "SIB1 的调度位置等）",
    "",
    "整个 SSB：4 个符号 × 240 个子载波",
    "（20 个 RB）",
    "空白处不发送信号"
  ], { size: 12 }));
  return svg(W, H, b, "SSB 结构：PSS、SSS、PBCH 在 4 个符号和 240 个子载波中的位置");
}

// SSB 波束扫描
export function ssbBeamSweep() {
  const W = 720, H = 300, bx = 60, by = 240, b = [];
  for (let i = 0; i < 8; i++) {
    const ang = -78 + i * 10; // 相对水平向右，向上为负
    const rad = (ang * Math.PI) / 180;
    const L = 100;
    const cx = bx + Math.cos(rad) * L, cy = by + Math.sin(rad) * L;
    b.push(ellipse(cx, cy, L, 9, ang, i === 5 ? "acc-s" : "box"));
    b.push(text(bx + Math.cos(rad) * (L * 2 + 14), by + Math.sin(rad) * (L * 2 + 14) + 4, `#${i}`, { anchor: "middle", size: 12, cls: i === 5 ? "acc" : "mute" }));
  }
  b.push(tower(bx, by - 14));
  const ua = ((-78 + 50) * Math.PI) / 180;
  const ux = bx + Math.cos(ua) * 175, uy = by + Math.sin(ua) * 175;
  b.push(phone(ux, uy + 4));
  const tx = 400, ty = 70;
  b.push(text(tx, ty - 20, "一个 SSB 突发集（5 ms 半帧内）", { weight: 600, size: 13 }));
  for (let i = 0; i < 8; i++) b.push(box(tx + i * 36, ty, 32, 26, `#${i}`, { cls: i === 5 ? "acc-s" : "box", size: 11 }));
  b.push(lines(tx, ty + 60, [
    "基站在不同时刻把 SSB 依次朝不同方向发送；",
    "终端测量后选出最强的那个（图中 #5），",
    "并在对应的随机接入时机发起接入，",
    "基站由此知道该用哪个波束服务它。",
    "",
    "FR1 最多 8 个波束，FR2 最多 64 个；",
    "默认每 20 ms 重复一次。"
  ], { size: 12, cls: "mute" }));
  return svg(W, H, b, "SSB 波束扫描：基站轮流向 8 个方向发送 SSB，终端选择最强波束");
}
