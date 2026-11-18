// 阶段 3–7 的配图：协议栈、测量事件、服务化架构、寻呼时机、RSRP/SINR 四象限、链路电平图、NTN
import { svg, text, lines, rect, line, path, arrow, circle, box, polyline, tower, phone } from "./svg.mjs";

// 控制面与用户面协议栈
export function protocolStack() {
  const W = 760, H = 330, bw = 92, bh = 26, b = [];
  const column = (x, y, layers, title, hi, below) => {
    const ty = below ? y + layers.length * (bh + 4) + 12 : y - 10;
    b.push(text(x + bw / 2, ty, title, { anchor: "middle", weight: 600, size: 12 }));
    layers.forEach((l, i) => b.push(box(x, y + i * (bh + 4), bw, bh, l, { cls: hi && hi.includes(l) ? "acc-s" : "box", size: 12 })));
  };
  const peer = (x1, x2, y, label) => {
    b.push(line(x1, y, x2, y, "grid", { dash: "4 3" }));
    if (label) b.push(text((x1 + x2) / 2, y - 4, label, { anchor: "middle", cls: "mute", size: 11 }));
  };
  // 控制面
  b.push(text(10, 22, "控制面", { weight: 600 }));
  const cpUE = ["NAS", "RRC", "PDCP", "RLC", "MAC", "PHY"];
  column(20, 56, cpUE, "终端", ["NAS", "RRC"]);
  column(170, 86, ["RRC", "PDCP", "RLC", "MAC", "PHY"], "gNB", ["RRC"], true);
  column(270, 56, ["NAS"], "AMF", ["NAS"]);
  peer(20 + bw, 270, 56 + bh / 2, "NAS（经 N1，gNB 透传）");
  ["RRC", "PDCP", "RLC", "MAC", "PHY"].forEach((l, i) => peer(20 + bw, 170, 86 + i * (bh + 4) + bh / 2));
  // 用户面
  const ox = 400;
  b.push(text(ox, 22, "用户面", { weight: 600 }));
  column(ox + 10, 56, ["IP 数据", "SDAP", "PDCP", "RLC", "MAC", "PHY"], "终端", ["SDAP"]);
  column(ox + 160, 86, ["SDAP", "PDCP", "RLC", "MAC", "PHY"], "gNB", ["SDAP"], true);
  column(ox + 260, 56, ["IP 数据"], "UPF", []);
  peer(ox + 10 + bw, ox + 260, 56 + bh / 2, "IP（经 N3 GTP-U 隧道）");
  ["SDAP", "PDCP", "RLC", "MAC", "PHY"].forEach((l, i) => peer(ox + 10 + bw, ox + 160, 86 + i * (bh + 4) + bh / 2));
  b.push(lines(20, 292, ["虚线表示对等层之间的逻辑通信。SDAP 是 5G 新增的层，负责把 QoS 流映射到 DRB；", "PDCP 以下的层控制面和用户面共用同一套结构，但分别用 SRB 和 DRB 承载。"], { cls: "mute", size: 12 }));
  return svg(W, H, b, "NR 控制面与用户面协议栈");
}

