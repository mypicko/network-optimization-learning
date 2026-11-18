// 5G 路径 · 阶段 4 5G 核心网：模块知识讲解
window.LESSONS = window.LESSONS || {};
window.LESSONS["5g"] = window.LESSONS["5g"] || {};

Object.assign(window.LESSONS["5g"], {
  // ───────────── 4.1 服务化架构与网元 ─────────────
  "s4-sba": {
    sections: [
      {
        h: "5GC 的设计原则",
        list: [
          "**控制面与用户面彻底分离**：SMF 管控制，UPF 管转发，UPF 可以灵活下沉。",
          "**服务化**：网元功能做成服务，通过统一的 API 互相调用。",
          "**网元功能解耦**：移动性（AMF）和会话（SMF）分开；鉴权（AUSF）和数据（UDM）分开。",
          "**无状态化**：业务逻辑与数据存储分离，数据集中存在 UDR / UDSF，网元故障时容易接管。",
          "**接入无关**：同一个核心网同时支持 5G 无线接入和非 3GPP 接入（如 Wi-Fi，经 N3IWF）。",
          "**原生支持网络切片和边缘计算**。"
        ]
      },
      {
        h: "网元功能",
        table: {
          head: ["网元", "主要功能"],
          rows: [
            ["AMF", "注册管理、连接管理、移动性管理、NAS 信令终结与加密、接入鉴权中的 SEAF 角色、为 SMS 和定位等转发消息"],
            ["SMF", "PDU 会话建立 / 修改 / 释放、IP 地址分配、UPF 选择与控制（N4）、下行数据到达通知、计费数据收集"],
            ["UPF", "数据包路由转发、QoS 执行、用量上报、下行数据缓存、作为移动性锚点"],
            ["AUSF", "执行 5G-AKA / EAP-AKA' 鉴权"],
            ["UDM", "签约数据管理、生成鉴权向量（ARPF）、SUCI 解密（SIDF）、记录服务终端的 AMF"],
            ["UDR", "统一数据存储：签约数据、策略数据、开放数据"],
            ["PCF", "统一策略框架：会话策略（QoS、计费）、接入和移动性策略、终端路由策略（URSP）"],
            ["NRF", "网元注册、服务发现、为服务调用颁发访问令牌"],
            ["NSSF", "网络切片选择"],
            ["NEF", "向外部应用安全地开放网络能力"],
            ["SCP（R16）", "服务通信代理，网元之间间接通信、负载均衡"],
            ["NWDAF", "网络数据分析，为其他网元提供分析结果"],
            ["CHF", "融合计费"]
          ]
        }
      },
      {
        h: "两种表示法与主要接口",
        p: ["5GC 架构有两种画法：**服务化表示**（控制面网元都挂在一条服务总线上，接口名为 Namf、Nsmf 等）和**参考点表示**（网元之间两两连线，接口名为 N1、N2 等）。用户面和终端、基站相关的接口仍是点对点的。"],
        table: {
          head: ["参考点", "连接", "协议"],
          rows: [
            ["N1", "UE ↔ AMF", "NAS（5GMM / 5GSM）"],
            ["N2", "gNB ↔ AMF", "NGAP"],
            ["N3", "gNB ↔ UPF", "GTP-U"],
            ["N4", "SMF ↔ UPF", "PFCP"],
            ["N6", "UPF ↔ 数据网络", "IP"],
            ["N9", "UPF ↔ UPF", "GTP-U"],
            ["N11", "AMF ↔ SMF", "SBI"],
            ["N8 / N10", "AMF / SMF ↔ UDM", "SBI"],
            ["N12", "AMF ↔ AUSF", "SBI"],
            ["N7", "SMF ↔ PCF", "SBI"],
            ["N22", "AMF ↔ NSSF", "SBI"],
            ["N26", "AMF ↔ MME", "GTPv2-C（4G/5G 互操作）"]
          ]
        }
      },
      {
        h: "服务化接口是怎么工作的",
        p: [
          "每个网元对外提供若干**服务**，命名规则是“N + 网元名 + _ + 服务名”，例如 Namf_Communication、Nsmf_PDUSession、Nudm_SDM（签约数据管理）、Nudm_UECM（终端上下文管理）、Nausf_UEAuthentication、Npcf_SMPolicyControl、Nnrf_NFDiscovery。",
          "接口基于 **HTTP/2 + JSON**，用 RESTful 风格（资源 + GET/POST/PUT/PATCH/DELETE），接口定义用 OpenAPI 描述，见 TS 29.5xx 系列。网元之间用 TLS 保护，用 NRF 签发的 OAuth2 令牌鉴权。"
        ],
        flow: `sequenceDiagram
    participant SMF
    participant NRF
    participant UDM
    SMF->>NRF: 启动时注册（Nnrf_NFManagement，上报自己提供的服务）
    UDM->>NRF: 启动时注册
    SMF->>NRF: 需要签约数据时发现 UDM（Nnrf_NFDiscovery）
    NRF-->>SMF: 返回可用 UDM 实例列表
    SMF->>UDM: 直接调用 Nudm_SDM_Get`
      },
      {
        h: "4G/5G 融合组网",
        p: [
          "现网的 5GC 普遍与 EPC 融合部署：**SMF + PGW-C、UPF + PGW-U、UDM + HSS、PCF + PCRF** 做成合一网元，终端在 4G 和 5G 之间移动时 IP 地址保持不变。AMF 与 MME 之间通过 N26 接口传递终端上下文，支持系统间切换。"
        ],
        tip: "学核心网最好的方法是动手：用 Open5GS 或 free5GC 搭一套实验网，看每个网元的日志和 SBI 抓包，比读规范直观得多。"
      }
    ]
  },

  // ───────────── 4.2 注册流程 ─────────────
  "s4-registration": {
    sections: [
      {
        h: "注册的类型",
        table: {
          head: ["类型", "什么时候发生"],
          rows: [
            ["初始注册", "开机、或从未注册状态接入"],
            ["移动性注册更新", "移动到 TAI 列表以外的跟踪区；终端能力或参数变化"],
            ["周期性注册更新", "周期定时器 T3512 到期，让网络知道终端还在"],
            ["紧急注册", "仅为紧急呼叫接入"]
          ]
        }
      },
      {
        h: "终端的身份标识",
        table: {
          head: ["标识", "含义", "用途"],
          rows: [
            ["SUPI", "用户永久标识，通常是 IMSI", "核心网内部识别用户，不在空口明文传"],
            ["SUCI", "加密后的 SUPI", "首次注册等需要表明身份的场合"],
            ["5G-GUTI", "GUAMI（标识 AMF）+ 5G-TMSI", "AMF 分配的临时身份，注册后代替 SUPI 使用"],
            ["5G-S-TMSI", "5G-GUTI 的缩短形式", "寻呼、RRC 建立"],
            ["PEI", "终端设备标识，如 IMEI", "设备识别"]
          ]
        }
      },
      {
        h: "初始注册流程",
        flow: `sequenceDiagram
    participant UE
    participant gNB
    participant AMF
    participant AUSF
    participant UDM
    participant PCF
    UE->>gNB: RRC 建立，RRCSetupComplete 携带 Registration Request
    gNB->>AMF: NGAP Initial UE Message（基站选择 AMF）
    AMF->>AUSF: Nausf_UEAuthentication（SUCI）
    AUSF->>UDM: Nudm_UEAuthentication_Get（解密 SUCI，生成鉴权向量）
    AMF->>UE: Authentication Request / Response
    AMF->>UE: NAS Security Mode Command / Complete
    AMF->>UDM: Nudm_UECM_Registration（登记服务 AMF）
    AMF->>UDM: Nudm_SDM_Get / Subscribe（获取签约）
    AMF->>PCF: 建立接入和移动性策略
    AMF->>gNB: Initial Context Setup（含 Registration Accept 与接入层密钥）
    gNB->>UE: 接入层安全模式、RRC 重配置
    UE->>AMF: Registration Complete`
      },
      {
        h: "流程中的关键点",
        list: [
          "**Registration Request** 携带：注册类型、身份（SUCI 或 5G-GUTI）、请求的切片（Requested NSSAI）、终端核心网能力、是否有待发数据等。",
          "如果终端带的是旧 AMF 分配的 5G-GUTI，新 AMF 会先向旧 AMF 取上下文（Namf_Communication_UEContextTransfer），取不到再发 Identity Request 要 SUCI。",
          "**鉴权与安全**：先鉴权确认身份，再用 NAS 安全模式命令激活 NAS 加密和完整性保护，之后的 NAS 消息都受保护（详见 4.6）。",
          "**Registration Accept** 下发：新的 5G-GUTI、**TAI 列表**（在这些跟踪区内移动不用更新）、允许的切片（Allowed NSSAI）、周期注册定时器、网络能力（如是否支持 IMS 语音）。",
          "**注册与会话是分开的**：注册完成只代表“入网”，还没有 IP 地址。上网要再建立 PDU 会话（见 4.3）。"
        ]
      },
      {
        h: "注册被拒：常见原因值",
        table: {
          head: ["5GMM 原因值", "含义", "常见场景"],
          rows: [
            ["#3", "非法终端", "鉴权失败、卡被列入黑名单"],
            ["#7", "不允许使用 5GS 业务", "未开通 5G 签约"],
            ["#11", "不允许接入该 PLMN", "漫游限制"],
            ["#12", "不允许接入该跟踪区", "区域限制"],
            ["#15", "该跟踪区内没有合适的小区", "终端应尝试其他跟踪区"],
            ["#27", "不允许 N1 模式", "终端应回到 4G"],
            ["#62", "没有可用的网络切片", "请求的切片都不被允许"]
          ]
        },
        tip: "终端开机显示 5G 却上不了网，先看注册是否成功、拒绝原因值是什么，再看 PDU 会话是否建立成功——这是定界的第一步。"
      }
    ]
  },

  // ───────────── 4.3 PDU 会话建立 ─────────────
  "s4-pdu": {
    sections: [
      {
        h: "PDU 会话是什么",
        p: [
          "**PDU 会话**是终端与某个数据网络之间的一条逻辑连接，由 DNN（数据网络名）和 S-NSSAI（切片）确定。每个会话有自己的 IP 地址、锚点 UPF 和 QoS 配置。一个终端可以同时有多个会话（会话 ID 1–15），例如一个上网、一个 IMS。"
        ],
        table: {
          head: ["属性", "取值"],
          rows: [
            ["会话类型", "IPv4、IPv6、IPv4v6、以太网、非结构化"],
            ["DNN", "如互联网、ims、企业专网名称（相当于 4G 的 APN）"],
            ["S-NSSAI", "会话所属的切片"],
            ["SSC 模式", "1 / 2 / 3，决定移动时锚点是否保持"]
          ]
        }
      },
      {
        h: "建立流程逐步解读",
        steps: [
          "**终端发起**：NAS 消息 PDU Session Establishment Request（会话 ID、类型、DNN、S-NSSAI）。",
          "**AMF 选择 SMF**：按 DNN 和切片通过 NRF 发现合适的 SMF，调用 Nsmf_PDUSession_CreateSMContext。",
          "**SMF 获取签约**：从 UDM 取会话管理签约数据（允许的 DNN、默认 5QI、会话 AMBR 等）。",
          "**SMF 获取策略**：从 PCF 获取会话策略（Npcf_SMPolicyControl_Create）。",
          "**SMF 选择 UPF 并下发规则**：N4 会话建立，下发 PDR / FAR / QER / URR；UPF 分配上行隧道标识。",
          "**SMF 回应**：通过 AMF 的 N1N2MessageTransfer 同时下发两部分——给终端的 NAS 消息（会话建立接受：IP 地址、QoS 规则、会话 AMBR）和给基站的 N2 信息（QoS 配置、UPF 上行隧道地址）。",
          "**基站建立空口资源**：收到 PDU Session Resource Setup Request 后，用 RRC 重配置建立 DRB，并把 NAS 消息转给终端。",
          "**基站回应**：PDU Session Resource Setup Response，带上基站侧的下行隧道标识。",
          "**打通下行**：SMF 通过 N4 会话修改把下行隧道地址告诉 UPF。至此上下行用户面都打通了。"
        ]
      },
      {
        h: "PFCP 规则：SMF 如何指挥 UPF",
        table: {
          head: ["规则", "全称", "作用"],
          rows: [
            ["PDR", "包检测规则", "匹配报文：按隧道 TEID、终端 IP、业务数据流过滤器等识别属于哪条流"],
            ["FAR", "转发动作规则", "转发、丢弃、缓存；转发时加什么隧道头"],
            ["QER", "QoS 执行规则", "限速（MBR、GBR）、门控、标记 QFI"],
            ["URR", "用量上报规则", "统计流量和时长，用于计费和配额"],
            ["BAR", "缓存动作规则", "终端空闲时下行数据如何缓存"]
          ]
        },
        after: ["一个报文进入 UPF 后，先用 PDR 匹配，再按 PDR 关联的 FAR、QER、URR 处理。理解了这套规则，就理解了 UPF 的全部工作方式。"]
      },
      {
        h: "N3 上的用户面封装",
        p: [
          "N3 上传输的报文结构：外层 IP / UDP（端口 2152）/ GTP-U 头（含 **TEID**，标识隧道）/ PDU 会话容器扩展头（含 **QFI**）/ 终端的原始 IP 包。",
          "每个 PDU 会话在 N3 上有一对隧道：上行用 UPF 分配的 TEID，下行用基站分配的 TEID。"
        ]
      },
      {
        h: "SSC 模式与 UPF 部署",
        table: {
          head: ["SSC 模式", "移动时的行为", "适合"],
          rows: [
            ["1", "锚点 UPF 始终不变，IP 不变", "普通上网、语音，现网默认"],
            ["2", "先断后连：释放旧会话再建新会话，IP 变化", "对中断不敏感的业务"],
            ["3", "先连后断：先建新会话再释放旧的", "边缘计算，希望就近换锚点又不中断"]
          ]
        },
        after: ["UPF 可以级联：靠近基站的**中间 UPF（I-UPF）**通过 N9 连到会话锚点 UPF（PSA）。**上行分类器（UL CL）**能把特定目的地址的流量就近分流到本地 UPF，这就是边缘计算“本地分流”的实现方式。"],
        tip: "PDU 会话建立失败时，看 5GSM 原因值：如 #27 缺少或未知 DNN、#29 用户鉴权失败、#26 资源不足等，它会告诉你问题出在签约、策略还是资源。"
      }
    ]
  },

  // ───────────── 4.4 QoS 模型 ─────────────
  "s4-qos": {
    sections: [
      {
        h: "QoS 流：5G QoS 的最小单位",
        p: [
          "一个 PDU 会话里可以有多条 **QoS 流**，每条用 **QFI** 标识。同一条 QoS 流内的所有数据享受相同的转发待遇。会话建立时总会有一条**默认 QoS 流**，之后可以按需增加。",
          "QoS 在三个地方执行："
        ],
        table: {
          head: ["位置", "依据", "作用"],
          rows: [
            ["终端", "QoS 规则（来自 SMF 的 NAS 消息）", "上行报文分类，打上 QFI"],
            ["UPF", "PDR / QER（来自 SMF 的 N4 规则）", "下行报文分类、打 QFI、限速"],
            ["基站", "QoS 配置（来自 SMF 经 AMF 的 N2 信息）", "把 QoS 流映射到 DRB，按 5QI 调度"]
          ]
        }
      },
      {
        h: "QoS 参数",
        list: [
          "**5QI**：标准化的 QoS 等级编号，对应一组特性（资源类型、优先级、时延预算、误包率）。",
          "**ARP**：分配与保留优先级。优先级 1–15（数值越小越优先），加上能否抢占别人、能否被别人抢占两个标志。资源紧张时决定谁能接入。",
          "**GFBR / MFBR**：GBR 流的保证速率和最大速率。",
          "**会话 AMBR / 终端 AMBR**：一个会话 / 一个终端所有 Non-GBR 流的总速率上限，常用于套餐限速。"
        ]
      },
      {
        h: "常用标准 5QI",
        table: {
          head: ["5QI", "资源类型", "优先级", "时延预算", "误包率", "典型业务"],
          rows: [
            ["1", "GBR", "20", "100 ms", "10⁻²", "语音通话"],
            ["2", "GBR", "40", "150 ms", "10⁻³", "视频通话"],
            ["5", "Non-GBR", "10", "100 ms", "10⁻⁶", "IMS 信令"],
            ["6", "Non-GBR", "60", "300 ms", "10⁻⁶", "缓冲视频、TCP 业务"],
            ["7", "Non-GBR", "70", "100 ms", "10⁻³", "直播、互动游戏"],
            ["8 / 9", "Non-GBR", "80 / 90", "300 ms", "10⁻⁶", "普通上网（9 最常用作默认）"],
            ["82", "时延敏感 GBR", "19", "10 ms", "10⁻⁴", "离散自动化（工业控制）"]
          ]
        },
        after: ["1–9 的定义与 4G 的 QCI 一致，便于 4G/5G 互操作。时延敏感 GBR 是 5G 新增的资源类型，面向 URLLC，还额外规定了最大数据突发量。完整表格见 TS 23.501 表 5.7.4-1。"]
      },
      {
        h: "QoS 流是怎么建立的",
        list: [
          "**默认 QoS 流**：PDU 会话建立时根据签约的默认 5QI 和 ARP 建立，通常 5QI 9。",
          "**按策略建立**：PCF 根据业务（例如收到 IMS 发起的通话请求）向 SMF 下发 PCC 规则，SMF 发起 PDU 会话修改，增加一条 5QI 1 的 QoS 流，基站为它建立专门的 DRB。",
          "**反射式 QoS**：UPF 在下行包中标记“反射”指示，终端据此自动生成对应的上行规则，不需要额外信令，适合大量动态业务流。"
        ]
      },
      {
        h: "和 4G 的区别",
        table: {
          head: ["", "4G EPS 承载", "5G QoS 流"],
          rows: [
            ["粒度", "承载，端到端一一对应", "QoS 流，核心网与空口解耦"],
            ["空口映射", "一个 EPS 承载 = 一个无线承载", "多个 QoS 流可映射到一个 DRB，由基站决定"],
            ["新增业务", "要建新承载，信令多", "可用反射式 QoS，无需信令"]
          ]
        },
        tip: "现网绝大部分流量都在默认的 5QI 9 上；VoNR 用 5QI 1（语音）和 5QI 5（IMS 信令）；行业专网和差异化套餐通过不同的 5QI、ARP 和 AMBR 实现差异化保障。"
      }
    ]
  },

  // ───────────── 4.5 网络切片 ─────────────
  "s4-slicing": {
    sections: [
      {
        h: "切片的标识",
        p: [
          "一个网络切片用 **S-NSSAI** 标识，由两部分组成：**SST**（切片 / 业务类型，8 位）和可选的 **SD**（切片区分符，24 位，用来区分同类型的多个切片，例如两家企业各一个 eMBB 切片）。"
        ],
        table: {
          head: ["SST", "类型"],
          rows: [
            ["1", "eMBB 增强移动宽带"],
            ["2", "URLLC 超可靠低时延"],
            ["3", "MIoT 大规模物联网"],
            ["4", "V2X 车联网"],
            ["5 及以后", "后续版本陆续增加的类型（如高性能机器通信）"]
          ]
        }
      },
      {
        h: "几种 NSSAI",
        table: {
          head: ["名称", "含义", "来源"],
          rows: [
            ["签约 NSSAI", "用户签约允许使用的切片", "UDM"],
            ["配置 NSSAI", "网络配置给终端、在某 PLMN 可用的切片", "AMF 下发，终端保存"],
            ["请求 NSSAI", "终端注册时希望使用的切片", "终端"],
            ["允许 NSSAI", "本次注册网络允许使用的切片（最多 8 个）", "AMF / NSSF"],
            ["拒绝 NSSAI", "本次被拒绝的切片及原因", "AMF"]
          ]
        }
      },
      {
        h: "切片是怎么被选中的",
        steps: [
          "终端在 Registration Request 中带上请求 NSSAI；基站也可以据此选择支持这些切片的 AMF。",
          "AMF 对照签约和本区域支持的切片，必要时向 NSSF 查询（Nnssf_NSSelection），得到允许 NSSAI；如果当前 AMF 不支持，还会重定向到合适的 AMF。",
          "终端建立 PDU 会话时指定 S-NSSAI，AMF 按切片选择 SMF，SMF 按切片选择 UPF。",
          "基站从 NGAP 消息中得知每个 PDU 会话属于哪个切片，在调度时区别对待。",
          "终端上的 **URSP**（终端路由选择策略，由 PCF 下发）决定哪个应用走哪个切片 / DNN，这是面向个人用户的切片能落地的关键。"
        ]
      },
      {
        h: "端到端切片：三个域都要配合",
        table: {
          head: ["域", "隔离和保障手段"],
          rows: [
            ["无线", "切片感知的调度优先级；按切片预留或限制 PRB 比例（R17 的 RRM 策略：最小、最大、专用比例）；专用载波或专用基站"],
            ["传输", "软隔离：VPN、SR 路径、QoS 队列；硬隔离：FlexE 切片，带宽物理独占"],
            ["核心网", "共享 AMF 等控制面网元，专用 SMF / UPF；最高等级可整套专用并下沉到园区"]
          ]
        },
        after: ["隔离程度越高，保障越好，成本越高。实际方案要在 SLA（时延、带宽、可靠性、安全隔离）与成本之间权衡。"]
      },
      {
        h: "切片的管理与国内应用",
        p: [
          "切片的生命周期（设计、实例化、监控、调整、终止）由网管系统完成，相关规范在 TS 28.530 / 28.531 系列；GSMA 定义了通用切片模板（GST），用统一的属性描述客户需求。",
          "国内典型应用：电网差动保护（低时延、高可靠的硬切片）、电力配网采集、港口远程操控、矿山井下视频与控制、大型活动直播保障、医疗应急等。"
        ],
        tip: "评估切片方案时，问三个问题：无线侧怎么保障？传输侧怎么隔离？核心网哪些网元专用、部署在哪里？只回答了核心网的方案不完整。"
      }
    ]
  },

  // ───────────── 4.6 5G 安全 ─────────────
  "s4-security": {
    sections: [
      {
        h: "安全架构中的角色",
        table: {
          head: ["功能", "所在网元", "作用"],
          rows: [
            ["ARPF", "UDM", "保存用户长期密钥 K，生成鉴权向量"],
            ["SIDF", "UDM", "用归属网络私钥解密 SUCI，得到 SUPI"],
            ["AUSF", "AUSF", "在归属网络执行鉴权并确认结果"],
            ["SEAF", "AMF", "在服务网络中锚定鉴权结果，派生后续密钥"],
            ["SEPP", "网络边界", "运营商之间（漫游）信令的安全网关"]
          ]
        }
      },
      {
        h: "SUCI：保护永久身份",
        p: [
          "4G 中，网络在某些情况下会要求终端明文发送 IMSI，可能被伪基站捕获，用于跟踪用户。5G 中终端用 USIM 中保存的**归属网络公钥**，以 ECIES 算法（Profile A 基于 Curve25519，Profile B 基于 secp256r1）加密 SUPI 中的用户部分，得到 **SUCI**。只有归属网络 UDM 中的 SIDF 能解密。",
          "SUCI 每次生成都不同，窃听者无法关联。也有不加密的“空方案”，用于测试或未配置公钥的卡。"
        ]
      },
      {
        h: "5G-AKA 鉴权流程",
        flow: `sequenceDiagram
    participant UE
    participant AMF as AMF（SEAF）
    participant AUSF
    participant UDM as UDM（ARPF / SIDF）
    AMF->>AUSF: 鉴权请求（SUCI、服务网络名）
    AUSF->>UDM: 获取鉴权向量
    Note over UDM: 解密 SUCI，生成 RAND、AUTN、XRES*、KAUSF
    UDM-->>AUSF: 归属网络鉴权向量
    Note over AUSF: 计算 HXRES*，派生 KSEAF
    AUSF-->>AMF: RAND、AUTN、HXRES*
    AMF->>UE: Authentication Request（RAND、AUTN）
    Note over UE: 校验 AUTN（验证网络），计算 RES*
    UE->>AMF: Authentication Response（RES*）
    Note over AMF: 比较 HRES* 与 HXRES*
    AMF->>AUSF: 提交 RES*
    Note over AUSF: 比较 RES* 与 XRES*（归属网络确认）
    AUSF-->>AMF: 鉴权成功、KSEAF、SUPI`,
        after: ["关键改进是**归属网络确认**：最终由归属网络的 AUSF 判定鉴权是否成功，拜访网络无法伪造鉴权结果，防止漫游计费欺诈。另一种方式 EAP-AKA' 基于 EAP 框架，同样适用于非 3GPP 接入。"]
      },
      {
        h: "密钥层次",
        table: {
          head: ["密钥", "持有者", "用途"],
          rows: [
            ["K", "USIM、ARPF", "长期根密钥，永不传输"],
            ["CK / IK", "USIM、ARPF", "鉴权过程产生"],
            ["KAUSF", "终端、AUSF", "归属网络锚点密钥"],
            ["KSEAF", "终端、SEAF", "服务网络锚点密钥"],
            ["KAMF", "终端、AMF", "派生 NAS 密钥和接入层密钥"],
            ["KNASint / KNASenc", "终端、AMF", "NAS 完整性 / 加密"],
            ["KgNB", "终端、gNB", "派生接入层密钥"],
            ["KRRCint / KRRCenc", "终端、gNB", "RRC 信令完整性 / 加密"],
            ["KUPint / KUPenc", "终端、gNB", "用户面完整性 / 加密"]
          ]
        },
        after: ["切换时 KgNB 会重新派生（利用下一跳参数 NH），使目标基站拿不到源基站的密钥，实现前向安全。"]
      },
      {
        h: "安全算法与安全激活",
        list: [
          "加密算法 NEA0–NEA3、完整性算法 NIA0–NIA3，分别基于空算法、SNOW 3G、AES、**祖冲之（ZUC）**。ZUC 是我国自主设计的算法。",
          "NAS 层：鉴权成功后，AMF 发 **NAS Security Mode Command** 选定算法，激活 NAS 安全。",
          "接入层：基站发 **RRC SecurityModeCommand**，激活 RRC 信令和用户面的安全。",
          "**用户面完整性保护**是 5G 新增能力，由 SMF 按策略决定是否对某个会话启用。"
        ]
      },
      {
        h: "5G 相比 4G 的安全增强",
        list: [
          "SUCI 加密永久身份，抵御 IMSI 捕获。",
          "归属网络确认鉴权结果。",
          "支持用户面完整性保护。",
          "统一鉴权框架，3GPP 与非 3GPP 接入使用同一套机制。",
          "服务化接口使用 TLS 和 OAuth2，运营商之间通过 SEPP 保护漫游信令。"
        ],
        tip: "看注册抓包时，Authentication Request 中能看到 RAND 和 AUTN，Security Mode Command 中能看到选定的加密和完整性算法；安全激活之后的 NAS 消息就是密文了。"
      }
    ]
  }
});
