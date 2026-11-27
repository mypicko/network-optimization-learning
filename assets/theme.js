// 深色模式开关：跟随系统 → 浅色 → 深色，选择存在本浏览器（pathway-theme-v1）
// 在 <head> 里同步加载，先于页面绘制设置 data-theme，避免闪一下浅色
(function () {
  const KEY = "pathway-theme-v1";
  const MODES = [
    { id: "auto", label: "跟随系统", icon: "◐" },
    { id: "light", label: "浅色", icon: "☀" },
    { id: "dark", label: "深色", icon: "☾" }
  ];
  const root = document.documentElement;
  const read = () => { try { const v = localStorage.getItem(KEY); return MODES.some((m) => m.id === v) ? v : "auto"; } catch (e) { return "auto"; } };
  const apply = (mode) => { if (mode === "auto") root.removeAttribute("data-theme"); else root.setAttribute("data-theme", mode); };
  const systemDark = () => !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const isDark = () => { const m = read(); return m === "dark" || (m === "auto" && systemDark()); };
  apply(read());

  function button() {
    const header = document.querySelector(".site-header .wrap");
    if (!header || header.querySelector(".theme-toggle")) return;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "theme-toggle";
    const sync = () => {
      const m = MODES.find((x) => x.id === read());
      b.textContent = m.icon;
      b.title = `外观：${m.label}（点击切换）`;
      b.setAttribute("aria-label", b.title);
    };
    b.addEventListener("click", () => {
      const i = MODES.findIndex((x) => x.id === read());
      const next = MODES[(i + 1) % MODES.length].id;
      try { localStorage.setItem(KEY, next); } catch (e) { /* 存储不可用时只在本页生效 */ }
      apply(next);
      sync();
      window.dispatchEvent(new CustomEvent("theme-change", { detail: { dark: isDark() } }));
    });
    sync();
    header.appendChild(b);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", button); else button();
  // 其他标签页改了外观，这里同步
  window.addEventListener("storage", (e) => { if (e.key === KEY) apply(read()); });

  window.Theme = { isDark, read, MODES };
})();
