// LTE 专有术语（补充 data/glossary.js 中尚未收录的条目）
// 格式同 data/glossary.js：t / en / zh / d / c / alias（可选），另加 lm：最相关的 LTE 路线模块 id
module.exports = [
  // ───────── 基础 / 架构 ─────────
  { t: "EPS", en: "Evolved Packet System", zh: "演进分组系统", c: "架构", lm: "lte-evolution", d: "4G 系统的整体名称，由终端、无线接入网 E-UTRAN 和核心网 EPC 组成，是纯分组域系统，没有电路域。" },
  { t: "E-UTRAN", en: "Evolved UMTS Terrestrial Radio Access Network", zh: "演进的 UMTS 陆地无线接入网", c: "架构", lm: "lte-arch", d: "LTE 的无线接入网，只有 eNB 一种网元（取消了 3G 的 RNC），eNB 之间用 X2 互联，通过 S1 接入 EPC。" },
  { t: "S1", zh: "S1 接口", c: "架构", lm: "lte-arch", alias: ["S1-MME", "S1-U"], d: "eNB 与 EPC 之间的接口：控制面 S1-MME 连 MME（S1AP 协议），用户面 S1-U 连 SGW（GTP-U 隧道）。" },
  { t: "X2", zh: "X2 接口", c: "架构", lm: "lte-arch", d: "eNB 之间的接口（X2AP / GTP-U），用于切换准备、数据前转和干扰协调等。有 X2 时切换不必经过 MME 中转。" },
  { t: "OFDMA", en: "Orthogonal Frequency Division Multiple Access", zh: "正交频分多址", c: "基础", lm: "lte-ofdma", d: "基于 OFDM 的多址方式，把不同子载波和时间分给不同用户。LTE 下行使用 OFDMA，子载波间隔固定 15 kHz（MBSFN 另有 7.5 kHz）。" },
  { t: "SC-FDMA", en: "Single Carrier Frequency Division Multiple Access", zh: "单载波频分多址", c: "基础", lm: "lte-ofdma", d: "LTE 上行多址方式，先做 DFT 扩展再做 OFDM 调制（也叫 DFT-s-OFDM），峰均比低，有利于终端功放效率和上行覆盖。" },
  { t: "EARFCN", en: "E-UTRA Absolute Radio Frequency Channel Number", zh: "E-UTRA 绝对无线频点号", c: "无线", lm: "lte-bands", d: "用一个整数表示 LTE 载波中心频率，步进 100 kHz。下行频率 = 频段起始频率 + 0.1 ×（EARFCN − 该频段偏移量）。" },
  { t: "DwPTS", en: "Downlink Pilot Time Slot", zh: "下行导频时隙", c: "无线", lm: "lte-frame", d: "TDD 特殊子帧的下行部分，可承载 PSS、PDCCH 和少量 PDSCH。特殊子帧由 DwPTS、GP、UpPTS 三段组成，配比按符号数表示（如 10:2:2）。" },
  { t: "UpPTS", en: "Uplink Pilot Time Slot", zh: "上行导频时隙", c: "无线", lm: "lte-frame", d: "TDD 特殊子帧的上行部分，只有 1–2 个符号（新版本可扩展），可发 SRS 或短格式 PRACH（格式 4）。紧跟 GP 之后，最易受远端干扰。" },

  // ───────── 物理层 ─────────
  { t: "CRS", en: "Cell-specific Reference Signal", zh: "小区专用参考信号", c: "无线", lm: "lte-dl", d: "LTE 下行全带宽、每个子帧都发送的参考信号，用于 RSRP 测量、信道估计和解调（TM1–TM6）。频域位置随 PCI mod 6 偏移，是模 3 干扰的根源。" },
  { t: "PCFICH", en: "Physical Control Format Indicator Channel", zh: "物理控制格式指示信道", c: "无线", lm: "lte-dl", d: "位于每个子帧第一个 OFDM 符号，承载 CFI，告诉终端本子帧 PDCCH 占用几个符号（通常 1–3 个，窄带宽时 2–4 个）。" },
  { t: "PHICH", en: "Physical Hybrid-ARQ Indicator Channel", zh: "物理 HARQ 指示信道", c: "无线", lm: "lte-dl", d: "下行信道，承载基站对上行 PUSCH 的 ACK / NACK 反馈。5G NR 取消了 PHICH，改由 DCI 调度重传。" },
  { t: "CCE", en: "Control Channel Element", zh: "控制信道单元", c: "无线", lm: "lte-dl", d: "PDCCH 的资源分配单位，1 个 CCE = 9 个 REG = 36 个 RE。聚合等级 1 / 2 / 4 / 8，信道越差需要的 CCE 越多。" },
  { t: "SIB2", en: "System Information Block Type 2", zh: "系统信息块 2", c: "无线", lm: "lte-cellsearch", d: "LTE 中承载公共无线资源配置的系统消息：RACH / PRACH、PUCCH / PUSCH、上行功控参数、定时器（T300、T310 等）和接入控制（AC barring）。" },
  { t: "TM", en: "Transmission Mode", zh: "传输模式", c: "无线", lm: "lte-mimo", d: "LTE 下行多天线传输方式的编号（TM1–TM10），如 TM2 发射分集、TM3 开环空间复用、TM4 闭环空间复用、TM7/8 波束赋形。" },

  // ───────── 标识 ─────────
  { t: "IMSI", en: "International Mobile Subscriber Identity", zh: "国际移动用户识别码", c: "核心网", lm: "lte-ids", d: "存在 SIM 卡里的永久用户身份，由 MCC + MNC + MSIN 组成，最长 15 位。LTE 中首次附着时可能明文上报，5G 改为加密的 SUCI。" },
  { t: "GUTI", en: "Globally Unique Temporary Identity", zh: "全球唯一临时标识", c: "核心网", lm: "lte-ids", d: "MME 分配给终端的临时身份，由 GUMMEI（MCC + MNC + MMEGI + MMEC）和 32 bit 的 M-TMSI 组成，用来代替 IMSI 保护用户隐私。" },
  { t: "S-TMSI", en: "SAE Temporary Mobile Subscriber Identity", zh: "SAE 临时移动用户标识", c: "核心网", lm: "lte-ids", d: "GUTI 的缩短形式，由 MMEC（8 bit）和 M-TMSI（32 bit）组成，共 40 bit，用于寻呼和 RRC 连接建立。" },
  { t: "TAC", en: "Tracking Area Code", zh: "跟踪区码", c: "核心网", lm: "lte-ids", d: "LTE 中 16 bit 的跟踪区编号（5G 为 24 bit），在 SIB1 中广播，与 PLMN 一起组成 TAI。TAC 规划决定寻呼范围和 TAU 次数。" },
  { t: "ECGI", en: "E-UTRAN Cell Global Identifier", zh: "E-UTRAN 小区全球标识", c: "架构", lm: "lte-ids", d: "全球唯一的小区标识，由 PLMN 和 28 bit 的 ECI 组成；宏站 ECI 常见划分为 20 bit eNB ID + 8 bit 小区号。PCI 会复用，ECGI 不会。" },

  // ───────── 核心网 ─────────
  { t: "S6a", zh: "S6a 接口", c: "核心网", lm: "lte-epc", d: "MME 与 HSS 之间的 Diameter 接口，用于获取鉴权向量、位置更新和下载签约数据。" },
  { t: "S11", zh: "S11 接口", c: "核心网", lm: "lte-epc", d: "MME 与 SGW 之间的控制面接口（GTPv2-C），用于创建、修改、删除会话和承载。" },
  { t: "S5", zh: "S5 / S8 接口", c: "核心网", lm: "lte-epc", alias: ["S8"], d: "SGW 与 PGW 之间的接口，有控制面和用户面。同一运营商网内叫 S5，漫游时拜访地 SGW 连归属地 PGW 叫 S8。" },
  { t: "SGs", zh: "SGs 接口", c: "核心网", lm: "lte-csfb", d: "MME 与 2G/3G MSC/VLR 之间的接口（SGsAP），用于联合附着、CS 寻呼转发和短信，是 CSFB 的基础。" },
  { t: "Gx", zh: "Gx 接口", c: "核心网", lm: "lte-pcc", d: "PCRF 与 PGW 中 PCEF 之间的 Diameter 接口，PCRF 通过它下发 QoS 和计费策略。" },
  { t: "MSC", en: "Mobile Switching Center", zh: "移动交换中心", c: "核心网", lm: "lte-csfb", d: "2G/3G 电路域核心网的交换节点，负责语音呼叫接续。CSFB 中通过 SGs 与 MME 协作，SRVCC 中通过 Sv 接口与 MME 协作。" },
  { t: "TAU", en: "Tracking Area Update", zh: "跟踪区更新", c: "核心网", lm: "lte-tau", d: "终端进入不在 TAI list 中的跟踪区，或周期性 TAU 定时器到期时，向 MME 更新位置的流程。" },
  { t: "T3412", zh: "周期性 TAU 定时器", c: "核心网", lm: "lte-tau", d: "MME 在附着 / TAU 接受中下发，到期后空闲态终端发起周期性 TAU，让网络确认它仍可达。默认值为 54 分钟。" },
  { t: "EPS-AKA", en: "EPS Authentication and Key Agreement", zh: "EPS 鉴权与密钥协商", c: "核心网", lm: "lte-security", alias: ["EPS AKA"], d: "LTE 的鉴权机制：HSS 生成鉴权向量，MME 比对终端返回的 RES 与 XRES，实现双向鉴权并推导出 KASME。" },
  { t: "KASME", zh: "接入安全管理实体密钥", c: "核心网", lm: "lte-security", d: "EPS-AKA 成功后 MME 和终端共同持有的 256 bit 根密钥，由 CK / IK 和服务网络标识推导，NAS 和 AS 层的密钥都由它派生。" },
  { t: "QCI", en: "QoS Class Identifier", zh: "QoS 等级标识", c: "核心网", lm: "lte-bearer", d: "LTE 承载的 QoS 类别编号，对应一组标准化的资源类型、优先级、时延和丢包要求。如 QCI 1 为 VoLTE 语音（GBR）、QCI 5 为 IMS 信令、QCI 9 常用于默认承载。5G 对应 5QI。" },
  { t: "E-RAB", en: "E-UTRAN Radio Access Bearer", zh: "E-UTRAN 无线接入承载", c: "核心网", lm: "lte-bearer", d: "终端到 SGW 之间的承载，由空口无线承载（DRB）和 S1 承载串接而成，与 EPS 承载一一对应。E-RAB 建立成功率和掉线率是核心 KPI。" },
  { t: "TFT", en: "Traffic Flow Template", zh: "业务流模板", c: "核心网", lm: "lte-bearer", d: "一组包过滤器（IP 地址、端口、协议等），决定哪些数据包走哪个专用承载。上行 TFT 在终端执行，下行 TFT 在 PGW 执行。" },

  // ───────── 语音与互操作 ─────────
  { t: "CSFB", en: "Circuit Switched Fallback", zh: "电路域回落", c: "业务", lm: "lte-csfb", d: "LTE 早期的语音方案：打电话或来电时，网络把终端从 LTE 送回 2G/3G 电路域完成通话，结束后再返回 LTE。需要联合附着和 SGs 接口。" },
  { t: "LAU", en: "Location Area Update", zh: "位置区更新", c: "核心网", lm: "lte-csfb", d: "2G/3G 电路域的位置更新流程。CSFB 回落后若所在位置区与登记的不一致，要先做 LAU，接续时延变长。" },
  { t: "SRVCC", en: "Single Radio Voice Call Continuity", zh: "单射频语音呼叫连续性", c: "业务", lm: "lte-srvcc", d: "VoLTE 通话中终端离开 LTE 覆盖时，把 IMS 语音切换到 2G/3G 电路域继续通话的技术，MME 通过 Sv 接口请求 MSC 准备资源。" },
  { t: "eSRVCC", en: "enhanced SRVCC", zh: "增强型 SRVCC", c: "业务", lm: "lte-srvcc", d: "Rel-10 引入的 SRVCC 增强，在服务网络中设置 ATCF / ATGW 作为媒体锚点，切换时不必回到归属 IMS 改路由，语音中断时间更短。" },

  // ───────── 测量、规划与优化 ─────────
  { t: "A2", zh: "A2 事件", c: "网优", lm: "lte-meas", d: "服务小区质量低于门限时触发的测量事件，常用来启动异频 / 异系统测量（配置测量间隙）或触发盲重定向。" },
  { t: "B2", zh: "B2 事件", c: "网优", lm: "lte-meas", d: "服务小区低于门限 1 且异系统邻区高于门限 2 时触发，常用于 LTE 到 2G/3G 的切换，如 eSRVCC。" },
  { t: "CIO", en: "Cell Individual Offset", zh: "小区个体偏置", c: "网优", lm: "lte-mobility-opt", d: "针对单个邻区配置的测量偏置（cellIndividualOffset），加在邻区测量值上，只调这一对小区的切换难易，不影响其他邻区。" },
  { t: "ANR", en: "Automatic Neighbour Relation", zh: "自动邻区关系", c: "网优", lm: "lte-params", d: "SON 功能：终端上报未知 PCI 时，基站让终端读取该小区的 ECGI，自动把它加入邻区关系表，减少邻区漏配。" },
  { t: "ICIC", en: "Inter-Cell Interference Coordination", zh: "小区间干扰协调", c: "无线", lm: "lte-coverage", d: "相邻小区协调边缘用户使用的频率资源或功率，降低小区边缘同频干扰。Rel-10 的 eICIC 用几乎空白子帧（ABS）解决宏微异构网干扰。" },
  { t: "CoMP", en: "Coordinated Multi-Point", zh: "多点协作传输", c: "无线", lm: "lte-ca", d: "Rel-11 引入，多个站点或小区协作为同一用户收发（联合传输、协作调度 / 波束等），改善小区边缘性能，对回传时延要求高。" },

  // ───────── 演进 ─────────
  { t: "NB-IoT", en: "Narrowband Internet of Things", zh: "窄带物联网", c: "业务", lm: "lte-iot", d: "Rel-13 引入的低功耗广覆盖物联网技术，只占 180 kHz，支持独立、保护带、带内三种部署方式，适合水表、烟感等低速率静止终端。" },
  { t: "eMTC", en: "enhanced Machine Type Communication", zh: "增强型机器类通信", c: "业务", lm: "lte-iot", alias: ["LTE-M"], d: "Rel-13 引入的 LTE 物联网技术，占 1.4 MHz（6 个 PRB），速率高于 NB-IoT，支持移动性和语音，适合可穿戴、物流追踪等。" },
  { t: "DSS", en: "Dynamic Spectrum Sharing", zh: "动态频谱共享", c: "无线", lm: "lte-refarm", d: "LTE 与 NR 在同一载波上按需动态分配资源，NR 需避开 LTE 的 CRS 等常驻信号，用于 4G 频谱平滑向 5G 过渡。" }
];
