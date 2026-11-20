// 5G 关键流程的示意信令日志：逐条消息 + 关键字段 + 解读 + 规范出处
// ⚠️ 示意日志：按 3GPP 规范的消息结构编写，用于教学；字段取值为虚构示例，不是现网实测。
//    不同厂商的路测 / 信令跟踪工具显示格式不同，字段名以规范 ASN.1 / 信元名为准。
// 结构：SIGLOGS[主题][模块 id] = { title, intro, steps: [{ dir, iface, msg, fields: [[字段, 说明]], explain, spec }] }
window.SIGLOGS = window.SIGLOGS || {};

window.SIGLOGS["5g"] = {
  // ───────────── 3.3 随机接入与 RRC 连接建立 ─────────────
  "s3-access": {
    title: "四步竞争随机接入 + RRC 连接建立（空闲态手机首次接入）",
    intro: "手机已完成小区搜索、读到 SIB1，要发起注册。下面是从发前导到 RRC 连接建立完成的 5 条消息（常说的 Msg1–Msg5）。",
    steps: [
      {
        dir: "UE → gNB", iface: "PRACH（物理层）", msg: "Msg1：随机接入前导",
        fields: [
          ["preambleIndex: 23", "从 SIB1 配置的 64 个前导里随机挑一个（竞争接入）"],
          ["SSB index: 2", "选信号最好的 SSB，并在它映射的 PRACH 时机（RO）上发送"],
          ["RA-RNTI: 0x0069", "由发送前导的时隙、符号、频域位置算出，基站用它回 RAR"]
        ],
        explain: "前导只是一串序列，不带手机身份。基站据此知道“这个波束方向有人想接入”，并测出上行定时偏差。",
        spec: "TS 38.211 §6.3.3；TS 38.321 §5.1.2–5.1.3"
      },
      {
        dir: "gNB → UE", iface: "MAC（PDSCH，PDCCH 用 RA-RNTI 加扰）", msg: "Msg2：随机接入响应 RAR",
        fields: [
          ["RAPID: 23", "回显前导编号，手机据此确认是回给自己的（可能多人选了同一个前导）"],
          ["Timing Advance Command: 37", "上行定时提前量，让手机的上行信号对齐基站接收窗口"],
          ["UL Grant: …", "给 Msg3 分配的上行资源"],
          ["Temporary C-RNTI: 0x4601", "临时身份，竞争解决成功后才转正为 C-RNTI"]
        ],
        explain: "手机在 ra-ResponseWindow 内盯着 RA-RNTI 加扰的 PDCCH。收不到就加大功率（功率爬坡）重发前导。",
        spec: "TS 38.321 §5.1.4、§6.2.3"
      },
      {
        dir: "UE → gNB", iface: "RRC · SRB0（CCCH）", msg: "Msg3：RRCSetupRequest",
        fields: [
          ["ue-Identity: randomValue '0x5A3C1F07E2'（39 bit）", "第一次注册没有 5G-S-TMSI，用随机数；已注册过则填 ng-5G-S-TMSI-Part1"],
          ["establishmentCause: mo-Signalling", "建立原因：主叫信令（注册）。被叫是 mt-Access，主叫数据是 mo-Data"]
        ],
        explain: "这是第一条带“身份”的消息。选了同一前导的多台手机会在同一资源上发 Msg3，靠下一步的竞争解决分出胜负。",
        spec: "TS 38.331 §5.3.3.3"
      },
      {
        dir: "gNB → UE", iface: "MAC CE + RRC · SRB0", msg: "Msg4：竞争解决 + RRCSetup",
        fields: [
          ["UE Contention Resolution Identity: 0x5A3C1F07E2…", "MAC CE，原样回显 Msg3 的前 48 bit；和自己发的一致才算赢"],
          ["radioBearerConfig: srb-ToAddModList { srb-Identity 1 }", "建立 SRB1，后续 RRC 和 NAS 信令走它"],
          ["masterCellGroup: { rlc-BearerToAddModList, mac-CellGroupConfig, physicalCellGroupConfig, spCellConfig }", "专用的 RLC / MAC / 物理层配置"]
        ],
        explain: "竞争解决成功后，Temporary C-RNTI 转正为 C-RNTI。没赢的手机重新发起随机接入。",
        spec: "TS 38.321 §5.1.5；TS 38.331 §5.3.3.4"
      },
      {
        dir: "UE → gNB", iface: "RRC · SRB1", msg: "Msg5：RRCSetupComplete",
        fields: [
          ["selectedPLMN-Identity: 1", "选中 SIB1 里 PLMN 列表的第 1 个（如 460-00）"],
          ["registeredAMF / guami-Type", "已注册过的手机告诉基站原 AMF，便于路由到同一个 AMF"],
          ["dedicatedNAS-Message: Registration Request", "把 NAS 注册请求捎带上去，基站透传给 AMF"]
        ],
        explain: "到这里 RRC 连接建立完成，手机进入 RRC_CONNECTED。基站选好 AMF，用 NGAP Initial UE Message 转发 NAS 消息——注册流程从这里接上。",
        spec: "TS 38.331 §5.3.3.4"
      }
    ]
  },

  // ───────────── 4.2 注册流程 ─────────────
  "s4-registration": {
    title: "初始注册：身份、鉴权、NAS 安全、建立上下文",
    intro: "接着上面的 RRC 连接建立。手机第一次开机注册（没有可用的安全上下文），用 SUCI 上报身份，走 5G AKA 鉴权。",
    steps: [
      {
        dir: "gNB → AMF", iface: "NGAP（N2）", msg: "Initial UE Message（携带 Registration Request）",
        fields: [
          ["RAN-UE-NGAP-ID: 1", "基站给这个手机分的 N2 标识"],
          ["NAS-PDU: Registration Request", "基站不解析，原样转给 AMF"],
          ["UserLocationInformation: NR-CGI 460-00-0x1A2B3C4D5, TAI 460-00-0x001234", "手机当前所在小区和跟踪区"],
          ["RRCEstablishmentCause: mo-Signalling", ""]
        ],
        explain: "Registration Request 的关键内容：5GS registration type = initial registration；ngKSI = 7（没有可用密钥）；5GS mobile identity = SUCI（MCC 460、MNC 00，MSIN 部分已加密）；UE security capability（支持的 5G-EA / 5G-IA 算法）；Requested NSSAI（如 SST 1 = eMBB）。",
        spec: "TS 38.413 §8.6.1；TS 24.501 §5.5.1.2、§8.2.6"
      },
      {
        dir: "AMF ↔ AUSF ↔ UDM", iface: "SBI（HTTP/2）", msg: "Nausf_UEAuthentication_Authenticate",
        fields: [
          ["supiOrSuci: suci-0-460-00-0000-1-1-…", "AMF 把 SUCI 交给 AUSF，UDM 里的 SIDF 解密出 SUPI"],
          ["servingNetworkName: 5G:mnc000.mcc460.3gppnetwork.org", "参与密钥推导，防止拿别的网络的鉴权向量冒充"],
          ["5gAuthData: RAND, AUTN, HXRES*", "UDM 生成鉴权向量，AUSF 只把 HXRES* 给 AMF（RES* 原值留在 AUSF）"]
        ],
        explain: "这一步在核心网内部完成，空口看不到，但在核心网信令跟踪里能看到对应的 HTTP/2 请求。",
        spec: "TS 33.501 §6.1.3.2；TS 29.509"
      },
      {
        dir: "AMF → UE", iface: "NAS（经 NGAP DL NAS Transport）", msg: "Authentication Request",
        fields: [
          ["ngKSI: 0", "这次要建立的安全上下文编号"],
          ["ABBA: 0x0000", "防降级参数，参与密钥推导"],
          ["RAND: 0x9C…（128 bit）", "随机数"],
          ["AUTN: 0x5E…（128 bit）", "网络鉴权令牌，手机（USIM）用它验证“这是真网络”"]
        ],
        explain: "5G AKA 是双向鉴权：手机先用 AUTN 验证网络，再算出 RES* 回给网络验证自己。AUTN 校验失败时手机回 Authentication Failure（如 MAC failure、Synch failure）。",
        spec: "TS 24.501 §5.4.1.3；TS 33.501 §6.1.3.2"
      },
      {
        dir: "UE → AMF", iface: "NAS", msg: "Authentication Response",
        fields: [["Authentication response parameter: RES*（128 bit）", "AMF 先比对 HRES* 与 HXRES*，再交 AUSF 做最终比对"]],
        explain: "鉴权通过后，AUSF 推导出 K_SEAF 给 AMF，AMF 再推导出 K_AMF，以及 NAS 加密、完整性保护用的密钥。",
        spec: "TS 33.501 §6.1.3.2、附录 A"
      },
      {
        dir: "AMF → UE", iface: "NAS（仅完整性保护）", msg: "Security Mode Command",
        fields: [
          ["Selected NAS security algorithms: 5G-EA2 / 5G-IA2", "选定加密算法和完整性保护算法（基于 AES）"],
          ["ngKSI: 0", ""],
          ["Replayed UE security capabilities", "把手机上报的能力原样回放，手机核对防止被中间人降级"],
          ["IMEISV request: requested", "要求手机在完成消息里带 IMEISV"]
        ],
        explain: "从这条起 NAS 消息开始有完整性保护。手机核对回放的能力无误后，启用 NAS 安全。",
        spec: "TS 24.501 §5.4.2；TS 33.501 §6.7.2"
      },
      {
        dir: "UE → AMF", iface: "NAS（加密 + 完整性保护）", msg: "Security Mode Complete",
        fields: [
          ["IMEISV: …", "设备标识"],
          ["NAS message container: 完整的 Registration Request", "最初的明文注册请求只带必要信元，完整内容这时在加密保护下重发"]
        ],
        explain: "到这里 NAS 安全建立完成。AMF 随后向 UDM 注册（Nudm_UECM_Registration）并取签约数据，向 PCF 取策略。",
        spec: "TS 24.501 §5.4.2.3"
      },
      {
        dir: "AMF → gNB", iface: "NGAP", msg: "Initial Context Setup Request（携带 Registration Accept）",
        fields: [
          ["AMF-UE-NGAP-ID: 0x10001", "AMF 侧的 N2 标识，和 RAN-UE-NGAP-ID 一起唯一确定这个手机"],
          ["GUAMI / AllowedNSSAI: SST 1", ""],
          ["UESecurityCapabilities", "供基站选 AS 算法"],
          ["SecurityKey: K_gNB（256 bit）", "基站用它推导空口 RRC 和用户面密钥"],
          ["NAS-PDU: Registration Accept", ""]
        ],
        explain: "基站收到后先做 AS 安全激活（RRC SecurityModeCommand：cipheringAlgorithm nea2、integrityProtAlgorithm nia2），再用 RRCReconfiguration 下发 NAS 消息。",
        spec: "TS 38.413 §8.3.1；TS 38.331 §5.3.4"
      },
      {
        dir: "AMF → UE", iface: "NAS（经 RRCReconfiguration 下发）", msg: "Registration Accept",
        fields: [
          ["5GS registration result: 3GPP access", ""],
          ["5G-GUTI: 460-00-AMF Region 0x01 / Set 0x001 / Pointer 0x00 / 5G-TMSI 0xC0FFEE01", "临时身份，之后用它代替 SUPI，减少真实身份暴露"],
          ["TAI list: 0x001234, 0x001235", "在这些跟踪区里移动不用重新注册"],
          ["Allowed NSSAI: SST 1", "允许使用的切片"],
          ["T3512: 54 min", "周期性注册定时器"]
        ],
        explain: "手机保存 5G-GUTI 和 TAI 列表。之后 RRC 连接建立时用 5G-S-TMSI（GUTI 的缩短形式）标识自己。",
        spec: "TS 24.501 §5.5.1.2.4、§8.2.7"
      },
      {
        dir: "UE → AMF", iface: "NAS", msg: "Registration Complete",
        fields: [["（无必选信元）", "确认收到新的 5G-GUTI"]],
        explain: "注册完成，手机进入 RM-REGISTERED。没有业务时，基站一段时间后释放 RRC 连接，手机回到空闲态（CM-IDLE）。",
        spec: "TS 24.501 §5.5.1.2.4"
      }
    ]
  },

  // ───────────── 4.3 PDU 会话建立 ─────────────
  "s4-pdu": {
    title: "PDU 会话建立：从请求到用户面打通",
    intro: "注册完成后手机要上网，发起 PDU 会话建立。关注三件事：SMF 选 UPF 并分配 IP；N3 隧道两端的 TEID 交换；基站建 DRB，把 QoS 流映射上去。",
    steps: [
      {
        dir: "UE → AMF", iface: "NAS（UL NAS Transport）", msg: "PDU Session Establishment Request",
        fields: [
          ["Payload container type: N1 SM information", "外层是移动性管理（5GMM）消息，里面装着会话管理（5GSM）消息"],
          ["PDU session ID: 1；Request type: initial request", ""],
          ["S-NSSAI: SST 1；DNN: cmnet", "要接入的切片和数据网络（DNN 类似 4G 的 APN，取值以运营商配置为准）"],
          ["5GSM：PTI 1，PDU session type IPv4v6，SSC mode 1", "SSC mode 1：会话锚点（UPF）不变，IP 地址保持"]
        ],
        explain: "AMF 不处理 5GSM 内容，只根据 S-NSSAI 和 DNN 选 SMF，把请求转过去。",
        spec: "TS 24.501 §6.4.1.2、§8.3.1；TS 23.502 §4.3.2.2.1"
      },
      {
        dir: "AMF → SMF → UPF", iface: "SBI + N4（PFCP）", msg: "CreateSMContext / PFCP Session Establishment",
        fields: [
          ["Nsmf_PDUSession_CreateSMContext", "AMF 请 SMF 建会话上下文"],
          ["SMF ↔ UDM / PCF", "取会话签约数据（默认 5QI、Session-AMBR）和策略"],
          ["PFCP Session Establishment Request: PDR / FAR / QER", "SMF 告诉 UPF 怎么识别、转发、限速这个会话的包；UPF 分配上行 F-TEID"]
        ],
        explain: "这些是核心网内部消息。IP 地址由 SMF 分配（或经 UPF / DHCP / AAA）。",
        spec: "TS 23.502 §4.3.2.2.1；TS 29.244"
      },
      {
        dir: "AMF → gNB", iface: "NGAP", msg: "PDU Session Resource Setup Request",
        fields: [
          ["PDU Session ID: 1；S-NSSAI: SST 1", ""],
          ["UL NG-U UP TNL Information: UPF 10.0.0.10，GTP-TEID 0x00000101", "上行隧道终点：基站往这个地址和 TEID 发上行用户数据"],
          ["QoS Flow Setup Request List: QFI 1，5QI 9，ARP 8", "默认 QoS 流：5QI 9 为非 GBR 普通上网业务"],
          ["PDU Session Aggregate Maximum Bit Rate: DL 1 Gbps / UL 200 Mbps", "会话级总速率上限"],
          ["NAS-PDU: PDU Session Establishment Accept", ""]
        ],
        explain: "SMF 通过 AMF（Namf_Communication_N1N2MessageTransfer）同时下发两部分：给基站的 N2 SM 信息，和给手机的 N1 SM 消息。",
        spec: "TS 38.413 §8.2.1、§9.3.4.1"
      },
      {
        dir: "gNB → UE", iface: "RRC · SRB1", msg: "RRCReconfiguration（建 DRB）",
        fields: [
          ["drb-ToAddModList: drb-Identity 1", "新建数据无线承载"],
          ["sdap-Config: pdu-Session 1，mappedQoS-FlowsToAdd { QFI 1 }，defaultDRB true", "SDAP 层把 QoS 流映射到 DRB，这是 5G 新增的一层"],
          ["pdcp-Config / rlc-BearerToAddModList", "该 DRB 的 PDCP、RLC（通常 AM 模式）配置"],
          ["dedicatedNAS-MessageList: PDU Session Establishment Accept", ""]
        ],
        explain: "Accept 的关键内容：selected PDU session type、PDU address（分到的 IP，如 10.45.0.2）、Authorized QoS rules（默认规则，绑定 QFI 1）、Session-AMBR、DNN。",
        spec: "TS 38.331 §5.3.5；TS 37.324（SDAP）；TS 24.501 §8.3.2"
      },
      {
        dir: "UE → gNB", iface: "RRC · SRB1", msg: "RRCReconfigurationComplete",
        fields: [["rrc-TransactionIdentifier: 1", "确认配置已生效"]],
        explain: "空口 DRB 就绪。这时上行数据已经能走通：手机 → DRB → 基站 → GTP-U（TEID 0x101）→ UPF。",
        spec: "TS 38.331 §5.3.5.3"
      },
      {
        dir: "gNB → AMF → SMF → UPF", iface: "NGAP + SBI + PFCP", msg: "PDU Session Resource Setup Response / PFCP Session Modification",
        fields: [
          ["DL NG-U UP TNL Information: gNB 10.0.1.20，GTP-TEID 0x00A00001", "下行隧道终点：UPF 往这个地址和 TEID 发下行数据"],
          ["QoS Flow Admitted List: QFI 1", "基站接纳的 QoS 流"],
          ["PFCP Session Modification Request: 更新 FAR 的下行外层头", "SMF 把基站的下行 F-TEID 告诉 UPF"]
        ],
        explain: "下行也打通了。排查“能注册上但上不了网”时，常见做法就是逐段核对：DNN 和切片是否被允许、IP 是否分到、两端 TEID 是否一致、DRB 是否建立。",
        spec: "TS 38.413 §8.2.1；TS 23.502 §4.3.2.2.1"
      }
    ]
  },

  // ───────────── 3.4 移动性管理：测量与切换 ─────────────
  "s3-mobility": {
    title: "基于 A3 事件的 Xn 切换",
    intro: "手机在连接态从源小区（PCI 101）移动到同频邻区（PCI 210），两个基站之间有 Xn 接口，核心网不变。",
    steps: [
      {
        dir: "源 gNB → UE", iface: "RRC", msg: "RRCReconfiguration（测量配置）",
        fields: [
          ["measObjectNR: ssbFrequency 633984，ssbSubcarrierSpacing kHz30", "测哪个频点的 SSB（633984 ≈ 3509.76 MHz，落在同步栅格 GSCN 上）"],
          ["reportConfigNR: eventA3 { a3-Offset 6，hysteresis 2，timeToTrigger ms320 }", "a3-Offset 和 hysteresis 以 0.5 dB 为单位：偏置 3 dB，迟滞 1 dB"],
          ["measId 1 = measObject 1 + reportConfig 1", "测量对象和上报配置绑定"]
        ],
        explain: "A3 事件：邻区比服务小区好过偏置（加迟滞）并持续满 TTT 才上报，避免信号抖动时来回切（乒乓切换）。",
        spec: "TS 38.331 §5.5.4.4、§6.3.2"
      },
      {
        dir: "UE → 源 gNB", iface: "RRC", msg: "MeasurementReport",
        fields: [
          ["measId: 1", "由哪条测量配置触发"],
          ["servCell PCI 101: rsrp 50，rsrq 22", "上报的是索引值：RSRP 索引 50 ≈ −107 dBm"],
          ["neighCell PCI 210: rsrp 58", "≈ −99 dBm，比服务小区好约 8 dB，满足 A3 条件"]
        ],
        explain: "SS-RSRP 上报映射：索引 n 表示 −157+n ≤ RSRP < −156+n（dBm）。看日志时要先换算成 dBm 再分析。",
        spec: "TS 38.331 §5.5.5；TS 38.133 §10.1.6"
      },
      {
        dir: "源 gNB → 目标 gNB", iface: "XnAP", msg: "Handover Request",
        fields: [
          ["Target Cell Global ID: NR-CGI 460-00-…（PCI 210）", ""],
          ["UE Context Information: AMF UE NGAP ID，K_gNB*，NCC，UE 安全能力", "源站推导出 K_gNB* 交给目标站，切换后用新密钥"],
          ["PDU Session Resources To Be Setup List", "要迁移的会话、QoS 流及其上行 TEID"],
          ["RRC Context: HandoverPreparationInformation", "手机当前的无线配置和能力，目标站据此准备配置"]
        ],
        explain: "目标站做接纳控制（资源够不够），通过就准备好手机在新小区要用的全部配置。",
        spec: "TS 38.423 §8.2.1；TS 33.501 §6.9.2"
      },
      {
        dir: "目标 gNB → 源 gNB", iface: "XnAP", msg: "Handover Request Acknowledge",
        fields: [
          ["Target NG-RAN node To Source Transparent Container: HandoverCommand", "里面是目标站生成的 RRCReconfiguration，源站原样转给手机"],
          ["PDU Session Resources Admitted List: 数据前转隧道 TEID", "源站把未发完的下行数据转给目标站"]
        ],
        explain: "“透明容器”：源站不解析内容，保证目标站完全掌控手机在新小区的配置。",
        spec: "TS 38.423 §8.2.1；TS 38.331 §11.2.2"
      },
      {
        dir: "源 gNB → UE", iface: "RRC", msg: "RRCReconfiguration（reconfigurationWithSync）",
        fields: [
          ["spCellConfigCommon: physCellId 210，…", "目标小区的公共配置"],
          ["newUE-Identity: 0x5B02", "在目标小区用的新 C-RNTI"],
          ["t304: ms1000", "切换定时器：超时还没接入目标小区就判定切换失败，发起重建"],
          ["rach-ConfigDedicated: CFRA { ssb 3 → preamble 52 }", "专用前导，非竞争随机接入，更快更可靠"]
        ],
        explain: "这就是切换命令。源站同时通过 Xn 发 SN Status Transfer（PDCP 序号状态），并开始前转数据。",
        spec: "TS 38.331 §5.3.5.5.2"
      },
      {
        dir: "UE → 目标 gNB", iface: "PRACH + RRC", msg: "随机接入（CFRA）+ RRCReconfigurationComplete",
        fields: [
          ["Msg1: preamble 52", "专用前导，不会和别人冲突"],
          ["Msg2: RAR（TA、UL Grant）", "非竞争接入收到 RAR 即完成"],
          ["RRCReconfigurationComplete", "在目标小区发出，表示空口切换完成"]
        ],
        explain: "这段是切换中断时间的主要来源。路测日志里常看“从切换命令到 Complete 的时延”评估切换性能。",
        spec: "TS 38.321 §5.1；TS 38.331 §5.3.5.3"
      },
      {
        dir: "目标 gNB ↔ AMF；目标 gNB → 源 gNB", iface: "NGAP / XnAP", msg: "Path Switch Request / Acknowledge；UE Context Release",
        fields: [
          ["Path Switch Request: PDU Session Resource To Be Switched in DL List（目标站下行 TEID）", "请核心网把下行路径切到目标站，SMF 再通知 UPF"],
          ["Path Switch Request Acknowledge: Security Context { NH，NCC }", "给目标站新的密钥材料，供下一次切换使用"],
          ["UE Context Release（目标 → 源）", "源站释放这个手机的资源"]
        ],
        explain: "UPF 切路径后会发“结束标记”（End Marker）包，帮目标站判断前转数据何时收完、保证下行包不乱序。",
        spec: "TS 38.413 §8.4.4；TS 38.423 §8.2.7"
      }
    ]
  },

  // ───────────── 5.2 服务请求与寻呼 ─────────────
  "s5-paging": {
    title: "下行数据触发寻呼 + 被叫服务请求",
    intro: "手机处于空闲态（CM-IDLE），这时有下行数据到达 UPF。网络先寻呼找到手机，手机发服务请求恢复连接和用户面。",
    steps: [
      {
        dir: "UPF → SMF → AMF", iface: "PFCP + SBI", msg: "Data Notification / N1N2MessageTransfer",
        fields: [
          ["PFCP Session Report Request: Downlink Data Report", "UPF 缓存下行包并通知 SMF"],
          ["Namf_Communication_N1N2MessageTransfer", "SMF 请 AMF 联系手机，恢复这个 PDU 会话的用户面"]
        ],
        explain: "空闲态时 N3 隧道的基站一端已释放，UPF 无处可发，只能先缓存。",
        spec: "TS 23.502 §4.2.3.3；TS 29.244"
      },
      {
        dir: "AMF → gNB（TAI 列表内所有基站）", iface: "NGAP", msg: "Paging",
        fields: [
          ["UE Paging Identity: 5G-S-TMSI { AMF Set ID 0x001，AMF Pointer 0x00，5G-TMSI 0xC0FFEE01 }", "用临时身份寻呼，不暴露 SUPI"],
          ["TAI List for Paging: 0x001234, 0x001235", "在手机注册的跟踪区里找"],
          ["Paging DRX: v128", "手机的寻呼周期（无线帧数）"]
        ],
        explain: "TAI 列表越大，寻呼范围越广、信令开销越大；越小，手机越容易出列表、需要做移动性注册更新。这是跟踪区规划要权衡的。",
        spec: "TS 38.413 §8.5.1"
      },
      {
        dir: "gNB → UE", iface: "RRC · PCCH（PDCCH 用 P-RNTI 加扰）", msg: "Paging",
        fields: [
          ["pagingRecordList: { ue-Identity ng-5G-S-TMSI 0x0040C0FFEE01（48 bit） }", "= AMF Set ID（10 bit）+ AMF Pointer（6 bit）+ 5G-TMSI（32 bit）；一条寻呼消息可同时寻呼多个手机"],
          ["寻呼帧 PF / 寻呼时机 PO", "按 5G-S-TMSI 和 DRX 周期算出，手机只在自己的 PO 醒来看 PDCCH，省电"]
        ],
        explain: "手机在 PO 上用 P-RNTI 解 PDCCH，读到寻呼消息并在列表里找到自己的 5G-S-TMSI，就发起接入。",
        spec: "TS 38.331 §5.3.2；TS 38.304 §7"
      },
      {
        dir: "UE → gNB", iface: "RRC", msg: "RRCSetupRequest + RRCSetupComplete（携带 Service Request）",
        fields: [
          ["RRCSetupRequest: ue-Identity ng-5G-S-TMSI-Part1（低 39 bit），establishmentCause mt-Access", "被叫接入"],
          ["RRCSetupComplete: ng-5G-S-TMSI-Part2（高 9 bit）", "两部分拼成完整的 48 bit 5G-S-TMSI"],
          ["NAS Service Request: service type = mobile terminated services；ngKSI 0；5G-S-TMSI", "有完整性保护，网络据此直接沿用已有的安全上下文"],
          ["Uplink data status / PDU session status", "告诉网络哪些会话需要恢复用户面"]
        ],
        explain: "前面还有四步随机接入（同 3.3）。服务请求不需要重新鉴权，因此比注册快得多。",
        spec: "TS 38.331 §5.3.3；TS 24.501 §5.6.1"
      },
      {
        dir: "AMF → gNB → UE", iface: "NGAP + RRC + NAS", msg: "Initial Context Setup Request（含 PDU 会话资源）→ RRCReconfiguration → Service Accept",
        fields: [
          ["Initial Context Setup Request: PDU Session Resource Setup Request List（UPF 上行 TEID、QoS 流）", "一次性恢复安全上下文和用户面"],
          ["RRC SecurityModeCommand → RRCReconfiguration（drb-ToAddModList）", "空口先激活 AS 安全，再重建 DRB"],
          ["Service Accept: PDU session status，PDU session reactivation result", "告诉手机哪些会话已恢复"],
          ["Initial Context Setup Response: 基站下行 TEID → SMF → UPF", "UPF 拿到新的下行 TEID，把缓存的包发出去"]
        ],
        explain: "从寻呼到第一包下行数据送达的时间，是“被叫接通时延”类 KPI 的核心。寻呼成功率低常见原因：覆盖差、TA 列表规划不当、寻呼信道拥塞。",
        spec: "TS 38.413 §8.3.1；TS 24.501 §5.6.1.4；TS 23.502 §4.2.3.3"
      }
    ]
  }
};
