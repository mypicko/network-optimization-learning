module.exports = [
  // ───────── 0.1 从 2G/3G 到 LTE：演进与 EPS 总体 ─────────
  { id: "lte-evolution-1", m: "lte-evolution", t: "single", q: "LTE 相比 3G UMTS，在无线接入网架构上最大的变化是？", o: ["取消了 RNC，eNB 直连核心网", "取消了基站，由 RNC 直接发射", "增加了 BSC 作为中间控制节点", "无线侧仍保留 NodeB + RNC 两级结构"], a: 0, e: "LTE 采用扁平架构，原 RNC 的无线资源管理、调度、加密等功能下沉到 eNB，移动性等控制功能上移到 MME，eNB 通过 S1 直连 EPC。" },
  { id: "lte-evolution-2", m: "lte-evolution", t: "single", q: "EPS（演进的分组系统）由哪两部分组成？", o: ["UTRAN + EPC", "E-UTRAN + IMS", "E-UTRAN + EPC", "GERAN + EPC"], a: 2, e: "EPS = E-UTRAN（无线接入网，只有 eNB）+ EPC（演进的分组核心网）。IMS 是承载 VoLTE 等业务的业务网络，不属于 EPS 本身。" },
  { id: "lte-evolution-3", m: "lte-evolution", t: "multi", q: "下列属于 LTE 立项时设定的设计目标的有？", o: ["支持 1.4–20 MHz 多种带宽", "用户面时延低于 5 ms 量级", "保留电路域专门承载语音", "扁平化架构、降低网络成本"], a: [0, 1, 3], e: "LTE 的目标包括带宽可伸缩、低时延、高频谱效率、扁平架构和全 IP。LTE 只有分组域，没有电路域，语音靠 CSFB 或 VoLTE 解决。" },
  { id: "lte-evolution-4", m: "lte-evolution", t: "judge", q: "LTE FDD 与 TD-LTE 使用不同的核心网和高层协议。", a: false, e: "两者共用 EPC 和全部高层协议，物理层也大部分相同，差别主要在帧结构、HARQ 时序等双工相关的部分。" },

  // ───────── 0.2 OFDMA 与 SC-FDMA ─────────
  { id: "lte-ofdma-1", m: "lte-ofdma", t: "single", q: "LTE 中一个 RB（资源块）在频域和时域上的大小是？", o: ["12 个子载波 × 1 个子帧，频域 360 kHz", "12 个子载波 × 1 个时隙，频域 180 kHz", "6 个子载波 × 1 个时隙，频域 90 kHz", "24 个子载波 × 1 个符号，频域 360 kHz"], a: 1, e: "RB = 12 个 15 kHz 子载波（180 kHz）× 1 个 0.5 ms 时隙，常规 CP 下含 84 个 RE；调度通常以一个子帧内的 RB 对为单位。" },
  { id: "lte-ofdma-2", m: "lte-ofdma", t: "single", q: "10 MHz 信道带宽的 LTE 载波有多少个 RB？", o: ["25", "100", "75", "50"], a: 3, e: "1.4 / 3 / 5 / 10 / 15 / 20 MHz 分别对应 6 / 15 / 25 / 50 / 75 / 100 个 RB。" },
  { id: "lte-ofdma-3", m: "lte-ofdma", t: "multi", q: "关于 LTE 上行采用 SC-FDMA，下列说法正确的有？", o: ["其 PAPR 低于 OFDMA，利于终端功放效率", "本质上是 DFT 扩展的 OFDM", "R8 中单个 UE 的 PUSCH 可以任意离散分配 RB", "分配的 RB 数需要满足 2、3、5 的幂次乘积约束"], a: [0, 1, 3], e: "SC-FDMA 即 DFT-s-OFDM，PAPR 较低；R8 要求 PUSCH 占用连续 RB（R10 起支持两簇），RB 数受 DFT 尺寸约束。" },
  { id: "lte-ofdma-4", m: "lte-ofdma", t: "judge", q: "LTE 常规 CP 时每个时隙包含 7 个 OFDM 符号，扩展 CP 时包含 6 个。", a: true, e: "扩展 CP 更长（约 16.7 μs），抗时延扩展能力更强，代价是每时隙少一个符号、开销更大。" },

  // ───────── 0.3 LTE 多天线与传输模式 ─────────
  { id: "lte-mimo-1", m: "lte-mimo", t: "single", q: "LTE 下行传输模式中，“开环空间复用”对应的是？", o: ["TM2", "TM3", "TM4", "TM7"], a: 1, e: "TM2 为发射分集，TM3 为开环空间复用（大时延 CDD，不需 PMI），TM4 为闭环空间复用，TM7 为单流波束赋形。" },
  { id: "lte-mimo-2", m: "lte-mimo", t: "single", q: "UE 上报的 RI 表示什么？", o: ["信道质量等级，用于选择 MCS", "推荐的预编码矩阵序号", "UE 支持的最大带宽", "推荐的传输层数（秩）"], a: 3, e: "CQI 用于选择 MCS，PMI 是推荐的预编码矩阵序号，RI 是推荐的层数。" },
  { id: "lte-mimo-3", m: "lte-mimo", t: "multi", q: "下列传输模式中，基于 UE 专用参考信号（DMRS 或端口 5）而非 CRS 解调的有？", o: ["TM3", "TM7", "TM8", "TM9"], a: [1, 2, 3], e: "TM1–TM6 基于 CRS 解调；TM7 使用端口 5，TM8 使用端口 7–8，TM9 使用端口 7–14 的 UE 专用参考信号解调。" },
  { id: "lte-mimo-4", m: "lte-mimo", t: "judge", q: "高速移动场景中，闭环空间复用 TM4 通常比开环 TM3 性能更好。", a: false, e: "TM4 依赖 UE 上报 PMI，高速移动时信道变化快、PMI 易过时，性能反而下降；开环 TM3 对信道变化更鲁棒。" }
];
