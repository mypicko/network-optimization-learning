// 生成讲解配图用的极简 SVG 工具。颜色全部用 class（见 assets/style.css 的 .figure svg 部分），自动适配深色模式
export const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const r1 = (n) => Math.round(n * 10) / 10;

export function svg(w, h, body, label) {
  return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}" xmlns="http://www.w3.org/2000/svg" font-size="13">${body.join("")}</svg>`;
}

// 文字：anchor = start | middle | end
export function text(x, y, s, { cls = "ink", anchor = "start", size, weight } = {}) {
  const extra = `${size ? ` font-size="${size}"` : ""}${weight ? ` font-weight="${weight}"` : ""}`;
  return `<text x="${r1(x)}" y="${r1(y)}" class="${cls}" text-anchor="${anchor}"${extra}>${esc(s)}</text>`;
}

// 多行文字（数组，每行一个字符串）
export function lines(x, y, arr, opts = {}) {
  const lh = opts.lh || 17;
  return arr.map((s, i) => text(x, y + i * lh, s, opts)).join("");
}

export function rect(x, y, w, h, cls = "box", rx = 4) {
  return `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" rx="${rx}" class="${cls}"/>`;
}

export function line(x1, y1, x2, y2, cls = "line", { width = 1.2, dash } = {}) {
  return `<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}" class="${cls}" stroke-width="${width}"${dash ? ` stroke-dasharray="${dash}"` : ""}/>`;
}

export function path(d, cls = "line", { width = 1.5, dash } = {}) {
  return `<path d="${d}" class="${cls}" stroke-width="${width}"${dash ? ` stroke-dasharray="${dash}"` : ""}/>`;
}

export function poly(points, cls = "ink") {
  return `<polygon points="${points.map(([x, y]) => `${r1(x)},${r1(y)}`).join(" ")}" class="${cls}"/>`;
}

// 带箭头的线段（不用 marker，避免多张图 id 冲突）；both = 双向
export function arrow(x1, y1, x2, y2, { cls = "line", head = "ink", width = 1.3, dash, both = false, size = 7 } = {}) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const tip = (x, y, ang) => poly([
    [x, y],
    [x - size * Math.cos(ang - 0.4), y - size * Math.sin(ang - 0.4)],
    [x - size * Math.cos(ang + 0.4), y - size * Math.sin(ang + 0.4)]
  ], head);
  return line(x1, y1, x2, y2, cls, { width, dash }) + tip(x2, y2, a) + (both ? tip(x1, y1, a + Math.PI) : "");
}

export function circle(cx, cy, r, cls = "box") {
  return `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(r)}" class="${cls}"/>`;
}

export function ellipse(cx, cy, rx, ry, rot, cls = "acc-s") {
  return `<ellipse cx="${r1(cx)}" cy="${r1(cy)}" rx="${r1(rx)}" ry="${r1(ry)}" transform="rotate(${r1(rot)} ${r1(cx)} ${r1(cy)})" class="${cls}" fill-opacity="0.55"/>`;
}

// 带文字的方框
export function box(x, y, w, h, label, { cls = "box", tcls = "ink", size, sub } = {}) {
  const cy = sub ? y + h / 2 - 3 : y + h / 2 + 4.5;
  return rect(x, y, w, h, cls) + text(x + w / 2, cy, label, { cls: tcls, anchor: "middle", size }) +
    (sub ? text(x + w / 2, cy + 16, sub, { cls: "mute", anchor: "middle", size: 11 }) : "");
}

// 折线 / 曲线：points = [[x,y],...]
export function polyline(points, cls = "line", width = 1.6, dash) {
  const d = points.map(([x, y], i) => `${i ? "L" : "M"}${r1(x)} ${r1(y)}`).join(" ");
  return path(d, cls, { width, dash });
}

// 简易天线 / 基站 / 手机图标
export function tower(x, y, cls = "line") {
  return line(x, y, x - 10, y + 34, cls, { width: 1.5 }) + line(x, y, x + 10, y + 34, cls, { width: 1.5 }) +
    line(x - 6, y + 20, x + 6, y + 20, cls) + rect(x - 4, y - 14, 8, 16, "acc-s", 2);
}
export function phone(x, y, cls = "acc-s") {
  return rect(x - 8, y - 14, 16, 28, cls, 3) + line(x - 3, y + 10, x + 3, y + 10, "line");
}
