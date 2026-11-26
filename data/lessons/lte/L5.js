// LTE 路径 · 阶段 5 语音与互操作：模块知识讲解
window.LESSONS = window.LESSONS || {};
window.LESSONS["lte"] = window.LESSONS["lte"] || {};

Object.assign(window.LESSONS["lte"], {
  // ───────────── 5.1 CSFB 电路域回落 ─────────────
  "lte-csfb": {
    sections: [
      {
        h: "为什么需要 CSFB",
        p: [
          "EPS 是纯分组网络，没有电路域。LTE 商用初期，IMS 网络和 VoLTE 终端都不成熟，而运营商已有成熟的 2G/3G 电路域语音网。**CSFB（Circuit Switched Fallback）** 的思路很朴素：终端平时驻留 LTE 上网，要打或接电话时，**回落到 2G/3G 用电路域通话**，挂机后再回到 LTE。",
          "CSFB 只在 EPC 和 MSC 之间加一条 **SGs 接口**，对 MSC 和 2G/3G 无线网改动很小，所以成为 4G 早期最快可用的语音方案。代价是：通话期间数据业务降到 2G/3G（2G 下甚至可能被挂起），接续时延比原生呼叫长。"
        ],
        table: {
          head: ["语音方案", "语音走哪里", "LTE 侧需要什么", "典型阶段"],
          rows: [
            ["CSFB", "回落到 2G/3G 电路域", "SGs 接口、联合附着", "LTE 商用早期"],
            ["VoLTE", "LTE 上的 IMS 分组语音", "IMS、PCC、QCI 1 承载（见 5.2）", "目前主流"],
            ["SRVCC", "VoLTE 通话中切到 2G/3G 电路域", "Sv 接口（见 5.3）", "VoLTE 的覆盖补充"]
          ]
        },
        tip: "不要把 CSFB 和 SRVCC 混淆：CSFB 是“呼叫建立前”就去 2G/3G，整个通话都在电路域；SRVCC 是“已经在 VoLTE 通话中”因覆盖问题切过去。"
      },
      {
        h: "前提：联合附着与 SGs 关联",
        p: [
          "要让 MSC 能找到一个驻留在 LTE 上的用户，终端开机时要做**联合附着（combined EPS/IMSI attach）**：在 LTE 附着的同时，由 MME 通过 SGs 接口代替终端向 MSC/VLR 做一次位置更新。此后 MSC/VLR 知道“这个用户在哪个 MME 下”，MME 也知道“这个用户对应哪个 MSC/VLR”，这叫 **SGs 关联**。"
        ],
        steps: [
          "UE 在 Attach Request 中把附着类型置为 combined EPS/IMSI attach。",
          "MME 根据 UE 所在的 TAI 推算出一个 LAI（**TAI→LAI 映射**由运营商配置），并据此选择 MSC/VLR。",
          "MME 向 MSC/VLR 发送 SGsAP-LOCATION-UPDATE-REQUEST，VLR 完成位置更新后回 SGsAP-LOCATION-UPDATE-ACCEPT（可能分配 TMSI）。",
          "MME 在 Attach Accept 中告诉 UE 联合附着结果：EPS 和非 EPS 都成功，或仅 EPS 成功；还可能附带 “SMS only” “CSFB not preferred” 等指示。",
          "之后 UE 跨 TA 移动时做联合 TAU，MME 视情况更新 SGs 侧位置。"
        ],
        after: ["SGs 接口使用 SGsAP 协议（TS 29.118），承载在 SCTP 上。SGs 关联在 MME 侧有空、位置更新中、已关联等状态，状态异常是“打不进来”类问题的常见根源。"]
      },
      {
        h: "主叫 CSFB 流程",
        flow: `sequenceDiagram
    participant UE
    participant eNB
    participant MME
    participant MSC as MSC/VLR
    participant RAN as 2G/3G 无线网
    UE->>MME: Extended Service Request（主叫 CS 回落）
    MME->>eNB: UE Context Modification Request（CS Fallback Indicator）
    eNB->>MME: UE Context Modification Response
    eNB-->>UE: 可选：下发 2G/3G 测量并收到测量报告
    eNB->>UE: RRCConnectionRelease（重定向到 2G/3G 频点）
    eNB->>MME: UE Context Release Request
    UE->>RAN: 在目标小区读系统消息并接入
    UE->>MSC: 若 LA 与联合附着时不同则先做 LAU
    UE->>MSC: CM Service Request
    MSC->>UE: Setup / Alerting / Connect 完成呼叫`,
        list: [
          "UE 若处于空闲态，会先发起随机接入建立 RRC 连接，再发 Extended Service Request；MME 此时用 Initial Context Setup Request 携带 CS Fallback Indicator。",
          "**CS Fallback Indicator** 告诉 eNB：这个 UE 需要尽快去电路域，请选择回落方式。",
          "eNB 释放 S1 上下文后，MME 会挂起或保留 PS 承载，取决于目标网络是否支持 PS 切换和 DTM。"
        ]
      },
      {
        h: "被叫 CSFB 流程",
        steps: [
          "主叫的呼叫到达被叫所在 MSC（IAM 等）。MSC/VLR 查到该用户有 SGs 关联，向对应 MME 发 **SGsAP-PAGING-REQUEST**，可带主叫号码等信息。",
          "若 UE 空闲：MME 在 TA 列表内寻呼，寻呼消息中 **CN domain 标为 CS**。若 UE 已在连接态：MME 下发 NAS 消息 **CS SERVICE NOTIFICATION**。",
          "UE 回 **Extended Service Request**（服务类型为被叫 CS 回落，UE 可选择接受或拒绝）；MME 同时向 MSC 发 SGsAP-SERVICE-REQUEST，让 MSC 知道 UE 正在回落，可启动对主叫的提示。",
          "后续与主叫类似：eNB 重定向或切换 UE 到 2G/3G。",
          "UE 在 2G/3G 侧发送 **Paging Response**，MSC 下发 Setup，完成呼叫。"
        ],
        p: ["被叫有一个主叫没有的坑：如果 UE 回落到的 2G/3G 小区所属的位置区，是由**另一个 MSC** 服务的（TAI→LAI 映射与实际回落小区不匹配），原 MSC 就收不到 Paging Response。TS 23.272 为此定义了 **MT Roaming Retry** 和 **MTRF（Mobile Terminating Roaming Forwarding）** 等补救机制，但根本办法是让 TA 与 LA 边界、MSC 归属尽量一致。"],
        tip: "被叫接通率低时，先区分是“寻呼不到”（看 SGs 寻呼和 S1 寻呼）还是“回落后丢了”（看 2G/3G 侧是否有 LAU 和 Paging Response）。"
      },
      {
        h: "三种回落方式对比",
        table: {
          head: ["方式", "做法", "优点", "缺点"],
          rows: [
            ["RRC 释放重定向", "RRCConnectionRelease 中带 redirectedCarrierInfo，指定 2G/3G 频点", "实现简单、终端兼容性好，现网最常用", "UE 到目标侧要自己搜小区、读系统消息，时延较长"],
            ["带系统信息的重定向（R9）", "RRCConnectionRelease 中额外携带目标小区的系统信息（cellInfoList），系统信息可经 RIM 从 2G/3G 获取", "省去读系统消息的时间", "需要 RIM 等配合，目标小区要确定"],
            ["PS 切换", "通过 MobilityFromEUTRACommand 把 UE 和 PS 承载一起切到 3G", "时延短，数据业务不中断", "需要 3G 侧支持 PS 切换，流程复杂"],
            ["CCO（到 GERAN）", "MobilityFromEUTRACommand 中指示小区改变命令，可配合 NACC 携带系统信息", "可指定目标小区", "仅适用于 2G，现网用得少"]
          ]
        },
        after: [
          "eNB 在回落前是否先做测量，也是一个取舍：**盲重定向**直接把 UE 推到预配置频点，快但可能推到弱覆盖频点；**基于测量的重定向**更准，但多了测量时间。常见做法是按小区配置优先频点盲重定向，覆盖复杂区域再开启测量。"
        ]
      },
      {
        h: "短信、通话后返回与现网关注点",
        list: [
          "**SMS over SGs**：短信封装在 NAS 的 UPLINK / DOWNLINK NAS TRANSPORT 中，经 MME 和 SGs 与 MSC 交换，终端不需要回落。",
          "**通话后返回 LTE**：3GPP 只规定了基本的重选机制（2G/3G 广播 LTE 的重选优先级）。很多厂家在 3G 侧提供“通话结束后直接重定向回 LTE”的功能，名称和实现因厂家而异，对用户体验影响很大。",
          "**接续时延**：CSFB 主叫接续时延明显长于 2G/3G 原生呼叫，主要耗在 RRC 释放、目标侧接入、读系统消息和 LAU 上。",
          "**TA / LA 规划**：TAI→LAI 映射要与实际回落小区的位置区一致，否则回落后要做 LAU，被叫还可能失败。",
          "**终端设置**：UE 的“语音域偏好”和“使用设置（语音为主 / 数据为主）”决定它在 VoLTE 不可用时是走 CSFB、只用数据还是去 2G/3G 驻留（TS 24.301 / 24.167）。"
        ],
        table: {
          head: ["问题现象", "常见原因", "排查方向"],
          rows: [
            ["主叫回落后接入失败", "重定向频点覆盖差、目标频点配置错误", "核对 redirectedCarrierInfo 与目标侧覆盖"],
            ["被叫打不通", "SGs 关联异常、TAI→LAI 映射与回落小区不一致", "SGs 寻呼记录、2G/3G 侧 Paging Response"],
            ["接续时延过长", "读系统消息慢、LAU 多、先测量再重定向", "按信令时间戳分段统计"],
            ["挂机后长时间停在 2G/3G", "缺少快速返回功能，LTE 重选优先级配置不当", "2G/3G 侧 LTE 邻区和优先级"]
          ]
        }
      },
      {
        h: "CSFB 的现状",
        p: [
          "随着 VoLTE 普及，CSFB 已从主流语音方案退为兜底手段：VoLTE 关闭、IMS 注册失败、漫游到不支持 VoLTE 的网络时仍会用到它。在 2G/3G 逐步退网的地区，CSFB 的回落目标网络本身在消失，这也是推动 VoLTE 全面覆盖的重要原因。",
          "学 CSFB 的价值在于它把 **EPC 与电路域如何协同**讲得很清楚：联合附着、SGs 寻呼、跨系统重定向，这些思路在后面的 SRVCC（5.3）和 4G/5G 互操作（5.4）中都会再次出现。"
        ]
      }
    ]
  },

  // ───────────── 5.2 VoLTE 概览 ─────────────
  "lte-volte": {
    sections: [
      {
        h: "VoLTE 是什么",
        p: [
          "**VoLTE** 是在 LTE 上通过 **IMS** 提供的分组域语音。呼叫控制用 SIP，语音媒体用 RTP，承载在一条有保障带宽（GBR）的 EPS 专用承载上。与 CSFB 相比，VoLTE 不必离开 LTE，接续快、数据业务不受影响，并支持 AMR-WB、EVS 等高清编码。",
          "业界通常以 GSMA 的 IR.92 作为 VoLTE 终端和网络的功能基线。本模块只讲清整体架构和主线流程；SIP 消息字段、IMS 鉴权和补充业务等细节留给后续的 IMS 路线。"
        ],
        table: {
          head: ["层面", "VoLTE 中的角色"],
          rows: [
            ["E-UTRAN", "建立语音 DRB，做调度、语音专用优化（RLC UM、ROHC、TTI Bundling、SPS、DRX）"],
            ["EPC", "提供 IMS APN 的 PDN 连接；按 PCRF 指令建立 / 释放 QCI 1 专用承载"],
            ["PCC（PCRF）", "根据 IMS 提供的媒体信息生成 QoS 策略，经 Gx 下发给 PGW"],
            ["IMS", "注册、呼叫控制、业务逻辑、与电路域互通"]
          ]
        }
      },
      {
        h: "IMS 主要网元",
        table: {
          head: ["网元", "作用", "与 EPC 的关系"],
          rows: [
            ["P-CSCF", "终端的第一个 SIP 代理；完成 SIP 压缩、安全关联；把媒体信息报给 PCRF", "通过 Rx 接口与 PCRF 交互"],
            ["I-CSCF", "入口查询点，向 HSS 查用户应由哪个 S-CSCF 服务", "Cx 接口连 HSS"],
            ["S-CSCF", "注册与会话控制核心，执行 IMS 鉴权，按初始过滤规则（iFC）触发应用服务器", "Cx 接口连 HSS"],
            ["TAS（MMTel AS）", "多媒体电话业务逻辑：呼叫前转、呼叫等待、多方通话等", "—"],
            ["SCC AS", "业务连续性锚点，SRVCC 依赖它（见 5.3）", "—"],
            ["HSS", "同时保存 EPS 签约和 IMS 签约", "S6a 接 MME，Cx 接 CSCF"],
            ["MGCF / IM-MGW", "与电路域 / PSTN 互通", "—"],
            ["SBC", "边界控制、NAT 穿越，现网常与 P-CSCF 合设", "—"]
          ]
        },
        after: ["IMS 网元之间都用 SIP 互通，IMS 与 HSS 之间用 Diameter（Cx），P-CSCF 与 PCRF 之间用 Diameter（Rx）。"]
      },
      {
        h: "开机：IMS PDN 连接与注册",
        steps: [
          "UE 完成 LTE 附着（见 4.2），MME 在 Attach Accept / TAU Accept 中通过 **IMS VoPS 指示**告诉 UE 当前网络是否支持 IMS 语音。",
          "UE 发起到 **IMS APN** 的 PDN 连接，建立一条 **QCI 5** 的默认承载，专门承载 SIP 信令。PGW 通常通过 PCO 把 **P-CSCF 地址**下发给 UE（P-CSCF 发现）。",
          "UE 向 P-CSCF 发送 SIP **REGISTER**，P-CSCF 转给 I-CSCF，I-CSCF 向 HSS 查询后选出 S-CSCF。",
          "S-CSCF 从 HSS 取鉴权向量，回 **401 Unauthorized** 携带挑战；UE 用 ISIM / USIM 计算响应，发第二次 REGISTER。",
          "鉴权通过后 S-CSCF 从 HSS 下载用户业务签约，回 **200 OK**；随后按 iFC 向 TAS 等应用服务器做第三方注册。"
        ],
        p: ["注册成功后，手机上通常会出现 “HD” 或 “VoLTE” 标识。注册有有效期，UE 会周期性重注册；注册失败时终端会按语音域偏好回到 CSFB 或其他方案。"],
        tip: "“VoLTE 开关打开但打电话仍回落”，第一步就是看 IMS APN 的 PDN 连接是否建立、SIP REGISTER 是否拿到 200 OK。"
      },
      {
        h: "一次 VoLTE 呼叫的主线",
        flow: `sequenceDiagram
    participant UE as 主叫 UE
    participant ENB as eNB / MME / SGW
    participant PGW
    participant PCRF
    participant IMS as P-CSCF / IMS
    UE->>IMS: SIP INVITE（SDP 携带编码能力，经 QCI 5 承载）
    IMS-->>UE: 100 Trying
    IMS-->>UE: 183 Session Progress（SDP 应答）
    IMS->>PCRF: Rx：AAR（媒体类型、编码、带宽）
    PCRF->>PGW: Gx：RAR（安装 QCI 1 规则）
    PGW->>ENB: Create Bearer Request
    ENB->>UE: E-RAB 建立，RRCConnectionReconfiguration 建立语音 DRB
    ENB->>PGW: Create Bearer Response
    UE->>IMS: PRACK / UPDATE（资源就绪）
    IMS-->>UE: 180 Ringing
    IMS-->>UE: 200 OK（被叫摘机）
    UE->>IMS: ACK
    Note over UE,IMS: RTP 语音在 QCI 1 专用承载上传输`,
        after: [
          "要点：**专用承载是“网络发起”的**，由 IMS 通过 PCRF 触发，不是终端自己申请；被叫侧也会在其 P-CSCF 触发同样的过程。是否使用“资源预留前提（precondition）”、各消息的先后细节，因运营商配置而异。",
          "通话结束（BYE / 200 OK）后，P-CSCF 通知 PCRF 释放会话，QCI 1 承载随之删除，QCI 5 默认承载保留。"
        ]
      },
      {
        h: "QCI 1 / QCI 5 / QCI 2",
        table: {
          head: ["QCI", "资源类型", "优先级", "包时延预算", "丢包率", "VoLTE 中的用途"],
          rows: [
            ["1", "GBR", "2", "100 ms", "10⁻²", "语音媒体（RTP）"],
            ["2", "GBR", "4", "150 ms", "10⁻³", "视频通话媒体"],
            ["5", "Non-GBR", "1", "100 ms", "10⁻⁶", "IMS 信令（SIP）"]
          ]
        },
        after: [
          "上表为 TS 23.203 标准化 QCI 特性。注意 QCI 5 的**优先级数值最小（最高）**、丢包要求最严，因为 SIP 信令丢一条就可能导致呼叫失败；而语音本身允许少量丢包，更看重时延。",
          "QCI 1 承载的 GBR 由 PCRF 按编码速率计算，例如 AMR-WB 12.65 kbps 加上 RTP/UDP/IP 头开销后，GBR 会比编码速率高不少（具体数值随是否启用 ROHC 而不同）。"
        ]
      },
      {
        h: "空口为语音做的优化",
        table: {
          head: ["技术", "作用", "说明"],
          rows: [
            ["RLC UM", "不做 RLC 重传，降低时延", "迟到的语音包没有价值，可靠性靠 HARQ"],
            ["ROHC 头压缩", "把 RTP/UDP/IP 约 40（IPv4）或 60（IPv6）字节的头压到几个字节", "小包语音的头开销占比很大，压缩后显著省资源、改善边缘覆盖"],
            ["TTI Bundling", "上行同一个包在连续 4 个 TTI 中重复发送", "提升上行边缘覆盖，代价是占用更多资源"],
            ["SPS 半持续调度", "按 20 ms 周期预分配资源，不必每个包都发 PDCCH 授权", "节省控制信道，适合语音的周期性"],
            ["DRX", "利用语音 20 ms 一包的规律让终端间歇休眠", "省电，周期需与语音包间隔匹配"]
          ]
        },
        after: ["语音编码器每 20 ms 产生一帧；静音期只发很小的 SID 帧。理解这一节奏，有助于理解 SPS 和 DRX 的参数设计。"]
      },
      {
        h: "关键指标",
        table: {
          head: ["指标", "含义", "主要看哪一层"],
          rows: [
            ["VoLTE 接通率", "呼叫成功建立的比例，常拆成 SIP 层成功率与 QCI 1 承载建立成功率", "无线 + IMS"],
            ["QCI 1 E-RAB 建立成功率", "语音专用承载建立成功的比例", "无线 / EPC"],
            ["VoLTE 掉话率", "通话中异常中断的比例，无线侧常用 QCI 1 E-RAB 异常释放比例衡量", "无线为主"],
            ["接续时延", "从发 INVITE 到收到 180 Ringing 的时间", "端到端"],
            ["eSRVCC 切换成功率", "VoLTE 用户切换到电路域的成功比例（见 5.3）", "无线 + 核心网"],
            ["MOS / RTP 丢包率 / 抖动", "主观语音质量与其底层原因", "无线 + 传输"]
          ]
        },
        tip: "各家对指标的分子分母定义略有不同，对比数据前先统一口径。VoLTE 指标的具体优化方法见 6.7。"
      }
    ]
  },

  // ───────────── 5.3 SRVCC 与 eSRVCC ─────────────
  "lte-srvcc": {
    sections: [
      {
        h: "SRVCC 要解决什么问题",
        p: [
          "VoLTE 依赖 LTE 覆盖，而 LTE 建网初期覆盖不连续。用户正在 VoLTE 通话时走出 LTE 覆盖，如果目标只有 2G/3G，就需要把**分组域的 IMS 语音会话**转换成**电路域呼叫**，并让对端几乎无感。这就是 **SRVCC（Single Radio Voice Call Continuity）**，规范在 TS 23.216。",
          "“Single Radio” 指终端同一时间只在一种无线制式上收发，不需要同时连接 LTE 和 2G/3G。难点在于两边的核心网完全不同：一边是 EPC + IMS，一边是 MSC 电路域，必须由网络在切换前把电路域资源准备好。"
        ],
        table: {
          head: ["要素", "作用"],
          rows: [
            ["Sv 接口", "MME 与支持 SRVCC 的 MSC Server 之间的接口（GTPv2-C，TS 29.280），传递 PS 到 CS 切换请求"],
            ["STN-SR", "SRVCC 会话转移号码，MSC Server 用它把会话转移请求路由到 IMS 中的锚点"],
            ["C-MSISDN", "关联用户电路域身份与 IMS 身份的号码"],
            ["SCC AS", "IMS 中的业务连续性应用服务器，呼叫建立时就锚定在会话路径上"],
            ["SRVCC 能力与签约", "UE 在附着时上报 SRVCC 能力；HSS 签约中有 STN-SR、C-MSISDN；MME 通过 S1AP 告诉 eNB “SRVCC Operation Possible”"]
          ]
        }
      },
      {
        h: "触发：eNB 如何决定做 SRVCC",
        list: [
          "UE 有 **QCI 1 语音承载**，且 eNB 已收到 SRVCC Operation Possible 指示。",
          "服务小区变差触发 **A2**，eNB 启动异系统测量（通常需要配置测量 GAP）。",
          "**B2 事件**：服务小区低于门限 1，且异系统邻区高于门限 2，UE 上报测量报告。也有配置用 B1（仅判断异系统邻区高于门限）的做法。",
          "常见做法是给有语音业务的 UE 配置单独的 A2 / B2 门限，让 VoLTE 用户比纯数据用户更“保守”地离开 LTE。"
        ],
        tip: "SRVCC 门限太高会让 VoLTE 用户过早掉到 2G/3G，失去高清语音；太低则可能在 LTE 上先掉话。门限要结合 LTE 边缘覆盖和语音质量一起调。"
      },
      {
        h: "SRVCC 主流程（到 UTRAN / GERAN）",
        flow: `sequenceDiagram
    participant UE
    participant eNB
    participant MME
    participant MSC as MSC Server
    participant TGT as 目标 RNC/BSC
    participant IMS as IMS（SCC AS 等）
    UE->>eNB: MeasurementReport（B2）
    eNB->>MME: Handover Required（SRVCC HO Indication）
    Note over MME: 按 QCI 1 拆分出语音承载
    MME->>MSC: Sv：SRVCC PS to CS Request（STN-SR、C-MSISDN 等）
    MSC->>TGT: 经目标 MSC 准备电路域切换资源
    TGT-->>MSC: 资源分配完成
    MSC->>IMS: 用 STN-SR 发起会话转移（INVITE）
    MSC->>MME: Sv：SRVCC PS to CS Response
    MME->>eNB: Handover Command
    eNB->>UE: MobilityFromEUTRACommand
    UE->>TGT: 接入目标小区
    MSC->>MME: SRVCC PS to CS Complete Notification`,
        list: [
          "**拆分承载**：MME 只把语音承载交给 Sv 做 PS 到 CS 转换；非语音承载在目标支持时走普通 PS 切换，否则被挂起。",
          "**会话转移**：MSC Server 用 STN-SR 向 IMS 发起转移，SCC AS 把会话从 LTE 腿切换到电路域腿，并更新对端的媒体地址。",
          "**下行先转**：会话转移后，下行语音开始从电路域到达；UE 收到切换命令真正切过去之前，会有一段中断。"
        ]
      },
      {
        h: "eSRVCC：把锚点拉近",
        p: [
          "基本 SRVCC 的会话转移要一路通知到 SCC AS 和对端（远端更新），如果用户在漫游或对端在很远的网络，信令往返时间长，语音中断明显。",
          "R10 引入 **eSRVCC**：在拜访网（服务网）P-CSCF 附近部署 **ATCF**（接入转移控制功能）和 **ATGW**（接入转移网关）。呼叫建立时，媒体就经过 ATGW 锚定；用户 IMS 注册时，ATCF 分配自己的 STN-SR 并更新到 HSS。发生 SRVCC 时，MSC Server 的转移请求只到 ATCF，ATGW 在本地把媒体从 LTE 侧切到 MSC 侧，**对端不需要更新**。"
        ],
        table: {
          head: ["", "SRVCC（R8）", "eSRVCC（R10）"],
          rows: [
            ["会话锚点", "归属网 SCC AS", "服务网 ATCF / ATGW"],
            ["STN-SR 指向", "SCC AS", "ATCF"],
            ["是否需要更新对端", "需要", "不需要"],
            ["语音中断", "较长，受远端路径影响", "明显缩短"]
          ]
        },
        after: ["国内 VoLTE 现网普遍部署 eSRVCC，指标中常见的 “eSRVCC 切换成功率” 就是指它。ATCF 常与 P-CSCF / SBC 合设，因厂家而异。"]
      },
      {
        h: "其他 SRVCC 增强",
        table: {
          head: ["增强", "解决的问题"],
          rows: [
            ["aSRVCC（振铃态 SRVCC）", "呼叫尚在振铃、未接通时也能做 SRVCC"],
            ["mid-call SRVCC", "保持中、多方通话等多会话场景的转移"],
            ["bSRVCC", "振铃前阶段的 SRVCC"],
            ["vSRVCC", "视频通话转移为电路域视频"],
            ["rSRVCC", "反向：从 UTRAN 电路域回到 LTE 上的 IMS 语音"],
            ["5G-SRVCC", "从 NR 上的 IMS 语音转到 UTRAN 电路域（5G 时代引入）"]
          ]
        },
        after: ["这些增强各有所属版本，现网支持程度取决于终端、无线和核心网是否都实现。早期常见问题是终端不支持振铃态 SRVCC，导致振铃阶段走出覆盖就失败。"]
      },
      {
        h: "常见问题与排查",
        table: {
          head: ["现象", "可能原因", "排查方向"],
          rows: [
            ["eNB 不触发 SRVCC，直接在 LTE 掉话", "未收到 SRVCC Operation Possible、未配置异系统邻区或 B2 门限过低", "S1AP 初始上下文中的指示、邻区与门限"],
            ["Sv 准备失败", "MSC 不支持 SRVCC、STN-SR / C-MSISDN 签约缺失、目标资源不足", "Sv 消息原因值、HSS 签约"],
            ["切换命令下发后失败", "目标小区覆盖差、邻区配置错误", "MobilityFromEUTRACommand 中的目标小区与实际覆盖"],
            ["切换成功但语音中断长或单通", "未部署 eSRVCC、会话转移时延大、媒体切换异常", "IMS 侧会话转移时间戳"],
            ["振铃中走出覆盖失败", "终端或网络不支持 aSRVCC", "终端能力与网络开关"]
          ]
        },
        tip: "SRVCC 的成败取决于无线、EPC、MSC、IMS 四方，排查时按信令顺序逐段定位：B2 报告 → Handover Required → Sv 请求 / 响应 → Handover Command → 目标侧接入。"
      },
      {
        h: "SRVCC 的未来",
        p: ["SRVCC 是 LTE 覆盖不完整时代的“安全网”。随着 LTE 覆盖完善、2G/3G 退网，SRVCC 的目标网络在减少，触发次数也在下降；当 2G/3G 完全关闭后，VoLTE 用户离开 LTE 就只能依靠 LTE 自身的覆盖或 5G 互操作。因此在退网规划中，SRVCC 指标是判断“能否关闭 2G/3G”的重要参考之一。"]
      }
    ]
  },

  // ───────────── 5.4 4G / 5G 互操作 ─────────────
  "lte-interwork": {
    sections: [
      {
        h: "两类互操作场景",
        p: ["5G 组网选项（NSA Option 3x、SA Option 2）的基本概念在 5G 路线 1.3「部署方式：NSA 与 SA」已经讲过，这里只从 **LTE 网络侧**看两类互操作：NSA 下 LTE 作为锚点“带着”NR 一起工作；SA 下 LTE 与 NR 是两个独立系统，用户在它们之间迁移。"],
        table: {
          head: ["场景", "核心网", "LTE 的角色", "关注点"],
          rows: [
            ["NSA（EN-DC）", "EPC", "主节点（MeNB），承载全部控制面", "锚点配置、B1 添加 SgNB、SCG 失败"],
            ["SA 与 LTE 互操作", "5GC 与 EPC 并存", "5G 覆盖外的承接网络", "重选、重定向、切换、N26"]
          ]
        }
      },
      {
        h: "NSA：LTE 锚点要配什么",
        list: [
          "**锚点小区**：配置了 NR 邻区和 B1-NR 测量、与 gNB 之间有 X2 的 LTE 小区。并非所有 LTE 频点都做锚点，常见做法是选覆盖与 NR 匹配的频点作锚点，非锚点频点上的 EN-DC 终端通过切换或重定向引导到锚点频点。",
          "**upperLayerIndication**：LTE SIB2 中的一个指示（R15），告诉终端这里有 5G 可用，终端据此显示 5G 图标。它只影响显示，不代表 SCG 已经建立。",
          "**终端与签约**：UE 在附着时上报是否支持 EN-DC（DCNR）；HSS 签约可以限制“NR 作为辅 RAT”，MME 据此通知 eNB 和 UE 不可使用 EN-DC。",
          "**B1-NR 门限与 TTT**：门限过高，用户很难加上 5G；过低则加上后很快因 NR 信号差而 SCG 失败。"
        ],
        tip: "“在 NR 覆盖下却没有 5G 图标”，先看所驻留 LTE 小区的 SIB2 有没有 upperLayerIndication；“有图标却没有 5G 速率”，再看 B1 测量和 SgNB 添加。"
      },
      {
        h: "NSA：SgNB 添加流程（LTE 视角）",
        flow: `sequenceDiagram
    participant UE
    participant eNB as eNB（MeNB）
    participant gNB as gNB（SgNB）
    participant MME
    eNB->>UE: RRCConnectionReconfiguration（配置 B1-NR 测量）
    UE->>eNB: MeasurementReport（B1-NR 触发）
    eNB->>gNB: X2：SgNB Addition Request
    gNB->>eNB: X2：SgNB Addition Request Acknowledge（携带 NR 侧配置）
    eNB->>UE: RRCConnectionReconfiguration（内含 NR RRC 配置）
    UE->>eNB: RRCConnectionReconfigurationComplete
    eNB->>gNB: X2：SgNB Reconfiguration Complete
    UE->>gNB: 在 NR 小区随机接入
    eNB->>MME: E-RAB Modification Indication（Option 3x 下行路径转到 gNB）`,
        after: [
          "SCG 释放的常见触发：NR 侧信号变差（NR 侧的 A2 等）、UE 上报 **SCGFailureInformationNR**、或锚点 LTE 发生切换时按策略释放 / 变更 SgNB。SCG 失败只释放 5G 部分，UE 仍保持在 LTE 上。",
          "由于控制面全在 LTE，**LTE 锚点的覆盖和质量决定了 NSA 体验的下限**：LTE 掉线即全部掉线。"
        ]
      },
      {
        h: "SA 与 LTE：重选、重定向、切换",
        table: {
          head: ["方向 / 状态", "手段", "关键配置", "业务中断"],
          rows: [
            ["空闲态 5G→4G", "小区重选", "NR SIB5 中 E-UTRA 频点优先级与门限", "无业务"],
            ["空闲态 4G→5G", "小区重选", "LTE SIB24 中 NR 频点优先级与门限（R15）", "无业务"],
            ["连接态 5G→4G", "重定向或切换", "NR 侧 A2 + B1/B2（测 E-UTRA）", "重定向秒级，切换百毫秒级（示例量级）"],
            ["连接态 4G→5G", "切换、重定向或释放后重选", "LTE 侧 B1-NR 测量", "同上"]
          ]
        },
        list: [
          "**重定向**：RRC 释放时带上目标系统频点，终端到对端重新接入。实现简单，但要重新建立连接，中断较长。",
          "**切换**：源侧经核心网把上下文传给目标侧，终端直接接入目标小区，中断短、IP 地址不变，但**依赖 N26**。",
          "国内现网常见策略是：空闲态 5G 高优先级，让终端尽快驻留 5G；连接态 5G 弱覆盖时切换或重定向到 4G；4G 下检测到 5G 好时再引导回去。"
        ]
      },
      {
        h: "N26 接口与合设网元",
        p: [
          "**N26** 是 MME 与 AMF 之间的接口（基于 GTPv2-C），用于在 EPC 与 5GC 之间传递移动性和会话上下文（TS 23.501 §5.17）。要让用户在 4G、5G 之间保持同一个 IP 地址，还需要核心网的**合设网元**："
        ],
        table: {
          head: ["合设网元", "作用"],
          rows: [
            ["SMF + PGW-C", "同一个会话锚点，4G 下作为 PGW-C，5G 下作为 SMF，保证 IP 不变"],
            ["UPF + PGW-U", "用户面锚点"],
            ["PCF + PCRF", "统一策略"],
            ["UDM + HSS", "统一签约与位置信息"]
          ]
        },
        after: [
          "**有 N26**：终端处于单注册模式，连接态可以直接做系统间切换；空闲态到 4G 时用由 5G-GUTI 映射来的 GUTI 做 TAU，MME 通过 N26 向 AMF 取上下文。5G 的 PDU 会话与 QoS 流在建立时就映射好对应的 EPS 承载（QCI 与 5QI 对应）。",
          "**无 N26**：网络在注册时告诉终端“支持无 N26 互通”。终端在 4G 侧重新附着，并以“切换”类型发起 PDN 连接，借助 UDM+HSS 中保存的 SMF+PGW-C 信息恢复同一会话；也可以用双注册模式。整体中断明显长于有 N26 的切换。"
        ],
        tip: "N26 是否部署直接决定 EPS Fallback 走切换还是重定向（见 5G 路线 5.3 语音模块），也决定 5G 与 4G 之间连接态迁移的体验。"
      },
      {
        h: "LTE 侧常见问题",
        table: {
          head: ["问题", "常见原因", "LTE 侧查什么"],
          rows: [
            ["NSA 不显示 5G", "非锚点频点、SIB2 无 upperLayerIndication、签约限制", "驻留频点、SIB2、附着接受中的 DCNR 限制"],
            ["NSA 有图标但加不上 SgNB", "B1 门限高、NR 邻区缺失、X2 故障", "B1 测量配置与报告、X2 状态、SgNB Addition 拒绝原因"],
            ["SCG 频繁失败", "NR 覆盖弱、上行受限、锚点频繁切换", "SCGFailureInformationNR 原因、锚点切换次数"],
            ["SA 用户回到 4G 后很久不回 5G", "LTE SIB24 未配置 NR 或优先级低、连接态无 B1-NR", "SIB24、LTE 侧 NR 测量配置"],
            ["4G/5G 来回乒乓", "两侧门限交叠", "统一梳理 NR 侧到 4G 门限与 LTE 侧到 5G 门限"]
          ]
        },
        after: ["做互操作参数时，要把 4G 侧和 5G 侧的门限放在一张表里对照，确保“5G 退到 4G 的门限”低于“4G 回到 5G 的门限”并留出余量，避免乒乓。"]
      }
    ]
  }
});
