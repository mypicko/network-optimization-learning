module.exports = [
  // ───────── 4.1 EPC 网元与接口详解 ─────────
  { id: "lte-epc-1", m: "lte-epc", t: "single", q: "EPC 中负责为终端分配 IP 地址的网元是？", o: ["MME", "SGW", "PGW", "HSS"], a: 2, e: "PGW 负责 UE IP 分配并内含 PCEF。MME 只处理信令，SGW 是移动锚点和下行缓存点，HSS 存签约和生成鉴权向量。" },
  { id: "lte-epc-2", m: "lte-epc", t: "single", q: "MME 与 SGW 之间的 S11 接口使用什么协议？", o: ["GTPv2-C", "S1AP", "Diameter", "GTP-U"], a: 0, e: "S11 是控制面接口，用 GTPv2-C 建立、修改、删除会话与承载。S1AP 用于 eNB–MME，Diameter 用于 S6a / Gx，GTP-U 用于用户面隧道。" },
  { id: "lte-epc-3", m: "lte-epc", t: "multi", q: "以下属于 SGW 职责的有？", o: ["eNB 间切换的本地移动锚点", "终端空闲态时缓存下行数据并触发 Downlink Data Notification", "执行 NAS 加密与完整性保护", "按 UE / PDN / QCI 统计用于漫游结算"], a: [0, 1, 3], e: "NAS 安全由 MME 负责，SGW 不处理 NAS 信令。其余三项都是 SGW 的功能。" },
  { id: "lte-epc-4", m: "lte-epc", t: "judge", q: "S5 和 S8 功能相同，S8 用于漫游时拜访网 SGW 与归属网 PGW 之间。", a: true, e: "S5 用于本网内 SGW–PGW，S8 用于漫游归属地路由场景，两者协议和功能基本相同。" },

  // ───────── 4.2 附着与默认承载建立 ─────────
  { id: "lte-attach-1", m: "lte-attach", t: "single", q: "LTE 附着时，默认承载建立请求是如何发送给网络的？", o: ["附着完成后终端单独发 PDN Connectivity Request", "PDN Connectivity Request 放在 Attach Request 的 ESM 消息容器中捎带", "由 MME 自动建立，终端不发任何 ESM 消息", "在 Attach Complete 中携带"], a: 1, e: "LTE 把 PDN 连接建立捎带在附着中，Attach Request 必带 PDN Connectivity Request，实现“永远在线”。Attach Complete 携带的是 Activate Default EPS Bearer Context Accept。" },
  { id: "lte-attach-2", m: "lte-attach", t: "single", q: "附着失败，Attach Reject 原因值为 #19，表示什么？", o: ["非法终端", "网络拥塞", "跟踪区不允许", "ESM 失败，需看捎带的 ESM 原因值"], a: 3, e: "#19 ESM failure 表示捎带的默认承载建立失败，具体原因看 PDN Connectivity Reject 中的 ESM 原因值，如 #27 APN 缺失或未知。#3 是非法终端，#22 是拥塞，#12 是跟踪区不允许。" },
  { id: "lte-attach-3", m: "lte-attach", t: "multi", q: "Attach Accept（含捎带的 ESM 消息）中通常下发哪些信息？", o: ["GUTI", "TAI 列表", "T3412 周期 TAU 定时器", "终端根密钥 K"], a: [0, 1, 2], e: "GUTI、TAI 列表、T3412、IMS VoPS 指示和默认承载参数都在 Attach Accept 中下发。根密钥 K 只存在于 USIM 和 AuC，永不传输。" },
  { id: "lte-attach-4", m: "lte-attach", t: "judge", q: "终端处于 EMM-REGISTERED 状态就一定处于 ECM-CONNECTED 状态。", a: false, e: "EMM 描述是否已注册，ECM 描述是否有 NAS 信令连接。已附着的终端没有业务时会释放 S1 连接，处于 EMM-REGISTERED + ECM-IDLE。" },

  // ───────── 4.3 EPS 承载与 QoS ─────────
  { id: "lte-bearer-1", m: "lte-bearer", t: "single", q: "按 TS 23.203 标准 QCI 表，IMS 信令对应的 QCI 是？", o: ["QCI 1", "QCI 5", "QCI 8", "QCI 9"], a: 1, e: "QCI 5 是 Non-GBR、优先级 1、时延 100 ms、丢包 10^-6，用于 IMS 信令。QCI 1 是会话语音，QCI 8 / 9 是 TCP 类业务。" },
  { id: "lte-bearer-2", m: "lte-bearer", t: "single", q: "UE-AMBR 由哪个网元执行？", o: ["PGW", "MME", "eNB", "PCRF"], a: 2, e: "UE-AMBR 由 eNB 执行；APN-AMBR 由 PGW（上下行）和 UE（上行）执行。MME 只传递参数，PCRF 做决策不执行。" },
  { id: "lte-bearer-3", m: "lte-bearer", t: "multi", q: "关于默认承载与专用承载，下列说法正确的有？", o: ["默认承载一定是 Non-GBR", "专用承载必须有 TFT", "每个 PDN 连接有且只有一条默认承载", "专用承载只能是 GBR"], a: [0, 1, 2], e: "专用承载可以是 GBR 也可以是 Non-GBR。默认承载必为 Non-GBR，每个 PDN 连接一条；专用承载需要 TFT 指定走它的业务流。" },
  { id: "lte-bearer-4", m: "lte-bearer", t: "judge", q: "ARP 的优先级会影响 eNB 对已建立承载的调度顺序。", a: false, e: "ARP 只用于承载准入和资源紧张时的抢占决策，不影响已建立承载的调度；调度依据的是 QCI 对应的转发特性。" },

  // ───────── 4.4 TAU、寻呼与服务请求 ─────────
  { id: "lte-tau-1", m: "lte-tau", t: "single", q: "终端处于 ECM-IDLE 时下行数据到达，SGW 向 MME 发送的消息是？", o: ["Create Session Request", "Modify Bearer Request", "Release Access Bearers Request", "Downlink Data Notification"], a: 3, e: "SGW 缓存数据并发 Downlink Data Notification 触发 MME 寻呼。Modify Bearer Request 是 MME 发给 SGW 用来告知 eNB 下行 TEID 的；Release Access Bearers Request 用于 S1 释放。" },
  { id: "lte-tau-2", m: "lte-tau", t: "single", q: "T3412 的默认值是多少？", o: ["54 分钟", "12 分钟", "15 秒", "30 分钟"], a: 0, e: "T3412 周期 TAU 定时器默认 54 分钟，网络可在 Attach / TAU Accept 中下发其他值。12 分钟是 T3402 默认值，15 秒是 T3410 / T3430。" },
  { id: "lte-tau-3", m: "lte-tau", t: "multi", q: "以下哪些情况会触发 TAU？", o: ["进入不在 TAI 列表中的跟踪区", "T3412 到期", "在 TAI 列表内的两个跟踪区之间移动", "终端的 UE 核心网能力或 DRX 参数发生变化"], a: [0, 1, 3], e: "TAI 列表的意义就是列表内移动不需要 TAU。其余三项都是 TAU 触发条件。" },
  { id: "lte-tau-4", m: "lte-tau", t: "judge", q: "终端进入 ECM-IDLE 后，SGW / PGW 中的承载上下文和终端 IP 地址都会被删除。", a: false, e: "S1 释放只删除 eNB 侧上下文、S1 连接和 SGW 中的 eNB 下行 TEID；SGW / PGW 的承载上下文和 IP 地址保留，所以恢复连接只需 Service Request。" },

  // ───────── 4.5 鉴权与安全（EPS-AKA）─────────
  { id: "lte-security-1", m: "lte-security", t: "single", q: "EPS 鉴权向量不包含以下哪一项？", o: ["RAND", "XRES", "KeNB", "AUTN"], a: 2, e: "EPS 鉴权向量由 RAND、XRES、AUTN、KASME 组成。KeNB 是 MME 由 KASME 和上行 NAS COUNT 推导后下发给 eNB 的。" },
  { id: "lte-security-2", m: "lte-security", t: "single", q: "终端回 Authentication Failure，原因值 #21 Synch failure，说明什么？", o: ["AUTN 中 MAC 校验失败", "MAC 正确但 SQN 不在可接受范围，需重同步", "MME 判定 RES 与 XRES 不一致", "终端不支持 EPS 算法"], a: 1, e: "#21 表示 SQN 不同步，终端带 AUTS，MME 请 HSS 重同步。MAC 失败是 #20；RES 不一致时 MME 发 Authentication Reject。" },
  { id: "lte-security-3", m: "lte-security", t: "multi", q: "下列哪些密钥由 KeNB 推导？", o: ["KRRCenc", "KRRCint", "KUPenc", "KNASint"], a: [0, 1, 2], e: "KRRCenc、KRRCint、KUPenc 由 KeNB 推导，用于接入层。KNASint 和 KNASenc 由 KASME 推导，用于 NAS 层。" },
  { id: "lte-security-4", m: "lte-security", t: "judge", q: "LTE 中普通终端的空口用户面数据既加密又做完整性保护。", a: false, e: "普通终端空口用户面只加密不做完整性保护，完整性保护用于 RRC 和 NAS 信令（中继节点场景例外）。" },

  // ───────── 4.6 PCC 策略控制与计费 ─────────
  { id: "lte-pcc-1", m: "lte-pcc", t: "single", q: "PCEF 通常部署在哪个网元中？", o: ["MME", "PGW", "PCRF", "HSS"], a: 1, e: "PCEF 是 PGW 内的策略执行功能；PCRF 负责决策，MME 和 HSS 不参与 PCC 执行。" },
  { id: "lte-pcc-2", m: "lte-pcc", t: "single", q: "VoLTE 呼叫中，P-CSCF 向 PCRF 提供媒体信息使用的接口和消息是？", o: ["Gx CCR", "Gy CCR", "S6a ULR", "Rx AAR"], a: 3, e: "P-CSCF 作为 AF 通过 Rx 接口发 AAR。Gx 连 PGW 与 PCRF，Gy 连 PGW 与 OCS，S6a 连 MME 与 HSS。" },
  { id: "lte-pcc-3", m: "lte-pcc", t: "multi", q: "PCC 规则通常包含哪些内容？", o: ["SDF 模板", "QCI 与 ARP", "计费键（rating group）", "终端的 GUTI"], a: [0, 1, 2], e: "PCC 规则含规则名、SDF 模板、优先级、QoS 参数、门控状态、计费参数等。GUTI 是 MME 分配的移动性标识，与 PCC 规则无关。" },
  { id: "lte-pcc-4", m: "lte-pcc", t: "judge", q: "预定义 PCC 规则配置在 PCEF 上，PCRF 只需通过规则名激活或去激活。", a: true, e: "预定义规则事先配置在 PGW（PCEF），PCRF 按名引用；动态规则则由 PCRF 在 Gx 消息中完整下发。" }
];
