// LTE 路径 · 阶段 4 EPC 核心网：模块知识讲解
window.LESSONS = window.LESSONS || {};
window.LESSONS["lte"] = window.LESSONS["lte"] || {};

Object.assign(window.LESSONS["lte"], {
  // ───────────── 4.1 EPC 网元与接口详解 ─────────────
  "lte-epc": {
    sections: [
      {
        h: "EPC 的设计思路",
        p: [
          "EPC（Evolved Packet Core）是一张**纯分组域**核心网：没有 CS 域，语音要么回落到 2G/3G（CSFB，见 5.1），要么走 IMS（VoLTE，见 5.2）。总体架构图和 E-UTRAN 部分见 1.1，这里聚焦每个核心网元“管什么、不管什么”，以及接口上跑的协议。"
        ],
        list: [
          "**控制面与用户面分开**：MME 只处理信令，不碰用户数据；用户数据走 eNB → SGW → PGW。",
          "**扁平化**：取消了 RNC，eNB 直接连核心网，S1 接口一分为二：S1-MME（信令）和 S1-U（数据）。",
          "**“永远在线”**：附着时就建立默认承载并分配 IP 地址（见 4.2）。",
          "**统一用 GTP 隧道和 Diameter**：GTPv2-C 管会话，GTP-U 运数据，Diameter 连签约库和策略服务器。"
        ]
      },
      {
        h: "核心网元职责",
        table: {
          head: ["网元", "主要职责", "不负责 / 易混点"],
          rows: [
            ["MME", "NAS 信令与 NAS 安全；鉴权；跟踪区列表管理；空闲态可达性（寻呼）；SGW / PGW 选择；承载管理信令；跨 MME 切换时选择目标 MME", "不转发用户数据；不分配 IP 地址"],
            ["SGW", "eNB 间切换的本地移动锚点；3GPP 异系统移动锚点；空闲态下行数据缓存并触发 DDN；按 UE / PDN / QCI 统计（漫游结算）；合法监听", "不直接连外部数据网络；不分配 IP"],
            ["PGW", "UE IP 地址分配；PCEF（策略执行、门控、速率控制）；按业务流计费；APN-AMBR 执行；连接外部 PDN（SGi）；下行传输层 DSCP 标记", "不感知无线侧位置细节（只知道用户位置信息上报）"],
            ["HSS", "存储用户签约（APN 配置、QoS、接入限制、MSISDN 等）；内含 AuC 生成鉴权向量；记录当前服务的 MME", "不参与用户面"],
            ["PCRF", "根据签约、业务和网络状态做策略决策，下发 PCC 规则（见 4.6）", "不执行策略，执行在 PGW"]
          ]
        },
        tip: "记住一句话：MME 管“人在哪、是谁”，SGW 管“数据往哪个基站送”，PGW 管“数据从哪出网、按什么规则收费”。"
      },
      {
        h: "主要接口与协议",
        table: {
          head: ["接口", "两端", "协议（传输）", "作用"],
          rows: [
            ["S1-MME", "eNB – MME", "S1AP over SCTP（端口 36412）", "UE 上下文管理、E-RAB 管理、寻呼、S1 切换、NAS 透传"],
            ["S1-U", "eNB – SGW", "GTP-U over UDP（端口 2152）", "用户面隧道"],
            ["S11", "MME – SGW", "GTPv2-C over UDP（端口 2123）", "会话与承载的建立、修改、删除；DDN"],
            ["S5 / S8", "SGW – PGW", "GTPv2-C + GTP-U（或 PMIP）", "S5 用于本网，S8 用于漫游归属地路由"],
            ["S6a", "MME – HSS", "Diameter over SCTP / TCP（常用端口 3868）", "鉴权向量获取、位置更新、签约下发"],
            ["S10", "MME – MME", "GTPv2-C", "跨 MME 的 TAU / 切换时传递 UE 上下文"],
            ["S3 / S4", "MME – SGSN / SGW – SGSN", "GTPv2-C（S4 还有 GTP-U）", "与 2G/3G 分组域互操作"],
            ["SGs", "MME – MSC/VLR", "SGsAP over SCTP", "CSFB、SMS over SGs（见 5.1）"],
            ["Gx", "PGW – PCRF", "Diameter", "策略与计费规则下发"],
            ["SGi", "PGW – 外部 PDN", "IP", "连接互联网、IMS 等数据网络"],
            ["S13", "MME – EIR", "Diameter", "终端 IMEI 检查"]
          ]
        },
        after: ["端口号是 IANA 分配的默认值，现网可能另配；抓包时按协议解码更可靠。"]
      },
      {
        h: "GTP 隧道与 TEID",
        p: [
          "用户数据在 S1-U、S5/S8 上都封装在 **GTP-U 隧道**里：外层是传输网 IP/UDP，内层是用户的 IP 包。每条隧道的一端用 **TEID（隧道端点标识）+ IP 地址**表示，合称 F-TEID。隧道是单向编号的：发往 SGW 的包带的是 SGW 分配的 TEID。"
        ],
        table: {
          head: ["隧道端点", "由谁分配", "在哪条消息里交换（附着时）"],
          rows: [
            ["PGW S5 上行 TEID", "PGW", "Create Session Response（PGW → SGW）"],
            ["SGW S1-U 上行 TEID", "SGW", "Create Session Response → Initial Context Setup Request 带给 eNB"],
            ["eNB S1-U 下行 TEID", "eNB", "Initial Context Setup Response → Modify Bearer Request 带给 SGW"],
            ["SGW S5 下行 TEID", "SGW", "Create Session Request（SGW → PGW）"]
          ]
        },
        tip: "用户面不通时，先核对两端 TEID 是否一致：eNB 发上行用的 TEID 必须是 SGW 分配的那个，SGW 发下行用的必须是 eNB 分配的那个。"
      },
      {
        h: "MME 池与网元选择",
        list: [
          "**MME 池（S1-flex）**：一个 eNB 可同时连接池内多台 MME，实现负荷分担和容灾。池由 MMEGI 标识，池内每台 MME 由 MMEC 标识。",
          "**GUTI = GUMMEI + M-TMSI**，GUMMEI = MCC + MNC + MMEGI + MMEC（标识详解见 1.4）。终端在 RRC 建立时带上 S-TMSI（MMEC + M-TMSI）或 GUMMEI，eNB 的 **NNSF** 据此把 NAS 消息路由回原 MME。",
          "**SGW 选择**：MME 常用 DNS 按 TAI 构造域名查询，得到服务该跟踪区的 SGW 候选。",
          "**PGW 选择**：MME 按 APN 构造 APN-FQDN 做 DNS 查询（NAPTR / SRV），得到 PGW 地址；也可用 HSS 签约里的静态 PGW 地址。DNS 规则见 TS 29.303。",
          "**负荷重均衡**：MME 可通过 S1AP 指示让部分终端重新选择池内其他 MME，常见做法用于割接、扩容。"
        ],
        tip: "附着失败且 ESM 原因是 APN 相关，别只查签约，DNS 中 APN-FQDN 记录缺失或指向错误同样会导致 PGW 选择失败。"
      },
      {
        h: "演进：CUPS 与向 5GC 过渡",
        p: [
          "R14 引入 **CUPS**（控制面用户面分离），把 SGW、PGW 各自拆成控制面（SGW-C / PGW-C）和用户面（SGW-U / PGW-U），之间用 Sx 接口（PFCP 协议）下发转发规则。这样用户面可以下沉到地市或边缘，控制面集中部署。"
        ],
        table: {
          head: ["EPC 网元", "5GC 中大致对应"],
          rows: [
            ["MME", "AMF（移动性）+ SMF（会话部分）"],
            ["SGW-C / PGW-C", "SMF"],
            ["SGW-U / PGW-U", "UPF"],
            ["HSS", "UDM / AUSF（融合部署时常见 HSS + UDM 合设）"],
            ["PCRF", "PCF"]
          ]
        },
        after: ["NSA 组网（EN-DC）下锚点仍是 EPC，核心网侧只需支持双连接相关能力；SA 的 4/5G 互操作中常见 SMF+PGW-C、UPF+PGW-U 合设，详见 5.4。"]
      }
    ]
  },

  // ───────────── 4.2 附着与默认承载建立 ─────────────
  "lte-attach": {
    sections: [
      {
        h: "三层状态：EMM、ECM、RRC",
        p: [
          "理解附着前先分清三组状态。它们分别在不同层次描述终端，组合起来才能完整描述终端“在网上的样子”。"
        ],
        table: {
          head: ["状态机", "取值", "含义", "维护者"],
          rows: [
            ["EMM（移动性管理）", "EMM-DEREGISTERED / EMM-REGISTERED", "网络是否知道这个终端、能否给它提供业务；附着成功进入 REGISTERED，分离进入 DEREGISTERED", "UE 与 MME"],
            ["ECM（连接管理）", "ECM-IDLE / ECM-CONNECTED", "UE 与 MME 之间是否存在 NAS 信令连接（RRC 连接 + S1 连接）", "UE 与 MME"],
            ["RRC", "RRC_IDLE / RRC_CONNECTED", "UE 与 eNB 之间是否有 RRC 连接（见 3.1）", "UE 与 eNB"]
          ]
        },
        list: [
          "EMM-REGISTERED + ECM-IDLE：已附着但没有连接，MME 只知道终端在 TAI 列表范围内，有下行数据需要寻呼。",
          "EMM-REGISTERED + ECM-CONNECTED：有连接，MME 知道终端所在 eNB（小区粒度）。",
          "LTE 中 ECM-CONNECTED 与 RRC_CONNECTED 基本同步：S1 连接释放时 RRC 连接一并释放（对比 5G 有 RRC_INACTIVE 而核心网保持 CM-CONNECTED）。"
        ]
      },
      {
        h: "附着的类型与触发",
        table: {
          head: ["附着类型（Attach type）", "用途"],
          rows: [
            ["EPS attach", "只注册 EPS 业务（纯数据、或 VoLTE 终端）"],
            ["Combined EPS/IMSI attach", "同时在 CS 域 MSC/VLR 登记，用于 CSFB 和 SMS over SGs（见 5.1）"],
            ["EPS emergency attach", "无卡或受限情况下仅为紧急业务接入"]
          ]
        },
        after: [
          "终端身份：有有效 GUTI 时带 GUTI（保护隐私）；没有时带 IMSI，这也是 LTE 中 IMSI 可能明文暴露在空口的场景。Attach Request 中还带 UE 网络能力（支持的安全算法等）、上次访问的 TAI、DRX 参数，以及 **ESM 消息容器里的 PDN Connectivity Request**（PDN 类型、可选 APN、PCO）。"
        ]
      },
      {
        h: "附着全流程逐步解读",
        steps: [
          "**RRC 建立**：随机接入和 RRC 连接建立（见 3.2），建立原因通常为 mo-Signalling；Attach Request 放在 RRCConnectionSetupComplete 中。",
          "**eNB 选择 MME**：通过 NNSF 选择 MME，发送 S1AP Initial UE Message，并附上 TAI、ECGI。",
          "**身份获取**：若终端带的是其他 MME 分配的 GUTI，新 MME 通过 S10 向旧 MME 发 Identification Request 取 IMSI 和安全上下文；取不到则向终端发 Identity Request 要 IMSI。",
          "**鉴权与 NAS 安全**：MME 向 HSS 发 Authentication Information Request 取鉴权向量，执行 EPS-AKA 和 NAS Security Mode Command（见 4.5）。可同时通过 Identity Request 获取 IMEI 并到 EIR 做检查（可选）。",
          "**ESM 信息请求（可选）**：若终端在请求中设置了 ESM information transfer flag，MME 在安全建立后再用 ESM Information Request 获取 APN 和 PCO，避免这些信息明文传输。",
          "**位置更新**：MME 向 HSS 发 Update Location Request；HSS 若记录有旧 MME，向旧 MME 发 Cancel Location；然后回 Update Location Answer，携带签约数据（APN 配置、默认 QCI / ARP、APN-AMBR、UE-AMBR、接入限制等）。",
          "**创建会话**：MME 选择 SGW / PGW，发 Create Session Request（IMSI、APN、PDN 类型、RAT 类型、默认承载 EBI 及 QoS 等）；SGW 转发给 PGW。",
          "**策略与 IP 分配**：PGW 向 PCRF 发 Gx CCR-Initial 获取策略（见 4.6），分配 UE IP 地址，回 Create Session Response（含 IP 地址、上行 TEID）。",
          "**建立无线侧承载**：MME 发 S1AP Initial Context Setup Request，里面带 E-RAB 信息（QCI、ARP、SGW 上行 TEID）、UE-AMBR、安全密钥 KeNB，以及 NAS 消息 Attach Accept（内含 Activate Default EPS Bearer Context Request）。",
          "**空口配置**：eNB 先执行 AS 安全模式，必要时获取终端无线能力（UECapabilityEnquiry），再用 RRCConnectionReconfiguration 建立 DRB 并把 NAS 消息转给终端。",
          "**eNB 回应**：Initial Context Setup Response 带上 eNB 的下行 TEID。",
          "**附着完成**：终端发 Attach Complete（内含 Activate Default EPS Bearer Context Accept）。此后终端可以发上行数据。",
          "**打通下行**：MME 发 Modify Bearer Request 把 eNB 下行 TEID 告诉 SGW，SGW 回 Modify Bearer Response。下行用户面至此打通。"
        ]
      },
      {
        h: "附着时序图",
        flow: `sequenceDiagram
    participant UE
    participant eNB
    participant MME
    participant HSS
    participant SGW
    participant PGW
    participant PCRF
    UE->>eNB: RRCConnectionSetupComplete（Attach Request + PDN Connectivity Request）
    eNB->>MME: Initial UE Message
    MME->>HSS: Authentication Information Request / Answer
    MME->>UE: Authentication Request / Response
    MME->>UE: Security Mode Command / Complete
    MME->>HSS: Update Location Request
    HSS->>MME: Update Location Answer（签约数据）
    MME->>SGW: Create Session Request
    SGW->>PGW: Create Session Request
    PGW->>PCRF: Gx CCR-Initial
    PCRF->>PGW: Gx CCA-Initial（PCC 规则）
    PGW->>SGW: Create Session Response
    SGW->>MME: Create Session Response
    MME->>eNB: Initial Context Setup Request（Attach Accept）
    eNB->>UE: RRCConnectionReconfiguration（建立 DRB，转 Attach Accept）
    UE->>eNB: RRCConnectionReconfigurationComplete
    eNB->>MME: Initial Context Setup Response
    UE->>MME: Attach Complete
    MME->>SGW: Modify Bearer Request
    SGW->>MME: Modify Bearer Response`,
        after: ["图中省略了身份获取、旧 MME 交互、ESM 信息请求、AS 安全模式等可选或嵌套步骤，以文字步骤为准。"]
      },
      {
        h: "Attach Accept 下发了什么",
        table: {
          head: ["信元", "作用"],
          rows: [
            ["GUTI", "新分配的临时身份，此后代替 IMSI 使用"],
            ["TAI list", "在这些跟踪区内移动不用做 TAU（见 4.4）"],
            ["T3412", "周期 TAU 定时器，默认 54 分钟（网络可另配）"],
            ["EPS attach result", "实际结果：仅 EPS 或联合 EPS/IMSI"],
            ["EPS network feature support", "网络能力指示，如是否支持 IMS 语音（IMS VoPS），决定终端走 VoLTE 还是 CSFB"],
            ["ESM 容器", "Activate Default EPS Bearer Context Request：EBI、APN、PDN 地址（IP）、EPS QoS（QCI）、APN-AMBR、PCO（如 DNS、P-CSCF 地址）"]
          ]
        },
        tip: "终端显示 4G 但打不了 VoLTE，先看 Attach Accept（或 TAU Accept）里 IMS VoPS 指示是否为支持，再看是否建立了 IMS APN 的 PDN 连接。"
      },
      {
        h: "附着失败：常见原因值",
        p: ["Attach Reject 携带 EMM 原因值；若是默认承载建立失败，原因值为 #19，具体原因看捎带的 PDN Connectivity Reject 中的 ESM 原因值。"],
        table: {
          head: ["EMM 原因值", "含义", "常见场景 / 终端行为"],
          rows: [
            ["#3", "Illegal UE", "鉴权失败（RES 不匹配）；终端认为 USIM 无效，直到关机或换卡"],
            ["#6", "Illegal ME", "IMEI 被 EIR 拒绝（黑名单）"],
            ["#7", "EPS services not allowed", "未开通 4G 签约；终端不再尝试 EPS 业务"],
            ["#8", "EPS services and non-EPS services not allowed", "EPS 与非 EPS 业务都不允许"],
            ["#11", "PLMN not allowed", "漫游受限，终端将该 PLMN 加入禁止列表"],
            ["#12", "Tracking area not allowed", "区域限制，加入禁止跟踪区列表"],
            ["#13", "Roaming not allowed in this tracking area", "该跟踪区不允许漫游"],
            ["#14", "EPS services not allowed in this PLMN", "该 PLMN 不提供 EPS 业务"],
            ["#15", "No suitable cells in tracking area", "终端应在同 PLMN 其他跟踪区找小区"],
            ["#17", "Network failure", "核心网内部故障（如 HSS / SGW 无响应）"],
            ["#19", "ESM failure", "默认承载建立失败，看 ESM 原因"],
            ["#22", "Congestion", "MME 拥塞，通常带回退定时器 T3346"]
          ]
        },
        after: ["常见 ESM 原因值：#26 资源不足、#27 APN 缺失或未知、#28 未知 PDN 类型、#29 用户鉴权失败（PAP/CHAP 等）、#30 被 SGW 或 PGW 拒绝、#33 请求的业务选项未签约、#38 网络故障。"],
        tip: "附着失败先看三件事：原因值是 EMM 还是 ESM；失败前最后一条成功的消息是什么；对应接口（S6a、S11、S5、Gx）上有没有错误应答。"
      }
    ]
  },

  // ───────────── 4.3 EPS 承载与 QoS ─────────────
  "lte-bearer": {
    sections: [
      {
        h: "承载是什么：分段一一对应",
        p: [
          "**EPS 承载**是 UE 到 PGW 之间具有统一 QoS 的一条逻辑通道，是 EPC 中 QoS 控制的最小粒度：同一承载内的所有数据包享受相同的转发待遇。EPS 承载由三段串接而成，各段**一一对应**。"
        ],
        table: {
          head: ["分段", "范围", "载体"],
          rows: [
            ["无线承载 DRB", "UE – eNB", "PDCP / RLC / 逻辑信道（DRB 对应的 LCID 为 3–10，见 1.2）"],
            ["S1 承载", "eNB – SGW", "GTP-U 隧道"],
            ["S5/S8 承载", "SGW – PGW", "GTP-U 隧道"]
          ]
        },
        after: [
          "**E-RAB = DRB + S1 承载**，S1AP 中的 E-RAB ID 与 EPS 承载标识 EBI 取值相同。EBI 为 4 比特，可用值 5–15，因此一个终端最多同时有 11 条 EPS 承载。"
        ]
      },
      {
        h: "默认承载与专用承载",
        table: {
          head: ["对比项", "默认承载", "专用承载"],
          rows: [
            ["何时建立", "建立 PDN 连接时（附着时或附加 PDN 连接）", "已有 PDN 连接后，按需建立"],
            ["资源类型", "一定是 Non-GBR", "GBR 或 Non-GBR"],
            ["TFT", "可以没有（匹配不到其他承载的包都走它）", "必须有 TFT 指定哪些业务流走它"],
            ["生命周期", "与 PDN 连接同生共死", "可单独建立、修改、释放"],
            ["典型例子", "上网 APN 的 QCI 9；IMS APN 的 QCI 5", "VoLTE 语音 QCI 1、视频 QCI 2"]
          ]
        },
        after: ["每个 PDN 连接有且只有一条默认承载。一个终端可以有多个 PDN 连接（如互联网 APN 和 IMS APN 各一个），每个 PDN 连接有自己的 IP 地址。"]
      },
      {
        h: "QoS 参数及执行位置",
        table: {
          head: ["参数", "粒度", "含义", "执行者"],
          rows: [
            ["QCI", "承载", "标量索引，指向一组标准化转发特性（资源类型、优先级、时延预算、丢包率）", "eNB 调度、各节点队列"],
            ["ARP", "承载", "分配与保持优先级：优先级 1–15（1 最高）+ 抢占能力 + 被抢占性；只用于准入和拥塞时抢占，不影响调度", "eNB、MME / SGW / PGW 准入"],
            ["GBR / MBR", "GBR 承载", "保证速率与最大速率", "eNB（空口）、PGW（下行）、UE（上行）"],
            ["APN-AMBR", "每 UE 每 APN", "该 APN 所有 Non-GBR 承载总速率上限", "PGW（上下行）、UE（上行）"],
            ["UE-AMBR", "每 UE", "该终端所有 Non-GBR 承载总速率上限", "eNB（上下行）"]
          ]
        },
        tip: "用户投诉“速率被限死在某个整数值”，先查签约和 PCC 下发的 APN-AMBR / UE-AMBR，再查空口。速率曲线是平顶、非常稳定时，多半是 AMBR 或策略限速。"
      },
      {
        h: "标准 QCI 表（TS 23.203 Table 6.1.7）",
        table: {
          head: ["QCI", "资源类型", "优先级", "包时延预算", "丢包率", "典型业务"],
          rows: [
            ["1", "GBR", "2", "100 ms", "10^-2", "会话语音（VoLTE）"],
            ["2", "GBR", "4", "150 ms", "10^-3", "会话视频（实时流）"],
            ["3", "GBR", "3", "50 ms", "10^-3", "实时游戏、V2X 消息"],
            ["4", "GBR", "5", "300 ms", "10^-6", "非会话视频（缓冲流）"],
            ["65", "GBR", "0.7", "75 ms", "10^-2", "关键任务一键通（MC-PTT）语音"],
            ["66", "GBR", "2", "100 ms", "10^-2", "非关键任务一键通语音"],
            ["5", "Non-GBR", "1", "100 ms", "10^-6", "IMS 信令"],
            ["6", "Non-GBR", "6", "300 ms", "10^-6", "视频（缓冲流）、TCP 类业务"],
            ["7", "Non-GBR", "7", "100 ms", "10^-3", "语音、实时视频、交互游戏"],
            ["8", "Non-GBR", "8", "300 ms", "10^-6", "TCP 类业务（常用于高等级用户上网）"],
            ["9", "Non-GBR", "9", "300 ms", "10^-6", "TCP 类业务（普通用户默认承载）"],
            ["69", "Non-GBR", "0.5", "60 ms", "10^-6", "关键任务时延敏感信令（MC-PTT 信令）"],
            ["70", "Non-GBR", "5.5", "200 ms", "10^-6", "关键任务数据"]
          ]
        },
        after: [
          "优先级数值越小越优先。QCI 1–9 自 R8 起就有；65、66、69、70 等是后续版本为公共安全（关键任务）增加的，规范中还有 V2X、低时延等更多 QCI，以所用版本的 Table 6.1.7 为准。",
          "包时延预算是 UE 到 PCEF 的上限，其中核心网部分通常按约 20 ms 估计，剩余留给空口。QCI 到传输网 DSCP 的映射由运营商规划，常见做法如 QCI 1 映射 EF，但并非标准强制。"
        ]
      },
      {
        h: "TFT 与业务流映射",
        p: [
          "**TFT（Traffic Flow Template）**是一组包过滤器，按源 / 目的 IP、端口、协议号、DSCP 等匹配数据包，决定包走哪条承载。下行 TFT 在 PGW 执行，上行 TFT 在 UE 执行，二者由网络统一下发保证一致。每个过滤器有优先级（evaluation precedence），按优先级逐条匹配，都匹配不上的包走默认承载。"
        ],
        list: [
          "一个 TFT 最多可包含 16 个包过滤器（编码规则见 TS 24.008）。",
          "VoLTE 语音专用承载的 TFT 通常就是 SDP 协商出的对端 IP 和 RTP / RTCP 端口。",
          "TFT 配错（如端口不一致）会导致语音包走了默认承载，表现为承载建了但通话质量差或单通。"
        ]
      },
      {
        h: "专用承载建立流程（网络发起）",
        steps: [
          "**触发**：PCRF 根据 AF（如 P-CSCF）的请求或自身策略，向 PGW 发 Gx RAR 下发新的 PCC 规则（见 4.6）。",
          "**PGW 发起**：PGW 根据 PCC 规则的 QCI / ARP 决定新建承载，向 SGW 发 Create Bearer Request（含 QoS、上行 TFT、PGW 上行 TEID）。",
          "**SGW 转发**：SGW 向 MME 发 Create Bearer Request，带上 SGW 的 S1-U 上行 TEID。",
          "**MME 分配 EBI**：MME 分配 EBI，构造 NAS 消息 Activate Dedicated EPS Bearer Context Request，连同 E-RAB 参数放入 S1AP E-RAB Setup Request。",
          "**eNB 准入与空口建立**：eNB 按 QCI / ARP / GBR 做准入，通过 RRCConnectionReconfiguration 新建 DRB，回 E-RAB Setup Response（含 eNB 下行 TEID）。",
          "**终端确认**：终端通过上行 NAS 发送 Activate Dedicated EPS Bearer Context Accept。",
          "**回应链路**：MME 向 SGW 回 Create Bearer Response，SGW 向 PGW 回 Create Bearer Response，PGW 再向 PCRF 回 RAA 或上报规则安装结果。"
        ],
        tip: "专用承载建立失败时，看 E-RAB Setup Response 中失败列表的原因（如无线资源不足），以及 GTP Create Bearer Response 的原因值，可快速区分是无线侧准入拒绝还是核心网问题。"
      }
    ]
  },

  // ───────────── 4.4 TAU、寻呼与服务请求 ─────────────
  "lte-tau": {
    sections: [
      {
        h: "跟踪区与 TAI 列表",
        p: [
          "**TA（跟踪区）**是 LTE 空闲态位置管理的单位，由 TAI = MCC + MNC + TAC 标识，小区在 SIB1 广播所属 TAC。MME 在附着 / TAU Accept 中给终端下发一个 **TAI 列表**：终端在列表内任一 TA 中移动都不用上报，寻呼时 MME 在列表内的所有 TA 寻呼。"
        ],
        table: {
          head: ["TAI 列表策略", "TAU 信令", "寻呼负荷", "适用"],
          rows: [
            ["列表小（如仅当前 TA）", "多", "小", "高业务密度、移动少的区域"],
            ["列表大", "少", "大", "高速移动场景（铁路、高速）"],
            ["包含上次 TA（常见做法）", "抑制边界乒乓 TAU", "适中", "TA 边界区域"]
          ]
        },
        after: ["与 2G/3G 的位置区 / 路由区不同，一个小区只属于一个 TA，但 TAI 列表让不同终端可以有不同的“位置区”，规划更灵活。TAC 规划见 6.2。"]
      },
      {
        h: "TAU 的触发与类型",
        list: [
          "进入一个不在 TAI 列表中的 TA（最常见）。",
          "周期 TAU 定时器 **T3412** 到期（默认 54 分钟，网络在 Attach / TAU Accept 中下发实际值）。",
          "从 2G/3G 重选回 LTE 且未激活 ISR（TIN 指示为 P-TMSI），如 CSFB 结束返回后。",
          "终端核心网能力、DRX 参数、无线能力等发生变化。",
          "收到 RRC 释放原因 load balancing TAU required（MME 负荷重均衡，见 4.1）；以及联合附着终端在 CS 域需要更新时。"
        ],
        table: {
          head: ["EPS update type", "说明"],
          rows: [
            ["TA updating", "普通 TAU"],
            ["Combined TA/LA updating", "联合更新，同时更新 CS 域位置区（CSFB 终端）"],
            ["Combined TA/LA updating with IMSI attach", "联合更新并在 CS 域附着"],
            ["Periodic updating", "周期 TAU"]
          ]
        },
        after: ["TAU Request 中的 **Active flag** 置位表示终端有上行数据要发，MME 在 TAU 完成后不释放连接而是直接建立用户面承载。"]
      },
      {
        h: "跨 MME 的 TAU 流程",
        p: ["终端移动到另一台 MME 服务的区域时，新 MME 需要从旧 MME 取回上下文，并向 HSS 登记。若 SGW 也要更换，还要在新 SGW 上建会话、删除旧 SGW 会话。"],
        flow: `sequenceDiagram
    participant UE
    participant eNB
    participant newMME as new MME
    participant oldMME as old MME
    participant SGW
    participant HSS
    UE->>eNB: RRCConnectionSetupComplete（TAU Request，旧 GUTI）
    eNB->>newMME: Initial UE Message
    newMME->>oldMME: Context Request（S10）
    oldMME->>newMME: Context Response（IMSI、安全上下文、承载上下文）
    newMME->>UE: 鉴权与 NAS 安全（可选）
    newMME->>oldMME: Context Acknowledge
    newMME->>SGW: Modify Bearer Request（SGW 不变时）
    SGW->>newMME: Modify Bearer Response
    newMME->>HSS: Update Location Request
    HSS->>oldMME: Cancel Location
    oldMME->>HSS: Cancel Location Ack
    HSS->>newMME: Update Location Answer
    newMME->>UE: TAU Accept（新 GUTI、TAI 列表）
    UE->>newMME: TAU Complete（分配了新 GUTI 时）`,
        after: ["MME 内的 TAU 简单得多：MME 直接处理，通常不涉及 HSS 和 SGW，只回 TAU Accept。TAU 被拒的原因值与附着相同体系，如 #9（网络无法从 GUTI 推出终端身份，终端需重新附着）、#10（已被隐式分离）。"]
      },
      {
        h: "可达性管理：定时器链",
        table: {
          head: ["定时器", "位置", "作用"],
          rows: [
            ["T3412", "UE", "周期 TAU，默认 54 分钟"],
            ["移动可达定时器", "MME", "默认比 T3412 长 4 分钟；超时说明终端可能失联，MME 停止寻呼该终端"],
            ["隐式分离定时器", "MME", "移动可达定时器超时后启动，时长由网络决定；超时后 MME 隐式分离终端"],
            ["T3324 / 扩展 T3412", "UE", "PSM 省电模式相关（见 7.2）"]
          ]
        },
        tip: "大量终端被隐式分离后，下次发起业务会收到 #10 Implicitly detached 而需重新附着。若某区域 #10 偏多，排查是否存在覆盖空洞导致周期 TAU 发不出去。"
      },
      {
        h: "寻呼与网络触发的服务请求",
        steps: [
          "**下行数据到达**：终端处于 ECM-IDLE，SGW 上没有 S1-U 下行隧道，SGW 缓存数据并向 MME 发 Downlink Data Notification（DDN）。",
          "**MME 确认并寻呼**：MME 回 DDN Ack，向 TAI 列表内的 eNB 发 S1AP Paging，携带终端的 S-TMSI（异常恢复时用 IMSI）、TAI 列表、UE 寻呼标识等。寻呼范围与重发策略（先最近 eNB 再扩大范围等）是常见的厂家优化，因厂家而异。",
          "**空口寻呼**：eNB 在终端的寻呼时机（由 IMSI 和 DRX 周期计算，见 2.6、3.1）发送 RRC Paging。",
          "**终端响应**：终端发起随机接入，RRCConnectionRequest 建立原因为 mt-Access，在 RRCConnectionSetupComplete 中携带 NAS **Service Request**。",
          "**恢复承载**：MME 可选地重新鉴权，然后发 Initial Context Setup Request，为终端所有承载恢复 E-RAB 并下发 KeNB。",
          "**打通下行**：eNB 回 Initial Context Setup Response 后，MME 发 Modify Bearer Request 把 eNB 下行 TEID 告诉 SGW，SGW 把缓存数据下发。"
        ],
        after: ["若寻呼的是 CSFB 来话或 SMS，寻呼来自 SGs 接口，终端响应 Extended Service Request（见 5.1）。若 IMSI 寻呼，终端需要本地分离后重新附着。"]
      },
      {
        h: "终端发起的服务请求与 S1 释放",
        p: [
          "终端在空闲态有上行数据时，发起 Service Request（RRC 建立原因 mo-Data），后续流程与上面第 5–6 步相同。Service Request 是一条很短的 NAS 消息，只包含 KSI、序列号和短 MAC，用于让 MME 确认身份。"
        ],
        steps: [
          "**触发**：eNB 检测到终端在一段时间内没有数据（用户不活动定时器，时长因厂家和参数而异），发 S1AP UE Context Release Request（原因 user inactivity）。",
          "**释放用户面**：MME 向 SGW 发 Release Access Bearers Request，SGW 删除 eNB 下行 TEID，之后下行数据会触发 DDN。",
          "**释放 S1 与 RRC**：MME 发 UE Context Release Command，eNB 发 RRCConnectionRelease，回 UE Context Release Complete。"
        ],
        table: {
          head: ["ECM-IDLE 下保留的", "释放的"],
          rows: [
            ["MME 中的 EMM / ESM 上下文、安全上下文、GUTI", "eNB 中的 UE 上下文、S1 连接"],
            ["SGW / PGW 中的承载上下文与 IP 地址", "SGW 中的 eNB 下行 TEID、DRB"]
          ]
        },
        tip: "现网看到 Service Request 失败多，按原因值分：#9 / #10 指向身份或上下文丢失（终端会重新附着），#40（No EPS bearer context activated）指向承载上下文不一致；再看 Initial Context Setup 是否失败（无线侧准入）。"
      }
    ]
  },

  // ───────────── 4.5 鉴权与安全（EPS-AKA）─────────────
  "lte-security": {
    sections: [
      {
        h: "EPS 安全要解决什么",
        list: [
          "**双向鉴权**：网络确认终端是合法用户，终端也确认网络持有归属网络授权（防伪基站冒充核心网）。",
          "**密钥协商**：鉴权的同时推导出会话密钥，根密钥 K 永不离开 USIM 和 AuC。",
          "**信令保护**：NAS 和 RRC 信令都做加密 + 完整性保护。",
          "**用户面保密**：空口用户面加密（无完整性保护，中继节点场景除外）。",
          "**服务网绑定**：KASME 推导时加入服务网络标识（SN id），某个拜访网拿到的密钥不能用在其他网络。"
        ]
      },
      {
        h: "EPS-AKA 流程",
        steps: [
          "**取鉴权向量**：MME 向 HSS 发 Authentication Information Request（IMSI、服务网络标识）。HSS / AuC 用 K 和 SQN 生成 EPS 鉴权向量：**RAND、XRES、AUTN、KASME**，在 Authentication Information Answer 中返回（可一次返回多组）。",
          "**下发挑战**：MME 选一组向量，发 Authentication Request（RAND、AUTN、KSIASME）。KSIASME 是 3 比特的密钥集标识，后续用来指代这个 KASME。",
          "**终端验证网络**：USIM 用 K 和 RAND 算出 AK，解出 SQN，计算 XMAC 与 AUTN 中的 MAC 比较；并检查 SQN 是否新鲜。终端还检查 AUTN 中 AMF 字段的“分离位”，确认这是 EPS 用的向量。",
          "**终端算结果与密钥**：USIM 计算 RES、CK、IK；ME 用 CK、IK、SN id、SQN⊕AK 推导 KASME。",
          "**网络验证终端**：终端发 Authentication Response（RES），MME 比较 RES 与 XRES，一致则鉴权成功。",
          "**激活 NAS 安全**：MME 随后发 NAS Security Mode Command（见下文）。"
        ],
        flow: `sequenceDiagram
    participant UE
    participant MME
    participant HSS
    MME->>HSS: Authentication Information Request（IMSI、SN id）
    HSS->>MME: Authentication Information Answer（RAND、XRES、AUTN、KASME）
    MME->>UE: Authentication Request（RAND、AUTN、KSIasme）
    Note over UE: USIM 校验 MAC 与 SQN，算 RES、CK、IK，推导 KASME
    UE->>MME: Authentication Response（RES）
    Note over MME: 比较 RES 与 XRES
    MME->>UE: Security Mode Command（算法、回放的 UE 安全能力，带 MAC）
    UE->>MME: Security Mode Complete（加密 + 完整性保护）`
      },
      {
        h: "鉴权失败的几种情况",
        table: {
          head: ["消息 / 原因值", "含义", "后续处理"],
          rows: [
            ["Authentication Failure #20 MAC failure", "终端算出的 MAC 与 AUTN 不符，认为网络不可信", "MME 可能先用 Identity Request 获取 IMSI 再重新鉴权；持续失败多为卡数据（K / OPc）不一致或伪基站"],
            ["Authentication Failure #21 Synch failure", "MAC 正确但 SQN 不在可接受范围", "终端携带 AUTS，MME 带 RAND 和 AUTS 请 HSS 重同步 SQN 后下发新向量"],
            ["Authentication Failure #26 non-EPS authentication unacceptable", "AMF 分离位不是 EPS 值（用了 UMTS 向量）", "检查 HSS 生成向量的配置"],
            ["Authentication Reject", "MME 判定 RES 不等于 XRES", "终端将 USIM 视为无效，停止尝试，直到关机或换卡"]
          ]
        },
        tip: "开卡后首次附着就鉴权失败，最常见的是 HSS 中录入的 K / OPc 与卡内不一致；偶发 #21 一般是正常的 SQN 重同步，不必紧张。"
      },
      {
        h: "密钥层次",
        table: {
          head: ["密钥", "从哪来", "用途"],
          rows: [
            ["K", "USIM 与 AuC 中预置的根密钥", "只用于计算，不出卡"],
            ["CK / IK", "USIM 用 K、RAND 计算", "推导 KASME"],
            ["KASME（256 比特）", "由 CK、IK、SN id 等推导", "EPS 安全的中间根密钥，保存在 MME 和 UE"],
            ["KNASenc / KNASint", "由 KASME 推导", "NAS 信令加密 / 完整性保护"],
            ["KeNB", "由 KASME 和上行 NAS COUNT 推导", "下发给 eNB，作为接入层根密钥"],
            ["KRRCenc / KRRCint", "由 KeNB 推导", "RRC 信令加密 / 完整性保护"],
            ["KUPenc", "由 KeNB 推导", "用户面加密"],
            ["NH / NCC", "由 KASME 推导的“下一跳”参数", "切换时更新 KeNB，实现前向安全"]
          ]
        },
        after: [
          "切换时 KeNB 要变：X2 切换由源 eNB 用当前 KeNB 或 NH，结合目标 PCI 和 EARFCN-DL 推导 KeNB*（同 NCC 时为水平推导，用新 NH 时为垂直推导）。这样源 eNB 无法推出目标 eNB 后续使用的密钥（下一跳之后）。切换流程见 3.4。"
        ]
      },
      {
        h: "NAS 与 AS 两层安全模式",
        table: {
          head: ["对比", "NAS Security Mode Command", "AS Security Mode Command"],
          rows: [
            ["发起者", "MME", "eNB"],
            ["保护对象", "UE 与 MME 之间的 NAS 信令", "RRC 信令（SRB1/2）与用户面（DRB）"],
            ["携带内容", "选定的 EEA / EIA、KSIASME、回放的 UE 安全能力", "选定的加密与完整性算法"],
            ["时机", "鉴权后、Attach Accept 之前", "Initial Context Setup 之后、建立 DRB 之前"],
            ["计数器", "NAS COUNT（24 比特：溢出计数 + 8 比特序列号）", "PDCP COUNT（HFN + PDCP SN）"]
          ]
        },
        after: [
          "**回放 UE 安全能力**是防降级攻击的关键：终端检查 MME 回放的能力是否与自己最初上报的一致，不一致就拒绝，防止中间人把能力篡改成只支持弱算法。",
          "SMC 消息本身已用新密钥做完整性保护但不加密；终端回的 Complete 已加密 + 完整性保护。"
        ]
      },
      {
        h: "加密与完整性算法",
        table: {
          head: ["加密", "完整性", "底层算法"],
          rows: [
            ["EEA0", "EIA0", "空算法（不加密 / 不保护；EIA0 只允许用于未鉴权的紧急呼叫）"],
            ["128-EEA1", "128-EIA1", "SNOW 3G"],
            ["128-EEA2", "128-EIA2", "AES（加密用 CTR 模式，完整性用 CMAC）"],
            ["128-EEA3", "128-EIA3", "ZUC（祖冲之算法，国内常用）"]
          ]
        },
        after: ["算法优先级由运营商在 MME 和 eNB 上配置，结合终端支持的能力选定。完整性校验值 MAC 为 32 比特。"],
        tip: "信令里看到 EEA0 不一定是故障：部分网络出于性能或监管考虑配置空加密，但完整性保护除紧急呼叫外必须开启，EIA0 出现在普通业务中就要查配置。"
      }
    ]
  },

  // ───────────── 4.6 PCC 策略控制与计费 ─────────────
  "lte-pcc": {
    sections: [
      {
        h: "为什么需要 PCC",
        p: [
          "签约只能描述“这个用户默认能用什么”，而现实中需要按业务、时段、用量、网络状态动态调整：VoLTE 通话时临时给语音建 GBR 承载；流量包用完后限速；定向流量免费。**PCC（Policy and Charging Control）**把“策略决策”和“策略执行”分开，并把 QoS 与计费统一起来。"
        ]
      },
      {
        h: "PCC 功能实体",
        table: {
          head: ["实体", "部署位置", "职责"],
          rows: [
            ["PCRF", "独立网元", "策略与计费规则决策中心，生成或选择 PCC 规则"],
            ["PCEF", "PGW 内", "策略执行：业务流检测、门控、QoS 执行、按规则计费上报"],
            ["AF", "如 IMS 的 P-CSCF", "向 PCRF 提供业务会话信息（媒体类型、带宽、IP 端口）"],
            ["SPR / UDR", "签约库", "存储策略相关签约（套餐等级、用量额度）"],
            ["OCS", "在线计费系统", "实时信用控制，授予配额（预付费、流量包实时扣减）"],
            ["OFCS", "离线计费系统", "收集计费数据记录，事后出账"],
            ["BBERF", "S5 采用 PMIP 时在 SGW", "承载绑定与事件上报（GTP 组网中不需要）"],
            ["TDF", "独立或合设（R11 起）", "业务检测功能，DPI 识别应用"]
          ]
        }
      },
      {
        h: "接口与主要消息",
        table: {
          head: ["接口", "两端", "主要消息", "作用"],
          rows: [
            ["Gx", "PCEF – PCRF", "CCR / CCA（Initial、Update、Termination），RAR / RAA", "IP-CAN 会话建立时取策略；事件上报；PCRF 主动推送规则"],
            ["Rx", "AF – PCRF", "AAR / AAA、STR / STA、RAR / RAA、ASR / ASA", "AF 提供业务信息；PCRF 通知承载事件（如承载丢失）"],
            ["Gy", "PCEF – OCS", "CCR / CCA（Initial、Update、Termination）", "在线计费，请求和上报配额（与 Ro 同属 Diameter 信用控制应用）"],
            ["Gz", "PCEF – OFCS", "Rf（Diameter ACR / ACA）或基于 GTP' 传话单", "离线计费"],
            ["Sp", "PCRF – SPR", "因厂家实现而异", "读取用户策略签约"]
          ]
        },
        after: ["Gx 会话与 PDN 连接一一对应：附着建立默认承载时 PGW 发 CCR-Initial，PDN 连接释放时发 CCR-Termination。"]
      },
      {
        h: "PCC 规则的组成",
        table: {
          head: ["组成", "说明"],
          rows: [
            ["规则名", "唯一标识规则"],
            ["SDF 模板", "业务数据流过滤器（五元组等），或预定义规则引用的应用标识"],
            ["优先级（precedence）", "多条规则匹配同一包时取优先级最高者"],
            ["QoS 参数", "QCI、ARP、MBR / GBR，决定该业务流映射到哪个承载"],
            ["门控状态", "允许或阻断该业务流"],
            ["计费参数", "计费键（rating group）、计费方式（在线 / 离线）、计量方式（流量 / 时长）"],
            ["用量监控键", "关联用量监控，用于流量包到量降速等"]
          ]
        },
        list: [
          "**动态规则**：PCRF 在 Gx 消息中完整下发，适合 VoLTE 等由 AF 实时提供信息的业务。",
          "**预定义规则**：配置在 PCEF 上，PCRF 按规则名激活 / 去激活；常用于需要 DPI 识别的应用（定向流量）。",
          "**静态规则**：在 PCEF 本地配置且不受 PCRF 控制。",
          "**承载绑定**：PCEF 把 QCI + ARP 相同的规则绑定到同一承载，没有合适承载就发起专用承载建立（见 4.3）。"
        ]
      },
      {
        h: "VoLTE 呼叫中的 PCC 链路",
        steps: [
          "主被叫经 IMS 完成 SIP / SDP 协商，P-CSCF 得到媒体类型、带宽、IP 和端口。",
          "P-CSCF 作为 AF 向 PCRF 发 **Rx AAR**，携带媒体组件描述。",
          "PCRF 据此生成动态 PCC 规则（语音 QCI 1、GBR 按编解码带宽、TFT 为媒体五元组），回 AAA。",
          "PCRF 向 PGW 发 **Gx RAR** 安装规则，PGW 回 RAA。",
          "PGW 发起专用承载建立（Create Bearer Request），流程见 4.3。",
          "承载建立结果通过 Gx 上报 PCRF，必要时 PCRF 通过 Rx 通知 P-CSCF；挂机后按相反方向删除规则和承载。"
        ],
        flow: `sequenceDiagram
    participant PCSCF as P-CSCF
    participant PCRF
    participant PGW
    participant SGW
    participant MME
    participant UE
    PCSCF->>PCRF: Rx AAR（媒体描述）
    PCRF->>PCSCF: Rx AAA
    PCRF->>PGW: Gx RAR（安装 QCI 1 动态规则）
    PGW->>PCRF: Gx RAA
    PGW->>SGW: Create Bearer Request
    SGW->>MME: Create Bearer Request
    MME->>UE: E-RAB Setup + Activate Dedicated EPS Bearer Context Request
    UE->>MME: Activate Dedicated EPS Bearer Context Accept
    MME->>SGW: Create Bearer Response
    SGW->>PGW: Create Bearer Response`,
        tip: "VoLTE 呼叫建立失败而 SIP 一切正常时，顺着 Rx AAR → Gx RAR → Create Bearer 往下查，看是哪一跳回了错误。"
      },
      {
        h: "在线与离线计费",
        table: {
          head: ["对比", "在线计费（Gy / OCS）", "离线计费（Gz / OFCS）"],
          rows: [
            ["时机", "业务使用前申请配额，使用中实时扣减", "业务使用后生成话单，事后出账"],
            ["对业务的影响", "配额不足可实时阻断、限速或重定向", "不影响业务进行"],
            ["典型用户", "预付费、实时流量包", "后付费用户"],
            ["关键概念", "申请单元、授予单元、已用单元、有效期、最终单元指示", "计费数据记录（如 SGW-CDR、PGW-CDR）、计费 ID"]
          ]
        },
        after: [
          "示例（数值为虚构）：某用户通用流量包用尽，OCS 在最后一次授予配额时携带最终单元指示“重定向”，配额耗尽后 PGW 把该用户的 HTTP 访问重定向到充值页面，充值后 OCS 恢复授予配额。",
          "另一类常见做法是**用量监控**：PCRF 通过 Gx 让 PCEF 按监控键累计用量，达到阈值上报后，PCRF 下发新规则把 APN-AMBR 降低，实现“到量降速”。"
        ],
        tip: "用户投诉“流量没用完却被限速”，同时核对 OCS 配额、PCRF 用量监控计数和 PGW 上实际生效的规则，三方数据口径不一致是常见根因。"
      }
    ]
  }
});
