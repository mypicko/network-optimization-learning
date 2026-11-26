// 阶段 4 EPC 核心网
module.exports = {
  id: "L4", title: "EPC 核心网",
  summary: "MME、SGW、PGW、HSS、PCRF 如何分工协作，完成附着、承载建立、移动性管理、鉴权安全与策略计费。看懂 EPC 信令，才能把“上不了网、打不了电话”定界到具体网元和具体一步。",
  modules: [
    {
      id: "lte-epc",
      title: "EPC 网元与接口详解",
      hours: 4,
      goals: [
        "说出 MME、SGW、PGW、HSS、PCRF 各自的职责和不负责的事情",
        "说出 S1-MME、S1-U、S11、S5/S8、S6a、Gx、SGi、S10、SGs 的两端网元与承载协议",
        "理解 MME 池、NNSF 以及基于 DNS 的 SGW / PGW 选择机制",
        "能根据抓包中的协议和端口判断信令走在哪个接口上"
      ],
      concepts: ["MME：NAS 信令与移动性", "SGW：本地移动锚点、下行缓存", "PGW：IP 分配与 PCEF", "HSS：签约数据与鉴权向量", "GTPv2-C / GTP-U", "S1AP over SCTP", "Diameter（S6a / Gx）", "MME 池与 GUMMEI", "CUPS 控制面 / 用户面分离"],
      specs: [
        { id: "TS 23.401", note: "EPS 架构、网元功能与参考点" },
        { id: "TS 29.274", note: "GTPv2-C（S11 / S5 / S8 / S10）" },
        { id: "TS 29.272", note: "S6a / S6d Diameter 接口" },
        { id: "TS 36.413", note: "S1AP" }
      ],
      quiz: [
        {
          q: "终端处于 ECM-IDLE 时，下行数据到达，是哪个网元先发现并缓存数据？之后发生什么？",
          a: "SGW。空闲态时 SGW 上没有该终端的 S1-U 下行隧道信息，它把数据缓存起来并向 MME 发 Downlink Data Notification；MME 在 TAI 列表范围内寻呼终端，终端回 Service Request 恢复连接后，SGW 拿到新的 eNB 隧道地址再把缓存数据发下去。"
        },
        {
          q: "S5 和 S8 有什么区别？",
          a: "两者都是 SGW 与 PGW 之间的接口，功能相同。S5 用于 SGW 与 PGW 在同一运营商网络内的场景；S8 用于漫游归属地路由（SGW 在拜访网、PGW 在归属网），多了跨运营商的安全和计费考虑。协议上常用 GTPv2-C + GTP-U，也可以用 PMIP。"
        },
        {
          q: "eNB 收到一个终端的 RRC 连接，怎么知道该把 NAS 消息送给池里的哪台 MME？",
          a: "eNB 的 NNSF 功能根据终端在 RRC 中提供的 S-TMSI 中的 MMEC（或 registeredMME 中的 GUMMEI）找到原来为它服务的 MME；如果终端是首次附着或对应 MME 不可用，eNB 按负荷等因素在池内选择一台 MME。"
        }
      ],
      practice: "用开源 EPC（如 Open5GS 的 EPC 部分）配合 srsRAN 4G 搭建实验环境，用 Wireshark 抓 S1AP、GTPv2-C、Diameter 报文，按协议和端口把每条消息归到对应接口，画出你环境的接口图。"
    },
    {
      id: "lte-attach",
      title: "附着与默认承载建立",
      hours: 5,
      goals: [
        "完整复述 TS 23.401 附着流程，说出每一步涉及的网元和目的",
        "理解附着与默认承载“同时完成”的设计：Attach Request 中捎带 PDN Connectivity Request",
        "掌握 EMM-DEREGISTERED / EMM-REGISTERED 与 ECM-IDLE / ECM-CONNECTED 状态的含义",
        "能根据 EMM / ESM 原因值初步定位附着失败"
      ],
      concepts: ["Attach Request / Accept / Complete", "PDN Connectivity Request（ESM 捎带）", "Update Location（S6a）", "Create Session（S11 / S5）", "Initial Context Setup", "Activate Default EPS Bearer Context", "EMM 与 ECM 状态", "联合附着（EPS / IMSI）", "EMM / ESM 原因值"],
      specs: [
        { id: "TS 23.401", note: "附着流程（E-UTRAN Initial Attach）" },
        { id: "TS 24.301", note: "EMM 附着过程与 ESM 默认承载激活" },
        { id: "TS 36.413", note: "Initial Context Setup" }
      ],
      flow: `sequenceDiagram
    participant UE
    participant eNB
    participant MME
    participant HSS
    participant SGW
    participant PGW
    UE->>eNB: RRC 建立，RRCConnectionSetupComplete 携带 Attach Request + PDN Connectivity Request
    eNB->>MME: S1AP Initial UE Message
    MME->>HSS: Authentication Information Request
    HSS->>MME: Authentication Information Answer（EPS 鉴权向量）
    MME->>UE: Authentication Request / Response
    MME->>UE: NAS Security Mode Command / Complete
    MME->>HSS: Update Location Request
    HSS->>MME: Update Location Answer（签约数据）
    MME->>SGW: Create Session Request
    SGW->>PGW: Create Session Request
    PGW->>SGW: Create Session Response（UE IP、上行 TEID）
    SGW->>MME: Create Session Response
    MME->>eNB: Initial Context Setup Request（Attach Accept + Activate Default EPS Bearer Context Request）
    eNB->>UE: AS Security Mode Command、RRCConnectionReconfiguration
    UE->>eNB: RRCConnectionReconfigurationComplete
    eNB->>MME: Initial Context Setup Response（eNB 下行 TEID）
    UE->>MME: Attach Complete + Activate Default EPS Bearer Context Accept
    MME->>SGW: Modify Bearer Request（eNB 下行 TEID）
    SGW->>MME: Modify Bearer Response`,
      quiz: [
        {
          q: "为什么 LTE 附着完成后终端一定“永远在线”有 IP 地址，而 2G/3G 附着后不一定？",
          a: "LTE 把 PDN 连接建立捎带在附着过程中：Attach Request 里必带 PDN Connectivity Request，附着成功的同时建立默认承载并分配 IP 地址。2G/3G 的 GPRS 附着与 PDP 上下文激活是两个独立过程，附着后不一定有 PDP 上下文。"
        },
        {
          q: "附着时 Initial Context Setup Response 之后，为什么还要做 Modify Bearer Request？",
          a: "Create Session 阶段 SGW 只知道 PGW 的地址，还不知道 eNB 的下行隧道地址；eNB 在 Initial Context Setup Response 中才给出自己的 S1-U 下行 TEID 和 IP。MME 用 Modify Bearer Request 把它告诉 SGW，下行用户面才真正打通。"
        },
        {
          q: "附着被拒，原因值 #19 ESM failure，下一步看什么？",
          a: "#19 表示附着中捎带的 ESM 过程（默认承载建立）失败，要去看 Attach Reject 里携带的 PDN Connectivity Reject 的 ESM 原因值，例如 #27 APN 缺失或未知、#33 未签约该业务选项、#26 资源不足，再对应查 HSS 签约、DNS 解析或 SGW / PGW 侧的 GTP 原因。"
        }
      ],
      practice: "在开源 EPC + srsRAN 环境（或手机工程模式 / 路测软件的 NAS 日志）中抓一次完整附着，按流程图逐条标注 NAS、S1AP、Diameter、GTPv2-C 消息，记录 Attach Accept 中下发的 GUTI、TAI 列表、T3412 和默认承载的 EBI、QCI、APN-AMBR。"
    },
    {
      id: "lte-bearer",
      title: "EPS 承载与 QoS",
      hours: 4,
      goals: [
        "理解 EPS 承载、E-RAB、DRB、S1 承载、S5/S8 承载之间一一对应的关系",
        "掌握 QCI、ARP、GBR / MBR、APN-AMBR、UE-AMBR 的含义和执行位置",
        "熟记 TS 23.203 标准 QCI 表中 QCI 1–9 的资源类型、优先级、时延和丢包指标",
        "理解专用承载由网络发起建立的流程和 TFT 的作用"
      ],
      concepts: ["默认承载 / 专用承载", "GBR / Non-GBR", "QCI", "ARP（优先级、抢占能力 / 被抢占性）", "APN-AMBR / UE-AMBR", "TFT 与包过滤器", "EBI 5–15", "E-RAB = DRB + S1 承载"],
      specs: [
        { id: "TS 23.401", note: "承载模型、专用承载激活流程" },
        { id: "TS 23.203", note: "Table 6.1.7 标准 QCI 特性" },
        { id: "TS 24.301", note: "ESM 承载上下文过程" }
      ],
      quiz: [
        {
          q: "APN-AMBR 和 UE-AMBR 分别由谁执行？为什么 GBR 承载不受它们限制？",
          a: "APN-AMBR 由 PGW 执行（上下行），终端在上行也执行；UE-AMBR 由 eNB 执行。AMBR 约束的是一组 Non-GBR 承载的总速率，GBR 承载有自己的 GBR / MBR 控制，所以不计入 AMBR。"
        },
        {
          q: "VoLTE 通话为什么要建 QCI 1 专用承载而不是复用 QCI 9 默认承载？",
          a: "语音需要稳定速率和低时延：QCI 1 是 GBR，时延预算 100 ms，允许 10^-2 丢包，基站会为它预留资源并配合 RLC UM、ROHC 等优化；QCI 9 是 Non-GBR 尽力而为，拥塞时没有保障。此外 IMS 信令走 QCI 5 承载，优先级最高。"
        }
      ],
      practice: "在手机工程模式或路测软件中查看当前承载列表，记录每条承载的 EBI、QCI、APN；若有 VoLTE 终端，在通话前后对比承载数量变化，找到 QCI 1 专用承载建立与释放对应的 NAS 消息。"
    },
    {
      id: "lte-tau",
      title: "TAU、寻呼与服务请求",
      hours: 4,
      goals: [
        "说出 TAU 的触发条件和类型，区分 MME 内 TAU 与跨 MME TAU",
        "掌握 TAI 列表、T3412 周期 TAU、移动可达定时器与隐式分离的关系",
        "完整复述网络触发的服务请求（寻呼）流程和终端发起的服务请求流程",
        "理解 S1 释放后 ECM-IDLE 状态下哪些上下文保留、哪些释放"
      ],
      concepts: ["TAI 列表", "TAU 类型（普通 / 联合 / 周期）", "T3412 与移动可达定时器", "Downlink Data Notification", "S1AP Paging 与 S-TMSI", "Service Request", "S1 Release", "Active flag"],
      specs: [
        { id: "TS 23.401", note: "TAU、服务请求、S1 释放流程" },
        { id: "TS 24.301", note: "EMM TAU 与服务请求过程、定时器" },
        { id: "TS 36.304", note: "寻呼时机计算" }
      ],
      flow: `sequenceDiagram
    participant UE
    participant eNB
    participant MME
    participant SGW
    Note over UE,SGW: 网络触发的服务请求（终端处于 ECM-IDLE）
    SGW->>MME: Downlink Data Notification（缓存下行数据）
    MME->>SGW: Downlink Data Notification Ack
    MME->>eNB: S1AP Paging（S-TMSI、TAI 列表）
    eNB->>UE: RRC Paging
    UE->>eNB: 随机接入 + RRCConnectionRequest（mt-Access）
    UE->>eNB: RRCConnectionSetupComplete 携带 Service Request
    eNB->>MME: S1AP Initial UE Message
    MME->>eNB: Initial Context Setup Request（E-RAB 列表、KeNB）
    eNB->>UE: AS Security Mode Command、RRCConnectionReconfiguration
    eNB->>MME: Initial Context Setup Response（eNB 下行 TEID）
    MME->>SGW: Modify Bearer Request
    SGW->>MME: Modify Bearer Response
    SGW->>UE: 转发缓存的下行数据`,
      quiz: [
        {
          q: "终端在 TAI 列表内的跟踪区之间移动要不要做 TAU？TAI 列表大小如何取舍？",
          a: "不需要，只有进入列表以外的 TA 或周期定时器 T3412 到期等情况才触发 TAU。TAI 列表越大，TAU 信令越少，但寻呼时要在更多基站下发，寻呼负荷越大；列表越小则相反。现网通常结合话务和移动模式规划，常见做法还会把终端上一次所在 TA 放进列表以抑制边界乒乓 TAU。"
        },
        {
          q: "MME 寻呼不到终端，可能是什么原因？",
          a: "终端可能已移出覆盖或在弱覆盖区收不到寻呼；寻呼范围（TAI 列表、寻呼策略）未覆盖终端实际位置；终端处于 PSM 等省电状态不监听寻呼；MME 中 TAI 列表与基站配置的 TAC 不一致；或空口寻呼拥塞丢弃。需结合 MME 寻呼统计和终端侧日志定界。"
        }
      ],
      practice: "用手机工程模式或路测软件记录一段跨 TAC 的移动过程，找出每次 TAU Request 的类型和触发原因，对比 TAU Accept 中下发的 TAI 列表，判断哪些 TAC 变化没有触发 TAU、为什么。"
    },
    {
      id: "lte-security",
      title: "鉴权与安全（EPS-AKA）",
      hours: 3,
      goals: [
        "复述 EPS-AKA 流程：鉴权向量的组成、终端和网络各自验证什么",
        "画出 EPS 密钥层次：K → CK / IK → KASME → NAS 密钥与 KeNB → AS 密钥",
        "区分 NAS 安全模式与 AS 安全模式，以及加密与完整性保护的覆盖范围",
        "能根据 Authentication Failure 原因值区分 MAC 失败与同步失败"
      ],
      concepts: ["EPS 鉴权向量：RAND / XRES / AUTN / KASME", "双向鉴权（AUTN 验证网络）", "SQN 与同步失败（AUTS）", "KASME 与 KSIASME", "NAS / AS 安全模式命令", "EEA / EIA 算法（SNOW 3G、AES、ZUC）", "KeNB、NH 与 NCC", "NAS COUNT / PDCP COUNT"],
      specs: [
        { id: "TS 33.401", note: "EPS 安全架构、EPS-AKA、密钥层次" },
        { id: "TS 24.301", note: "鉴权与 NAS 安全模式过程" },
        { id: "TS 33.102", note: "UMTS AKA 与 SQN 机制（EPS-AKA 的基础）" }
      ],
      quiz: [
        {
          q: "EPS-AKA 中，终端如何验证网络是真的？网络又如何验证终端？",
          a: "终端的 USIM 用自己的根密钥 K 和收到的 RAND 计算期望的 MAC，与 AUTN 中的 MAC 比较，并检查 SQN 是否在可接受范围，从而确认 AUTN 出自归属网络。网络侧由 MME 比较终端返回的 RES 与鉴权向量中的 XRES，一致则认为终端合法。"
        },
        {
          q: "LTE 空口用户面有完整性保护吗？",
          a: "普通终端的空口用户面数据只加密不做完整性保护（完整性保护只用于 RRC 信令和 NAS 信令；中继节点场景例外）。这是 LTE 安全的一个已知弱点，5G 引入了可选的用户面完整性保护。"
        }
      ],
      practice: "在开源 EPC 实验环境中配置测试卡的 K / OPc，抓一次附着，找到 Authentication Request 中的 RAND、AUTN 和 Security Mode Command 中选定的 EEA / EIA 算法；故意把 OPc 配错一次，观察终端回的 Authentication Failure 原因值。"
    },
    {
      id: "lte-pcc",
      title: "PCC 策略控制与计费",
      hours: 3,
      goals: [
        "说出 PCC 架构中 PCRF、PCEF、AF、OCS、OFCS、SPR 的职责",
        "掌握 Gx、Rx、Gy、Gz 接口的作用和主要 Diameter 消息",
        "理解 PCC 规则的组成以及动态规则与预定义规则的区别",
        "能复述 VoLTE 呼叫中 Rx → Gx → 专用承载的触发链路"
      ],
      concepts: ["PCRF / PCEF", "PCC 规则（SDF 模板、QCI、ARP、计费键）", "Gx：CCR / CCA、RAR / RAA", "Rx：AAR / AAA", "在线计费 Gy 与配额", "离线计费与 CDR", "事件触发器", "用量监控"],
      specs: [
        { id: "TS 23.203", note: "PCC 架构与功能" },
        { id: "TS 29.212", note: "Gx / Gxx 接口" },
        { id: "TS 29.214", note: "Rx 接口" },
        { id: "TS 32.299", note: "Diameter 计费应用（Gy / Ro、Rf）" }
      ],
      quiz: [
        {
          q: "动态 PCC 规则和预定义 PCC 规则有什么区别？",
          a: "动态规则由 PCRF 在 Gx 消息中完整下发（包括 SDF 模板、QoS、计费参数），可按会话实时生成；预定义规则事先配置在 PCEF（PGW）上，PCRF 只需通过规则名激活或去激活。预定义规则常用于需要 DPI 识别的业务（如定向流量包），动态规则常用于 VoLTE 这类由 AF 实时提供媒体信息的业务。"
        },
        {
          q: "预付费用户余额用完时，Gy 上发生了什么？",
          a: "OCS 在最后一次授予配额时可携带最终单元指示（Final-Unit-Indication），配额耗尽后 PGW 按指示执行终止、限制访问或重定向到充值页面等动作；也可能直接以拒绝应答结束信用控制会话。具体动作取决于运营商计费策略。"
        }
      ],
      practice: "用公开资料或开源 PCRF / OCS 模拟器（如 Open5GS 自带的 PCRF）抓一次附着中的 Gx CCR-Initial / CCA-Initial，找出下发的默认承载 QCI、APN-AMBR 和事件触发器；再画出 VoLTE 主叫时 Rx AAR 到专用承载建立的完整消息链。"
    }
  ]
};