// A3 测量事件：邻区比服务小区好过偏置并持续 TTT 后上报
export function eventA3() {
  const W = 720, H = 295, x0 = 70, x1 = 660, y0 = 40, y1 = 220, b = [];
  b.push(line(x0, y1, x1, y1, "line")); b.push(line(x0, y0, x0, y1, "line"));
  b.push(text(x0 - 8, y0 + 4, "RSRP", { anchor: "end", cls: "mute", size: 12 }));
  b.push(text(x1, y1 - 6, "时间 →", { anchor: "end", cls: "mute", size: 12 }));
  b.push(text(x0 + 10, y0 - 18, "终端从服务小区走向邻区", { cls: "mute", size: 12 }));
  const serv = (t) => 70 + t * 110, neigh = (t) => 200 - t * 120; // t∈[0,1] → y
  const X = (t) => x0 + 10 + t * (x1 - x0 - 20);
  const S = [], N = [], O = [];
  for (let i = 0; i <= 60; i++) { const t = i / 60; S.push([X(t), serv(t)]); N.push([X(t), neigh(t)]); O.push([X(t), serv(t) - 22]); }
  b.push(polyline(S, "line", 2)); b.push(polyline(N, "acc-l", 2.2)); b.push(polyline(O, "line", 1, "4 3"));
  b.push(text(X(0.02), serv(0.02) - 8, "服务小区", { size: 12 }));
  b.push(text(X(0.9), neigh(0.9) - 10, "邻区", { cls: "acc", size: 12 }));
  b.push(text(X(0.05), serv(0.05) - 30, "服务小区 + 偏置 + 迟滞", { cls: "mute", size: 11 }));
  // 交点：neigh = serv - 22 → 200 - 120t = 48 + 110t → t = 152/230
  const tc = 152 / 230, tr = tc + 0.16;
  b.push(line(X(tc), y0, X(tc), y1, "grid", { dash: "3 3" })); b.push(line(X(tr), y0, X(tr), y1, "grid", { dash: "3 3" }));
  b.push(arrow(X(tc), y0 + 10, X(tr), y0 + 10, { both: true, head: "mute", cls: "grid" }));
  b.push(text((X(tc) + X(tr)) / 2, y0 + 4, "TTT", { anchor: "middle", size: 12 }));
  b.push(text(X(tc), y1 + 20, "进入条件满足", { anchor: "middle", size: 11, cls: "mute" }));
  b.push(circle(X(tr), neigh(tr), 5, "acc"));
  b.push(text(X(tr), y1 + 36, "上报测量报告 → 触发切换", { size: 11, cls: "acc", anchor: "middle" }));
  b.push(text(x0 + 10, 280, "偏置、迟滞和 TTT 都调大：切换更晚、乒乓更少，但更容易切换过晚导致掉线；反之亦然。", { cls: "mute", size: 12 }));
  return svg(W, H, b, "A3 事件：邻区信号比服务小区好过偏置并持续 TTT 后上报");
}

// 5GC 服务化架构
export function sba() {
  const W = 760, H = 320, b = [];
  const busY = 120;
  b.push(line(40, busY, 720, busY, "acc-l", { width: 3 }));
  b.push(text(720, busY + 18, "服务化总线（HTTP/2）", { anchor: "end", cls: "acc", size: 12 }));
  const top = [["NSSF", "切片选择"], ["NEF", "能力开放"], ["NRF", "注册与发现"], ["PCF", "策略"], ["UDM", "签约数据"], ["AF", "应用"]];
  top.forEach(([n, d], i) => {
    const x = 60 + i * 110;
    b.push(box(x, 40, 90, 44, n, { cls: "box", sub: d }));
    b.push(line(x + 45, 84, x + 45, busY, "line"));
    b.push(text(x + 50, 104, `N${n.toLowerCase()}`, { cls: "mute", size: 10 }));
  });
  const bottom = [["AUSF", "鉴权", 60], ["AMF", "接入与移动性", 280], ["SMF", "会话管理", 500]];
  bottom.forEach(([n, d, x]) => {
    b.push(box(x, 150, 100, 44, n, { cls: "acc-s", sub: d }));
    b.push(line(x + 50, busY, x + 50, 150, "line"));
    b.push(text(x + 55, 140, `N${n.toLowerCase()}`, { cls: "mute", size: 10 }));
  });
  // 用户面与参考点
  const y = 250;
  b.push(phone(70, y + 20));
  b.push(box(180, y, 100, 40, "(R)AN", { cls: "box", sub: "基站" }));
  b.push(box(500, y, 100, 40, "UPF", { cls: "ok-s", sub: "用户面" }));
  b.push(box(650, y, 70, 40, "DN", { cls: "box", sub: "数据网络" }));
  b.push(line(82, y + 20, 180, y + 20, "line")); b.push(text(130, y + 14, "空口", { anchor: "middle", cls: "mute", size: 11 }));
  b.push(line(280, y + 20, 500, y + 20, "ok-l", { width: 2 })); b.push(text(390, y + 14, "N3（用户数据）", { anchor: "middle", cls: "mute", size: 11 }));
  b.push(line(600, y + 20, 650, y + 20, "ok-l", { width: 2 })); b.push(text(625, y + 14, "N6", { anchor: "middle", cls: "mute", size: 11 }));
  b.push(line(230, y, 320, 194, "line", { dash: "4 3" })); b.push(text(262, 225, "N2", { cls: "mute", size: 11 }));
  b.push(line(70, y + 6, 300, 194, "line", { dash: "4 3" })); b.push(text(165, 222, "N1（NAS）", { cls: "mute", size: 11 }));
  b.push(line(550, y, 550, 194, "line", { dash: "4 3" })); b.push(text(556, 225, "N4（PFCP）", { cls: "mute", size: 11 }));
  return svg(W, H, b, "5G 核心网服务化架构：控制面网元通过服务化接口互通，UPF 负责用户面");
}

