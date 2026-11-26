// LTE 路径 · 阶段 3 高层协议与空口流程：模块知识讲解
window.LESSONS = window.LESSONS || {};
window.LESSONS["lte"] = window.LESSONS["lte"] || {};

Object.assign(window.LESSONS["lte"], {
  // ───────────── 3.1 RRC 状态、空闲态与小区重选 ─────────────
  "lte-rrc": {
    sections: [
      {
        h: "两种 RRC 状态",
        p: ["LTE 的 RRC 只有两种基本状态：**RRC_IDLE** 和 **RRC_CONNECTED**。相比 3G 的 CELL_DCH / CELL_FACH / CELL_PCH / URA_PCH 多状态，LTE 做了大幅简化：要么连着（有专用资源、网络知道你在哪个小区），要么空闲（只知道你在哪个跟踪区）。"],
        table: {
          head: ["", "RRC_IDLE", "RRC_CONNECTED"],
          rows: [
            ["eNB 是否有 UE 上下文", "没有", "有（含安全上下文、承载配置）"],
            ["网络掌握的位置粒度", "跟踪区（TA 列表）", "小区"],
            ["移动性", "终端自主小区重选", "网络控制的切换（见 3.4）"],
            ["能否收发数据", "不能，只能收寻呼和系统消息", "能"],
            ["对应 ECM 状态", "ECM-IDLE", "ECM-CONNECTED"],
            ["耗电", "低，按寻呼周期 DRX 醒来", "高，可配置连接态 DRX 省电（见 2.6）"]
          ]
        },
        after: [
          "RRC 状态是空口概念，ECM 状态是 NAS 层（终端与 MME 之间）概念，二者在 LTE 里基本一一对应：RRC 连接建立后 S1 连接随之建立，进入 ECM-CONNECTED。EMM 注册状态见 4.2。",
          "与 5G 的差异：NR 多了一个 RRC_INACTIVE 态（见 5G 路线）。LTE R13 为物联网引入了挂起 / 恢复（suspend / resume），R15 接入 5GC 的 LTE 也支持 INACTIVE，但传统 LTE 现网基本只有两态。"
        ]
      },
      {
        h: "空闲态要做哪些事",
        list: [
          "**PLMN 选择**：NAS 层决定在哪个运营商网络上注册，AS 层负责搜索并上报可用 PLMN。",
          "**小区选择**：开机或回到空闲态时，找到一个“适合小区”（suitable cell）驻留。",
          "**小区重选**：驻留期间持续评估邻区，按规则换到更合适的小区。",
          "**位置登记**：进入不在 TA 列表中的跟踪区时发起 TAU（见 4.4）。",
          "**监听寻呼与系统消息**：在自己的寻呼时机醒来看有没有被叫，系统消息变更时重读。"
        ],
        table: {
          head: ["小区类别", "含义", "能做什么"],
          rows: [
            ["适合小区（suitable）", "属于选定 / 等效 PLMN，满足 S 准则，未被禁止，不在禁止漫游 TA 中", "正常驻留，可获得全部业务"],
            ["可接受小区（acceptable）", "满足 S 准则且未被禁止，但不满足适合小区的其他条件", "受限驻留，只能紧急呼叫"],
            ["禁止小区（barred）", "SIB1 中 cellBarred 置位", "不能驻留"],
            ["保留小区（reserved）", "cellReservedForOperatorUse 置位", "仅特定接入等级终端可驻留"]
          ]
        }
      },
      {
        h: "小区选择：S 准则",
        p: ["终端要驻留一个小区，接收电平和质量都必须高于小区广播的最低门限，即同时满足 **Srxlev > 0** 和 **Squal > 0**（TS 36.304）。"],
        list: [
          "Srxlev = Qrxlevmeas − (Qrxlevmin + Qrxlevminoffset) − Pcompensation − Qoffsettemp",
          "Squal = Qqualmeas − (Qqualmin + Qqualminoffset) − Qoffsettemp",
          "**Qrxlevmeas / Qqualmeas**：终端测得的 RSRP / RSRQ。",
          "**Qrxlevmin（q-RxLevMin）/ Qqualmin**：SIB1 中广播的最低接收电平 / 质量。",
          "**Qrxlevminoffset**：仅在漫游搜索更高优先级 PLMN 时使用，平时为 0。",
          "**Pcompensation**：补偿终端最大发射功率低于小区允许上限的情况，功率等级弱的终端门限更严，保证上行也能打通。",
          "**Qoffsettemp**：连接建立失败后临时加的偏置，平时为 0。"
        ],
        table: {
          head: ["示例参数", "数值"],
          rows: [
            ["测得 RSRP（Qrxlevmeas）", "−118 dBm"],
            ["q-RxLevMin", "−124 dBm"],
            ["Pcompensation、Qrxlevminoffset、Qoffsettemp", "0"],
            ["Srxlev", "−118 − (−124) = 6 dB > 0，满足电平条件"]
          ]
        },
        after: ["以上为示例。q-RxLevMin 设得越低，小区覆盖“边缘”越远，但边缘终端上行可能打不通；设得越高，弱场终端会被挤出去，可能出现脱网。"],
        tip: "q-RxLevMin 在信令里是“实际值除以 2”的编码，解码工具通常已换算成 dBm，手工读原始码流时要注意乘 2。"
      },
      {
        h: "重选的测量启动条件",
        p: ["为了省电，终端并不总是测量邻区，而是由服务小区质量决定是否启动："],
        table: {
          head: ["测量类型", "何时必须测量", "参数（SIB3）"],
          rows: [
            ["同频", "服务小区 Srxlev ≤ SIntraSearchP 或 Squal ≤ SIntraSearchQ", "s-IntraSearchP / s-IntraSearchQ"],
            ["高优先级异频 / 异系统", "始终要测（可按较长周期）", "—"],
            ["同等或低优先级异频 / 异系统", "服务小区 Srxlev ≤ SnonIntraSearchP 或 Squal ≤ SnonIntraSearchQ", "s-NonIntraSearchP / s-NonIntraSearchQ"]
          ]
        },
        after: ["反过来说，服务小区足够好时，终端可以不测同频邻区。现网遇到“明明邻区更强却不重选”，常常是 s-IntraSearch 设得过低，服务小区还没差到门限，终端根本没去测。"]
      },
      {
        h: "基于优先级的异频 / 异系统重选",
        p: ["每个频点有一个绝对优先级 **cellReselectionPriority**（0–7，0 最低），服务频点优先级在 SIB3，异频在 SIB5，UTRA / GERAN 在 SIB6 / SIB7。网络也可以在 RRCConnectionRelease 中下发专用优先级（配合 T320 有效期），覆盖广播值。"],
        table: {
          head: ["目标频点优先级", "重选条件（基于 RSRP 的版本）", "说明"],
          rows: [
            ["高于服务频点", "目标小区 Srxlev > ThreshX,HighP，持续 Treselection", "不管服务小区多好，高优先级够好就过去"],
            ["等于服务频点", "按 R 准则排序（同频规则）", "异频同优先级也用排序"],
            ["低于服务频点", "服务小区 Srxlev < ThreshServing,LowP 且目标 Srxlev > ThreshX,LowP，持续 Treselection", "服务小区差了才往低优先级走"]
          ]
        },
        after: [
          "若 SIB3 广播了 threshServingLowQ，以上门限改为基于 Squal 判断（R9 引入）。另外，终端在当前小区驻留必须超过 1 秒才允许重选。",
          "国内常见做法：把容量层、高频段的 LTE 频点设成较高优先级，覆盖层设低优先级；有 5G 时在 SIB24 中把 NR 频点设为更高优先级，引导终端驻留 5G（见 5.4）。"
        ]
      },
      {
        h: "同频（及同优先级）重选：R 准则",
        list: [
          "服务小区：Rs = Qmeas,s + Qhyst − Qoffsettemp",
          "邻区：Rn = Qmeas,n − Qoffset − Qoffsettemp",
          "**Qhyst（q-Hyst）**：给服务小区加的迟滞，抑制乒乓重选。",
          "**Qoffset**：同频为小区对偏置 Qoffsets,n（q-OffsetCell，SIB4 中按邻区配置）；异频同优先级时还要加频点偏置 Qoffsetfrequency。",
          "所有满足 S 准则的小区按 R 值排序，某邻区持续排名第一达到 **Treselection**（0–7 秒）才重选。",
          "**移动状态**：终端根据一段时间内的重选次数判断自己是中速还是高速，按 SIB3 中的比例因子缩短 Treselection、减小 Qhyst，让高速终端重选更敏捷。"
        ],
        table: {
          head: ["示例", "服务小区", "邻区"],
          rows: [
            ["测得 RSRP", "−100 dBm", "−97 dBm"],
            ["Qhyst / Qoffset", "Qhyst = 4 dB", "Qoffset = 0 dB"],
            ["R 值", "Rs = −96", "Rn = −97"],
            ["结论", "服务小区仍排第一", "邻区要再强 1 dB 以上并持续 Treselection 才重选"]
          ]
        },
        tip: "空闲态重选参数（SIB3–SIB5）和连接态切换参数（测量配置）是两套独立参数。二者不协调时会出现“空闲态驻留 A 小区，一接入马上切到 B 小区”的现象，既浪费信令又影响接入感知。"
      }
    ]
  },

  // ───────────── 3.2 随机接入与 RRC 连接建立 ─────────────
  "lte-access": {
    sections: [
      {
        h: "什么时候需要随机接入",
        list: [
          "从 RRC_IDLE 初始接入（主叫、被叫寻呼响应、TAU 等）。",
          "RRC 连接重建（见 3.5）。",
          "切换时接入目标小区（见 3.4）。",
          "连接态下行数据到达，但终端已失去上行同步（基站用 PDCCH order 指令触发）。",
          "连接态上行数据到达，但终端失去上行同步，或没有可用的 PUCCH 调度请求（SR）资源。"
        ],
        after: ["随机接入要解决两件事：**上行同步**——基站根据前导到达时刻算出时间提前量（TA），让不同距离的终端上行信号对齐到达；**拿到身份和上行资源**——获得 C-RNTI 和发送高层消息的上行授权。"]
      },
      {
        h: "竞争随机接入：四步",
        flow: `sequenceDiagram
    participant UE
    participant eNB
    UE->>eNB: Msg1 随机接入前导（PRACH）
    Note right of eNB: 检测前导，估计 TA
    eNB->>UE: Msg2 随机接入响应（PDCCH 用 RA-RNTI 加扰）
    UE->>eNB: Msg3 RRCConnectionRequest（PUSCH）
    eNB->>UE: Msg4 竞争解决 MAC CE + RRCConnectionSetup
    UE->>eNB: RRCConnectionSetupComplete（携带 NAS 消息）`,
        table: {
          head: ["步骤", "内容", "关键点"],
          rows: [
            ["Msg1", "从小区的 64 个前导中选一个（分 A / B 两组，Msg3 较大或信道较好时可选 B 组），在 PRACH 时机发送", "前导时频位置决定 RA-RNTI；FDD 下 RA-RNTI = 1 + t_id + 10 × f_id"],
            ["Msg2", "MAC RAR：前导标识（RAPID）、TA 命令、Msg3 上行授权、临时 C-RNTI（TC-RNTI）；可带回退指示（Backoff Indicator）", "终端在 ra-ResponseWindowSize 窗内用 RA-RNTI 盲检；收不到就按步长加功率重发"],
            ["Msg3", "SRB0 上发送 RRCConnectionRequest：初始标识 + 建立原因", "多个终端选了同一前导时，它们会用同一授权发 Msg3，产生冲突"],
            ["Msg4", "UE 竞争解决标识 MAC CE（回显 Msg3 的前 48 比特）+ RRCConnectionSetup", "回显与自己发的一致才算赢，TC-RNTI 转为 C-RNTI；mac-ContentionResolutionTimer 超时未解决则重新接入"]
          ]
        },
        after: ["连接态终端发起竞争接入时，Msg3 携带的是 C-RNTI MAC CE，竞争解决的方式变为：收到用自己 C-RNTI 加扰的 PDCCH 即成功。"]
      },
      {
        h: "PRACH 配置与功率攀升",
        list: [
          "**前导格式**：格式 0–3 用于 FDD 和 TDD，序列长度 839，格式之间循环前缀和序列重复次数不同，对应不同的最大小区半径；格式 4 只用于 TDD 的 UpPTS，序列长度 139，覆盖很小。",
          "**prach-ConfigIndex**：决定前导格式以及 PRACH 出现在哪些帧、子帧（物理层细节见 2.4）。",
          "**zeroCorrelationZoneConfig（Ncs）**：与小区半径相关。半径越大 Ncs 越大，每个根序列能生成的前导越少，凑满 64 个前导需要的根序列越多。",
          "**rootSequenceIndex**：相邻小区要错开根序列，避免把邻区终端的前导误检为本小区的（规划见 6.2）。",
          "**功率攀升**：首次以 preambleInitialReceivedTargetPower 为目标发送，每次失败按 powerRampingStep 提升，达到 preambleTransMax 仍失败则向上层报告随机接入问题。"
        ],
        tip: "看到大量 Msg1 而 Msg2 很少，先区分是基站没检测到（上行覆盖、干扰、根序列冲突）还是基站检测到但没回（资源不足、虚检后不调度）。基站侧的前导检测计数和终端侧的发送次数对比一下就清楚了。"
      },
      {
        h: "RRC 连接建立与建立原因",
        table: {
          head: ["消息", "承载", "关键内容"],
          rows: [
            ["RRCConnectionRequest", "SRB0（CCCH）", "ue-Identity：S-TMSI 或 40 比特随机数；establishmentCause"],
            ["RRCConnectionSetup", "SRB0（CCCH）", "radioResourceConfigDedicated：建立 SRB1，配置 MAC、物理层专用参数"],
            ["RRCConnectionSetupComplete", "SRB1（DCCH）", "selectedPLMN-Identity、dedicatedInfoNAS（如 Attach Request、Service Request、TAU Request），可带 registeredMME"],
            ["RRCConnectionReject", "SRB0", "waitTime：终端等待多少秒后才能再试"]
          ]
        },
        after: ["建立原因（establishmentCause）取值包括 emergency、highPriorityAccess、mt-Access（被叫）、mo-Signalling（主叫信令，如 TAU）、mo-Data（主叫数据），以及后续版本增加的 delayTolerantAccess、mo-VoiceCall 等。KPI 统计中常按原因区分“业务类”和“信令类”接入成功率，统计口径因厂家而异。"],
        list: [
          "**T300**：终端发出 RRCConnectionRequest 时启动，收到 Setup 或 Reject 停止；超时则判定本次建立失败，通知 NAS。",
          "**接入等级限制（ACB）**：SIB2 中 ac-BarringInfo 给出限制因子和限制时间，终端抽随机数，低于因子才允许接入，用于拥塞时控制接入量。接入等级 11–15 为特殊用户，另有单独控制。"
        ]
      },
      {
        h: "从 RRC 连接到初始上下文建立",
        flow: `sequenceDiagram
    participant UE
    participant eNB
    participant MME
    UE->>eNB: RRCConnectionSetupComplete（NAS 消息）
    eNB->>MME: Initial UE Message（NAS-PDU、TAI、ECGI、建立原因）
    Note over UE,MME: NAS 鉴权与安全流程（见 4.5）
    MME->>eNB: Initial Context Setup Request（E-RAB 列表、KeNB、UE 能力）
    eNB->>UE: SecurityModeCommand
    UE->>eNB: SecurityModeComplete
    eNB->>UE: UECapabilityEnquiry（MME 未带能力时）
    UE->>eNB: UECapabilityInformation
    eNB->>UE: RRCConnectionReconfiguration（SRB2、DRB）
    UE->>eNB: RRCConnectionReconfigurationComplete
    eNB->>MME: Initial Context Setup Response`,
        after: [
          "RRCConnectionSetupComplete 之后，eNB 把 NAS 消息包进 S1AP Initial UE Message 发给 MME，从此建立该终端的 S1 信令连接。MME 处理后下发 Initial Context Setup Request，携带要建立的 E-RAB 及其 QoS、AS 安全根密钥 KeNB。",
          "eNB 先通过 **SecurityModeCommand** 激活 AS 安全（加密与完整性保护），再用 **RRCConnectionReconfiguration** 建立 SRB2 和数据无线承载 DRB，并下发测量配置。全部成功后回复 Initial Context Setup Response，E-RAB 建立完成。",
          "UE 能力查询的时机和是否把能力上传 MME 存储，属于常见实现差异；MME 已存有能力时，后续接入可省掉这一步。"
        ]
      },
      {
        h: "接入失败的分段排查",
        table: {
          head: ["现象", "可能原因", "先查什么"],
          rows: [
            ["反复发 Msg1，收不到 Msg2", "上行覆盖不足、PRACH 根序列冲突、上行干扰、prach-ConfigIndex 与邻区冲突", "终端发射功率是否已到上限；小区上行底噪；PRACH 参数"],
            ["收到 Msg2，Msg3 失败", "Msg3 功率不足、上行干扰、TA 不准（超远覆盖）", "Msg3 的 HARQ 重传次数；上行 SINR；小区半径与前导格式是否匹配"],
            ["Msg4 竞争失败或 T300 超时", "前导冲突、下行质量差、Msg4 漏收", "接入负荷、前导分组；下行 RSRQ / SINR"],
            ["收到 RRCConnectionReject", "基站拥塞、准入控制、过载", "小区用户数、准入门限、MME 过载指示"],
            ["RRC 成功，E-RAB 建立失败", "MME 拒绝、安全模式失败、准入拒绝、重配置无响应", "S1AP 失败原因、NAS 拒绝原因（见 4.2）"]
          ]
        },
        tip: "接入类问题一律先画时间轴：把 Msg1 到 Initial Context Setup Response 的每一步时间戳标出来，卡在哪一步问题就在哪一层。"
      }
    ]
  },

  // ───────────── 3.3 测量配置与测量事件 ─────────────
  "lte-meas": {
    sections: [
      {
        h: "测量的整体框架",
        p: ["连接态移动性由网络控制：网络通过 RRCConnectionReconfiguration 中的 **measConfig** 告诉终端“测什么、怎么测、什么时候报”，终端按配置测量并发送 **MeasurementReport**，网络据此决定切换、添加 SCell 或做负载均衡。"],
        table: {
          head: ["配置项", "作用", "典型内容"],
          rows: [
            ["measObject", "测哪个频点 / 哪个系统", "EUTRA：carrierFreq、allowedMeasBandwidth、offsetFreq、邻区列表及 cellIndividualOffset、黑名单"],
            ["reportConfig", "什么条件下报、报什么", "事件类型或周期上报、门限、hysteresis、timeToTrigger、triggerQuantity（RSRP / RSRQ）、reportInterval、reportAmount"],
            ["measId", "把 measObject 与 reportConfig 绑定", "一个 measId = 一个对象 + 一个报告配置"],
            ["quantityConfig", "层 3 滤波系数", "filterCoefficientRSRP / RSRQ"],
            ["measGapConfig", "异频 / 异系统测量间隙", "gp0 或 gp1 + 起始偏移"],
            ["s-Measure", "服务小区 RSRP 门限", "高于此值时终端可不测邻区"]
          ]
        },
        after: ["这种“对象—报告配置—标识”三段式设计的好处是复用：同一个频点可以挂多个事件（比如 A3 用于切换、A2 用于启动异频测量），同一个事件配置也可以用到多个频点。"]
      },
      {
        h: "测量量与上报映射",
        list: [
          "**RSRP**：参考信号接收功率，反映覆盖，上报范围 −140 ~ −44 dBm，映射为 0–97（TS 36.133）。",
          "**RSRQ** = N × RSRP / RSSI（N 为测量带宽内的 RB 数），反映质量与负载干扰，基础上报范围 −19.5 ~ −3 dB，映射 0–34；后续版本扩展了范围。",
          "**SINR**：早期版本并未把 SINR 定义为 RRC 测量上报量（后续版本才引入 RS-SINR 上报），路测软件里的 SINR 多为终端芯片或仪表自行计算，不同终端之间可比性有限。",
          "门限在信令中同样以编码值下发：RSRP 门限的实际值 = 编码值 − 140 dBm，例如编码 30 对应 −110 dBm（示例换算）。"
        ],
        tip: "RSRQ 受本小区负载影响：空载时邻区不发业务，RSRQ 看起来很好；加载后 RSSI 上升、RSRQ 下降。用 RSRQ 做门限时要考虑忙闲时差异。"
      },
      {
        h: "测量事件定义",
        p: ["以下为进入条件（TS 36.331）。Ms / Mp 为服务小区（或 PCell）测量值，Mn 为邻区测量值；Ofn / Ofp 为频点偏置（offsetFreq），Ocn / Ocp 为小区个体偏置（CIO），Hys 为迟滞，Off 为事件偏置（如 a3-Offset）。"],
        table: {
          head: ["事件", "进入条件", "常见用途"],
          rows: [
            ["A1", "Ms − Hys > Thresh", "服务小区变好，停止异频测量、关闭 gap"],
            ["A2", "Ms + Hys < Thresh", "服务小区变差，启动异频 / 异系统测量，或直接重定向"],
            ["A3", "Mn + Ofn + Ocn − Hys > Mp + Ofp + Ocp + Off", "同频切换（最常用），也可用于异频"],
            ["A4", "Mn + Ofn + Ocn − Hys > Thresh", "负载均衡、基于覆盖的异频切换、SCell 添加"],
            ["A5", "Mp + Hys < Thresh1 且 Mn + Ofn + Ocn − Hys > Thresh2", "异频切换"],
            ["A6", "Mn + Ocn − Hys > Ms + Ocs + Off（R11）", "CA 中 SCell 更换"],
            ["B1", "Mn + Ofn + Ocn − Hys > Thresh（异系统）", "LTE 到 NR 添加辅节点（EN-DC，见 5.4）、异系统负载分流"],
            ["B2", "Mp + Hys < Thresh1 且异系统 Mn + Ofn + Ocn − Hys > Thresh2", "LTE 到 UTRAN / GERAN 切换"]
          ]
        },
        after: ["每个事件还有对应的离开条件（不等号反向、迟滞符号反向）。A1、A2、A4、B1 的门限是绝对值，A3、A6 是相对值，这决定了它们分别适合“看自己”还是“和邻居比”。"]
      },
      {
        h: "A3 事件手算示例",
        table: {
          head: ["参数", "示例取值"],
          rows: [
            ["服务小区 RSRP（Mp）", "−95 dBm"],
            ["邻区 RSRP（Mn）", "−92 dBm"],
            ["同频，Ofn = Ofp", "0 dB"],
            ["邻区 CIO（Ocn）/ 服务小区 CIO（Ocp）", "0 dB / 0 dB"],
            ["a3-Offset（Off）", "2 dB"],
            ["hysteresis（Hys）", "1 dB"],
            ["判定", "左边 −92 + 0 + 0 − 1 = −93；右边 −95 + 0 + 0 + 2 = −93；−93 > −93 不成立，尚不触发"]
          ]
        },
        after: ["以上为示例。邻区再强一点点（超过 3 dB，即 Off + Hys）并持续 timeToTrigger 才会上报。可见对于 A3，Off 与 Hys 在进入时效果相加；把邻区 CIO 调大 1 dB，等效于让切到这个邻区更容易，这就是网优中用 CIO 做“定向调整”的原理。"],
        tip: "信令里 a3-Offset 和 hysteresis 都是以 0.5 dB 为单位编码的，解码值 4 表示 2 dB，手工读取时别看错。"
      },
      {
        h: "迟滞、TTT 与层 3 滤波",
        list: [
          "**hysteresis**：进入和离开条件之间留出余量，避免测量值在门限附近抖动时反复进出。",
          "**timeToTrigger（TTT）**：进入条件需持续满足的时间，取值为一组离散值（0、40、64、80、100、128、160、256、320、480、512、640、1024、1280、2560、5120 ms）。",
          "**层 3 滤波**：Fn = (1 − a) × Fn−1 + a × Mn，其中 a = 1 / 2^(k/4)，k 即 filterCoefficient。k 越大越平滑、反应越慢。",
          "**reportInterval / reportAmount**：事件触发后若网络未处理，终端按间隔重复上报，直到次数用完或离开条件满足。"
        ],
        table: {
          head: ["调整方向", "好处", "代价"],
          rows: [
            ["增大 Hys / Off / TTT / 滤波系数", "减少乒乓和误切换", "切换变晚，高速场景易掉线"],
            ["减小 Hys / Off / TTT / 滤波系数", "切换及时", "乒乓、过早切换增多，信令开销大"]
          ]
        }
      },
      {
        h: "测量间隙与 s-Measure",
        list: [
          "单射频终端在同一时刻只能接收一个频点，测异频或异系统时需要暂停服务小区的收发，这段时间就是**测量间隙（gap）**。",
          "LTE 定义了两种常用模式：**gp0** 每 40 ms 一个 6 ms 间隙，**gp1** 每 80 ms 一个 6 ms 间隙。间隙期间不能调度该终端，会直接降低速率。",
          "终端在能力中上报每个频段组合是否需要 gap（interFreqNeedForGaps 等），支持多射频的终端可无 gap 测量。",
          "**s-Measure**：服务小区（PCell）RSRP 高于此值时，终端可以不测邻区，节省功耗；但设得过低会导致终端在信号已经变差时才开始测，切换可能来不及。"
        ],
        tip: "“A2 开 gap → A5/A3 切 → A1 关 gap”是异频切换的标准套路。A2 门限太高会让很多用户长期开着 gap，表现为该区域速率莫名偏低。"
      }
    ]
  },

  // ───────────── 3.4 切换：X2、S1 与异系统 ─────────────
  "lte-ho": {
    sections: [
      {
        h: "切换的三个阶段与分类",
        p: ["LTE 切换都是**硬切换**（先断后连），由网络控制、终端辅助（测量上报）。按流程可分为三个阶段："],
        steps: [
          "**切换准备**：源 eNB 根据测量报告做出切换判决，向目标 eNB（直接或经 MME）请求资源；目标做准入控制，生成切换命令。",
          "**切换执行**：源 eNB 把切换命令发给终端，终端断开源小区、同步并随机接入目标小区，发送 RRCConnectionReconfigurationComplete；同时源 eNB 把未发完的数据前转给目标 eNB。",
          "**切换完成**：目标 eNB 通知核心网把下行路径从源 eNB 切到自己，然后释放源 eNB 上的终端资源。"
        ],
        table: {
          head: ["类型", "特点", "信令路径"],
          rows: [
            ["eNB 内切换", "同一 eNB 下不同小区之间", "只有空口信令，无 X2 / S1 交互"],
            ["X2 切换", "eNB 间有 X2，且 MME 不变", "准备经 X2，完成时发 Path Switch"],
            ["S1 切换", "无 X2、需换 MME 或策略要求", "准备、完成都经 MME 中转"],
            ["异系统切换", "到 UTRAN / GERAN", "经 MME 与 SGSN 交互"]
          ]
        }
      },
      {
        h: "基于 X2 的切换流程",
        flow: `sequenceDiagram
    participant UE
    participant S as 源 eNB
    participant T as 目标 eNB
    participant MME
    participant SGW
    UE->>S: MeasurementReport（如 A3）
    Note over S: 切换判决
    S->>T: Handover Request（UE 上下文、E-RAB、RRC 容器）
    Note over T: 准入控制，分配专用前导与 C-RNTI
    T->>S: Handover Request Acknowledge（透明容器内含切换命令）
    S->>UE: RRCConnectionReconfiguration（mobilityControlInfo）
    S->>T: SN Status Transfer
    S->>T: 下行数据前转
    UE->>T: 前导（非竞争随机接入）
    T->>UE: RAR（TA、上行授权）
    UE->>T: RRCConnectionReconfigurationComplete
    T->>MME: Path Switch Request
    MME->>SGW: Modify Bearer Request
    Note over SGW: 切换下行路径，旧路径发 End Marker
    SGW->>MME: Modify Bearer Response
    MME->>T: Path Switch Request Acknowledge
    T->>S: UE Context Release`,
        list: [
          "**切换命令由目标 eNB 生成**：Handover Request Acknowledge 中携带一个透明容器，里面就是完整的 RRCConnectionReconfiguration，源 eNB 只是原样转发给终端。",
          "**mobilityControlInfo** 包含 targetPhysCellId、目标频点（异频时）、新的 C-RNTI（newUE-Identity）、T304、专用前导（rach-ConfigDedicated）以及目标小区公共无线配置。",
          "**SN Status Transfer** 告诉目标 eNB 每个 RLC AM 承载的 PDCP 序列号状态，配合数据前转实现无损切换。",
          "**End Marker**：SGW 切换路径后在旧路径上发结束标记，目标 eNB 据此知道前转数据已收完，可以开始按序发送新路径数据。"
        ]
      },
      {
        h: "基于 S1 的切换",
        flow: `sequenceDiagram
    participant UE
    participant S as 源 eNB
    participant MME
    participant T as 目标 eNB
    S->>MME: Handover Required（目标 eNB ID、源到目标透明容器）
    MME->>T: Handover Request
    T->>MME: Handover Request Acknowledge（目标到源透明容器）
    MME->>S: Handover Command
    S->>UE: RRCConnectionReconfiguration（mobilityControlInfo）
    S->>MME: eNB Status Transfer
    MME->>T: MME Status Transfer
    UE->>T: 随机接入 + RRCConnectionReconfigurationComplete
    T->>MME: Handover Notify
    Note over MME: 经 SGW 修改承载，切换下行路径
    MME->>S: UE Context Release Command
    S->>MME: UE Context Release Complete`,
        after: [
          "S1 切换的空口部分与 X2 切换相同，差别在网络侧：准备阶段和状态传递都经 MME 中转；数据前转可以直接走 X2（若存在）或经 SGW **间接前转**。",
          "需要更换 MME 时，源 MME 通过 S10 接口向目标 MME 发 Forward Relocation Request；需要更换 SGW 时还涉及新 SGW 的会话建立（见 23.401，核心网细节见 4.1）。",
          "现网判断方法：信令中出现 X2AP Handover Request 即为 X2 切换；出现 S1AP Handover Required 即为 S1 切换。"
        ]
      },
      {
        h: "异系统移动性：切换与重定向",
        table: {
          head: ["方式", "空口消息", "特点"],
          rows: [
            ["PS 切换到 UTRAN", "MobilityFromEUTRACommand（purpose 为 handover，内含 UTRAN 的切换命令）", "经 S1 Handover Required → MME → SGSN 准备资源，中断短，需核心网与目标 RNC 支持"],
            ["小区改变命令到 GERAN（CCO）", "MobilityFromEUTRACommand（purpose 为 cellChangeOrder）", "终端到 GSM 小区重新接入，可配合 NACC 提前给系统消息"],
            ["重定向", "RRCConnectionRelease（redirectedCarrierInfo）", "释放 LTE 连接并指示到某频点 / 系统重新接入，实现简单、中断较长"],
            ["CSFB", "见 5.1", "语音回落场景的专用流程"]
          ]
        },
        after: ["异系统切换一般由 A2 启动异系统测量、B2（或 B1）触发。国内 LTE 现网中，到 2G / 3G 的数据业务移动性多用重定向，PS 切换的开通情况因运营商和网络而异。4G 与 5G 之间的切换与 EN-DC 见 5.4。"]
      },
      {
        h: "切换中的关键定时器与安全",
        list: [
          "**T304**：终端收到带 mobilityControlInfo 的重配置时启动，目标小区随机接入成功后停止；超时即切换失败，触发 RRC 重建（原因 handoverFailure，见 3.5）。",
          "**源 eNB 保护定时器**：X2 切换中源 eNB 用 TX2RELOCoverall 等待 UE Context Release，超时则自行释放资源；取值因厂家而异。",
          "**密钥更新**：切换时 KeNB 要派生为新的 KeNB*，X2 切换采用水平或基于 NH 的垂直派生，切换命令中携带 nextHopChainingCount（NCC），细节见 4.5。",
          "**切换中断时间**：从终端断开源小区到在目标小区恢复数据收发，一般为几十毫秒量级；VoLTE 用户对此敏感（见 6.7）。"
        ]
      },
      {
        h: "切换失败的分段排查",
        table: {
          head: ["失败环节", "信令表现", "常见原因"],
          rows: [
            ["没有测量报告", "终端不上报 A3", "邻区漏配、测量门限 / TTT 过严、黑名单误配"],
            ["切换准备失败", "Handover Preparation Failure 或无响应", "目标准入拒绝（资源满、license）、X2 链路故障、PCI 混淆导致找错目标"],
            ["切换执行失败", "收到切换命令后 T304 超时、出现 handoverFailure 重建", "目标小区上行覆盖差、PRACH 问题、目标信号虚高（过早切换）、源小区质量太差收不到命令（过晚切换）"],
            ["切换完成失败", "Path Switch Request Failure", "核心网侧问题（MME / SGW）"]
          ]
        },
        tip: "统计切换成功率时要分清“准备成功率”和“执行成功率”：前者主要是网络侧问题，后者主要是空口问题，优化手段完全不同（见 6.5）。"
      }
    ]
  },

  // ───────────── 3.5 无线链路失败与 RRC 重建 ─────────────
  "lte-rlf": {
    sections: [
      {
        h: "什么是无线链路失败（RLF）",
        p: ["连接态终端持续监测 PCell 的下行链路质量。当链路已经无法可靠收发时，终端判定**无线链路失败**，不再被动等待，而是主动发起 RRC 连接重建，尝试在一个可用小区上恢复连接。RLF 是掉线、切换失败等问题的“终端视角”记录。"],
        table: {
          head: ["触发条件", "说明"],
          rows: [
            ["T310 超时", "物理层连续上报 N310 次失步，启动 T310；期间未收到连续 N311 次同步指示，T310 超时即判 RLF"],
            ["MAC 随机接入问题", "随机接入达到 preambleTransMax 仍失败（且 T300、T301、T304、T311 均未运行）"],
            ["RLC 达到最大重传", "某个 RLC AM 实体重传次数达到 maxRetxThreshold"]
          ]
        },
        after: ["另外两类相关失败也会触发重建：切换执行失败（T304 超时）和 RRC 重配置失败（终端无法执行网络下发的配置）。R12 还引入了 T312：T310 运行期间若触发了测量报告，可启动一个更短的 T312，超时同样判 RLF，让终端更早去重建，缓解切换过晚。"]
      },
      {
        h: "失步检测：Qout / Qin 与 N310 / T310 / N311",
        list: [
          "物理层按 TS 36.133 的要求评估下行质量：估计“假想 PDCCH”的误块率，劣于 **Qout**（约 10% 误块率对应的质量）上报失步，优于 **Qin**（约 2%）上报同步。",
          "**N310**：连续多少次失步指示后启动 T310。",
          "**T310**：给链路一个恢复的机会；期间收到连续 **N311** 次同步指示则停止 T310，链路恢复。",
          "这些参数通过 SIB2 的 ue-TimersAndConstants 广播，也可在专用信令（rlf-TimersAndConstants）中针对终端配置。"
        ],
        table: {
          head: ["参数", "设大", "设小"],
          rows: [
            ["N310", "更能容忍短时失步", "很快进入 T310 计时"],
            ["T310", "给恢复更多时间，但真失败时反应慢", "容易误判 RLF，增加重建"],
            ["N311", "恢复判定更严格", "更容易认为链路恢复"]
          ]
        }
      },
      {
        h: "RRC 连接重建流程",
        flow: `sequenceDiagram
    participant UE
    participant eNB
    Note over UE: 检测到 RLF，启动 T311，做小区选择
    Note over UE: 找到适合小区，停 T311，启动 T301
    UE->>eNB: 随机接入（竞争）
    UE->>eNB: RRCConnectionReestablishmentRequest（C-RNTI、源 PCI、shortMAC-I、原因）
    eNB->>UE: RRCConnectionReestablishment（恢复 SRB1，含 NCC）
    UE->>eNB: RRCConnectionReestablishmentComplete
    eNB->>UE: RRCConnectionReconfiguration（恢复 SRB2 与 DRB）
    UE->>eNB: RRCConnectionReconfigurationComplete`,
        list: [
          "**前提**：AS 安全已激活。若安全尚未激活就发生 RLF，终端直接回到 RRC_IDLE。",
          "**T311**：重建期间做小区选择的时限，超时没找到适合小区则回到 RRC_IDLE。",
          "**T301**：发出 RRCConnectionReestablishmentRequest 时启动，收到响应停止；超时或所选小区变得不适合则回到 RRC_IDLE。",
          "**ue-Identity**：由源 PCell 的 C-RNTI、物理小区 ID 和 shortMAC-I 组成，基站据此找到终端上下文并校验身份。",
          "**reestablishmentCause**：reconfigurationFailure、handoverFailure、otherFailure 三种取值。"
        ]
      },
      {
        h: "重建为什么会失败",
        table: {
          head: ["现象", "原因", "说明"],
          rows: [
            ["RRCConnectionReestablishmentReject", "所选小区没有该终端上下文", "最常见。一般只有源小区和做过切换准备的小区持有上下文；部分厂家支持跨 eNB 获取上下文，因厂家而异"],
            ["T311 超时", "长时间找不到适合小区", "弱覆盖、脱网区域"],
            ["T301 超时", "重建请求或响应在空口丢失", "所选小区质量也差"],
            ["重建成功后再次 RLF", "所选小区并不稳定", "覆盖重叠混乱区域常见"]
          ]
        },
        after: ["重建失败后终端回到 RRC_IDLE，通常需要重新发起连接建立恢复业务，对用户来说就是一次掉线。网络侧的掉线统计（E-RAB 异常释放）口径因厂家而异，详见 6.3 与 6.5。"],
        tip: "重建请求里的 physCellId 是“掉线前的源小区”，而发出重建请求的小区是“终端选到的新小区”。两者相同说明是原地恢复，不同说明终端已经移到别的小区，后者更值得关注邻区和切换参数。"
      },
      {
        h: "RLF Report 与移动鲁棒性优化（MRO）",
        p: ["R9 起，终端可以记录 RLF 时的测量信息（失败小区、邻区测量值、失败类型等），在下次连接时通过 rlf-InfoAvailable 指示网络，网络用 UEInformationRequest 取回 **rlf-Report**。eNB 之间通过 X2 的 RLF Indication、Handover Report 消息交换这些信息，自动判断切换问题类型："],
        table: {
          head: ["类型", "判断依据（简化）", "优化方向"],
          rows: [
            ["过晚切换（too late）", "在源小区 RLF，之后在另一个小区重建 / 重新接入，且最近没有切换", "提前触发：减小 Off / TTT，或增大目标邻区 CIO"],
            ["过早切换（too early）", "刚切到目标小区不久就 RLF，之后回到源小区", "推迟触发：增大 Off / TTT，或减小目标邻区 CIO"],
            ["切错小区（wrong cell）", "刚切到目标小区不久就 RLF，之后在第三个小区恢复", "调整相关两个邻区的 CIO"]
          ]
        },
        after: ["MRO 是 SON 的重要功能，现网是否开启、调整步长与范围因厂家而异。人工优化时也可以用同样的思路给掉线事件分类（见 6.5）。"]
      }
    ]
  },

  // ───────────── 3.6 载波聚合与 LTE-A 关键技术 ─────────────
  "lte-ca": {
    sections: [
      {
        h: "为什么需要载波聚合",
        p: ["LTE R8 单载波最大带宽 20 MHz。IMT-Advanced 要求更高的峰值速率（LTE-A 的目标是下行 1 Gbps、上行 500 Mbps 量级，见 TS 36.913），而运营商手里的频谱往往是分散在不同频段的零碎块。**载波聚合（CA，R10）** 把多个 R8 兼容的载波（成员载波，CC）捆在一起给同一个终端用，既提升峰值速率，又能把零散频谱变成一块“虚拟大带宽”。"],
        list: [
          "R10：最多 5 个 CC，每个最大 20 MHz，总带宽最大 100 MHz。",
          "R13：增强型 CA，最多 32 个 CC（主要为配合非授权频谱等场景）。",
          "每个 CC 对 R8 终端来说都是一个普通 LTE 小区，保证后向兼容。",
          "R12 起支持 FDD 与 TDD 载波之间的聚合（FDD-TDD CA）。"
        ]
      },
      {
        h: "三种聚合方式",
        table: {
          head: ["方式", "含义", "特点"],
          rows: [
            ["带内连续", "同一频段内相邻的两个载波", "射频实现最简单，一套射频链路即可"],
            ["带内非连续", "同一频段内不相邻的载波", "射频实现较复杂"],
            ["带间", "不同频段的载波，如低频覆盖 + 高频容量", "最常见，可兼顾覆盖与容量；终端需要多套射频"]
          ]
        },
        after: ["每种具体组合（哪些频段、每频段几个载波、带宽多少）都必须在 TS 36.101 中有定义，终端也必须在能力中声明支持该频段组合（supportedBandCombination），网络才能给它配置。组合命名中带宽等级字母 A 表示该频段单载波，C 表示该频段内连续两载波，其余等级见 TS 36.101。"],
        tip: "“手机支持 CA”不等于“在你的网络里能聚合”。要同时满足：网络开通了该组合、终端能力里声明了该组合、两个载波覆盖重叠且由同一 eNB 控制（或满足厂家支持的跨站条件）。"
      },
      {
        h: "PCell 与 SCell",
        table: {
          head: ["", "PCell（主小区）", "SCell（辅小区）"],
          rows: [
            ["怎么来的", "终端建立连接或切换进入的小区", "由 RRCConnectionReconfiguration（sCellToAddModList）配置"],
            ["RRC / NAS / 安全", "都在 PCell", "不承担"],
            ["PUCCH", "在 PCell（R13 前只能在 PCell）", "R13 前无"],
            ["无线链路监测 / RLF", "针对 PCell", "不触发 RLF"],
            ["能否去激活", "不能，始终激活", "可用 MAC CE 激活 / 去激活"],
            ["更换方式", "只能通过切换", "RRC 重配置增删，或 A6 事件触发更换"]
          ]
        },
        after: ["CA 主要是 MAC 层的功能：每个服务小区有独立的 HARQ 实体和传输块，PDCP 和 RLC 不感知有几个载波。上行 HARQ 反馈集中在 PCell 的 PUCCH 上发，CC 多时使用 PUCCH format 3 或 format 1b 加信道选择（物理层见 2.4）。"]
      },
      {
        h: "SCell 配置、激活与跨载波调度",
        steps: [
          "**配置**：eNB 根据策略（盲配置，或基于 A4 / A1 等测量）通过 RRC 重配置把 SCell 加给终端，此时 SCell 默认处于去激活状态。",
          "**激活**：有数据要发时，eNB 发送 Activation / Deactivation MAC CE 激活 SCell，终端开始监听其 PDCCH、上报其 CSI。",
          "**去激活**：eNB 发 MAC CE 去激活，或 sCellDeactivationTimer 超时自动去激活，终端停止该载波上的监听以省电。",
          "**删除 / 更换**：SCell 质量变差时通过 RRC 重配置删除，或基于 A6 事件更换；PCell 切换时 SCell 通常一起重新配置。"
        ],
        list: [
          "**自调度**：每个 CC 的 PDCCH 调度自己的 PDSCH / PUSCH。",
          "**跨载波调度**：在一个 CC（通常是 PCell）的 PDCCH 上调度另一个 CC 的资源，DCI 中增加 3 比特载波指示域（CIF）。适合 SCell 控制域干扰大的异构网络场景；PCell 不能被其他载波跨调度。",
          "**多定时提前组（TAG，R11）**：不同频段上行传播时延可能不同（如经过不同的直放站 / 远端），可为 SCell 配置独立的 TA。"
        ]
      },
      {
        h: "速率估算与 UE 类别",
        table: {
          head: ["UE 类别", "下行峰值（约）", "典型实现"],
          rows: [
            ["Cat 3", "100 Mbps", "20 MHz、2 层"],
            ["Cat 4", "150 Mbps", "20 MHz、2 层"],
            ["Cat 6", "300 Mbps", "2 × 20 MHz CA 2 层，或 20 MHz 4 层"],
            ["Cat 9", "450 Mbps", "3 × 20 MHz CA 2 层"]
          ]
        },
        after: [
          "经验估算（示例）：FDD 20 MHz、2×2、64QAM 下行峰值约 150 Mbps；两个 20 MHz 载波聚合约 300 Mbps；再引入 4×4 MIMO 或 256QAM（R12）可进一步翻倍或提升约三分之一。TDD 载波还要按上下行配置折算下行时隙占比（见 2.1）。",
          "R12 起 UE 能力把上下行类别拆开（ue-CategoryDL / ue-CategoryUL），实际速率还受频段组合、MIMO 层数、调制阶数共同限制，以终端能力上报为准。"
        ]
      },
      {
        h: "LTE-A 其他关键技术（R10–R12）",
        table: {
          head: ["技术", "版本", "要点"],
          rows: [
            ["增强 MIMO", "R10", "下行最多 8 层（TM9，基于 CSI-RS 和 DMRS），上行最多 4 层；传输模式见 0.3"],
            ["eICIC", "R10", "宏站在 ABS（几乎空白子帧）中不发数据，让小基站覆盖扩展区的用户免受干扰；R11 feICIC 进一步增强"],
            ["中继（Relay）", "R10", "中继节点通过无线回传连接施主 eNB，用于补盲"],
            ["CoMP（协作多点）", "R11", "多个站点协作调度 / 波束赋形或联合传输，改善小区边缘性能；对回传时延要求高，现网应用有限"],
            ["双连接（DC）", "R12", "终端同时连接主 eNB 和辅 eNB，两站可以非理想回传；EN-DC 即在此基础上扩展到 LTE + NR（见 5.4）"],
            ["256QAM 下行", "R12", "高 SINR 区域提升频谱效率"]
          ]
        },
        after: ["R13 起的 LAA、大规模 MIMO（FD-MIMO）、NB-IoT / eMTC 等属于 LTE-A Pro，见 7.1 与 7.2。"],
        tip: "CA 与双连接的根本区别：CA 的多个载波由同一个 MAC 实体调度，要求站内或理想回传；双连接是两个 MAC 实体、两套调度器，可跨站非理想回传，在 PDCP 层分流。"
      }
    ]
  }
});
