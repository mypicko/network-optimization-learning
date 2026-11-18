// 5G 路径 · 阶段 3 NR 高层协议与接入网架构：模块知识讲解
window.LESSONS = window.LESSONS || {};
window.LESSONS["5g"] = window.LESSONS["5g"] || {};

Object.assign(window.LESSONS["5g"], {
  // ───────────── 3.1 NR 协议栈 ─────────────
  "s3-stack": {
    sections: [
      {
        h: "协议栈全景",
        table: {
          head: ["层", "用户面", "控制面", "终结点"],
          rows: [
            ["NAS", "—", "注册、鉴权、会话管理", "UE ↔ AMF（基站透传）"],
            ["RRC", "—", "连接管理、配置、测量、移动性", "UE ↔ gNB（CU）"],
            ["SDAP", "QoS 流 → DRB 映射", "—", "UE ↔ gNB（CU）"],
            ["PDCP", "加密、完整性、头压缩、重排序", "加密、完整性", "UE ↔ gNB（CU）"],
            ["RLC", "分段、ARQ", "分段、ARQ", "UE ↔ gNB（DU）"],
            ["MAC", "调度、复用、HARQ", "同左", "UE ↔ gNB（DU）"],
            ["PHY", "编码、调制、MIMO", "同左", "UE ↔ gNB（DU / AAU）"]
          ]
        },
        after: ["和 LTE 相比，用户面多了 **SDAP** 一层；控制面结构基本相同。CU 和 DU 的分界正好在 PDCP 和 RLC 之间（见 3.5）。"]
      },
      {
        h: "SDAP：5G 新增的一层",
        list: [
          "把核心网下来的 **QoS 流**（以 QFI 标识）映射到空口的 **DRB**，映射关系由基站决定，可以多个 QoS 流共用一个 DRB。",
          "在空口数据包头中标记 QFI，支持**反射式 QoS**：终端根据下行包的 QFI 自动推导上行该怎么映射，减少信令。",
          "只在接入 5GC 时存在。NSA（EN-DC 接 EPC）的承载仍是 LTE 式的一一对应，没有 SDAP。"
        ]
      },
      {
        h: "PDCP：安全和可靠性",
        list: [
          "**加密与完整性保护**：信令（SRB）必须做完整性保护；用户面（DRB）的完整性保护是 5G 新增的可选能力，防止数据被篡改。",
          "**头压缩（ROHC）**：VoNR 这类小包业务中，IP/UDP/RTP 头比语音负载还大，压缩后大幅节省空口资源。",
          "**重排序与去重**：下层乱序到达的包在这里按序号排好再交上层。NR 把重排序从 RLC 挪到了 PDCP。",
          "**复制（PDCP Duplication）**：同一个包通过两条路径（载波聚合的两个载波或双连接的两个基站）同时发送，用于 URLLC 提高可靠性。",
          "**分离承载路由**：双连接时决定数据走主节点还是辅节点。"
        ]
      },
      {
        h: "RLC：三种模式",
        table: {
          head: ["模式", "是否重传", "用于"],
          rows: [
            ["TM 透明模式", "否，不加头", "广播（BCCH）、寻呼（PCCH）、SRB0（CCCH）"],
            ["UM 非确认模式", "否", "对时延敏感、能容忍少量丢包的业务，如 VoNR 语音"],
            ["AM 确认模式", "是（ARQ）", "信令 SRB1/2/3、大多数数据业务"]
          ]
        },
        after: ["NR 的 RLC 取消了串接（把多个小包拼成一个），让 RLC 头可以在拿到调度授权前就预先生成，配合 MAC 的复用降低处理时延——这是 NR 层二为低时延做的关键设计。"]
      },
      {
        h: "MAC：调度和复用",
        list: [
          "把多个逻辑信道的数据**复用**到一个传输块，按逻辑信道优先级（LCP）分配资源。",
          "**HARQ** 重传（见 2.4）。",
          "**MAC CE**（MAC 控制单元）：缓冲区状态报告（BSR，告诉基站还有多少数据要发）、功率余量报告（PHR）、时间提前命令、DRX 命令、TCI 激活等。",
          "**调度请求（SR）**、**随机接入**、**DRX** 等过程都在 MAC 层完成。"
        ]
      },
      {
        h: "三类信道与无线承载",
        table: {
          head: ["逻辑信道", "传输信道", "物理信道", "内容"],
          rows: [
            ["BCCH", "BCH / DL-SCH", "PBCH / PDSCH", "MIB / 其他系统消息"],
            ["PCCH", "PCH", "PDSCH", "寻呼"],
            ["CCCH", "DL-SCH / UL-SCH", "PDSCH / PUSCH", "连接建立前的 RRC 消息"],
            ["DCCH", "DL-SCH / UL-SCH", "PDSCH / PUSCH", "专用信令（RRC、NAS）"],
            ["DTCH", "DL-SCH / UL-SCH", "PDSCH / PUSCH", "用户数据"]
          ]
        },
        after: ["信令无线承载 **SRB0** 走 CCCH（RRCSetupRequest 等）；**SRB1** 承载 RRC 消息和早期的 NAS 消息；**SRB2** 承载 NAS 消息，优先级低于 SRB1；**SRB3** 用于双连接时辅节点直接和终端交互。用户数据走 **DRB**。"]
      },
      {
        h: "一个下行 IP 包在基站内的旅程",
        steps: [
          "UPF 经 N3 隧道送来带 QFI 标记的 IP 包。",
          "SDAP 根据 QFI 选择 DRB，加 SDAP 头。",
          "PDCP 加序号、头压缩、加密，必要时复制。",
          "RLC（AM）加头、按调度大小分段，保存副本以备重传。",
          "MAC 把多个逻辑信道的数据和 MAC CE 复用成传输块，交给物理层。",
          "物理层编码调制后在 PDSCH 上发出；终端侧逆序处理。"
        ]
      }
    ]
  },

  // ───────────── 3.2 RRC 状态与系统消息 ─────────────
  "s3-rrc": {
    sections: [
      {
        h: "三种 RRC 状态",
        flow: `stateDiagram-v2
    IDLE: RRC_IDLE 空闲态
    CONN: RRC_CONNECTED 连接态
    INACT: RRC_INACTIVE 非激活态
    IDLE --> CONN: RRCSetup 建立
    CONN --> IDLE: RRCRelease 释放
    CONN --> INACT: RRCRelease 携带挂起配置
    INACT --> CONN: RRCResume 恢复
    INACT --> IDLE: 释放或恢复失败`,
        table: {
          head: ["", "RRC_IDLE", "RRC_INACTIVE", "RRC_CONNECTED"],
          rows: [
            ["终端上下文", "基站无", "基站（锚点）和终端都保留", "基站有"],
            ["与核心网的连接", "无（CM-IDLE）", "保持（CM-CONNECTED）", "保持（CM-CONNECTED）"],
            ["位置粒度", "跟踪区列表（核心网管理）", "RAN 通知区（基站管理）", "小区"],
            ["移动方式", "小区重选", "小区重选", "网络控制的切换"],
            ["寻呼发起方", "核心网（AMF）", "基站（RAN 寻呼）", "不需要寻呼"],
            ["功耗", "最低", "接近空闲态", "最高"]
          ]
        }
      },
      {
        h: "为什么要有 INACTIVE 态",
        p: [
          "智能手机的数据往往是“一阵一阵”的：微信消息、心跳包。如果每次都从 IDLE 重新走 RRC 建立 + 核心网服务请求，信令开销和时延都很大；一直保持 CONNECTED 又太耗电。",
          "INACTIVE 是折中：基站释放空口资源，让终端像空闲态一样省电，但保留终端上下文和 N2 连接。有数据时用 **RRCResume** 三条消息即可恢复，不需要和核心网交互。",
          "终端在 INACTIVE 态下移动，只要不离开 **RAN 通知区（RNA）** 就不用通知网络；离开 RNA 或周期定时器到期时做一次 RNA 更新。R17 还引入了**小数据传输（SDT）**：少量数据在 INACTIVE 态直接发，连恢复都省了。"
        ],
        tip: "现网是否启用 INACTIVE、定时器怎么设，各运营商和厂家策略不同，也受终端兼容性影响。分析日志时先确认终端是被释放到 IDLE 还是 INACTIVE。"
      },
      {
        h: "RRC 状态与核心网状态的对应",
        p: [
          "核心网有两套状态：**RM（注册管理）** 状态表示终端是否已注册（RM-REGISTERED / RM-DEREGISTERED）；**CM（连接管理）** 状态表示终端与 AMF 之间是否有 NAS 信令连接（CM-IDLE / CM-CONNECTED）。",
          "对应关系：RRC_IDLE ↔ CM-IDLE；RRC_INACTIVE 和 RRC_CONNECTED ↔ CM-CONNECTED。所以 INACTIVE 态的终端，在核心网看来仍是“连接”的，来了下行数据核心网直接发给基站，由基站负责在 RNA 内寻呼。"
        ]
      },
      {
        h: "主要 RRC 过程",
        table: {
          head: ["过程", "消息", "用途"],
          rows: [
            ["连接建立", "RRCSetupRequest → RRCSetup → RRCSetupComplete", "从 IDLE 进入 CONNECTED，Complete 中携带第一条 NAS 消息"],
            ["连接恢复", "RRCResumeRequest → RRCResume → RRCResumeComplete", "从 INACTIVE 恢复"],
            ["重配置", "RRCReconfiguration → RRCReconfigurationComplete", "建立 / 修改承载、测量配置、切换（带 reconfigurationWithSync）、添加辅小区"],
            ["连接释放", "RRCRelease", "释放到 IDLE；携带 suspendConfig 时进入 INACTIVE"],
            ["连接重建", "RRCReestablishmentRequest → RRCReestablishment → Complete", "无线链路失败或切换失败后恢复连接"],
            ["安全激活", "SecurityModeCommand → SecurityModeComplete", "激活接入层加密和完整性保护"],
            ["能力查询", "UECapabilityEnquiry → UECapabilityInformation", "获取终端支持的频段、MIMO 等能力"]
          ]
        }
      },
      {
        h: "系统消息",
        table: {
          head: ["消息", "内容"],
          rows: [
            ["MIB", "系统帧号、公共子载波间隔、CORESET 0 配置、是否禁止接入"],
            ["SIB1", "PLMN、小区接入与选择参数、初始 BWP、随机接入配置、TDD 配置、其他 SIB 的调度"],
            ["SIB2", "小区重选的公共参数"],
            ["SIB3", "同频邻区重选参数"],
            ["SIB4", "异频重选参数"],
            ["SIB5", "到 LTE 的重选参数"],
            ["SIB6–SIB8", "地震海啸预警、公共预警消息"],
            ["SIB9", "时间信息"]
          ]
        },
        after: ["SIB1 以外的系统消息可以设置为**按需提供**：空闲态终端通过随机接入请求，基站才广播，节省小区开销。"]
      }
    ]
  },

  // ───────────── 3.3 随机接入 ─────────────
  "s3-access": {
    sections: [
      {
        h: "什么时候需要随机接入",
        list: [
          "从 RRC_IDLE 初始接入，或从 RRC_INACTIVE 恢复。",
          "RRC 连接重建。",
          "切换时接入目标小区。",
          "连接态下有上行数据但已失去上行同步，或没有可用的调度请求资源。",
          "波束失败恢复、请求按需系统消息等。"
        ],
        after: ["本质上，随机接入解决两件事：**上行同步**（基站算出时间提前量 TA，让各终端的上行信号同时到达）和**获得一个身份与上行资源**。"]
      },
      {
        h: "竞争随机接入：四步",
        flow: `sequenceDiagram
    participant UE
    participant gNB
    UE->>gNB: Msg1 随机接入前导（PRACH）
    Note right of gNB: 检测前导，估计时间提前量
    gNB->>UE: Msg2 随机接入响应（RA-RNTI 调度）
    UE->>gNB: Msg3 RRCSetupRequest（携带终端标识）
    gNB->>UE: Msg4 竞争解决 + RRCSetup
    UE->>gNB: RRCSetupComplete（携带 NAS 注册请求）`,
        table: {
          head: ["步骤", "内容", "关键点"],
          rows: [
            ["Msg1", "从小区的 64 个前导中随机选一个，在 PRACH 时机发送", "PRACH 时机与 SSB 波束绑定，选哪个时机就隐式告诉基站最佳波束"],
            ["Msg2", "随机接入响应：前导标识、时间提前量、Msg3 上行授权、临时 C-RNTI", "终端在响应窗内用 RA-RNTI 盲检 PDCCH；收不到就加大功率重发 Msg1"],
            ["Msg3", "在 PUSCH 上发送 RRCSetupRequest，携带 5G-S-TMSI 的一部分或随机数，以及建立原因", "多个终端可能选了同一个前导，此时它们的 Msg3 会冲突"],
            ["Msg4", "竞争解决 MAC CE（回显 Msg3 的内容）+ RRCSetup", "回显内容与自己发的一致，才算竞争成功，临时 C-RNTI 转为正式 C-RNTI"]
          ]
        }
      },
      {
        h: "前导与 PRACH 配置",
        list: [
          "前导基于 Zadoff-Chu 序列，分长序列（839，适合大覆盖）和短序列（139，适合高频段和小覆盖）两类，以及多种格式。",
          "**prach-ConfigurationIndex** 决定 PRACH 在哪些帧、时隙、符号上出现；**零相关区配置（Ncs）** 与小区半径相关，半径越大需要的 Ncs 越大，能生成的前导越少，需要更多根序列。",
          "**根序列规划**：相邻小区使用不同的根序列，避免误检对方的前导。",
          "**功率攀升**：首次以目标接收功率发送，收不到响应就按步长（powerRampingStep）增加功率重发，直到最大次数（preambleTransMax）。"
        ]
      },
      {
        h: "非竞争随机接入与两步随机接入",
        list: [
          "**非竞争**：基站预先给终端分配专用前导（如切换命令中、波束失败恢复中），不会冲突，只需 Msg1 和 Msg2，速度快、成功率高。",
          "**两步随机接入（R16）**：MsgA = 前导 + PUSCH 负载（相当于把 Msg1 和 Msg3 合并），MsgB = 响应 + 竞争解决（相当于合并 Msg2 和 Msg4）。时延减半，适合小覆盖、低负载场景；失败时可回退到四步。"
        ]
      },
      {
        h: "接入失败的分段排查",
        table: {
          head: ["现象", "可能原因", "先查什么"],
          rows: [
            ["反复发 Msg1，收不到 Msg2", "上行覆盖不足、前导功率不够、PRACH 配置或根序列冲突、上行干扰", "终端发射功率是否已到上限；小区上行底噪；PRACH 参数"],
            ["收到 Msg2，Msg3 失败", "Msg3 上行功率不足、上行干扰、TA 不准", "Msg3 的 HARQ 重传次数；上行 SINR"],
            ["Msg4 竞争失败", "前导冲突，高话务时多见", "前导数量和分组配置；接入负荷"],
            ["收到 RRCReject", "基站拥塞或接入控制", "小区负荷、准入参数"],
            ["RRC 建立成功但注册失败", "核心网侧原因", "NAS 拒绝原因值（见 4.2）"]
          ]
        },
        tip: "看接入问题时，先在日志里把 Msg1 到 RRCSetupComplete 的每一步时间戳标出来，问题卡在哪一步就一目了然。"
      }
    ]
  },

  // ───────────── 3.4 测量与切换 ─────────────
  "s3-mobility": {
    sections: [
      {
        h: "空闲态与连接态的移动性",
        table: {
          head: ["", "空闲态 / 非激活态", "连接态"],
          rows: [
            ["谁决定", "终端自主（按网络广播的规则）", "网络决定"],
            ["机制", "小区选择与重选", "测量上报 + 切换"],
            ["参数来源", "SIB2–SIB5", "RRC 重配置中的测量配置"],
            ["对用户的影响", "影响能否及时驻留好小区、能否被寻呼到", "影响掉线、切换中断和速率"]
          ]
        }
      },
      {
        h: "小区选择与重选",
        list: [
          "**小区选择（S 准则）**：小区的接收电平和质量要高于最低门限（Srxlev > 0 且 Squal > 0），才能驻留。",
          "**异频 / 异系统重选按优先级**：高优先级频点信号高于门限（threshX-High）就重选过去；服务小区低于门限（threshServingLow）且低优先级频点高于门限（threshX-Low）时，才重选到低优先级。",
          "**同频（及同优先级）重选按排序（R 准则）**：服务小区加迟滞（Qhyst）、邻区减偏置（Qoffset）后排序，邻区持续排名第一达到 Treselection 时间才重选。",
          "国内现网通常把 5G 频点设为高优先级，让终端优先驻留 5G。"
        ]
      },
      {
        h: "连接态测量配置",
        p: ["基站通过 RRC 重配置下发测量配置，由几部分组成："],
        list: [
          "**测量对象（measObject）**：测哪个频点、基于 SSB 还是 CSI-RS、SMTC 时间窗、邻区列表和偏置。",
          "**报告配置（reportConfig）**：事件触发还是周期上报、哪个事件、门限、迟滞、触发时间（TTT）、上报 RSRP 还是 SINR。",
          "**测量标识（measId）**：把测量对象和报告配置绑定起来。",
          "**层 3 滤波**：对测量结果做平滑，滤波系数越大越平滑、反应越慢。",
          "**测量间隙（gap）**：终端只有一套射频时，测异频需要暂停收发，基站配置间隙。"
        ]
      },
      {
        h: "测量事件",
        table: {
          head: ["事件", "触发条件", "常见用途"],
          rows: [
            ["A1", "服务小区好于门限", "停止异频测量"],
            ["A2", "服务小区差于门限", "启动异频 / 异系统测量，或触发重定向"],
            ["A3", "邻区比服务小区好一个偏置", "同频切换，最常用"],
            ["A4", "邻区好于门限", "基于负载的切换"],
            ["A5", "服务小区差于门限 1 且邻区好于门限 2", "异频切换"],
            ["A6", "邻区比辅小区好一个偏置", "载波聚合中辅小区的更换"],
            ["B1", "异系统邻区好于门限", "NSA 中添加 5G 辅节点"],
            ["B2", "服务小区差于门限 1 且异系统邻区好于门限 2", "5G 到 4G 的切换"]
          ]
        },
        after: ["每个事件都带**迟滞**（Hysteresis，进入和离开条件之间留余量）和**触发时间**（TTT，条件持续满足多久才上报），用来避免信号波动导致频繁上报。"]
      },
      {
        h: "基于 Xn 的切换流程",
        flow: `sequenceDiagram
    participant UE
    participant S as 源 gNB
    participant T as 目标 gNB
    participant AMF
    participant UPF
    UE->>S: MeasurementReport（如 A3 事件）
    S->>T: Xn Handover Request
    T->>S: Handover Request Acknowledge（含切换命令）
    S->>UE: RRCReconfiguration（reconfigurationWithSync）
    S->>T: SN 状态传递 + 数据前转
    UE->>T: 随机接入（通常为非竞争）
    UE->>T: RRCReconfigurationComplete
    T->>AMF: Path Switch Request
    AMF->>UPF: 经 SMF 把下行路径切到目标基站
    AMF->>T: Path Switch Request Acknowledge
    T->>S: UE Context Release`,
        after: [
          "两个基站之间没有 Xn 接口，或需要更换 AMF 时，走**基于 N2 的切换**，由核心网中转切换信令，时延更长。",
          "5G 到 4G 的切换需要 N26 接口传递上下文；没有 N26 时只能重定向，会有更长的中断。"
        ]
      },
      {
        h: "切换问题与优化",
        table: {
          head: ["问题", "表现", "调整方向"],
          rows: [
            ["切换过晚", "切换前服务小区已很差，切换失败或掉线", "减小 A3 偏置 / 迟滞 / TTT"],
            ["切换过早", "切到目标后很快失败或切回", "增大偏置 / 迟滞 / TTT"],
            ["切换到错误小区", "切过去后很快又切到第三个小区", "检查邻区关系和单个邻区偏置"],
            ["乒乓切换", "两个小区之间来回切换", "增大迟滞和 TTT，优化覆盖，形成主导小区"],
            ["漏配邻区", "有更好的小区却不切换", "补充邻区（可借助 ANR 自动邻区关系）"]
          ]
        },
        tip: "R16 的**条件切换（CHO）**让基站提前下发候选目标和触发条件，终端满足条件时自行执行，避免“测量报告还没送到、信号已经掉了”的问题，对高速移动场景尤其有效。"
      }
    ]
  },

  // ───────────── 3.5 CU/DU 与接口 ─────────────
  "s3-ran-arch": {
    sections: [
      {
        h: "NG-RAN 的组成和接口",
        p: ["NG-RAN 由 gNB（以及接入 5GC 的增强型 LTE 基站 ng-eNB）组成。gNB 可以进一步拆为一个 CU 和多个 DU，CU 还可拆为 CU-CP 和 CU-UP。"],
        table: {
          head: ["接口", "连接", "控制面协议", "用户面协议"],
          rows: [
            ["NG（N2 / N3）", "gNB ↔ 5GC", "NGAP over SCTP（连 AMF）", "GTP-U over UDP（连 UPF）"],
            ["Xn", "gNB ↔ gNB", "XnAP", "GTP-U（切换数据前转、双连接）"],
            ["F1", "CU ↔ DU", "F1AP", "GTP-U"],
            ["E1", "CU-CP ↔ CU-UP", "E1AP", "—"]
          ]
        }
      },
      {
        h: "为什么要拆分，在哪里拆",
        p: [
          "3GPP 在研究阶段（TR 38.801）比较了 8 种切分点。切分点越靠下（越接近射频），集中处理的功能越多、协同越好，但对前传带宽和时延要求越苛刻。"
        ],
        table: {
          head: ["切分", "位置", "CU / 集中侧包含", "对传输的要求"],
          rows: [
            ["Option 2（3GPP F1）", "PDCP 与 RLC 之间", "RRC、SDAP、PDCP", "宽松：带宽与用户流量相当，时延毫秒级可接受"],
            ["Option 7-2x（O-RAN 前传）", "物理层内部", "高层物理层及以上", "严格：带宽大，时延百微秒级"],
            ["Option 8（传统 CPRI）", "射频与物理层之间", "全部基带", "最严格：传输时域采样，带宽巨大"]
          ]
        },
        after: ["**CU-CP / CU-UP 分离**的好处：用户面可以靠近用户或与 UPF 共址部署，控制面集中，两者独立扩容。"]
      },
      {
        h: "部署形态",
        list: [
          "**D-RAN（分布式）**：BBU 放在每个站点机房，前传短，最常见。",
          "**C-RAN（集中式）**：多个站点的 BBU 集中到一个机房（BBU 池），便于协同和维护，需要大量前传光纤或波分设备。",
          "**CU 云化**：CU 用通用服务器和虚拟化实现，集中部署在边缘数据中心。",
          "国内现网多数是 **AAU + BBU** 形态，CU 和 DU 的功能集成在同一 BBU 中，F1 是设备内部接口。"
        ]
      },
      {
        h: "前传、中传、回传",
        table: {
          head: ["段落", "连接", "国内常见承载方式"],
          rows: [
            ["前传", "AAU / RRU ↔ DU（BBU）", "光纤直驱、无源 / 有源波分；协议 CPRI 或 eCPRI"],
            ["中传", "DU ↔ CU", "CU / DU 合设时不存在"],
            ["回传", "CU（BBU）↔ 核心网", "中国移动以 SPN 为主；中国电信、联通以 IPRAN / STN 为主"]
          ]
        },
        tip: "5G 前传带宽很大（64T64R、100 MHz 的 AAU 用 eCPRI 也需要 25G 级接口），光纤资源常常是建站的瓶颈，这也是波分前传方案兴起的原因。"
      },
      {
        h: "O-RAN 简述",
        p: ["O-RAN 联盟在 3GPP 架构基础上，进一步开放 DU 与射频单元之间的前传接口（7-2x），并引入 RAN 智能控制器（RIC），目标是让不同厂家的设备可以混合组网、引入第三方智能应用。O-RAN 是本站规划中的独立主题。"]
      }
    ]
  }
});
