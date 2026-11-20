// 工具箱页面：NR-ARFCN 换算、参数集、峰值速率三个计算器
(function () {
  const C = window.Calc;
  const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const fmt = (x) => Number(x).toLocaleString("zh-CN", { maximumFractionDigits: 3 });
  const err = (e) => `<p class="calc-err">${esc(e.message)}</p>`;

  const TDD_PRESETS = [
    { id: "fdd", label: "FDD（上下行同时传，不打折）", pattern: "", special: null },
    { id: "cu", label: "DDDSUDDSUU，S = 10:2:2（2.5 ms 双周期，国内 3.5 GHz 常见）", pattern: "DDDSUDDSUU", special: [10, 2, 2] },
    { id: "cm", label: "DDDDDDDSUU，S = 6:4:4（5 ms 单周期，国内 2.6 GHz 常见）", pattern: "DDDDDDDSUU", special: [6, 4, 4] },
    { id: "custom", label: "自定义", pattern: "DDDSU", special: [10, 2, 2] }
  ];

  // ---------- NR-ARFCN ----------
  function arfcnCard() {
    const rows = C.BANDS.map((b) => `<tr><td><strong>${b.band}</strong></td><td>${b.mode}</td>
      <td>${b.dl[0]}–${b.dl[1]}${b.ul ? `<br><span class="meta">上行 ${b.ul[0]}–${b.ul[1]}</span>` : ""}</td>
      <td>${b.n[0]}–${b.n[1]}</td><td>${Object.entries(b.steps).map(([k, s]) => `${k} kHz：每 ${s} 个`).join("<br>")}</td>
      <td>${esc(b.cn)}</td></tr>`).join("");
    return `<section class="calc-card" id="arfcn">
      <h2>NR-ARFCN 与频率换算</h2>
      <p class="meta">规范：TS 38.104 §5.4.2。F<sub>REF</sub> = F<sub>REF-Offs</sub> + ΔF<sub>Global</sub> × (N<sub>REF</sub> − N<sub>REF-Offs</sub>)</p>
      <div class="calc-row">
        <label>NR-ARFCN <input type="number" id="ar-n" value="633334" min="0" max="3279165" step="1"></label>
        <label>或频率（MHz） <input type="number" id="ar-f" value="" step="0.005" placeholder="如 3500"></label>
      </div>
      <div class="calc-out" id="ar-out"></div>
      <details class="calc-ref"><summary>常用频段速查</summary>
        <div class="table-wrap"><table><thead><tr><th>频段</th><th>双工</th><th>下行 / TDD（MHz）</th><th>N<sub>REF</sub> 范围</th><th>信道栅格</th><th>国内使用</th></tr></thead><tbody>${rows}</tbody></table></div>
        <p class="meta">全球栅格：0–3 GHz 步长 5 kHz；3–24.25 GHz 步长 15 kHz（N 从 600000 起）；24.25 GHz 以上步长 60 kHz（N 从 2016667 起）。频段内还要求 N 落在“信道栅格”上，才是合法的载波位置。</p>
      </details>
    </section>`;
  }

  function arfcnResult(n) {
    const f = C.arfcnToFreq(n);
    const bands = C.bandsFor(n);
    const list = bands.length
      ? `<ul>${bands.map((b) => `<li><strong>${b.band}</strong>（${b.mode}，${esc(b.cn)}）：
          ${b.mode === "FDD" ? `下行 ${fmt(b.dlFreq)} MHz，对应上行 ${fmt(b.ulFreq)} MHz；` : ""}
          ${b.onRaster.length ? `落在 ${b.onRaster.join(" / ")} kHz 信道栅格上 ✅` : "不在该频段的信道栅格上 ⚠️（不是合法载波位置）"}</li>`).join("")}</ul>`
      : `<p class="meta">不在本页收录的常用频段内。</p>`;
    return `<p class="calc-big">N<sub>REF</sub> = ${n} → <strong>${fmt(f)} MHz</strong></p>${list}`;
  }

  function bindArfcn(root) {
    const n = root.querySelector("#ar-n"), f = root.querySelector("#ar-f"), out = root.querySelector("#ar-out");
    const fromN = () => { try { out.innerHTML = arfcnResult(Number(n.value)); } catch (e) { out.innerHTML = err(e); } };
    n.addEventListener("input", () => { f.value = ""; fromN(); });
    f.addEventListener("input", () => {
      if (f.value === "") return;
      try { n.value = C.freqToArfcn(Number(f.value)); out.innerHTML = arfcnResult(Number(n.value)); } catch (e) { out.innerHTML = err(e); }
    });
    fromN();
  }

  // ---------- 参数集 ----------
  function numerologyCard() {
    const rows = [0, 1, 2, 3, 4].map((mu) => {
      const x = C.numerology(mu);
      return `<tr data-mu="${mu}"><td>${mu}</td><td>${x.scsKHz} kHz</td><td>${x.slotMs} ms</td><td>${x.slotsPerFrame}</td>
        <td>${x.usefulSymbolUs} µs</td><td>${x.cpUs} µs</td><td>${x.rbWidthKHz / 1000} MHz</td><td>${x.fr}</td></tr>`;
    }).join("");
    return `<section class="calc-card" id="numerology">
      <h2>参数集（Numerology）与 RB 数</h2>
      <p class="meta">规范：TS 38.211 §4.2–4.3；最大 RB 数见 TS 38.101-1 / 38.101-2 表 5.3.2-1</p>
      <div class="calc-row">
        <label>μ <select id="nu-mu">${[0, 1, 2, 3, 4].map((m) => `<option value="${m}"${m === 1 ? " selected" : ""}>${m}（${15 * 2 ** m} kHz）</option>`).join("")}</select></label>
      </div>
      <div class="calc-out" id="nu-out"></div>
      <div class="table-wrap"><table class="nu-table"><thead><tr><th>μ</th><th>子载波间隔</th><th>时隙长度</th><th>每帧时隙数</th><th>有效符号</th><th>普通 CP</th><th>1 个 RB 宽</th><th>频率范围</th></tr></thead><tbody>${rows}</tbody></table></div>
      <h3>带宽 → 最大 RB 数</h3>
      <div class="calc-row">
        <label>频率范围 <select id="rb-fr"><option>FR1</option><option>FR2</option></select></label>
        <label>子载波间隔 <select id="rb-scs"></select></label>
        <label>信道带宽 <select id="rb-bw"></select></label>
      </div>
      <div class="calc-out" id="rb-out"></div>
    </section>`;
  }

  function fillOptions(sel, values, suffix, keep) {
    const cur = keep ? sel.value : null;
    sel.innerHTML = values.map((v) => `<option value="${v}">${v} ${suffix}</option>`).join("");
    if (cur && values.map(String).includes(cur)) sel.value = cur;
  }

  function bindRbPicker(root, ids, onChange) {
    const fr = root.querySelector(ids.fr), scs = root.querySelector(ids.scs), bw = root.querySelector(ids.bw);
    const sync = () => {
      fillOptions(scs, Object.keys(C.NRB[fr.value]), "kHz", true);
      fillOptions(bw, Object.keys(C.NRB[fr.value][scs.value]).map(Number), "MHz", true);
    };
    fr.addEventListener("change", () => { sync(); onChange(); });
    scs.addEventListener("change", () => { fillOptions(bw, Object.keys(C.NRB[fr.value][scs.value]).map(Number), "MHz", true); onChange(); });
    bw.addEventListener("change", onChange);
    sync();
    return { fr, scs, bw };
  }

  function bindNumerology(root) {
    const sel = root.querySelector("#nu-mu"), out = root.querySelector("#nu-out");
    const show = () => {
      const x = C.numerology(Number(sel.value));
      out.innerHTML = `<p class="calc-big">μ = ${x.mu}：子载波间隔 <strong>${x.scsKHz} kHz</strong>，时隙 <strong>${x.slotMs} ms</strong>，每子帧 ${x.slotsPerSubframe} 个时隙、每帧 ${x.slotsPerFrame} 个</p>
        <ul><li>每时隙 14 个符号（普通 CP）${x.extendedCp ? "；μ = 2 还支持扩展 CP（12 个符号）" : ""}</li>
        <li>有效符号 ${x.usefulSymbolUs} µs（= 1 / 子载波间隔），普通 CP ${x.cpUs} µs；每 0.5 ms 的第一个符号 CP 稍长，为 ${x.longCpUs} µs</li>
        <li>1 个 RB = 12 个子载波 = ${x.rbWidthKHz} kHz；${x.ssb}</li></ul>
        <p class="meta">规律：μ 每加 1，子载波间隔翻倍、符号和 CP 都减半、时隙变短一半——抗多普勒和时延更好，但能容忍的多径时延扩展变小。</p>`;
      root.querySelectorAll(".nu-table tr[data-mu]").forEach((tr) => tr.classList.toggle("on", tr.dataset.mu === sel.value));
    };
    sel.addEventListener("change", show);
    show();
    const rbOut = root.querySelector("#rb-out");
    const p = bindRbPicker(root, { fr: "#rb-fr", scs: "#rb-scs", bw: "#rb-bw" }, () => showRb());
    p.scs.value = "30"; p.scs.dispatchEvent(new Event("change"));
    p.bw.value = "100";
    function showRb() {
      const n = C.maxRb(p.fr.value, Number(p.scs.value), Number(p.bw.value));
      const used = n * 12 * Number(p.scs.value) / 1000;
      rbOut.innerHTML = `<p class="calc-big">最大 <strong>${n}</strong> 个 RB</p>
        <p class="meta">占用 ${n} × 12 × ${p.scs.value} kHz = ${fmt(used)} MHz，频谱利用率 ${fmt(used / Number(p.bw.value) * 100)}%，其余是两侧保护带。</p>`;
    }
    showRb();
  }

  // ---------- 峰值速率 ----------
  function rateCard() {
    return `<section class="calc-card" id="rate">
      <h2>峰值速率估算</h2>
      <p class="meta">规范：TS 38.306 §4.1.2。速率 = v<sub>layers</sub> × Q<sub>m</sub> × f × R<sub>max</sub> × (N<sub>PRB</sub> × 12) / T<sub>s</sub> × (1 − OH)，R<sub>max</sub> = 948/1024，T<sub>s</sub> = 10<sup>−3</sup> / (14 × 2<sup>μ</sup>) 秒</p>
      <div class="calc-row">
        <label>方向 <select id="rt-dir"><option value="DL">下行</option><option value="UL">上行</option></select></label>
        <label>频率范围 <select id="rt-fr"><option>FR1</option><option>FR2</option></select></label>
        <label>子载波间隔 <select id="rt-scs"></select></label>
        <label>信道带宽 <select id="rt-bw"></select></label>
      </div>
      <div class="calc-row">
        <label>MIMO 层数 <select id="rt-layers">${[1, 2, 3, 4, 6, 8].map((v) => `<option${v === 4 ? " selected" : ""}>${v}</option>`).join("")}</select></label>
        <label>调制 <select id="rt-mod">${Object.keys(C.QM).map((m) => `<option${m === "256QAM" ? " selected" : ""}>${m}</option>`).join("")}</select></label>
        <label>缩放因子 f <select id="rt-f"><option value="1">1</option><option value="0.8">0.8</option><option value="0.75">0.75</option><option value="0.4">0.4</option></select></label>
      </div>
      <div class="calc-row">
        <label class="wide">双工 / 帧结构 <select id="rt-tdd">${TDD_PRESETS.map((t) => `<option value="${t.id}"${t.id === "cu" ? " selected" : ""}>${esc(t.label)}</option>`).join("")}</select></label>
      </div>
      <div class="calc-row" id="rt-custom" hidden>
        <label>时隙序列 <input id="rt-pat" value="DDDSU" placeholder="如 DDDSU"></label>
        <label>特殊时隙 D:G:U <input id="rt-sp" value="10:2:2" placeholder="如 10:2:2"></label>
      </div>
      <div class="calc-out" id="rt-out"></div>
      <p class="meta">这是理论峰值：假设整个带宽都给一个用户、信道条件最好、最高码率。现网单用户速率通常只有峰值的几分之一，取决于信号质量、负载和终端能力。</p>
    </section>`;
  }

  function bindRate(root) {
    const $ = (id) => root.querySelector(id);
    const out = $("#rt-out");
    const p = bindRbPicker(root, { fr: "#rt-fr", scs: "#rt-scs", bw: "#rt-bw" }, () => calc());
    p.scs.value = "30"; p.scs.dispatchEvent(new Event("change"));
    p.bw.value = "100";
    function ratioOf(dir) {
      const preset = TDD_PRESETS.find((t) => t.id === $("#rt-tdd").value);
      $("#rt-custom").hidden = preset.id !== "custom";
      if (preset.id === "fdd") return { ratio: 1, desc: "FDD" };
      const pattern = preset.id === "custom" ? $("#rt-pat").value.trim() : preset.pattern;
      const special = preset.id === "custom" ? $("#rt-sp").value.split(/[:：]/).map(Number) : preset.special;
      const r = C.tddRatio(pattern, special);
      const ratio = dir === "DL" ? r.dl : r.ul;
      return { ratio, desc: `TDD ${pattern.toUpperCase()}，${dir === "DL" ? "下行" : "上行"}占 ${fmt(ratio * 100)}%` };
    }
    function calc() {
      try {
        const dir = $("#rt-dir").value;
        const t = ratioOf(dir);
        const r = C.peakRate({ fr: p.fr.value, dir, scsKHz: Number(p.scs.value), bwMHz: Number(p.bw.value), layers: Number($("#rt-layers").value), mod: $("#rt-mod").value, scaling: Number($("#rt-f").value), ratio: t.ratio });
        out.innerHTML = `<p class="calc-big">约 <strong>${fmt(r.mbps)} Mbps</strong>${r.mbps >= 1000 ? `（${fmt(r.mbps / 1000)} Gbps）` : ""}</p>
          <ul><li>N<sub>PRB</sub> = ${r.nprb}，μ = ${r.mu}，开销 OH = ${fmt(r.overhead * 100)}%</li>
          <li>不考虑上下行分时：${fmt(r.fullMbps)} Mbps；${esc(t.desc)}</li></ul>`;
      } catch (e) { out.innerHTML = err(e); }
    }
    ["#rt-dir", "#rt-layers", "#rt-mod", "#rt-f", "#rt-tdd"].forEach((id) => $(id).addEventListener("change", calc));
    ["#rt-pat", "#rt-sp"].forEach((id) => $(id).addEventListener("input", calc));
    calc();
  }

  function render() {
    const root = document.getElementById("calc");
    root.innerHTML = `
      <section class="hero">
        <h1>工具箱</h1>
        <p>边学边算：频点换算、参数集和峰值速率。公式全部来自 3GPP 规范，标注了出处，可以对照规范自己验算。</p>
        <p class="calc-jump"><a href="#arfcn">NR-ARFCN 换算</a><a href="#numerology">参数集与 RB 数</a><a href="#rate">峰值速率</a></p>
      </section>
      ${arfcnCard()}${numerologyCard()}${rateCard()}`;
    bindArfcn(root);
    bindNumerology(root);
    bindRate(root);
  }

  window.CalcPage = { render };
})();