// 寻呼时机：终端按 DRX 周期醒来
export function pagingDrx() {
  const W = 720, H = 210, x0 = 40, x1 = 690, b = [];
  const cyc = 260; // 一个 DRX 周期的像素宽度
  b.push(text(x0, 24, "终端状态", { cls: "mute", size: 12 }));
  const wave = [];
  let x = x0;
  wave.push([x, 80]);
  for (let k = 0; k < 3 && x0 + 60 + k * cyc < x1; k++) {
    const po = x0 + 60 + k * cyc;
    wave.push([po, 80], [po, 45], [po + 22, 45], [po + 22, 80]);
  }
  wave.push([x1, 80]);
  b.push(polyline(wave, "acc-l", 2));
  b.push(text(x1, 96, "睡眠（省电）", { anchor: "end", cls: "mute", size: 11 }));
  b.push(text(x0 + 60 + 30, 52, "醒来监听", { cls: "acc", size: 11 }));
  // 无线帧时间轴
  const fy = 130;
  for (let xx = x0; xx < x1; xx += 13) b.push(rect(xx, fy, 13, 18, "grid", 0));
  for (let k = 0; k < 3 && x0 + 60 + k * cyc < x1; k++) {
    const po = x0 + 60 + k * cyc;
    b.push(rect(po - 4, fy, 26, 18, "acc", 0));
    b.push(text(po + 9, fy + 34, "PF / PO", { anchor: "middle", size: 11 }));
  }
  b.push(text(x0, fy - 8, "无线帧（每格 10 ms）", { cls: "mute", size: 11 }));
  b.push(arrow(x0 + 60, 112, x0 + 60 + cyc, 112, { both: true, head: "mute", cls: "grid" }));
  b.push(text(x0 + 60 + cyc / 2, 108, "DRX 周期（如 128 帧 = 1.28 s）", { anchor: "middle", size: 12 }));
  b.push(text(x0, 200, "网络和终端用同一公式（终端标识 + DRX 周期）算出寻呼帧 PF 和寻呼时机 PO，寻呼只在这些时刻发送。", { cls: "mute", size: 12 }));
  return svg(W, H, b, "空闲态终端按 DRX 周期在寻呼时机醒来监听");
}

// RSRP × SINR 四象限
export function rsrpSinrQuadrant() {
  const W = 720, H = 340, x0 = 110, y0 = 30, w = 520, h = 250, b = [];
  const mx = x0 + w / 2, my = y0 + h / 2;
  const q = (x, y, cls, title, sub) => {
    b.push(rect(x, y, w / 2 - 4, h / 2 - 4, cls, 6));
    b.push(text(x + (w / 2 - 4) / 2, y + 44, title, { anchor: "middle", weight: 600 }));
    b.push(lines(x + (w / 2 - 4) / 2, y + 68, sub, { anchor: "middle", cls: "mute", size: 12 }));
  };
  q(mx + 4, y0, "ok-s", "正常", ["信号强、质量好", "高阶调制、多流传输"]);
  q(x0, y0, "box", "覆盖边缘但干净", ["干扰小、信号偏弱", "主要靠功率、天线、加站"]);
  q(mx + 4, my + 4, "warn-s", "干扰 / 重叠覆盖", ["“满格但很慢”", "控制强信号数量、查外部干扰"]);
  q(x0, my + 4, "acc-s", "弱覆盖", ["信号弱、质量也差", "加站、加室分、调天线"]);
  b.push(arrow(x0, y0 + h + 12, x0 + w, y0 + h + 12, { head: "mute", cls: "grid" }));
  b.push(text(x0 + w / 2, y0 + h + 32, "SS-RSRP（信号强度）→ 强", { anchor: "middle", size: 12 }));
  b.push(arrow(x0 - 14, y0 + h, x0 - 14, y0, { head: "mute", cls: "grid" }));
  b.push(lines(x0 - 22, my - 10, ["SS-SINR", "（信号质量）", "↑ 好"], { anchor: "end", size: 12 }));
  b.push(text(mx, y0 + h + 50, "分界线取本单位的门限，如 RSRP −100 dBm、SINR 5 dB", { anchor: "middle", cls: "mute", size: 12 }));
  return svg(W, H + 20, b, "RSRP 与 SINR 四象限：判断是覆盖问题还是干扰问题");
}

