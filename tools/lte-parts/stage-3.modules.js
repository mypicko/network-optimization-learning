// 阶段 3 高层协议与空口流程
module.exports = {
  id: "L3", title: "高层协议与空口流程",
  summary: "沿着终端从开机驻留、接入、测量、切换到掉线重建的完整生命周期，打通 LTE 空口控制面（RRC / MAC）的主线流程，并了解载波聚合等 LTE-A 关键技术。这是读懂信令日志和做网优的基本功。",
  modules: [
    {
      id: "lte-rrc",
      title: "RRC 状态、空闲态与小区重选",
      hours: 4,
      goals: [
        "说清 LTE 两种 RRC 状态（RRC_IDLE / RRC_CONNECTED）各自的行为以及与 ECM 状态的对应关系",
        "能用 S 准则判断一个小区能否驻留，并能手算 Srxlev",
        "掌握基于优先级的异频 / 异系统重选和基于 R 准则的同频重选规则",
        "能从 SIB3 / SIB4 / SIB5 中读出重选参数，并解释它们对驻留行为的影响"
      ],
      concepts: ["RRC_IDLE / RRC_CONNECTED", "适合小区 / 可接受小区", "S 准则（Srxlev、Squal）", "q-RxLevMin", "cellReselectionPriority", "threshX-High / threshX-Low / threshServingLow", "R 准则（Qhyst、Qoffset）", "Treselection", "s-IntraSearch / s-NonIntraSearch"],
      specs: [
        { id: "TS 36.304", note: "空闲态过程：小区选择、重选、寻呼" },
        { id: "TS 36.331", note: "RRC 状态与系统消息 SIB3–SIB8 的参数定义" },
        { id: "TS 36.133", note: "空闲态测量与重选的性能要求" }
      ],
      quiz: [
        {
          q: "某高优先级异频频点信号很好，但终端迟迟不重选过去，可能是哪些原因？",
          a: "先看目标频点的 Srxlev（或 Squal）是否持续高于 threshX-High 达到 Treselection；再确认终端在当前小区驻留已超过 1 秒；还要检查 SIB5 中该频点是否真的配置了更高的 cellReselectionPriority、是否在 RRCConnectionRelease 中下发了专用优先级覆盖了广播优先级，以及目标小区是否被禁止（barred）。"
        },
        {
          q: "为什么同频重选要给服务小区加 Qhyst？",
          a: "Qhyst 让邻区必须比服务小区好出一个迟滞量才能排到第一，配合 Treselection 可以抑制终端在两个信号相近的小区之间来回重选（乒乓重选），减少无谓的 TAU 和寻呼丢失风险。代价是重选变“迟钝”，取值过大会导致终端驻留在较差小区。"
        }
      ],
      practice: "用手机工程模式或路测软件记录空闲态下的服务小区 RSRP / RSRQ，结合公开的 SIB3 参数（可从路测软件解码的系统消息里读）手算 Srxlev 和 R 值，观察一次同频重选发生前后数值是否符合 R 准则。"
    },
    {
      id: "lte-access",
      title: "随机接入与 RRC 连接建立",
      hours: 4,
      goals: [
        "掌握竞争随机接入 Msg1–Msg4 的内容与 RA-RNTI、TC-RNTI、竞争解决机制",
        "区分竞争与非竞争随机接入及各自的触发场景",
        "画出 RRCConnectionRequest 到 Initial Context Setup 的完整信令流程",
        "能按信令分段定位接入失败的原因"
      ],
      concepts: ["PRACH 前导（64 个 / 小区）", "RA-RNTI", "RAR：TA、UL Grant、TC-RNTI", "RRCConnectionRequest（S-TMSI / 随机数、establishmentCause）", "竞争解决 MAC CE", "RRCConnectionSetup / SetupComplete", "T300 与 RRCConnectionReject", "接入等级限制（ACB）", "S1AP Initial UE Message / Initial Context Setup"],
      specs: [
        { id: "TS 36.321", note: "MAC 层随机接入过程" },
        { id: "TS 36.331", note: "RRC 连接建立、安全模式、RRC 重配置" },
        { id: "TS 36.300", note: "随机接入与连接建立总体描述" },
        { id: "TS 36.413", note: "S1AP：Initial UE Message、Initial Context Setup" }
      ],
      flow: `sequenceDiagram
    participant UE
    participant eNB
    participant MME
    UE->>eNB: Msg1 随机接入前导（PRACH）
    eNB->>UE: Msg2 随机接入响应 RAR（TA、UL Grant、TC-RNTI）
    UE->>eNB: Msg3 RRCConnectionRequest（S-TMSI 或随机数、建立原因）
    eNB->>UE: Msg4 竞争解决 + RRCConnectionSetup（建立 SRB1）
    UE->>eNB: RRCConnectionSetupComplete（携带 NAS 消息）
    eNB->>MME: S1AP Initial UE Message
    MME->>eNB: S1AP Initial Context Setup Request（E-RAB、安全密钥）
    eNB->>UE: SecurityModeCommand
    UE->>eNB: SecurityModeComplete
    eNB->>UE: RRCConnectionReconfiguration（SRB2、DRB、测量配置）
    UE->>eNB: RRCConnectionReconfigurationComplete
    eNB->>MME: S1AP Initial Context Setup Response`,
      quiz: [
        {
          q: "Msg3 中的 RRCConnectionRequest 为什么有时携带 S-TMSI，有时携带随机数？",
          a: "终端已在该网络注册、持有有效 GUTI 时，用 S-TMSI 作为初始标识，便于 MME 定位上下文；没有有效 S-TMSI（如首次开机附着）时，携带 40 比特随机数。无论哪种，基站都会在 Msg4 的竞争解决 MAC CE 里回显 Msg3 内容，终端比对一致即竞争成功。"
        },
        {
          q: "RRC 连接建立成功率正常，但 E-RAB 建立成功率偏低，应该往哪查？",
          a: "说明问题出在 RRCConnectionSetupComplete 之后：可能是 MME 拒绝（看 NAS 拒绝原因和 S1AP 失败原因）、安全模式失败、基站准入拒绝（资源不足），或 RRCConnectionReconfiguration 下发后终端不回 Complete（空口质量差、终端不支持配置）。按 Initial Context Setup 请求到响应之间的每一步排查。"
        }
      ],
      practice: "在路测软件或公开的 LTE 信令样例日志中，找一次完整的接入过程，标出 Msg1 到 RRCConnectionReconfigurationComplete 每条消息的时间戳，算出控制面接入时延，并指出哪一段耗时最长。"
    },
    {
      id: "lte-meas",
      title: "测量配置与测量事件",
      hours: 4,
      goals: [
        "说出 measObject、reportConfig、measId、quantityConfig、measGapConfig 的作用和绑定关系",
        "写出 A1–A6、B1、B2 事件的进入条件并理解各偏置项含义",
        "理解迟滞、TTT、层 3 滤波对上报时机的影响",
        "知道什么时候需要测量间隙以及 s-Measure 的作用"
      ],
      concepts: ["measObjectEUTRA", "reportConfigEUTRA / reportConfigInterRAT", "measId", "A3：Mn + Ofn + Ocn − Hys > Mp + Ofp + Ocp + Off", "Hysteresis / timeToTrigger", "层 3 滤波（filterCoefficient）", "测量间隙 gp0 / gp1", "s-Measure", "周期上报与事件上报"],
      specs: [
        { id: "TS 36.331", note: "测量配置、测量事件与测量报告" },
        { id: "TS 36.133", note: "RSRP / RSRQ 测量上报映射与测量性能要求" },
        { id: "TS 36.214", note: "RSRP、RSRQ、RSSI 的物理层定义" }
      ],
      quiz: [
        {
          q: "同频切换常用 A3，异频切换为什么常配 A2 + A5（或 A4）的组合？",
          a: "异频测量通常需要测量间隙，会占用调度时间、影响速率，所以不能一直开。先用 A2（服务小区差于门限）启动异频测量和 gap，再用 A5（服务差于门限 1 且邻区好于门限 2）或 A4 触发切换，服务小区恢复后用 A1 停止测量。这样只在需要时才付出测量代价。"
        },
        {
          q: "增大 timeToTrigger 会带来什么影响？",
          a: "条件需要持续满足更长时间才上报，可以过滤信号短时波动，减少乒乓和误切换；但在高速场景或信号快速衰落时会导致切换过晚，增加掉线风险。通常结合迟滞和 CIO 一起调整，不同场景（高铁、室分）取值不同。"
        }
      ],
      practice: "在一份测量控制消息（RRCConnectionReconfiguration 中的 measConfig）里，画出 measObject、reportConfig、measId 的对应关系表，并写出每个 A3 / A2 事件换算成 dB 的实际门限、迟滞和 TTT。"
    },
    {
      id: "lte-ho",
      title: "切换：X2、S1 与异系统",
      hours: 5,
      goals: [
        "完整描述基于 X2 的切换流程（准备、执行、完成三阶段）",
        "说清 S1 切换与 X2 切换的触发条件和信令差异",
        "了解 LTE 到 UTRAN / GERAN 的 PS 切换与重定向两种方式",
        "能根据信令定位切换准备失败和切换执行失败"
      ],
      concepts: ["切换准备 / 执行 / 完成", "X2AP Handover Request / Acknowledge", "mobilityControlInfo 与 T304", "SN Status Transfer 与数据前转", "Path Switch Request", "S1AP Handover Required / Handover Command", "MobilityFromEUTRACommand", "重定向（redirectedCarrierInfo）", "End Marker"],
      specs: [
        { id: "TS 36.300", note: "Intra-E-UTRAN 与 Inter-RAT 移动性总体流程" },
        { id: "TS 36.423", note: "X2AP 切换相关过程" },
        { id: "TS 36.413", note: "S1AP 切换与路径转换过程" },
        { id: "TS 23.401", note: "基于 X2 / S1 的切换与异系统切换（核心网侧）" }
      ],
      flow: `sequenceDiagram
    participant UE
    participant S as 源 eNB
    participant T as 目标 eNB
    participant MME
    participant SGW
    UE->>S: MeasurementReport（如 A3 事件）
    S->>T: X2AP Handover Request
    T->>S: Handover Request Acknowledge（含切换命令）
    S->>UE: RRCConnectionReconfiguration（mobilityControlInfo）
    S->>T: SN Status Transfer + 数据前转
    UE->>T: 随机接入（通常为非竞争）
    UE->>T: RRCConnectionReconfigurationComplete
    T->>MME: S1AP Path Switch Request
    MME->>SGW: Modify Bearer Request
    SGW->>MME: Modify Bearer Response
    MME->>T: Path Switch Request Acknowledge
    T->>S: X2AP UE Context Release`,
      quiz: [
        {
          q: "什么情况下会走 S1 切换而不是 X2 切换？",
          a: "源、目标 eNB 之间没有 X2 接口或 X2 不可用；需要更换 MME（跨 MME Pool）；目标 eNB 拒绝 X2 切换；或运营商策略禁止 X2 切换。S1 切换由 MME 中转切换准备信令，时延更长，跨 MME 时还要经 S10 接口。"
        },
        {
          q: "终端收到切换命令后在目标小区接入失败，会发生什么？",
          a: "终端收到 mobilityControlInfo 后启动 T304，若 T304 超时仍未完成目标小区随机接入，即判定切换失败，回退到原配置并发起 RRC 连接重建，重建原因为 handoverFailure（见 3.5）。重建能否成功取决于所选小区是否有该终端上下文。"
        }
      ],
      practice: "在一次切换信令中找出 MeasurementReport、带 mobilityControlInfo 的 RRCConnectionReconfiguration、目标小区 RRCConnectionReconfigurationComplete，计算“测量报告到切换命令”的准备时延和“切换命令到 Complete”的执行时延，并判断这是 X2 还是 S1 切换。"
    },
    {
      id: "lte-rlf",
      title: "无线链路失败与 RRC 重建",
      hours: 3,
      goals: [
        "说清 RLF 的三类触发条件以及 N310 / T310 / N311 的作用",
        "掌握 RRC 连接重建流程和 T311、T301 的含义",
        "知道重建失败的常见原因以及重建原因值的含义",
        "了解 RLF Report 与 MRO 如何用于识别过早、过晚和切错小区"
      ],
      concepts: ["失步 / 同步指示（Qout / Qin）", "N310 / T310 / N311", "RLC 最大重传", "随机接入问题", "RRCConnectionReestablishmentRequest", "reestablishmentCause", "T311 / T301", "RLF Report 与 MRO"],
      specs: [
        { id: "TS 36.331", note: "无线链路失败检测与 RRC 连接重建" },
        { id: "TS 36.133", note: "无线链路监测（Qout / Qin）要求" },
        { id: "TS 36.300", note: "无线链路失败与移动鲁棒性优化（MRO）" }
      ],
      quiz: [
        {
          q: "RRC 重建失败（收到 RRCConnectionReestablishmentReject）最常见的原因是什么？",
          a: "终端选到的小区没有它的上下文：比如掉线后选到了一个既不是源小区、也没有做过切换准备的小区。此外目标小区拥塞、shortMAC-I 校验失败也会导致拒绝。被拒后终端回到 RRC_IDLE，业务需要重新建立连接，用户感知为掉线。"
        },
        {
          q: "T310 设得过短和过长分别有什么问题？",
          a: "过短：短时深衰落就判 RLF，触发不必要的重建甚至掉线；过长：链路早已不可用，终端仍在苦等恢复，迟迟不去重建，用户感知为“卡死”。一般结合 N310 与场景（高铁、室内）来权衡。"
        }
      ],
      practice: "在掉线类日志中找出 RRCConnectionReestablishmentRequest，读出其中的 reestablishmentCause 与 physCellId，判断这次重建发生在源小区还是邻区、是切换失败还是其他失败，并看重建是否成功。"
    },
    {
      id: "lte-ca",
      title: "载波聚合与 LTE-A 关键技术",
      hours: 4,
      goals: [
        "理解载波聚合的 PCell / SCell 概念、三种聚合方式和终端能力要求",
        "说清 SCell 的配置、激活 / 去激活机制和跨载波调度",
        "了解 R10–R12 其他 LTE-A 关键技术：增强 MIMO、eICIC、CoMP、双连接",
        "能估算典型 CA 组合下的理论峰值速率"
      ],
      concepts: ["成员载波 CC", "PCell / SCell", "带内连续 / 带内非连续 / 带间 CA", "SCell 激活去激活 MAC CE", "sCellDeactivationTimer", "跨载波调度（CIF）", "UE 能力与频段组合", "eICIC / ABS", "CoMP、双连接"],
      specs: [
        { id: "TS 36.300", note: "载波聚合与双连接总体描述" },
        { id: "TS 36.321", note: "SCell 激活 / 去激活" },
        { id: "TS 36.101", note: "CA 频段组合与带宽等级" },
        { id: "TS 36.306", note: "UE 类别与能力" }
      ],
      quiz: [
        {
          q: "为什么 SCell 配置之后还要单独“激活”？",
          a: "配置（RRC 重配置）比较慢、信令开销大；激活 / 去激活用 MAC CE 完成，速度快。没有数据时让 SCell 处于去激活状态，终端不监听其 PDCCH、不上报其 CSI，可以省电；有大数据量时再快速激活。sCellDeactivationTimer 超时会自动去激活。"
        },
        {
          q: "为什么 PCell 很重要，SCell 失败却不会导致掉线？",
          a: "RRC 连接、NAS 移动性、安全、PUCCH（R13 前）都只在 PCell 上；无线链路监测也针对 PCell。SCell 只是额外的数据通道，质量差时可去激活或删除，不影响连接；PCell 发生 RLF 才会触发重建。"
        }
      ],
      practice: "查阅 TS 36.101 中国内常用频段的 CA 组合（如 B3 与 B1 / B41 相关组合），用手机工程模式查看手机是否处于 CA 状态、PCell 和 SCell 的频点与带宽，并按“每 20 MHz 2×2 约 150 Mbps”的经验值估算理论峰值（示例计算）。"
    }
  ]
};
