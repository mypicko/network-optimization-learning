// 阶段 6 网络规划与优化（网优方向）
module.exports = {
  id: "L6",
  title: "网络规划与优化",
  track: "网优方向",
  summary: "从链路预算、PCI / PRACH / TAC 参数规划，到 KPI 体系与覆盖、干扰、切换、接入、速率、VoLTE 的专题优化，建立 LTE 网优的完整方法。",
  modules: [
    {
      id: "lte-plan",
      title: "规划与链路预算",
      hours: 4,
      tools: ["budget"],
      goals: [
        "能按上下行分别列出 LTE 链路预算的各项增益、损耗和余量，算出 MAPL",
        "会由基站总功率换算 RS 功率（RE 功率），并据此做下行 RSRP 覆盖预算",
        "理解传播模型选择与校正、覆盖半径与站间距的推算方法",
        "能从覆盖和容量两个角度估算站点数，并说清两者取大的道理"
      ],
      concepts: ["MAPL", "RS 功率（RE 功率）", "接收灵敏度", "阴影衰落余量", "穿透损耗", "干扰余量", "Okumura-Hata / COST231-Hata", "传播模型校正（CW 测试）", "上下行平衡"],
      specs: [
        { id: "TR 36.942", note: "射频系统场景与传播模型" },
        { id: "TS 36.101", note: "终端射频指标，功率等级 3 为 23 dBm" },
        { id: "TS 36.104", note: "基站射频指标" }
      ],
      quiz: [
        {
          q: "20 MHz 带宽、单端口总功率 46 dBm 的 LTE 小区，RS 功率大约是多少？为什么下行覆盖要用 RS 功率而不是总功率来算？",
          a: "20 MHz 有 1200 个子载波，平均每 RE 功率约 46 − 10·lg1200 ≈ 46 − 30.8 = 15.2 dBm（假设 RS 与数据 RE 等功率，示例）。终端测量的 RSRP 是单个 CRS RE 的功率，覆盖门限也按 RSRP 定，所以下行覆盖预算要从 RS 功率出发，带宽越大同样总功率下 RS 功率越低。"
        },
        {
          q: "为什么 LTE 规划常说“上行受限”？有哪些手段改善上行覆盖？",
          a: "终端只有约 23 dBm，远低于基站，且上行要在多个 PRB 上铺开功率，所以多数场景上行先到极限。改善手段有：边缘用户少分 PRB 提升单 PRB 功率谱密度、基站多天线接收分集（4R 等）、降低馈线损耗（RRU 上塔）、VoLTE 用 TTI bundling，以及选用低频段。"
        }
      ],
      practice: "用工具箱的链路预算计算器，分别按 1.8 GHz 和 2.6 GHz、室外覆盖室内场景做一次上行预算（参数自拟并标注示例），比较 MAPL 差异，再用 COST231-Hata 公式估算两者的覆盖半径比。"
    },
    {
      id: "lte-params",
      title: "PCI、邻区、PRACH 与 TAC 规划",
      hours: 4,
      goals: [
        "掌握 LTE 504 个 PCI 的结构，理解模 3、模 6、模 30 规则背后的物理意义",
        "能做无冲突、无混淆、模 3 错开的 PCI 规划，并会检查复用距离",
        "会根据小区半径选择 PRACH 零相关区配置并计算所需根序列数",
        "理解邻区规划原则、ANR 的作用，以及 TAC / TA List 边界的划分方法"
      ],
      concepts: ["PCI = 3×组号 + 组内号", "PCI 冲突与混淆", "模 3（PSS、多端口 CRS）", "模 6（CRS 频域偏移）", "模 30（上行 DMRS 序列组）", "根序列与 Ncs", "邻区漏配 / 冗余", "ANR", "TAC 与 TA List"],
      specs: [
        { id: "TS 36.211", note: "§6.11 同步信号、§6.10 参考信号、§5.7 PRACH" },
        { id: "TS 36.300", note: "ANR 等 SON 功能" },
        { id: "TS 23.401", note: "跟踪区与 TA List" }
      ],
      quiz: [
        {
          q: "同站三个扇区为什么通常分配同一 PCI 组内的三个 PCI？",
          a: "同一组内三个 PCI 的模 3 值分别为 0、1、2，正好错开 PSS 序列，2 端口及以上时 CRS 的频域位置也错开，避免同站相邻扇区间 CRS 互相碰撞、影响 RS-SINR 和信道估计。"
        },
        {
          q: "PCI 冲突和 PCI 混淆有什么区别？",
          a: "冲突是两个同频相邻（覆盖有重叠）的小区用了相同 PCI，终端无法区分，严重时同步和解调都会出错。混淆是某小区的两个同频邻区 PCI 相同，测量报告只带 PCI，基站不知道终端报的是哪一个，可能切到错误小区导致切换失败。"
        },
        {
          q: "小区半径越大，PRACH 需要的根序列数为什么越多？",
          a: "半径越大，往返时延越大，需要的循环移位间隔 Ncs 越大；长度 839 的 ZC 根序列能生成的前导数约为 ⌊839/Ncs⌋，不够 64 个时要用多个连续根序列补齐，所以需要的根序列数增加，相邻小区根序列复用也越紧张。"
        }
      ],
      practice: "画一个 7 站 21 扇区的蜂窝示意图，自己分配 PCI（要求同站模 3 错开、相邻小区无冲突无混淆），并按假设的小区半径选择 Ncs、算出每个小区占用的根序列数。"
    },
    {
      id: "lte-kpi",
      title: "KPI 体系与无线测量",
      hours: 4,
      tools: ["kpi"],
      goals: [
        "能说清 RSRP、RSRQ、RSSI、SINR 的定义、上报范围和相互关系",
        "掌握接入性、保持性、移动性、业务量与资源、语音五大类 KPI 及常用公式",
        "理解计数器、统计口径与 MR / MDT 数据的来源和局限",
        "会用“全网 → TOP 小区 → 时段 → 原因值”的思路从 KPI 定位问题"
      ],
      concepts: ["RSRP（−140 ~ −44 dBm，映射 0–97）", "RSRQ = N×RSRP / RSSI", "RS-SINR", "无线接通率", "E-RAB 掉线率", "切换成功率", "PRB 利用率", "MR 覆盖率", "TOP N 小区分析"],
      specs: [
        { id: "TS 36.214", note: "物理层测量定义（RSRP、RSRQ、RSSI、上行干扰功率）" },
        { id: "TS 36.133", note: "测量精度与上报映射" },
        { id: "TS 32.425", note: "E-UTRAN 性能测量（计数器）" },
        { id: "TS 32.450", note: "E-UTRAN KPI 定义" }
      ],
      quiz: [
        {
          q: "RSRP 很好但 RSRQ 很差，可能是什么情况？",
          a: "RSRQ = N×RSRP / RSSI，RSSI 包含本小区负荷、邻区信号、干扰和噪声。RSRP 好而 RSRQ 差，说明 RSSI 很大：要么是本小区或邻区负荷高，要么是重叠覆盖或外部干扰强。需要结合 SINR、邻区电平和 PRB 利用率区分是“忙”还是“乱”。"
        },
        {
          q: "无线接通率通常怎么计算？为什么要分两段？",
          a: "常见口径是 RRC 连接建立成功率 × E-RAB 建立成功率。两段分别对应空口信令连接和业务承载建立，失败原因和责任环节不同：前者多与覆盖、干扰、PRACH 和拥塞有关，后者还涉及安全模式、核心网和传输，分开统计才能定界。"
        }
      ],
      practice: "用手机工程模式（或路测软件）在室外、室内、电梯口三处各记录 10 次 RSRP、RSRQ、SINR，填成表格，分析三个量的变化规律，并用 RSRP 上报映射关系把其中一个 dBm 值换算成上报索引。"
    },
    {
      id: "lte-coverage",
      title: "覆盖与干扰优化",
      hours: 5,
      goals: [
        "能识别弱覆盖、越区覆盖、重叠覆盖、无主导小区四类覆盖问题并给出调整手段",
        "理解 CRS 干扰与网络负荷的关系，解释模 3 干扰在不同负荷下的表现",
        "会用上行 PRB 级干扰功率判断底噪抬升，区分内部与外部干扰",
        "掌握 TDD 大气波导远端干扰的特征、成因与规避措施"
      ],
      concepts: ["弱覆盖 / 越区覆盖", "重叠覆盖度", "无主导小区", "CRS 干扰与负荷", "PA / PB 功率配置", "上行底噪抬升", "外部干扰排查", "大气波导远端干扰", "GP 与特殊子帧配置"],
      specs: [
        { id: "TS 36.214", note: "上行接收干扰功率（Received Interference Power）测量" },
        { id: "TS 36.213", note: "§5.2 下行功率分配（PA / PB）" },
        { id: "TS 36.211", note: "CRS 结构、TDD 特殊子帧配置" }
      ],
      quiz: [
        {
          q: "为什么说空载时 LTE 网络也有干扰？",
          a: "LTE 的 CRS 不论有没有用户都持续全带宽发送。邻区即使空载，其 CRS 也会落到本小区的 CRS 或数据 RE 上，形成干扰。所以 LTE 的干扰水平和重叠覆盖关系很大，负荷升高后邻区 PDSCH 也开始发，干扰进一步加重。"
        },
        {
          q: "TDD 大气波导远端干扰有哪些典型特征？",
          a: "多在春夏季、夜间到清晨出现，日出后减弱；大片区域、大量小区同时出现上行底噪抬升；干扰集中在 UpPTS 和上行子帧靠前的符号，越往后越轻，呈“斜坡”状；受扰站往往在沿海、平原或湖泊附近，干扰源可能在上百公里外。"
        }
      ],
      practice: "设想一个“RSRP 普遍 −85 dBm、SINR 却在 0 dB 附近”的路段（示例），写一份分析思路：要看哪些数据（扫频、邻区电平、工参、PCI 模 3），可能的根因，以及对应的天馈和参数调整方案。"
    },
    {
      id: "lte-mobility-opt",
      title: "切换与掉线优化",
      hours: 4,
      goals: [
        "掌握 A3、A5 事件公式中各参数的作用，以及调整方向对切换的影响",
        "能区分过晚切换、过早切换、切换到错误小区三类问题并给出对策",
        "理解 RLF 判定（T310、N310、N311）与 RRC 重建，能分类分析掉线原因",
        "会用“掉线点前后的测量报告和信令”还原掉线过程"
      ],
      concepts: ["A3：Off / Hys / TTT", "CIO（Ocn）", "A5 双门限", "过晚 / 过早 / 错误小区切换", "乒乓切换", "MRO", "RLF 与 T310 / N310", "RRC 重建", "E-RAB 异常释放"],
      specs: [
        { id: "TS 36.331", note: "§5.5.4 测量上报触发、§5.3.11 无线链路失败" },
        { id: "TS 36.300", note: "移动性鲁棒性优化（MRO）" },
        { id: "TS 36.133", note: "无线链路监测相关要求" }
      ],
      quiz: [
        {
          q: "某小区切换失败多为“过晚切换”，可以怎么调参数？",
          a: "让切换更早触发：对目标邻区调大 CIO、适当减小 A3 偏置或迟滞、缩短 TTT。同时要先排除邻区漏配和覆盖问题，并观察乒乓切换是否随之增加，调整幅度一般每次 1–2 dB 或一档 TTT，逐步验证。"
        },
        {
          q: "终端在掉线前未收到切换命令，常见原因有哪些？",
          a: "可能是邻区漏配导致根本没触发测量上报；测量报告上行发不出去（上行弱覆盖或干扰）；基站收到报告但切换准备失败（目标小区准入拒绝、X2 故障）；或者切换命令下发时下行质量已太差，终端收不到 RRCConnectionReconfiguration。"
        }
      ],
      practice: "画出 A3 事件的触发示意图（横轴时间、纵轴 RSRP，标出 Off、Hys、TTT），然后分别画出 CIO +3 dB 和 TTT 从 320 ms 改为 640 ms 后触发点如何移动（数值为示例）。"
    },
    {
      id: "lte-access-opt",
      title: "接入与速率优化",
      hours: 4,
      goals: [
        "能把接入失败分成 RRC、S1 信令、E-RAB 三段，并按每段的原因值排查",
        "理解 Msg1–Msg5 各步失败的典型原因与对应参数",
        "掌握影响下行速率的因素：CQI、RANK、MCS、BLER、PRB 利用率、调度用户数、CA",
        "会用速率拆解公式定位低速率的瓶颈"
      ],
      concepts: ["接入分段", "Msg2 / Msg3 / Msg5 失败", "RRC Connection Reject", "初始上下文建立失败", "CQI → MCS → TBS", "RANK 与传输模式", "BLER 目标", "PRB 利用率与调度份额", "载波聚合"],
      specs: [
        { id: "TS 36.321", note: "§5.1 随机接入过程" },
        { id: "TS 36.213", note: "§7.1.7 MCS 与 TBS 确定、§7.2 CSI 上报" },
        { id: "TS 36.306", note: "终端类别与能力" }
      ],
      flow: `sequenceDiagram
    participant UE
    participant eNB
    participant MME
    UE->>eNB: Msg1 前导
    eNB->>UE: Msg2 RAR
    UE->>eNB: Msg3 RRCConnectionRequest
    eNB->>UE: Msg4 RRCConnectionSetup
    UE->>eNB: Msg5 RRCConnectionSetupComplete
    Note over UE,eNB: 以上为 RRC 段
    eNB->>MME: Initial UE Message
    MME->>eNB: Initial Context Setup Request
    Note over eNB,MME: S1 信令段
    eNB->>UE: SecurityModeCommand / RRCConnectionReconfiguration
    UE->>eNB: SecurityModeComplete / RRCConnectionReconfigurationComplete
    eNB->>MME: Initial Context Setup Response
    Note over UE,MME: E-RAB 建立完成`,
      quiz: [
        {
          q: "RRC 建立失败中“基站发了 RRCConnectionSetup 但收不到 Setup Complete”占比高，说明什么？",
          a: "下行已经能把 Msg4 送到终端（或至少基站发出了），问题多在上行：终端的 Msg5 发不上来，常见于上行弱覆盖、上行干扰（底噪抬升）或上下行覆盖不平衡。应查小区上行干扰功率、上行功控参数和覆盖边缘的 RSRP 分布。"
        },
        {
          q: "一个用户 RSRP 很好、SINR 也不错，但下载速率低，可能有哪些原因？",
          a: "可从“每 PRB 效率 × 分到的 PRB 数”拆：效率侧看 RANK 是否长期为 1、MCS 和 BLER 是否正常；资源侧看小区 PRB 利用率和同时调度的用户数是否很高、是否支持 CA；此外还要排除终端能力、传输带宽、核心网或服务器侧（TCP 窗口、服务器限速）的瓶颈。"
        }
      ],
      practice: "用手机测速软件在同一地点分别于闲时和忙时测速 5 次，同时用工程模式记录 RSRP、SINR、RANK（如可显示）和 CA 状态，用速率拆解公式解释两组结果的差别。"
    },
    {
      id: "lte-volte-opt",
      title: "VoLTE 语音质量优化",
      hours: 4,
      goals: [
        "掌握 VoLTE 接通率、掉话率、MOS、eSRVCC 切换比例与成功率等核心指标的含义",
        "理解影响 MOS 的因素：丢包、抖动、时延、编码速率，以及 RTP 指标的分析方法",
        "知道 TTI bundling、RoHC、SPS、DRX 等 VoLTE 增强特性的作用与代价",
        "能对单通、吞字、断续、掉话等典型问题做分段排查"
      ],
      concepts: ["QCI 1 / QCI 5", "VoLTE 接通率", "QCI1 E-RAB 掉话率", "MOS 与 POLQA", "RTP 丢包与抖动", "eSRVCC 切换比例", "TTI bundling", "RoHC", "单通 / 吞字"],
      specs: [
        { id: "TS 23.203", note: "标准化 QCI 特性（QCI 1 会话语音、QCI 5 IMS 信令）" },
        { id: "TS 23.216", note: "SRVCC / eSRVCC" },
        { id: "TS 26.114", note: "IMS 多媒体电话（MTSI）媒体处理" },
        { id: "ITU-T P.863", note: "POLQA 客观语音质量评估" }
      ],
      quiz: [
        {
          q: "为什么 eSRVCC 切换比例“越低越好”，而 eSRVCC 成功率“越高越好”？",
          a: "eSRVCC 比例反映 VoLTE 通话中有多少要回落到 2G / 3G 电路域，比例高说明 LTE 覆盖或 B2 门限设置让语音过早离开 LTE，回落后语音质量和后续业务体验都会下降。成功率则衡量真正需要回落时能否不掉话，必须尽量高。两者要一起看，单纯压低比例可能导致掉话上升。"
        },
        {
          q: "路测中 MOS 偏低，但没有掉话，应该先看哪些指标？",
          a: "先看 RTP 丢包率和抖动，再看对应时段的 RSRP、SINR、上行 BLER、切换次数。丢包集中在切换点附近多为切换中断或频繁切换；集中在弱覆盖区多为上行受限；同时检查语音编码速率（如 AMR-WB 是否降速）和是否频繁触发 eSRVCC。"
        }
      ],
      practice: "整理一张 VoLTE 问题排查表：列出单通、吞字、断续、掉话、未接通五种现象，分别写出要看的指标、信令点和可能原因（不需要现网数据，可基于本模块讲解）。"
    }
  ]
};
