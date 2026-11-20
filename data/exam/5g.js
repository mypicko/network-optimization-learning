// 5G 模拟考试题库（客观题）：按学习路径的 30 个模块编写，依据 3GPP 规范和站内讲解内容
// 字段：id 题号  m 所属模块 id  t 题型（single 单选 / multi 多选 / judge 判断）  q 题干
//       o 选项（判断题没有）  a 答案（单选：选项下标；多选：下标数组；判断：true / false）  e 解析
// 问答题不在这里重复：考试时自动复用路径模块的自测问答题（data/pathways/5g.js 的 quiz），
// 以及入门快线的单选题（data/quickstart/5g.js），见 assets/exam.js 的 buildBank
// 以后找到授权合适的外部题库，可以按同样格式追加到 window.EXAM_BANK[主题] 数组里
window.EXAM_BANK = window.EXAM_BANK || {};

window.EXAM_BANK["5g"] = [
  // ───────── 0.1 OFDM 与调制 ─────────
  { id: "s0-ofdm-1", m: "s0-ofdm", t: "single", q: "子载波间隔为 30 kHz 时，一个 OFDM 有效符号（不含 CP）长约多少？", o: ["66.7 µs", "33.3 µs", "16.7 µs", "8.3 µs"], a: 1, e: "有效符号长度 = 1 / 子载波间隔 = 1 / 30 kHz ≈ 33.3 µs。15 kHz 时为 66.7 µs。" },
  { id: "s0-ofdm-2", m: "s0-ofdm", t: "single", q: "循环前缀（CP）的主要作用是？", o: ["提高调制阶数", "吸收多径时延扩展，避免符号间干扰", "降低峰均比", "用于信道编码"], a: 1, e: "CP 把符号尾部复制到前面，只要多径时延扩展不超过 CP 长度，就不会产生符号间干扰，子载波正交性也得以保持。" },
  { id: "s0-ofdm-3", m: "s0-ofdm", t: "multi", q: "关于 NR 的上行波形，下列说法正确的有？", o: ["上行支持 CP-OFDM", "上行支持 DFT-s-OFDM", "DFT-s-OFDM 的峰均比比 CP-OFDM 低", "DFT-s-OFDM 支持多层 MIMO，频谱效率高于 CP-OFDM"], a: [0, 1, 2], e: "NR 上行两种波形都支持。DFT-s-OFDM 峰均比低、功放效率高，适合覆盖受限的小区边缘，但只支持单层传输；CP-OFDM 频谱效率和 MIMO 支持更好。" },
  { id: "s0-ofdm-4", m: "s0-ofdm", t: "judge", q: "256QAM 每个调制符号携带 8 个比特。", a: true, e: "2^8 = 256，所以 256QAM 每符号 8 比特；64QAM 为 6 比特，16QAM 为 4 比特，QPSK 为 2 比特。" },
  { id: "s0-ofdm-5", m: "s0-ofdm", t: "judge", q: "同一种 CP 类型下，子载波间隔越大，CP 的绝对时长越长。", a: false, e: "子载波间隔每翻一倍，符号和 CP 时长都减半。所以大子载波间隔能容忍的多径时延扩展更小，更适合小覆盖的高频场景。" },

  // ───────── 0.2 多天线与 MIMO 基础 ─────────
  { id: "s0-mimo-1", m: "s0-mimo", t: "single", q: "下行 4 层空间复用中，“层（Layer）”指的是？", o: ["天线的物理数量", "同一时频资源上并行传输的独立数据流数", "码字数", "子载波数"], a: 1, e: "层数（rank）是同时并行传输的独立数据流数，受收发天线数和信道条件共同限制，不等于天线数。" },
  { id: "s0-mimo-2", m: "s0-mimo", t: "single", q: "TDD 系统中，基站可以用上行 SRS 估计下行信道，依据的是？", o: ["信道互易性", "频率复用", "循环前缀", "HARQ"], a: 0, e: "TDD 上下行同频，在信道相干时间内上下行信道近似相同（互易），基站可以用上行探测估计下行信道来做波束赋形。" },
  { id: "s0-mimo-3", m: "s0-mimo", t: "multi", q: "多天线技术的典型用途包括？", o: ["空间分集，提高可靠性", "空间复用，提高速率", "波束赋形，提升覆盖", "增大子载波间隔"], a: [0, 1, 2], e: "多天线的三种用法：分集、复用、波束赋形。子载波间隔属于参数集，和多天线无关。" },
  { id: "s0-mimo-4", m: "s0-mimo", t: "judge", q: "MU-MIMO 是指在同一时频资源上同时服务多个用户。", a: true, e: "MU-MIMO 利用空间维度区分用户，多个用户共享同一时频资源，提升小区容量。" },

  // ───────── 0.3 4G LTE 体系回顾 ─────────
  { id: "s0-lte-1", m: "s0-lte", t: "single", q: "LTE 中负责移动性管理等信令处理的核心网网元是？", o: ["SGW", "PGW", "MME", "HSS"], a: 2, e: "MME 负责 NAS 信令、移动性管理和鉴权流程控制；SGW / PGW 是用户面网关；HSS 存签约数据。" },
  { id: "s0-lte-2", m: "s0-lte", t: "single", q: "LTE 基站（eNB）之间的接口是？", o: ["S1", "X2", "Uu", "S6a"], a: 1, e: "X2 连接两个 eNB，用于切换和干扰协调；S1 连接 eNB 和核心网；Uu 是空口；S6a 是 MME 和 HSS 之间的接口。" },
  { id: "s0-lte-3", m: "s0-lte", t: "multi", q: "以下属于 EPC 核心网网元的有？", o: ["MME", "SGW", "PGW", "gNB"], a: [0, 1, 2], e: "gNB 是 5G 基站，不属于 EPC。" },
  { id: "s0-lte-4", m: "s0-lte", t: "judge", q: "LTE 用 QCI 标识承载的 QoS 等级，5G 中对应的概念是 5QI。", a: true, e: "5QI 沿用了 QCI 的思路，但 5G 的 QoS 控制粒度从承载变成了 QoS 流。" },

  // ───────── 1.1 三大场景与关键指标 ─────────
  { id: "s1-scenarios-1", m: "s1-scenarios", t: "single", q: "“低时延高可靠通信”对应的场景缩写是？", o: ["eMBB", "URLLC", "mMTC", "NB-IoT"], a: 1, e: "URLLC：Ultra-Reliable Low-Latency Communications。" },
  { id: "s1-scenarios-2", m: "s1-scenarios", t: "single", q: "IMT-2020 规定的连接密度指标是每平方公里多少台设备？", o: ["10⁴", "10⁵", "10⁶", "10⁷"], a: 2, e: "连接密度 10⁶ 台/km²，对应 mMTC 场景。" },
  { id: "s1-scenarios-3", m: "s1-scenarios", t: "multi", q: "ITU 定义的 5G 三大应用场景包括？", o: ["eMBB", "URLLC", "mMTC", "VoLTE"], a: [0, 1, 2], e: "VoLTE 是 4G 语音方案，不是 5G 应用场景。" },
  { id: "s1-scenarios-4", m: "s1-scenarios", t: "judge", q: "IMT-2020 的下行峰值速率指标是 20 Gbps。", a: true, e: "下行峰值 20 Gbps、上行峰值 10 Gbps。" },

  // ───────── 1.2 3GPP 标准演进 ─────────
  { id: "s1-releases-1", m: "s1-releases", t: "single", q: "RedCap（轻量化终端）在哪个版本引入？", o: ["R15", "R16", "R17", "R18"], a: 2, e: "RedCap 在 R17 引入，R18 进一步增强（eRedCap）。" },
  { id: "s1-releases-2", m: "s1-releases", t: "single", q: "3GPP 规范中，NR 无线接入相关规范属于哪个系列？", o: ["23 系列", "24 系列", "33 系列", "38 系列"], a: 3, e: "38 系列是 NR 无线；23 系列是系统架构；24 系列是 NAS 等核心网协议；33 系列是安全。" },
  { id: "s1-releases-3", m: "s1-releases", t: "multi", q: "以下属于 R16 主要特性的有？", o: ["URLLC 增强", "NR-V2X", "NR-U（非授权频谱）", "RedCap"], a: [0, 1, 2], e: "RedCap 属于 R17。" },
  { id: "s1-releases-4", m: "s1-releases", t: "judge", q: "R18 是 5G-Advanced 的第一个版本。", a: true, e: "3GPP 把 R18 定为 5G-Advanced 的起点。" },

  // ───────── 1.3 部署方式：NSA 与 SA ─────────
  { id: "s1-deploy-1", m: "s1-deploy", t: "single", q: "NSA Option 3x 组网中，控制面锚点是？", o: ["gNB", "eNB", "AMF", "UPF"], a: 1, e: "Option 3x 以 LTE 基站为主节点（控制面锚点），NR 作为辅节点提供数据面容量，核心网是 EPC。" },
  { id: "s1-deploy-2", m: "s1-deploy", t: "single", q: "SA 组网（Option 2）使用的核心网是？", o: ["EPC", "5GC", "IMS", "2G/3G 核心网"], a: 1, e: "SA 是 NR 基站直接接入 5GC。" },
  { id: "s1-deploy-3", m: "s1-deploy", t: "multi", q: "关于 EN-DC，下列说法正确的有？", o: ["终端同时连接 LTE 和 NR", "LTE 基站为主节点 MeNB", "NR 基站为辅节点 SgNB", "必须接入 5GC"], a: [0, 1, 2], e: "EN-DC（E-UTRA–NR 双连接）对应 NSA，核心网是 EPC。" },
  { id: "s1-deploy-4", m: "s1-deploy", t: "judge", q: "中国移动 2.6 GHz 的 5G 使用的是 n41 频段。", a: true, e: "中国移动 2515–2675 MHz 属于 n41；电信联通 3.5 GHz 属于 n78。" },

  // ───────── 2.1 参数集、帧结构与 BWP ─────────
  { id: "s2-numerology-1", m: "s2-numerology", t: "single", q: "μ = 1（30 kHz）时，每个无线帧有多少个时隙？", o: ["10", "20", "40", "80"], a: 1, e: "每子帧 2^μ 个时隙，每帧 10 个子帧，所以 μ = 1 时每帧 20 个时隙，每时隙 0.5 ms。" },
  { id: "s2-numerology-2", m: "s2-numerology", t: "single", q: "一个 PRB 在频域包含多少个子载波？", o: ["6", "12", "14", "24"], a: 1, e: "PRB = 12 个连续子载波；14 是正常 CP 下每时隙的符号数。" },
  { id: "s2-numerology-3", m: "s2-numerology", t: "multi", q: "关于 NR 帧结构，下列说法正确的有？", o: ["一个无线帧 10 ms", "一个子帧 1 ms", "正常 CP 下每时隙 14 个符号", "每个子帧固定只有 1 个时隙"], a: [0, 1, 2], e: "每子帧的时隙数随 μ 变化（2^μ 个），只有 μ = 0 时才是 1 个。" },
  { id: "s2-numerology-4", m: "s2-numerology", t: "judge", q: "FR1 下单载波最大信道带宽为 100 MHz。", a: true, e: "FR1 最大 100 MHz（30 / 60 kHz 子载波间隔），FR2 最大 400 MHz（120 kHz）。" },
  { id: "s2-numerology-5", m: "s2-numerology", t: "judge", q: "BWP 让终端只在载波的一部分带宽上工作，可以节省终端功耗。", a: true, e: "BWP（部分带宽）让终端按业务需要在窄带和宽带之间切换，窄带工作时射频和基带功耗更低。" },

  // ───────── 2.2 SSB 与小区搜索 ─────────
  { id: "s2-ssb-1", m: "s2-ssb", t: "single", q: "NR 一共有多少个物理小区 ID（PCI）？", o: ["504", "1008", "1024", "336"], a: 1, e: "PCI = 3 × N_ID(1) + N_ID(2)，N_ID(1) 有 336 个取值、N_ID(2) 有 3 个，共 1008 个（LTE 是 504 个）。" },
  { id: "s2-ssb-2", m: "s2-ssb", t: "single", q: "一个 SSB 在时频域占用多少资源？", o: ["4 个 OFDM 符号、20 个 RB", "2 个符号、12 个 RB", "14 个符号、24 个 RB", "1 个符号、6 个 RB"], a: 0, e: "SSB 占 4 个连续 OFDM 符号、240 个子载波（20 个 RB）。" },
  { id: "s2-ssb-3", m: "s2-ssb", t: "multi", q: "SSB 由哪些部分组成？", o: ["PSS", "SSS", "PBCH（含 DMRS）", "PDSCH"], a: [0, 1, 2], e: "SSB = 主同步信号 + 辅同步信号 + 物理广播信道。SIB1 才通过 PDSCH 发送。" },
  { id: "s2-ssb-4", m: "s2-ssb", t: "judge", q: "MIB 通过 PBCH 承载，SIB1 通过 PDSCH 承载。", a: true, e: "终端先解 PBCH 得到 MIB，再按 MIB 指示的 CORESET#0 和搜索空间解 PDCCH，最后在 PDSCH 上读 SIB1。" },

  // ───────── 2.3 物理信道与参考信号 ─────────
  { id: "s2-channels-1", m: "s2-channels", t: "single", q: "用于下行信道状态测量（如 CQI、PMI、RI）的参考信号是？", o: ["DMRS", "CSI-RS", "SRS", "PTRS"], a: 1, e: "CSI-RS 用于下行信道测量；DMRS 用于解调；SRS 用于上行探测；PTRS 用于相位跟踪。" },
  { id: "s2-channels-2", m: "s2-channels", t: "single", q: "承载下行控制信息 DCI 的物理信道是？", o: ["PDSCH", "PDCCH", "PBCH", "PUCCH"], a: 1, e: "DCI 在 PDCCH 上发送，告诉终端调度信息。" },
  { id: "s2-channels-3", m: "s2-channels", t: "multi", q: "以下属于上行物理信道的有？", o: ["PUSCH", "PUCCH", "PRACH", "PDSCH"], a: [0, 1, 2], e: "PDSCH 是下行共享信道。" },
  { id: "s2-channels-4", m: "s2-channels", t: "judge", q: "PTRS 主要用于高频段（如毫米波）的相位噪声跟踪。", a: true, e: "高频段本振相位噪声大，PTRS 帮助接收端估计并补偿相位噪声。" },

  // ───────── 2.4 信道编码与 HARQ ─────────
  { id: "s2-coding-1", m: "s2-coding", t: "single", q: "NR 数据信道（PDSCH / PUSCH）使用的信道编码是？", o: ["Turbo 码", "LDPC 码", "Polar 码", "卷积码"], a: 1, e: "数据信道用 LDPC，适合大数据块和高吞吐；LTE 数据信道用 Turbo 码。" },
  { id: "s2-coding-2", m: "s2-coding", t: "single", q: "NR 中 PBCH 和 DCI 使用的信道编码是？", o: ["LDPC 码", "Turbo 码", "Polar 码", "RS 码"], a: 2, e: "控制信道（PBCH、DCI、大部分 UCI）用 Polar 码，短码长下性能好。" },
  { id: "s2-coding-3", m: "s2-coding", t: "multi", q: "关于 HARQ，下列说法正确的有？", o: ["接收端反馈 ACK / NACK", "重传数据可与之前的接收合并译码", "NR 支持基于码块组（CBG）的重传", "HARQ 在 PDCP 层实现"], a: [0, 1, 2], e: "HARQ 在 MAC 层（配合物理层）实现；PDCP 负责加密、完整性保护和重排序。" },
  { id: "s2-coding-4", m: "s2-coding", t: "judge", q: "链路自适应通常以初传 BLER 约 10% 为目标来选择 MCS。", a: true, e: "BLER 目标 10% 是常见设置，在吞吐和重传开销之间折中；URLLC 会用更低的目标。" },

  // ───────── 2.5 Massive MIMO 与波束管理 ─────────
  { id: "s2-beam-1", m: "s2-beam", t: "single", q: "描述两个参考信号具有相同大尺度信道特性（如时延、多普勒、空间接收参数）的概念是？", o: ["QCL（准共址）", "HARQ", "BWP", "DRX"], a: 0, e: "QCL 关系由 TCI 状态指示，终端据此用已测好的参考信号的波束去接收数据或控制信道。" },
  { id: "s2-beam-2", m: "s2-beam", t: "single", q: "AAU 规格中的“64T64R”指的是？", o: ["64 个发射通道和 64 个接收通道", "支持 64 个小区", "固定 64 个波束", "64 个子载波"], a: 0, e: "T / R 指收发通道数，通道越多，波束越窄、可同时服务的用户越多。" },
  { id: "s2-beam-3", m: "s2-beam", t: "multi", q: "波束管理的主要过程包括？", o: ["波束扫描", "波束测量与上报", "波束指示（TCI 状态）", "波束失败检测与恢复"], a: [0, 1, 2, 3], e: "四个都是波束管理的组成部分。" },
  { id: "s2-beam-4", m: "s2-beam", t: "judge", q: "Type II 码本比 Type I 码本反馈精度更高，反馈开销也更大。", a: true, e: "Type II 用多个波束的线性组合描述信道，精度高，适合 MU-MIMO，但上报比特更多。" },

  // ───────── 3.1 NR 协议栈 ─────────
  { id: "s3-stack-1", m: "s3-stack", t: "single", q: "负责把 QoS 流映射到 DRB 的协议层是？", o: ["PDCP", "SDAP", "RLC", "MAC"], a: 1, e: "SDAP 是 5G 新增的一层，位于 PDCP 之上，完成 QoS 流到 DRB 的映射并标记 QFI。" },
  { id: "s3-stack-2", m: "s3-stack", t: "single", q: "空口的加密和完整性保护在哪一层完成？", o: ["PDCP", "RLC", "MAC", "PHY"], a: 0, e: "PDCP 负责加密、完整性保护、头压缩和重排序。" },
  { id: "s3-stack-3", m: "s3-stack", t: "multi", q: "MAC 层的功能包括？", o: ["调度", "HARQ", "逻辑信道复用", "ARQ 重传"], a: [0, 1, 2], e: "ARQ 是 RLC 层（AM 模式）的功能。" },
  { id: "s3-stack-4", m: "s3-stack", t: "judge", q: "RLC AM 模式通过 ARQ 重传保证可靠传输。", a: true, e: "AM（确认模式）有状态报告和重传；UM、TM 模式没有。" },

  // ───────── 3.2 RRC 状态与系统消息 ─────────
  { id: "s3-rrc-1", m: "s3-rrc", t: "single", q: "相比 LTE，5G 新增的 RRC 状态是？", o: ["RRC_IDLE", "RRC_INACTIVE", "RRC_CONNECTED", "RRC_DORMANT"], a: 1, e: "RRC_INACTIVE 是 5G 新增状态，兼顾省电和快速恢复。" },
  { id: "s3-rrc-2", m: "s3-rrc", t: "single", q: "终端从 RRC_INACTIVE 恢复连接时发送的消息是？", o: ["RRCSetupRequest", "RRCResumeRequest", "RRCReestablishmentRequest", "RRCReconfiguration"], a: 1, e: "INACTIVE 用 RRCResumeRequest 恢复；IDLE 用 RRCSetupRequest 建立；RLF 后用重建请求。" },
  { id: "s3-rrc-3", m: "s3-rrc", t: "multi", q: "关于 RRC_INACTIVE，下列说法正确的有？", o: ["终端在核心网侧仍处于 CM-CONNECTED", "基站保留终端上下文", "恢复连接比从 IDLE 建立更快", "INACTIVE 下可以持续大量收发数据"], a: [0, 1, 2], e: "INACTIVE 下没有专用无线资源，大量数据需要先恢复到 CONNECTED（R17 的 SDT 只支持小数据）。" },
  { id: "s3-rrc-4", m: "s3-rrc", t: "judge", q: "5G 中部分系统消息可以由终端按需请求，而不必一直周期广播。", a: true, e: "除 MIB、SIB1 外，其他 SIB 可以配置为按需（on-demand）发送，节省广播开销。" },

  // ───────── 3.3 随机接入与 RRC 连接建立 ─────────
  { id: "s3-access-1", m: "s3-access", t: "single", q: "四步随机接入中，携带 RRCSetupRequest 的是哪一条？", o: ["Msg1", "Msg2", "Msg3", "Msg4"], a: 2, e: "Msg1 前导，Msg2 RAR，Msg3 RRCSetupRequest，Msg4 竞争解决 + RRCSetup。" },
  { id: "s3-access-2", m: "s3-access", t: "single", q: "随机接入响应（RAR）中用于调整终端上行发送时刻的字段是？", o: ["Temporary C-RNTI", "Timing Advance Command", "RAPID", "UL Grant"], a: 1, e: "TA 命令让终端提前发送，使上行信号对齐基站的接收时间窗。" },
  { id: "s3-access-3", m: "s3-access", t: "multi", q: "关于竞争随机接入的竞争解决，下列说法正确的有？", o: ["在 Msg4 完成", "网络回显 Msg3 中的终端标识", "成功后 Temporary C-RNTI 转为 C-RNTI", "非竞争随机接入同样需要竞争解决"], a: [0, 1, 2], e: "非竞争随机接入使用专用前导，不会冲突，收到 RAR 即完成，不需要竞争解决。" },
  { id: "s3-access-4", m: "s3-access", t: "judge", q: "两步随机接入（2-step RACH）是在 R16 引入的。", a: true, e: "两步 RACH 把 Msg1 + Msg3 合成 MsgA、Msg2 + Msg4 合成 MsgB，缩短接入时延。" },

  // ───────── 3.4 移动性管理 ─────────
  { id: "s3-mobility-1", m: "s3-mobility", t: "single", q: "A3 事件的含义是？", o: ["服务小区好于门限", "服务小区差于门限", "邻区比服务小区好一个偏置", "异系统邻区好于门限"], a: 2, e: "A1：服务小区好于门限；A2：服务小区差于门限；A3：邻区比服务小区好一个偏置；B1：异系统邻区好于门限。" },
  { id: "s3-mobility-2", m: "s3-mobility", t: "single", q: "NSA 组网下，通常用哪个测量事件触发添加 NR 辅节点？", o: ["A1", "A2", "B1", "A6"], a: 2, e: "B1：异系统（NR）邻区好于门限，LTE 主节点据此添加 NR 辅节点。" },
  { id: "s3-mobility-3", m: "s3-mobility", t: "multi", q: "以下哪些调整有助于抑制乒乓切换？", o: ["增大迟滞（Hysteresis）", "增大触发时间（TTT）", "适当增大 A3 偏置", "缩短触发时间（TTT）"], a: [0, 1, 2], e: "迟滞、TTT、偏置越大，切换条件越严格，越不容易来回切；代价是切换可能变晚。" },
  { id: "s3-mobility-4", m: "s3-mobility", t: "judge", q: "条件切换（CHO）在 R16 引入，终端在满足预先配置的条件时自主执行切换。", a: true, e: "CHO 提前下发候选小区和执行条件，避免信号快速变差时切换命令发不下来。" },

  // ───────── 3.5 NG-RAN 架构 ─────────
  { id: "s3-ran-arch-1", m: "s3-ran-arch", t: "single", q: "gNB-CU 与 gNB-DU 之间的接口是？", o: ["Xn", "F1", "E1", "NG"], a: 1, e: "F1 连接 CU 和 DU；E1 连接 CU-CP 和 CU-UP；Xn 连接两个 gNB；NG 连接 gNB 和 5GC。" },
  { id: "s3-ran-arch-2", m: "s3-ran-arch", t: "single", q: "CU-CP 与 CU-UP 之间的接口是？", o: ["F1", "E1", "Xn", "N3"], a: 1, e: "E1 接口用于 CU 内部控制面和用户面分离。" },
  { id: "s3-ran-arch-3", m: "s3-ran-arch", t: "multi", q: "关于 CU / DU 分离，下列说法正确的有？", o: ["PDCP 及以上通常在 CU", "RLC / MAC / PHY 通常在 DU", "F1 接口分为 F1-C 和 F1-U", "CU 必须与 DU 同站部署"], a: [0, 1, 2], e: "CU 可以集中部署在机房，一个 CU 管理多个 DU。" },
  { id: "s3-ran-arch-4", m: "s3-ran-arch", t: "judge", q: "基站之间的 Xn 接口可以用于切换。", a: true, e: "Xn 切换不需要核心网参与准备阶段，完成后通过 Path Switch 通知 AMF。" },

  // ───────── 4.1 服务化架构与网元 ─────────
  { id: "s4-sba-1", m: "s4-sba", t: "single", q: "负责会话管理（含分配 IP、选择 UPF）的网元是？", o: ["AMF", "SMF", "PCF", "UDM"], a: 1, e: "SMF 管会话；AMF 管接入和移动性；PCF 管策略；UDM 管签约数据。" },
  { id: "s4-sba-2", m: "s4-sba", t: "single", q: "5GC 中负责网络功能注册与发现的网元是？", o: ["NRF", "NSSF", "NEF", "AUSF"], a: 0, e: "NRF（网络存储功能）让各网络功能注册自己的服务，并相互发现。" },
  { id: "s4-sba-3", m: "s4-sba", t: "multi", q: "关于 5G 参考点（接口），下列说法正确的有？", o: ["N2：基站与 AMF", "N3：基站与 UPF", "N4：SMF 与 UPF", "N6：UPF 与 AMF"], a: [0, 1, 2], e: "N6 是 UPF 与数据网络（如互联网）之间的接口。" },
  { id: "s4-sba-4", m: "s4-sba", t: "judge", q: "5GC 的服务化接口基于 HTTP/2 和 JSON。", a: true, e: "服务化接口（SBI）采用 HTTP/2 传输、JSON 编码，接口定义用 OpenAPI 描述。" },

  // ───────── 4.2 注册流程 ─────────
  { id: "s4-registration-1", m: "s4-registration", t: "single", q: "初次注册时，终端用于隐藏真实身份 SUPI 的加密标识是？", o: ["5G-GUTI", "SUCI", "IMEI", "5G-S-TMSI"], a: 1, e: "SUCI 是用归属网络公钥加密后的 SUPI，防止空口泄露真实身份。" },
  { id: "s4-registration-2", m: "s4-registration", t: "single", q: "注册成功后网络分配给终端的临时身份是？", o: ["SUPI", "SUCI", "5G-GUTI", "PEI"], a: 2, e: "5G-GUTI 在 Registration Accept 中下发，之后用它（或其缩短形式 5G-S-TMSI）代替 SUPI。" },
  { id: "s4-registration-3", m: "s4-registration", t: "multi", q: "5GS 注册类型包括？", o: ["初始注册", "移动性注册更新", "周期性注册更新", "紧急注册"], a: [0, 1, 2, 3], e: "四种都是 TS 24.501 定义的注册类型。" },
  { id: "s4-registration-4", m: "s4-registration", t: "judge", q: "注册流程中，Registration Request 先由基站解析，再转给 AMF。", a: false, e: "NAS 消息对基站透明：基站把它放进 NGAP Initial UE Message 原样转给 AMF，不解析内容。" },

  // ───────── 4.3 PDU 会话建立 ─────────
  { id: "s4-pdu-1", m: "s4-pdu", t: "single", q: "5G 中相当于 4G APN 的概念是？", o: ["S-NSSAI", "DNN", "QFI", "PDU 会话 ID"], a: 1, e: "DNN（数据网络名称）标识要接入的数据网络，作用类似 APN。" },
  { id: "s4-pdu-2", m: "s4-pdu", t: "single", q: "SMF 通过哪个接口控制 UPF？", o: ["N2", "N3", "N4", "N11"], a: 2, e: "N4 接口使用 PFCP 协议。" },
  { id: "s4-pdu-3", m: "s4-pdu", t: "multi", q: "PFCP 会话中，SMF 下发给 UPF 的规则包括？", o: ["PDR（包检测规则）", "FAR（转发规则）", "QER（QoS 执行规则）", "TAI（跟踪区标识）"], a: [0, 1, 2], e: "PDR 识别包，FAR 决定怎么转发，QER 执行限速等 QoS；TAI 是跟踪区标识，与 PFCP 规则无关。" },
  { id: "s4-pdu-4", m: "s4-pdu", t: "judge", q: "SSC 模式 1 下，PDU 会话锚点 UPF 保持不变，IP 地址也保持不变。", a: true, e: "SSC 模式 2 是“先断后连”，模式 3 是“先连后断”，后两者 IP 地址可能变化。" },

  // ───────── 4.4 5G QoS 模型 ─────────
  { id: "s4-qos-1", m: "s4-qos", t: "single", q: "默认的尽力而为上网业务常用的 5QI 是？", o: ["1", "5", "9", "69"], a: 2, e: "5QI 9 是非 GBR 的默认业务；5QI 1 是语音；5QI 5 是 IMS 信令。" },
  { id: "s4-qos-2", m: "s4-qos", t: "single", q: "VoNR 语音媒体流使用的 5QI 是？", o: ["1", "5", "8", "9"], a: 0, e: "5QI 1 是 GBR 语音业务，包时延预算 100 ms。" },
  { id: "s4-qos-3", m: "s4-qos", t: "multi", q: "关于 5G QoS 模型，下列说法正确的有？", o: ["QoS 控制的粒度是 QoS 流", "用 QFI 标识 QoS 流", "GBR 流有 GFBR 和 MFBR 参数", "一个 PDU 会话只能有一个 QoS 流"], a: [0, 1, 2], e: "一个 PDU 会话可以有多个 QoS 流，其中一个是默认 QoS 流。" },
  { id: "s4-qos-4", m: "s4-qos", t: "judge", q: "5QI 5 用于 IMS 信令，属于非 GBR 类型。", a: true, e: "5QI 5 非 GBR，优先级很高，保证语音呼叫信令及时送达。" },

  // ───────── 4.5 网络切片 ─────────
  { id: "s4-slicing-1", m: "s4-slicing", t: "single", q: "S-NSSAI 中 SST 字段的长度是？", o: ["4 位", "8 位", "16 位", "24 位"], a: 1, e: "SST 8 位，SD 24 位（可选）。" },
  { id: "s4-slicing-2", m: "s4-slicing", t: "single", q: "标准化的 SST 取值 2 代表？", o: ["eMBB", "URLLC", "MIoT", "V2X"], a: 1, e: "SST 1：eMBB；2：URLLC；3：MIoT；4：V2X（后续版本还新增了其他取值）。" },
  { id: "s4-slicing-3", m: "s4-slicing", t: "multi", q: "关于网络切片，下列说法正确的有？", o: ["S-NSSAI = SST + 可选的 SD", "NSSF 参与切片选择", "一个终端可以同时使用多个切片", "SD 是必选字段"], a: [0, 1, 2], e: "SD 用于区分同一类型的多个切片，是可选的。" },
  { id: "s4-slicing-4", m: "s4-slicing", t: "judge", q: "标准化的 SST 取值 3 代表大规模物联网（MIoT）。", a: true, e: "见 TS 23.501 的标准化 SST 取值表。" },

  // ───────── 4.6 5G 安全 ─────────
  { id: "s4-security-1", m: "s4-security", t: "single", q: "终端生成 SUCI 时，用什么来加密 SUPI 中的 MSIN 部分？", o: ["归属网络的公钥", "根密钥 K", "服务网络的私钥", "不加密，直接明文发送"], a: 0, e: "终端用 USIM 中预置的归属网络公钥做 ECIES 加密，只有归属网络（UDM 中的 SIDF）能解密。" },
  { id: "s4-security-2", m: "s4-security", t: "single", q: "5G 中两种主要的鉴权方法是？", o: ["5G-AKA 和 EAP-AKA'", "EPS-AKA 和 CHAP", "PAP 和 CHAP", "TLS 和 IPsec"], a: 0, e: "TS 33.501 定义了 5G-AKA 和 EAP-AKA' 两种主鉴权方法。" },
  { id: "s4-security-3", m: "s4-security", t: "multi", q: "关于 NAS 安全模式命令（Security Mode Command），下列说法正确的有？", o: ["指定 NAS 加密和完整性保护算法", "回放终端的安全能力，防止降级攻击", "本身受完整性保护", "本身已用新密钥加密"], a: [0, 1, 2], e: "安全模式命令只做完整性保护、不加密；终端回复的 Security Mode Complete 才同时加密和完整性保护。" },
  { id: "s4-security-4", m: "s4-security", t: "judge", q: "5G 支持用户面数据的完整性保护。", a: true, e: "这是 5G 相对 4G 新增的安全能力，是否启用由会话的安全策略决定。" },

  // ───────── 5.1 从开机到上网 ─────────
  { id: "s5-e2e-1", m: "s5-e2e", t: "single", q: "手机开机到能上网，下列步骤的正确顺序是？", o: ["小区搜索 → 随机接入 → 注册 → PDU 会话建立", "注册 → 小区搜索 → 随机接入 → PDU 会话建立", "随机接入 → 小区搜索 → PDU 会话建立 → 注册", "小区搜索 → PDU 会话建立 → 注册 → 随机接入"], a: 0, e: "先找到小区并读系统消息，再随机接入建立 RRC 连接，然后注册，最后建 PDU 会话打通用户面。" },
  { id: "s5-e2e-2", m: "s5-e2e", t: "single", q: "终端读取 SIB1 之前，首先要从 PBCH 获取什么？", o: ["MIB", "SIB2", "RAR", "DCI 格式 1_1"], a: 0, e: "MIB 给出系统帧号、CORESET#0 和搜索空间等信息，终端据此才能找到 SIB1。" },
  { id: "s5-e2e-3", m: "s5-e2e", t: "multi", q: "用户面要打通，需要具备哪些条件？", o: ["DRB 已建立", "N3 GTP-U 隧道两端的 TEID 已交换", "终端已分配到 IP 地址", "终端处于 RRC_IDLE 状态"], a: [0, 1, 2], e: "收发数据需要处于连接态；空闲态时基站一侧的 N3 隧道已释放。" },
  { id: "s5-e2e-4", m: "s5-e2e", t: "judge", q: "注册成功就意味着终端已经可以访问互联网。", a: false, e: "注册只解决“网络认识你”，还需要建立 PDU 会话、分配 IP、打通用户面才能上网。" },

  // ───────── 5.2 服务请求与寻呼 ─────────
  { id: "s5-paging-1", m: "s5-paging", t: "single", q: "网络寻呼一个 CM-IDLE 终端时，通常在什么范围内寻呼？", o: ["单个小区", "终端注册的 TAI 列表内", "全网", "单个基站"], a: 1, e: "AMF 只知道终端在哪个 TAI 列表里，所以在这些跟踪区的所有基站上寻呼。" },
  { id: "s5-paging-2", m: "s5-paging", t: "single", q: "空闲态终端收到寻呼后，发起的 NAS 消息是？", o: ["Registration Request", "Service Request", "Attach Request", "PDU Session Establishment Request"], a: 1, e: "被叫时发 Service Request（服务类型为被叫），恢复信令连接和用户面。" },
  { id: "s5-paging-3", m: "s5-paging", t: "multi", q: "关于寻呼，下列说法正确的有？", o: ["终端只在自己的寻呼时机（PO）监听", "核心网寻呼用 5G-S-TMSI 标识终端", "RRC_INACTIVE 终端的寻呼由基站发起（RAN 寻呼）", "寻呼消息必须携带 SUPI"], a: [0, 1, 2], e: "寻呼用临时身份，避免暴露 SUPI。" },
  { id: "s5-paging-4", m: "s5-paging", t: "judge", q: "DRX 周期越长，终端越省电，但被叫接通时延可能越长。", a: true, e: "终端醒来的间隔变长，寻呼要等到下一个寻呼时机才能被收到。" },

  // ───────── 5.3 5G 语音 ─────────
  { id: "s5-voice-1", m: "s5-voice", t: "single", q: "SA 组网下，终端直接在 5G 上通话的方案是？", o: ["CSFB", "EPS Fallback", "VoNR", "VoLTE over EN-DC"], a: 2, e: "VoNR：语音直接承载在 NR 上；EPS Fallback 要回落到 4G 用 VoLTE。" },
  { id: "s5-voice-2", m: "s5-voice", t: "single", q: "EPS Fallback 中，语音最终承载在哪里？", o: ["5G NR", "4G LTE（VoLTE）", "3G", "2G"], a: 1, e: "建立语音时终端从 5G 回落（切换或重定向）到 LTE，由 VoLTE 承载。" },
  { id: "s5-voice-3", m: "s5-voice", t: "multi", q: "VoNR 和 VoLTE 都依赖的有？", o: ["IMS", "SIP 信令", "P-CSCF", "电路域交换"], a: [0, 1, 2], e: "两者都是基于 IMS 的分组域语音，不使用电路域。" },
  { id: "s5-voice-4", m: "s5-voice", t: "judge", q: "EPS Fallback 的接续时延一般比 VoNR 长。", a: true, e: "因为多了 5G 回落到 4G 的过程。" },

  // ───────── 6.1 关键 KPI 与无线测量 ─────────
  { id: "s6-kpi-1", m: "s6-kpi", t: "single", q: "反映下行信号质量（考虑了干扰和噪声）的测量量是？", o: ["SS-RSRP", "SS-SINR", "PRB 利用率", "TA"], a: 1, e: "RSRP 只反映信号强度；SINR 是信号与干扰加噪声之比，反映质量。" },
  { id: "s6-kpi-2", m: "s6-kpi", t: "single", q: "以下属于“接入类”KPI 的是？", o: ["RRC 建立成功率", "无线掉线率", "切换成功率", "下行用户平均速率"], a: 0, e: "接入类看用户能不能连上；掉线率属于保持类；切换成功率属于移动性类；速率属于业务感知类。" },
  { id: "s6-kpi-3", m: "s6-kpi", t: "multi", q: "以下属于“保持与移动性”类 KPI 的有？", o: ["无线掉线率", "切换成功率", "RRC 重建比例", "小区 PCI"], a: [0, 1, 2], e: "PCI 是小区配置参数，不是 KPI。" },
  { id: "s6-kpi-4", m: "s6-kpi", t: "judge", q: "SS-RSRP 是 SSB 参考信号的平均接收功率，单位通常为 dBm。", a: true, e: "按 TS 38.215 定义，是承载 SSS 的资源单元上的平均功率。" },

  // ───────── 6.2 覆盖与干扰优化 ─────────
  { id: "s6-coverage-1", m: "s6-coverage", t: "single", q: "中频 TDD 网络在覆盖边缘，通常先受限的是？", o: ["下行", "上行", "广播信道", "寻呼"], a: 1, e: "手机发射功率（约 23–26 dBm）远小于基站，且 TDD 上行时隙少，上行覆盖往往是短板。" },
  { id: "s6-coverage-2", m: "s6-coverage", t: "single", q: "多发生在春夏季、使远方基站的下行信号干扰本地 TDD 上行的是？", o: ["大气波导干扰", "互调干扰", "阻塞干扰", "雷达干扰"], a: 0, e: "大气波导让信号异常远距离传播，远端基站的下行信号延迟到达，落进本地上行时隙。" },
  { id: "s6-coverage-3", m: "s6-coverage", t: "multi", q: "解决越区覆盖的常用手段有？", o: ["增大天线下倾角", "调整方位角", "降低发射功率", "把邻区配置数加到最大"], a: [0, 1, 2], e: "越区覆盖要从“收缩覆盖范围”入手；多配邻区不能解决根本问题。" },
  { id: "s6-coverage-4", m: "s6-coverage", t: "judge", q: "重叠覆盖严重会导致 SINR 下降。", a: true, e: "多个小区信号强度接近时，互相成为干扰，SINR 变差。" },

  // ───────── 6.3 典型问题分析方法 ─────────
  { id: "s6-troubleshoot-1", m: "s6-troubleshoot", t: "single", q: "终端连续收到 N310 次“失步”指示后启动的定时器是？", o: ["T300", "T304", "T310", "T311"], a: 2, e: "T310 超时仍未恢复同步，就判定无线链路失败（RLF）。T304 是切换定时器，T311 用于重建时的小区选择。" },
  { id: "s6-troubleshoot-2", m: "s6-troubleshoot", t: "single", q: "发生无线链路失败（RLF）后，终端尝试恢复连接的流程是？", o: ["RRC 重建（Reestablishment）", "重新注册", "PDU 会话建立", "小区重选"], a: 0, e: "终端选一个合适小区发 RRCReestablishmentRequest，成功则业务不中断。" },
  { id: "s6-troubleshoot-3", m: "s6-troubleshoot", t: "multi", q: "问题定界时常用的数据来源有？", o: ["路测日志", "基站信令跟踪", "性能计数器", "用户投诉的时间和位置"], a: [0, 1, 2, 3], e: "多种数据交叉印证，才能判断问题出在无线、传输还是核心网。" },
  { id: "s6-troubleshoot-4", m: "s6-troubleshoot", t: "judge", q: "切换失败后终端一定会掉线。", a: false, e: "切换失败后终端会尝试 RRC 重建，重建成功就不会掉线。" },

  // ───────── 7.1 R16 / R17 关键增强 ─────────
  { id: "s7-r16-r17-1", m: "s7-r16-r17", t: "single", q: "“接入回传一体化”的缩写是？", o: ["IAB", "NTN", "TSN", "NR-U"], a: 0, e: "IAB：Integrated Access and Backhaul，基站之间用 NR 无线回传。" },
  { id: "s7-r16-r17-2", m: "s7-r16-r17", t: "single", q: "面向可穿戴设备、工业传感器等中端物联网的轻量化终端技术是？", o: ["RedCap", "NB-IoT", "eMTC", "URLLC"], a: 0, e: "RedCap 降低了带宽和天线数要求，成本和功耗介于 eMBB 终端和 NB-IoT 之间。" },
  { id: "s7-r16-r17-3", m: "s7-r16-r17", t: "multi", q: "R17 引入的特性有？", o: ["RedCap", "NTN 卫星接入", "FR2-2（52.6–71 GHz）", "NSA Option 3x"], a: [0, 1, 2], e: "NSA Option 3x 是 R15 就有的部署方式。" },
  { id: "s7-r16-r17-4", m: "s7-r16-r17", t: "judge", q: "NR-U 是指在非授权频谱上运行 NR。", a: true, e: "NR-U 在 R16 引入，需要遵守先听后说（LBT）等规则。" },

  // ───────── 7.2 5G-Advanced 与 6G ─────────
  { id: "s7-advanced-1", m: "s7-advanced", t: "single", q: "ITU 对 6G 的正式称呼是？", o: ["IMT-2020", "IMT-2030", "IMT-Advanced", "LTE-A Pro"], a: 1, e: "IMT-2020 对应 5G，IMT-2030 对应 6G。" },
  { id: "s7-advanced-2", m: "s7-advanced", t: "single", q: "把感知能力（如测距、测速、成像）融合进通信网络的方向，通常称为？", o: ["通感一体化", "载波聚合", "双连接", "波束扫描"], a: 0, e: "通感一体化（ISAC）是 5G-Advanced 和 6G 的重点方向之一。" },
  { id: "s7-advanced-3", m: "s7-advanced", t: "multi", q: "5G-Advanced（R18 及以后）的研究方向包括？", o: ["AI / ML 用于空口", "网络节能", "XR 增强", "取消 OFDM 波形"], a: [0, 1, 2], e: "5G-Advanced 仍以 OFDM 为基础波形。" },
  { id: "s7-advanced-4", m: "s7-advanced", t: "judge", q: "R18 开展了 AI / ML 在空口的研究，用例包括 CSI 反馈、波束管理和定位。", a: true, e: "这三个是 R18 AI/ML 空口研究的代表性用例。" }
];