// 链路电平图：从发射功率到接收灵敏度，中间能承受的就是最大允许路损
export function linkBudget() {
  const W = 720, H = 310, sens = 250, b = [];
  const pts = [[60, 70], [170, 70], [170, 50], [270, 50], [270, 210], [370, 210], [370, sens], [470, sens]];
  b.push(polyline(pts, "acc-l", 2.4));
  b.push(line(40, sens, 680, sens, "warn-l", { dash: "6 4", width: 1.5 }));
  b.push(text(40, sens + 22, "接收灵敏度 = 热噪声 + 噪声系数 + 解调所需 SINR", { size: 12 }));
  const tag = (x, y, s, sub, anchor = "middle") => {
    b.push(text(x, y, s, { anchor, size: 12, weight: 600 }));
    if (sub) b.push(text(x, y + 15, sub, { anchor, cls: "mute", size: 11 }));
  };
  tag(115, 38, "发射功率", "基站几十瓦 / 终端 0.2 W");
  tag(220, 18, "+ 天线增益", "波束赋形增益");
  b.push(arrow(290, 52, 290, 208, { both: true, head: "acc", cls: "acc-l" }));
  tag(300, 120, "− 路径损耗：最多能承受多少", "= 最大允许路损（MAPL）→ 换算成覆盖距离", "start");
  tag(480, 228, "− 余量与损耗", "穿透、阴影衰落、干扰", "start");
  b.push(text(40, 296, "上下行分别画一次：上行的起点（终端功率）比下行低 20 dB 以上，通常先碰到灵敏度线——这就是上行受限。", { cls: "mute", size: 12 }));
  return svg(W, H, b, "链路电平图：发射功率加增益减损耗后不能低于接收灵敏度");
}

// NTN 透明转发
export function ntn() {
  const W = 720, H = 270, b = [];
  b.push(path("M 0 250 Q 360 180 720 250", "grid", { width: 2 }));
  // 卫星
  const sx = 360, sy = 50;
  b.push(rect(sx - 14, sy - 10, 28, 20, "acc-s", 3));
  b.push(rect(sx - 54, sy - 6, 36, 12, "box", 1)); b.push(rect(sx + 18, sy - 6, 36, 12, "box", 1));
  b.push(text(sx, sy - 18, "卫星（透明转发：只做射频中继）", { anchor: "middle", size: 12 }));
  b.push(phone(150, 200));
  b.push(text(150, 236, "终端", { anchor: "middle", size: 12 }));
  b.push(tower(560, 172));
  b.push(text(560, 230, "关口站", { anchor: "middle", size: 12 }));
  b.push(box(610, 120, 90, 34, "gNB + 5GC", { cls: "acc-s", size: 12 }));
  b.push(line(570, 175, 610, 145, "line"));
  b.push(arrow(158, 185, sx - 10, sy + 14, { cls: "acc-l", head: "acc", both: true }));
  b.push(text(205, 115, "服务链路", { cls: "acc", size: 12 }));
  b.push(arrow(sx + 10, sy + 14, 556, 160, { cls: "acc-l", head: "acc", both: true }));
  b.push(text(470, 100, "馈电链路", { cls: "acc", size: 12 }));
  b.push(lines(20, 30, ["难点：", "· 时延大：静止轨道往返五百多毫秒", "· 多普勒大：低轨卫星约 7.5 km/s", "· 终端用 GNSS 定位 + 星历预补偿"], { size: 12, cls: "mute" }));
  return svg(W, H, b, "NTN 透明转发架构：终端经卫星中继接入地面基站");
}
