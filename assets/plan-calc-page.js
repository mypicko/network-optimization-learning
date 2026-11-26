// 工具箱里的规划计算器：链路预算 → 覆盖半径 → 站点数、测量上报换算、KPI 计算、PCI 核查
(function () {
  const P = window.PlanCalc;
  const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const fmt = (x, d = 2) => (x === null || x === undefined ? "—" : Number(x).toLocaleString("zh-CN", { maximumFractionDigits: d }));
  const err = (e) => `<p class="calc-err">${esc(e.message)}</p>`;

  // ---------- 链路预算 ----------
  // 示例数值是教学用的典型取值，不代表某个厂家或运营商的规范
  const PRESETS = [
    { id: "ul35", label: "3.5 GHz 上行 · 室外站覆盖室内（城区）", v: { rb: 8, scs: 30, nf: 3.5, sinr: -2, txPower: 26, txGain: 0, txLoss: 0, rxGain: 10, rxLoss: 0, shadow: 9, penetration: 18, interference: 2, body: 3, model: "uma", fc: 3.5, hBS: 25, hUT: 1.5 } },
    { id: "dl35", label: "3.5 GHz 下行 · 室外站覆盖室内（城区，全带宽）", v: { rb: 273, scs: 30, nf: 7, sinr: -3, txPower: 53, txGain: 10, txLoss: 0, rxGain: 0, rxLoss: 0, shadow: 9, penetration: 18, interference: 6, body: 3, model: "uma", fc: 3.5, hBS: 25, hUT: 1.5 } },
    { id: "ul26", label: "2.6 GHz 上行 · 室外道路（城区微站）", v: { rb: 8, scs: 30, nf: 3.5, sinr: -2, txPower: 26, txGain: 0, txLoss: 0, rxGain: 8, rxLoss: 0, shadow: 8, penetration: 0, interference: 2, body: 3, model: "umi", fc: 2.6, hBS: 10, hUT: 1.5 } },
    { id: "ul07", label: "700 MHz 上行 · 农村广覆盖", v: { rb: 8, scs: 15, nf: 3, sinr: -2, txPower: 23, txGain: 0, txLoss: 0, rxGain: 15, rxLoss: 1, shadow: 8, penetration: 10, interference: 1, body: 3, model: "rma", fc: 0.7, hBS: 35, hUT: 1.5 } }
  ];

  const field = (id, label, unit, step = 0.1) =>
    `<label>${label}${unit ? `（${unit}）` : ""} <input type="number" id="lb-${id}" step="${step}"></label>`;

  function budgetCard() {
    return `<section class="calc-card" id="budget">
      <h2>链路预算 → 覆盖半径 → 站点数</h2>
      <p class="meta">从接收灵敏度算出最大允许路径损耗（MAPL），代入 TR 38.901 传播模型反推覆盖半径，再按六边形蜂窝估算站点数。</p>
      <div class="calc-row"><label class="wide">示例场景 <select id="lb-preset">${PRESETS.map((p) => `<option value="${p.id}">${esc(p.label)}</option>`).join("")}</select></label></div>
      <h3>① 接收灵敏度 = −174 + 10·lg(B) + NF + SINR<sub>req</sub></h3>
      <div class="calc-row">${field("rb", "占用 RB 数", "", 1)}<label>子载波间隔 <select id="lb-scs"><option value="15">15 kHz</option><option value="30">30 kHz</option><option value="60">60 kHz</option></select></label>${field("nf", "接收机噪声系数", "dB")}${field("sinr", "解调门限 SINR", "dB")}</div>
      <h3>② 增益、损耗与余量</h3>
      <div class="calc-row">${field("txPower", "发射功率", "dBm")}${field("txGain", "发射天线增益", "dBi")}${field("txLoss", "发射端损耗", "dB")}${field("rxGain", "接收天线增益", "dBi")}${field("rxLoss", "接收端损耗", "dB")}</div>
      <div class="calc-row">${field("shadow", "阴影衰落余量", "dB")}${field("penetration", "穿透损耗", "dB")}${field("interference", "干扰余量", "dB")}${field("body", "人体 / 植被损耗", "dB")}</div>
      <h3>③ 传播模型</h3>
      <div class="calc-row"><label>场景 <select id="lb-model">${Object.entries(P.MODELS).map(([k, m]) => `<option value="${k}">${esc(m.label)}</option>`).join("")}</select></label>${field("fc", "频率", "GHz", 0.01)}${field("hBS", "基站天线高度", "m", 1)}${field("hUT", "终端高度", "m", 0.5)}</div>
      <h3>④ 站点数</h3>
      <div class="calc-row">${field("area", "规划区域面积", "km²", 0.1)}<label>站型 <select id="lb-sectors"><option value="3">三扇区站</option><option value="1">全向站</option></select></label>${field("margin", "工程冗余", "%", 1)}</div>
      <div class="calc-out" id="lb-out"></div>
      <details class="calc-ref"><summary>怎么用这些结果</summary>
        <ul>
          <li>上行、下行各算一遍，<strong>取半径小的一侧</strong>作为该场景的覆盖半径。中高频 TDD 网络通常是上行先受限：手机发射功率只有 23–26 dBm，比基站小两个数量级。</li>
          <li>示例数值只是教学用的典型取值。实际项目要用设备厂家给出的天线增益、噪声系数和解调门限，以及经过本地路测校正的传播模型。</li>
          <li>穿透损耗随频率升高而增大，3.5 GHz 覆盖深度室内时常取 20 dB 以上；阴影衰落余量由覆盖概率要求和本地阴影衰落标准差决定。</li>
          <li>这里算的是“覆盖站点数”，还要和容量估算出的站点数比较，取较大者，再结合仿真和站址条件修正。</li>
          <li>传播模型用的是 NLOS 公式（规范里取 LOS 与 NLOS 公式的较大值，在常用距离上通常就是 NLOS 公式）。RMa 取平均建筑高度 5 m、街道宽度 20 m。</li>
        </ul>
      </details>
    </section>`;
  }

  const LB_NUM = ["rb", "nf", "sinr", "txPower", "txGain", "txLoss", "rxGain", "rxLoss", "shadow", "penetration", "interference", "body", "fc", "hBS", "hUT", "area", "margin"];

  function bindBudget(root) {
    const $ = (id) => root.querySelector(`#lb-${id}`);
    const out = $("out");
    const apply = (id) => {
      const p = PRESETS.find((x) => x.id === id);
      Object.entries(p.v).forEach(([k, v]) => { if ($(k)) $(k).value = v; });
      if ($("area").value === "") { $("area").value = 10; $("margin").value = 10; }
      calc();
    };
    function calc() {
      try {
        const v = Object.fromEntries(LB_NUM.map((k) => [k, Number($(k).value)]));
        const s = P.sensitivity({ rb: v.rb, scsKHz: Number($("scs").value), nf: v.nf, sinr: v.sinr });
        const b = P.linkBudget({ ...v, sensDbm: s.sensDbm });
        const r = P.coverageRadius({ model: $("model").value, mapl: b.mapl, fc: v.fc, hBS: v.hBS, hUT: v.hUT });
        const site = r.d2d > 0 ? P.siteCount({ areaKm2: v.area, radiusM: r.d2d, sectors: Number($("sectors").value), margin: v.margin }) : null;
        const rows = b.items.map((x) => `<tr><td>${esc(x.label)}</td><td class="num">${x.value >= 0 ? "+" : ""}${fmt(x.value)}</td></tr>`).join("");
        out.innerHTML = `<p class="calc-big">MAPL ≈ <strong>${fmt(b.mapl, 1)} dB</strong> → 覆盖半径 ≈ <strong>${fmt(r.d2d, 0)} m</strong>${site ? ` → 约 <strong>${site.sites}</strong> 个站` : ""}</p>
          <ul>
            <li>占用带宽 ${fmt(s.bwHz / 1e6, 3)} MHz，热噪声 ${fmt(s.noiseDbm)} dBm，接收灵敏度 <strong>${fmt(s.sensDbm)} dBm</strong></li>
            <li>三维距离 ${fmt(r.d3d, 0)} m，换算成水平距离 ${fmt(r.d2d, 0)} m${r.warn ? `；⚠️ ${esc(r.warn)}` : ""}</li>
            ${site ? `<li>单站覆盖面积 ${fmt(site.siteAreaKm2, 3)} km²，理论站数 ${fmt(site.raw, 1)}，计入 ${fmt(v.margin, 0)}% 冗余后向上取整为 ${site.sites} 个</li>` : ""}
          </ul>
          <details class="calc-ref"><summary>链路预算明细</summary><div class="table-wrap"><table class="lb-table"><tbody>${rows}<tr class="sum"><td>MAPL</td><td class="num">${fmt(b.mapl)}</td></tr></tbody></table></div></details>`;
      } catch (e) { out.innerHTML = err(e); }
    }
    $("preset").addEventListener("change", (e) => apply(e.target.value));
    root.querySelectorAll("#budget input, #budget select:not(#lb-preset)").forEach((el) => el.addEventListener("input", calc));
    apply(PRESETS[0].id);
  }

  // ---------- 测量上报换算 ----------
  function reportCard() {
    return `<section class="calc-card" id="report">
      <h2>测量上报值换算</h2>
      <p class="meta">规范：TS 38.133 §10.1。信令日志里的 MeasurementReport 填的是 0–127 的索引，分析前要先换算成 dBm / dB。</p>
      <div class="calc-row">
        <label>测量量 <select id="rp-kind">${Object.entries(P.REPORT).map(([k, r]) => `<option value="${k}">${r.label}（${r.unit}）</option>`).join("")}</select></label>
        <label>上报索引 <input type="number" id="rp-idx" min="0" max="127" step="1" value="50"></label>
        <label>或实际值 <input type="number" id="rp-val" step="0.5" placeholder="如 −95"></label>
      </div>
      <div class="calc-out" id="rp-out"></div>
      <p class="meta">经验参考（各地考核口径不同）：SS-RSRP 高于 −105 dBm 一般算覆盖良好、低于 −110 dBm 算弱覆盖；SS-SINR 低于 0 dB 时下载速率会明显下降。</p>
    </section>`;
  }

  function bindReport(root) {
    const kind = root.querySelector("#rp-kind"), idx = root.querySelector("#rp-idx"), val = root.querySelector("#rp-val"), out = root.querySelector("#rp-out");
    const show = () => {
      try {
        const r = P.reportToValue(kind.value, idx.value);
        out.innerHTML = `<p class="calc-big">索引 ${Number(idx.value)} → <strong>${esc(r.text)}</strong></p>`;
      } catch (e) { out.innerHTML = err(e); }
    };
    idx.addEventListener("input", () => { val.value = ""; show(); });
    val.addEventListener("input", () => {
      if (val.value === "") return;
      try { idx.value = P.valueToReport(kind.value, val.value); show(); } catch (e) { out.innerHTML = err(e); }
    });
    kind.addEventListener("change", () => { if (val.value !== "") val.dispatchEvent(new Event("input")); else show(); });
    show();
  }

  // ---------- KPI ----------
  const KPI_FIELDS = [
    ["rrcReq", "RRC 建立请求次数", 12000], ["rrcSucc", "RRC 建立成功次数", 11934],
    ["qosReq", "QoS 流建立请求次数", 11900], ["qosSucc", "QoS 流建立成功次数", 11868],
    ["ctxSucc", "UE 上下文建立成功次数", 11850], ["drop", "UE 上下文异常释放次数", 41],
    ["hoAtt", "切换尝试次数", 5300], ["hoSucc", "切换成功次数", 5251]
  ];

  function kpiCard() {
    return `<section class="calc-card" id="kpi">
      <h2>KPI 计算</h2>
      <p class="meta">把网管话统里的计数器填进来，算出接入、保持、移动性三类核心指标。示例数字是虚构的。</p>
      <div class="calc-row">${KPI_FIELDS.map(([k, l, v]) => `<label>${l} <input type="number" id="kp-${k}" min="0" step="1" value="${v}"></label>`).join("")}</div>
      <div class="calc-out" id="kp-out"></div>
      <details class="calc-ref"><summary>公式与常见考核口径</summary>
        <ul>
          <li>RRC 建立成功率 = RRC 建立成功次数 ÷ 请求次数；QoS 流建立成功率同理（NSA 下看 E-RAB 和 SgNB 添加成功率）</li>
          <li>无线接通率 = RRC 建立成功率 × QoS 流建立成功率，综合反映“能不能连上”</li>
          <li>无线掉线率 = UE 上下文异常释放次数 ÷ UE 上下文建立成功次数，反映“连上后能不能保持”</li>
          <li>切换成功率 = 切换成功次数 ÷ 切换尝试次数，可再细分站内、站间（Xn / NG）和 5G 到 4G 的系统间切换</li>
          <li>不同运营商和厂家对计数器的统计点、剔除规则（如用户主动释放不算掉线）定义不完全相同，对比数据时先确认口径</li>
        </ul>
      </details>
    </section>`;
  }

  function bindKpi(root) {
    const out = root.querySelector("#kp-out");
    const calc = () => {
      try {
        const c = Object.fromEntries(KPI_FIELDS.map(([k]) => [k, Number(root.querySelector(`#kp-${k}`).value)]));
        const k = P.kpi(c);
        const li = (label, v, good) => `<li>${label}：<strong>${v === null ? "—" : `${fmt(v)}%`}</strong>${v !== null && good ? ` ${good(v) ? "✅" : "⚠️"}` : ""}</li>`;
        out.innerHTML = `<p class="calc-big">无线接通率 <strong>${k.access === null ? "—" : `${fmt(k.access)}%`}</strong></p>
          <ul>${li("RRC 建立成功率", k.rrc, (v) => v >= 99)}${li("QoS 流建立成功率", k.qos, (v) => v >= 99)}${li("无线掉线率", k.drop, (v) => v <= 0.5)}${li("切换成功率", k.ho, (v) => v >= 98.5)}</ul>
          <p class="meta">✅ / ⚠️ 按一组常见的参考门限标注（成功率 ≥ 99%、掉线率 ≤ 0.5%、切换成功率 ≥ 98.5%），实际以当地考核标准为准。</p>`;
      } catch (e) { out.innerHTML = err(e); }
    };
    root.querySelectorAll("#kpi input").forEach((el) => el.addEventListener("input", calc));
    calc();
  }

  // ---------- PCI ----------
  function pciCard() {
    return `<section class="calc-card" id="pci">
      <h2>PCI 规划核查</h2>
      <p class="meta">规范：TS 38.211 §7.4.2.1，PCI = 3 × N<sub>ID</sub><sup>(1)</sup> + N<sub>ID</sub><sup>(2)</sup>，共 1008 个（0–1007）。填入服务小区和它的邻区，检查是否有冲突。</p>
      <div class="calc-row">
        <label>服务小区 PCI <input type="number" id="pc-s" min="0" max="1007" step="1" value="216"></label>
        <label class="wide">邻区 PCI（逗号或空格分隔） <input id="pc-n" value="217, 219, 246, 220, 216, 318"></label>
      </div>
      <div class="calc-out" id="pc-out"></div>
      <details class="calc-ref"><summary>规划原则</summary>
        <ul>${P.PCI_RULES.map((r) => `<li><strong>${r.label}</strong>（${r.level}）：${esc(r.why)}</li>`).join("")}
          <li>“PCI 相同”分两种：两个相邻小区 PCI 相同叫冲突；同一个小区的两个邻区 PCI 相同叫混淆，切换时基站不知道该切到哪个</li>
          <li>同 PCI 的小区之间要拉开足够的复用距离；模 3 / 模 4 / 模 30 在相邻且覆盖重叠的小区之间尽量错开，实在避不开时优先保证同站和强重叠邻区</li></ul>
      </details>
    </section>`;
  }

  function bindPci(root) {
    const s = root.querySelector("#pc-s"), n = root.querySelector("#pc-n"), out = root.querySelector("#pc-out");
    const calc = () => {
      try {
        const list = n.value.split(/[\s,，、]+/).filter(Boolean);
        const r = P.pciCheck(s.value, list);
        const head = `<p class="calc-big">PCI ${r.serving.pci}：N<sub>ID</sub><sup>(1)</sup> = ${r.serving.nid1}，N<sub>ID</sub><sup>(2)</sup> = ${r.serving.nid2}（模 3），模 4 = ${r.serving.mod4}，模 30 = ${r.serving.mod30}</p>`;
        const body = r.issues.length
          ? `<ul>${r.issues.map((x) => `<li>${x.level === "严重" ? "❌" : "⚠️"} 邻区 ${x.pci}：<strong>${x.label}</strong>——${esc(x.why)}</li>`).join("")}</ul>`
          : `<p>✅ 与所填邻区没有冲突。</p>`;
        const dup = list.map(Number).filter((x, i, a) => a.indexOf(x) !== i);
        out.innerHTML = head + body + (dup.length ? `<p>❌ 邻区列表里 PCI ${[...new Set(dup)].join("、")} 出现多次：<strong>PCI 混淆</strong>，切换时无法区分目标小区。</p>` : "");
      } catch (e) { out.innerHTML = err(e); }
    };
    [s, n].forEach((el) => el.addEventListener("input", calc));
    calc();
  }

  const LINKS = [["budget", "链路预算与覆盖"], ["report", "测量值换算"], ["kpi", "KPI 计算"], ["pci", "PCI 核查"]];

  function render(root) {
    root.insertAdjacentHTML("beforeend", `<h2 class="calc-group" id="planning">网络规划与优化</h2>${budgetCard()}${reportCard()}${kpiCard()}${pciCard()}`);
    bindBudget(root);
    bindReport(root);
    bindKpi(root);
    bindPci(root);
  }

  window.PlanCalcPage = { render, LINKS };
})();
