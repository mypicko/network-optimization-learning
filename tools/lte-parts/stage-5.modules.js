// 阶段 5 语音与互操作
module.exports = {
  id: "L5", title: "语音与互操作",
  summary: "LTE 是纯分组网络，语音要么回落到 2G/3G（CSFB），要么走 IMS（VoLTE）；再加上离开 LTE 覆盖时的 SRVCC，以及与 5G 之间的锚点、切换和 N26 互操作。",
  modules: [
    {
      id: "lte-csfb",
      title: "CSFB 电路域回落",
      hours: 4,
      goals: [
        "说清 CSFB 为什么存在，以及联合附着、SGs 接口在其中的作用",
        "能画出主叫、被叫 CSFB 的信令流程，指出回落方式（重定向 / PS 切换 / CCO）的差别",
        "能分析 CSFB 接续时延长、回落失败、通话后不回 LTE 等常见问题"
      ],
      concepts: ["联合附着（combined EPS/IMSI attach）", "SGs 接口与 SGsAP", "TAI 到 LAI 的映射", "Extended Service Request", "CS Fallback Indicator", "RRC 释放重定向 / PS 切换 / CCO", "被叫寻呼（CN domain = CS）", "SMS over SGs", "通话后快速返回 LTE"],
      specs: [
        { id: "TS 23.272", note: "EPS 中的电路域回落（CSFB）总体流程" },
        { id: "TS 29.118", note: "SGs 接口 SGsAP 协议" },
        { id: "TS 24.301", note: "联合附着、Extended Service Request 等 NAS 过程" },
        { id: "TS 36.331", note: "RRCConnectionRelease 重定向、MobilityFromEUTRACommand" }
      ],
      flow: `sequenceDiagram
    participant UE
    participant eNB
    participant MME
    participant MSC as MSC/VLR
    participant RAN as 2G/3G 无线网
    Note over UE,MSC: 前提：UE 已完成联合附着，MME 与 MSC/VLR 建立 SGs 关联
    UE->>MME: Extended Service Request（主叫 CS 回落）
    MME->>eNB: S1AP UE Context Modification Request（CS Fallback Indicator）
    eNB-->>UE: 可选：下发 2G/3G 测量
    eNB->>UE: RRCConnectionRelease（redirectedCarrierInfo 指向 2G/3G 频点）
    eNB->>MME: S1AP UE Context Release Request
    UE->>RAN: 在 2G/3G 小区接入
    UE->>MSC: 必要时位置更新（LAU），随后 CM Service Request
    MSC->>UE: 电路域呼叫建立（Setup / Call Proceeding / Alerting / Connect）`,
      quiz: [
        { q: "CSFB 被叫时，MSC 是怎么找到正在 LTE 上的用户的？", a: "联合附着后 MSC/VLR 记录了该用户关联的 MME。来电时 MSC 通过 SGs 接口向 MME 发 SGsAP-PAGING-REQUEST；MME 若 UE 空闲就在 TA 列表内寻呼（CN domain 标为 CS），若 UE 连接态就下发 CS SERVICE NOTIFICATION。UE 回 Extended Service Request 后回落到 2G/3G，在那边回寻呼响应。" },
        { q: "CSFB 接续时延比 2G/3G 原生呼叫长，主要多在哪些环节？", a: "多出了 LTE 侧的 Extended Service Request 与上下文修改、RRC 释放（若要先测量还要加测量时间）、在 2G/3G 读系统消息和接入，以及位置区不一致时的位置更新。优化思路是用 TA/LA 一致规划避免 LAU、用带系统信息的重定向或 PS 切换减少读系统消息时间、尽量免测量直接重定向。" },
        { q: "为什么 SMS over SGs 不需要回落？", a: "短信数据量小，可以封装在 NAS 消息（UPLINK / DOWNLINK NAS TRANSPORT）里，经 MME 和 SGs 接口与 MSC 交换，终端始终留在 LTE。只有语音这类电路域呼叫才需要回落。" }
      ],
      practice: "用手机工程模式或路测软件，关闭 VoLTE 开关后拨打电话，记录从拨号到 2G/3G 接入、再到挂机后返回 LTE 的全过程，标出 Extended Service Request、RRCConnectionRelease（看 redirectedCarrierInfo）和 LAU 的时间点，计算接续时延构成。"
    },
    {
      id: "lte-volte",
      title: "VoLTE 概览",
      hours: 4,
      goals: [
        "说出 VoLTE 涉及的 IMS 主要网元和 EPC 中的配合（IMS APN、PCRF、专用承载）",
        "能用一句话描述 IMS 注册和一次 VoLTE 呼叫的主线",
        "掌握 QCI 1 / QCI 5 / QCI 2 的含义，以及空口为语音所做的优化",
        "了解 VoLTE 关键指标的定义口径"
      ],
      concepts: ["IMS APN 与默认承载（QCI 5）", "QCI 1 语音专用承载（GBR）", "P-CSCF / I-CSCF / S-CSCF / TAS", "P-CSCF 发现（PCO）", "Rx / Gx 与专用承载建立", "IMS 注册（REGISTER / 401 / 200 OK）", "RLC UM、ROHC、TTI Bundling、SPS", "AMR-WB / EVS", "IMS VoPS 指示"],
      specs: [
        { id: "TS 23.228", note: "IMS 总体架构与流程" },
        { id: "TS 24.229", note: "基于 SIP / SDP 的 IMS 呼叫控制" },
        { id: "TS 23.203", note: "PCC 架构与标准 QCI 特性表" },
        { id: "TS 23.401", note: "专用承载激活、IMS 相关的 EPS 过程" }
      ],
      quiz: [
        { q: "VoLTE 用户开机后，在打第一个电话之前已经建立了哪些承载？", a: "至少两个 PDN 连接：互联网 APN 的默认承载，以及 IMS APN 的默认承载（QCI 5，承载 SIP 信令）。终端在 IMS APN 上完成 SIP 注册。QCI 1 语音专用承载要到呼叫建立时才由 PCRF 触发建立，通话结束后释放。" },
        { q: "为什么语音专用承载通常配置 RLC UM 而不是 AM？", a: "语音对时延敏感、对少量丢包相对容忍，AM 的重传会引入额外时延和抖动，迟到的语音包即使到达也没有意义；UM 不重传、时延小。可靠性靠 HARQ、TTI Bundling 和编解码器的抗丢包能力来保证。" }
      ],
      practice: "在支持 VoLTE 的手机上抓一次通话日志（工程模式或路测软件），找出 IMS APN 的默认承载、呼叫时新增的 EPS 承载（看 QCI 和 GBR 速率）以及 RRC 重配置中语音 DRB 的 RLC 模式和 ROHC 配置。"
    },
    {
      id: "lte-srvcc",
      title: "SRVCC 与 eSRVCC",
      hours: 3,
      goals: [
        "理解 SRVCC 解决的问题：VoLTE 用户离开 LTE 覆盖时语音不断",
        "掌握 Sv 接口、STN-SR、C-MSISDN、SCC AS 等关键要素，能讲清 SRVCC 主流程",
        "理解 eSRVCC 引入 ATCF/ATGW 缩短中断时间的原理",
        "能定位 SRVCC 失败与语音中断长的常见原因"
      ],
      concepts: ["SRVCC（PS 到 CS 的语音连续性）", "Sv 接口（MME ↔ MSC Server）", "STN-SR 与 C-MSISDN", "SCC AS 会话锚定", "SRVCC HO Indication", "B2 测量事件", "eSRVCC：ATCF / ATGW", "aSRVCC / mid-call 等增强", "语音中断时间"],
      specs: [
        { id: "TS 23.216", note: "SRVCC 总体架构与流程" },
        { id: "TS 23.237", note: "IMS 业务连续性（SCC AS、ATCF）" },
        { id: "TS 29.280", note: "Sv 接口" }
      ],
      quiz: [
        { q: "SRVCC 中 MME 为什么要“拆分承载”？", a: "UE 同时有 QCI 1 语音承载和其他数据承载。MME 根据 QCI 1 识别出语音承载，只把语音部分通过 Sv 接口交给 MSC Server 做 PS 到 CS 的切换；非语音承载则走普通 PS 切换（目标支持时）或被挂起。" },
        { q: "eSRVCC 为什么能缩短语音中断？", a: "基本 SRVCC 的会话转移要一直通知到对端（远端更新），路径长、时延大。eSRVCC 在拜访网 P-CSCF 附近引入 ATCF/ATGW 作为媒体锚点，STN-SR 指向 ATCF，切换时只需在本地把媒体从 LTE 侧切到 MSC 侧，对端无感，中断时间显著缩短。" }
      ],
      practice: "在 LTE 覆盖边缘（如地下车库入口）用 VoLTE 通话并慢慢走出覆盖，在日志里找出 B2 测量报告、MobilityFromEUTRACommand 及在 3G/2G 的切换完成，估算从最后一个 LTE 语音包到第一个 CS 语音帧的中断时间。"
    },
    {
      id: "lte-interwork",
      title: "4G / 5G 互操作",
      hours: 4,
      goals: [
        "从 LTE 侧理解 NSA 锚点：锚点小区要配置什么、B1 如何触发 SgNB 添加",
        "掌握 SA 场景下 LTE 与 NR 之间重选、重定向、切换三种手段的取舍",
        "理解 N26 接口的作用，以及有无 N26 对互操作和业务连续性的影响",
        "能从 LTE 参数和信令角度排查“不上 5G”“回不了 5G”问题"
      ],
      concepts: ["EN-DC 锚点小区", "upperLayerIndication（5G 图标）", "B1-NR 测量与 SgNB 添加", "SCG 失败与释放", "LTE 与 NR 重选优先级（SIB24 / SIB5）", "4G→5G 重定向 / 切换", "N26 接口（MME ↔ AMF）", "SMF+PGW-C 等合设网元", "QCI ↔ 5QI 映射"],
      specs: [
        { id: "TS 23.501", note: "§5.17 互通与迁移（与 EPC 互通）" },
        { id: "TS 23.502", note: "§4.11 与 EPC 的系统间互通流程" },
        { id: "TS 37.340", note: "EN-DC 多连接总体" },
        { id: "TS 36.331", note: "B1-NR 测量、SIB24、upperLayerIndication" }
      ],
      quiz: [
        { q: "NSA 用户在某 LTE 小区下始终不显示 5G，从 LTE 侧要查哪些点？", a: "先看这个小区是不是锚点：是否给 NR 频点配了 B1 测量和 NR 邻区、SIB2 是否带 upperLayerIndication；再看终端能力和签约（是否被限制 NR 作为辅 RAT）；然后看 B1 门限是否过高、X2 是否正常、SgNB 添加是否被拒。非锚点频点的用户需要先被引导到锚点频点。" },
        { q: "N26 接口对 SA 与 LTE 的互操作有什么意义？", a: "N26 连接 MME 和 AMF，用于传递 UE 移动性和会话上下文。有 N26 时可以做连接态的系统间切换，IP 地址和会话保持，中断短；没有 N26 时只能靠重定向或空闲态重选，终端要在目标侧重新注册或附着并通过合设的 SMF+PGW-C 恢复会话，中断更长。" }
      ],
      practice: "用支持 SA 的手机在 5G 覆盖边缘来回走动，在日志中分别找出一次 5G→4G 和 4G→5G 的转换，判断它是重选、重定向还是切换（看 RRCRelease / MobilityFromEUTRACommand 等消息），并记录每次的业务中断时长。"
    }
  ]
};
