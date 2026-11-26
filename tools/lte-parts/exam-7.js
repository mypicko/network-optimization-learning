module.exports = [
  // ───────── 7.1 LTE-A Pro 增强 ─────────
  { id: "lte-pro-1", m: "lte-pro", t: "single", q: "“LTE-Advanced Pro” 这一名称从哪个版本开始使用？", o: ["R10", "R12", "R13", "R15"], a: 2, e: "R10–R12 称 LTE-Advanced，3GPP 从 R13 起使用 LTE-Advanced Pro。R15 是 NR 的首个版本。" },
  { id: "lte-pro-2", m: "lte-pro", t: "single", q: "LAA 在 5 GHz 非授权频段上必须执行 LBT 的主要原因是？", o: ["与 Wi-Fi 等系统公平共存并满足法规要求", "提升调制阶数", "减少 CRS 开销", "支持终端在非授权频段独立驻留"], a: 0, e: "LBT 即先听后发，信道忙就退避，保证与 Wi-Fi 共存，并满足许多地区的法规。LAA 的非授权小区只能作为 SCell，终端不能在其上独立驻留。" },
  { id: "lte-pro-3", m: "lte-pro", t: "multi", q: "下列属于 LTE-Advanced Pro（R13 及之后）引入的特性有？", o: ["LAA", "FD-MIMO", "NB-IoT 与 eMTC", "首次引入载波聚合"], a: [0, 1, 2], e: "载波聚合是 R10（LTE-Advanced）引入的；R13 是把成员载波上限扩展到 32 个。" },
  { id: "lte-pro-4", m: "lte-pro", t: "judge", q: "FD-MIMO 只在水平方向形成波束，与 R10 的 8 天线波束赋形没有本质区别。", a: false, e: "FD-MIMO 使用二维平面阵列，在水平和垂直两个维度同时赋形，可区分不同高度的用户，是 NR Massive MIMO 的先导。" },

  // ───────── 7.2 NB-IoT 与 eMTC ─────────
  { id: "lte-iot-1", m: "lte-iot", t: "single", q: "NB-IoT 终端的工作带宽是？", o: ["1.4 MHz", "5 MHz", "20 MHz", "180 kHz"], a: 3, e: "NB-IoT 占用 180 kHz（一个 PRB 的宽度）；1.4 MHz（6 个 PRB）是 eMTC Cat-M1 的窄带。" },
  { id: "lte-iot-2", m: "lte-iot", t: "single", q: "一个需要在移动中保持连接并支持 VoLTE 的可穿戴设备，在 R13 技术中更适合选择？", o: ["NB-IoT", "eMTC（Cat-M1）", "LTE-U", "SC-PTM"], a: 1, e: "eMTC 支持连接态切换和 VoLTE；R13 NB-IoT 连接态不支持切换，也不支持语音。" },
  { id: "lte-iot-3", m: "lte-iot", t: "multi", q: "关于 PSM 和 eDRX，下列说法正确的有？", o: ["PSM 休眠期间终端不可被寻呼", "eDRX 拉长了寻呼周期，终端仍可被寻呼", "PSM 的定时器由终端请求、网络决定", "eDRX 只能在连接态使用"], a: [0, 1, 2], e: "eDRX 主要用于空闲态，拉长寻呼周期；连接态有自己的 DRX。PSM 期间完全不可达，定时器（T3324、扩展 T3412）在 Attach / TAU 中协商。" },
  { id: "lte-iot-4", m: "lte-iot", t: "judge", q: "NB-IoT 的带内部署（In-band）占用 LTE 载波中的一个 PRB，需要避开 LTE 的控制区和 CRS。", a: true, e: "带内部署与 LTE 共享载波和功率，NB-IoT 需绕开 LTE 的 PDCCH 区域和 CRS 资源。" },

  // ───────── 7.3 频谱重耕、DSS 与 4G 演进 ─────────
  { id: "lte-refarm-1", m: "lte-refarm", t: "single", q: "DSS 中 NR 必须对 LTE 的哪种信号做速率匹配（避开其资源粒子）？", o: ["CRS", "SRS", "PRACH", "DMRS（LTE 上行）"], a: 0, e: "LTE CRS 在下行持续发送，NR PDSCH 需按配置的 LTE CRS 图样做速率匹配。SRS、PRACH 和上行 DMRS 属于上行，不是下行共享的主要冲突点。" },
  { id: "lte-refarm-2", m: "lte-refarm", t: "single", q: "DSS 中常把 NR SSB 放在 LTE 的哪类子帧里？", o: ["特殊子帧", "MBSFN 子帧", "寻呼子帧", "包含 PBCH 的子帧"], a: 1, e: "MBSFN 子帧的数据区不发 CRS，适合放置 NR SSB 等信号，这是常见做法。" },
  { id: "lte-refarm-3", m: "lte-refarm", t: "multi", q: "下列哪些情况更倾向于把某频段直接重耕给 NR，而不是做 DSS？", o: ["该频段 LTE 话务已很低", "主流终端已支持该 NR 频段", "该频段仍是唯一的 LTE 锚点和 VoLTE 承载频段", "希望 NR 获得完整频谱和最佳性能"], a: [0, 1, 3], e: "若该频段仍承担不可替代的锚点和 VoLTE 角色，应保留 LTE 或用 DSS 过渡，而非直接重耕。" },
  { id: "lte-refarm-4", m: "lte-refarm", t: "judge", q: "DSS 要求 NR 在共享载波上使用 15 kHz 子载波间隔，以便与 LTE 对齐。", a: true, e: "LTE 子载波间隔固定 15 kHz，DSS 载波上 NR 使用 15 kHz 才能在时频网格上与 LTE 对齐、协调调度。" }
];
