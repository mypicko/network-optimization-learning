// LTE 关键流程的示意信令日志：逐条消息 + 关键字段 + 解读 + 规范出处
// ⚠️ 示意日志：按 3GPP 规范的消息结构编写，用于教学；字段取值为虚构示例，不是现网实测。
//    不同厂商的路测 / 信令跟踪工具显示格式不同，字段名以规范 ASN.1 / 信元名为准。
// 结构：SIGLOGS[主题][模块 id] = { title, intro, steps: [{ dir, iface, msg, fields: [[字段, 说明]], explain, spec }] }
window.SIGLOGS = window.SIGLOGS || {};

window.SIGLOGS["lte"] = {
  // ───────────── 3.2 随机接入与 RRC 连接建立 ─────────────
  "lte-access": {
    title: "四步竞争随机接入 + RRC 连接建立（空闲态手机发起接入）",
    intro: "手机已完成小区搜索，读到 MIB、SIB1、SIB2（PRACH 配置在 SIB2 里），要发起附着。下面是从发前导到 RRC 连接建立完成的 5 条消息（Msg1–Msg5）。",
    steps: [
      {
        dir: "UE → eNB", iface: "PRACH（物理层）", msg: "Msg1：随机接入前导",
        fields: [
          ["preambleIndex: 17", "从小区可用于竞争接入的前导（numberOfRA-Preambles 指定的数量）中随机选一个"],
          ["prach-ConfigIndex: 3（来自 SIB2）", "决定前导格式以及哪些子帧可以发前导"],
          ["RA-RNTI: 2", "由发送前导的子帧和频域位置算出（RA-RNTI = 1 + t_id + 10 × f_id，FDD 下 f_id = 0），本例 t_id = 1"],
          ["发射功率: preambleInitialReceivedTargetPower + 路损估计", "开环功控，首次发送用初始目标功率，失败后按 powerRampingStep 逐次抬升"]
        ],
        explain: "前导只是一段 Zadoff-Chu 序列，不带手机身份。基站检测到前导后，可以测出这台手机的上行定时偏差。",
        spec: "TS 36.211 §5.7；TS 36.321 §5.1.2–5.1.3"
      },
      {
        dir: "eNB → UE", iface: "MAC（PDSCH，PDCCH 用 RA-RNTI 加扰）", msg: "Msg2：随机接入响应 RAR",
        fields: [
          ["RAPID: 17", "回显检测到的前导编号，手机据此确认是回给自己的（可能多人选了同一个前导）"],
          ["Timing Advance Command: 25", "11 bit 定时提前量，让手机的上行信号对齐基站接收窗口"],
          ["UL Grant: …（20 bit）", "给 Msg3 分配的上行资源、MCS、功控命令等"],
          ["Temporary C-RNTI: 0x3A21", "临时身份，竞争解决成功后才转正为 C-RNTI"]
        ],
        explain: "手机在 ra-ResponseWindowSize（SIB2 配置，以子帧计）内监听 RA-RNTI 加扰的 PDCCH。窗口内收不到匹配的 RAPID，就加大功率重发前导，直到达到 preambleTransMax。",
        spec: "TS 36.321 §5.1.4、§6.2.3"
      },
      {
        dir: "UE → eNB", iface: "RRC · SRB0（CCCH，PUSCH）", msg: "Msg3：RRCConnectionRequest",
        fields: [
          ["ue-Identity: randomValue '0x6B1D42E09A'（40 bit）", "首次附着没有 S-TMSI，用随机数；已注册过则填 s-TMSI（mmec + m-TMSI）"],
          ["establishmentCause: mo-Signalling", "建立原因：主叫信令（附着、TAU）。被叫是 mt-Access，主叫数据是 mo-Data，紧急呼叫是 emergency"]
        ],
        explain: "这是第一条带“身份”的消息。选了同一前导的多台手机会在同一资源上发 Msg3，靠下一步的竞争解决分出胜负。Msg3 按 RAR 给的 TA 和授权发送，HARQ 重传由基站控制。",
        spec: "TS 36.331 §5.3.3.3"
      },
      {
        dir: "eNB → UE", iface: "MAC CE + RRC · SRB0", msg: "Msg4：竞争解决 + RRCConnectionSetup",
        fields: [
          ["UE Contention Resolution Identity: 0x…（48 bit）", "MAC CE，原样回显 Msg3 的 CCCH SDU；与自己发的一致才算赢"],
          ["radioResourceConfigDedicated: srb-ToAddModList { srb-Identity 1 }", "建立 SRB1，后续 RRC 和 NAS 信令走它"],
          ["mac-MainConfig / physicalConfigDedicated", "专用的 MAC 配置（如 BSR、PHR 定时器）和物理层配置（如 PUCCH、SRS、CQI 上报）"]
        ],
        explain: "竞争解决成功后，Temporary C-RNTI 转正为 C-RNTI。没赢的手机重新发起随机接入。若 T300 超时仍未收到 RRCConnectionSetup，本次连接建立失败。",
        spec: "TS 36.321 §5.1.5；TS 36.331 §5.3.3.4"
      },
      {
        dir: "UE → eNB", iface: "RRC · SRB1", msg: "Msg5：RRCConnectionSetupComplete",
        fields: [
          ["selectedPLMN-Identity: 1", "选中 SIB1 里 PLMN 列表的第 1 个（如 460-00）"],
          ["registeredMME: { mmegi 0x8001, mmec 0x12 }（可选）", "已注册过的手机告诉基站原 MME，便于路由回同一个 MME"],
          ["dedicatedInfoNAS: Attach Request", "把 NAS 附着请求捎带上去，基站不解析，透传给 MME"]
        ],
        explain: "到这里 RRC 连接建立完成，手机进入 RRC_CONNECTED。基站选好 MME，用 S1AP Initial UE Message 转发 NAS 消息——附着流程从这里接上。",
        spec: "TS 36.331 §5.3.3.4"
      }
    ]
  },

  // ───────────── 4.2 附着与默认承载建立 ─────────────
  "lte-attach": {
    title: "初始附着：鉴权、NAS 安全、建立默认承载",
    intro: "接着上面的 RRC 连接建立。手机第一次开机附着（没有可用的安全上下文），用 IMSI 上报身份，附着过程中同时建立默认 EPS 承载（QCI 9），拿到 IP 地址。",
    steps: [
      {
        dir: "eNB → MME", iface: "S1AP（S1-MME）", msg: "Initial UE Message（携带 Attach Request）",
        fields: [
          ["eNB-UE-S1AP-ID: 1001", "基站给这个手机分的 S1 标识"],
          ["NAS-PDU: Attach Request + PDN Connectivity Request", "附着请求里用 ESM message container 捎带 PDN 连接请求"],
          ["TAI: 460-00-0x1A2B；EUTRAN-CGI: 460-00-0x0A1B2C01", "手机当前所在跟踪区和小区（ECI 28 bit = eNB ID + 小区号）"],
          ["RRC-Establishment-Cause: mo-Signalling", ""]
        ],
        explain: "Attach Request 的关键内容：EPS attach type = combined EPS/IMSI attach（需要 CSFB 或短信时）或 EPS attach；NAS key set identifier = 7（没有可用密钥）；EPS mobile identity = IMSI；UE network capability（支持的 EEA / EIA 算法）。PDN Connectivity Request 里有 PDN type（如 IPv4v6）和 request type = initial request。",
        spec: "TS 36.413 §8.6.2.1；TS 24.301 §5.5.1.2"
      },
      {
        dir: "MME ↔ HSS", iface: "Diameter（S6a）", msg: "Authentication-Information-Request / Answer",
        fields: [
          ["User-Name: 460001234567890", "IMSI（虚构）"],
          ["Visited-PLMN-Id: 460-00", "参与 KASME 推导，向量只能在该服务网络使用"],
          ["E-UTRAN-Vector: RAND, XRES, AUTN, KASME", "HSS 生成的 EPS 鉴权向量，MME 保存 XRES 和 KASME，把 RAND、AUTN 发给手机"]
        ],
        explain: "这一步在核心网内部完成，空口看不到。与 5G 不同，LTE 的最终比对由 MME 自己完成（比较 RES 与 XRES），没有 AUSF 这一层。",
        spec: "TS 29.272；TS 33.401 §6.1"
      },
      {
        dir: "MME → UE → MME", iface: "NAS（经 S1AP Downlink / Uplink NAS Transport）", msg: "Authentication Request / Authentication Response",
        fields: [
          ["NAS key set identifier: 0", "给这次鉴权产生的密钥集编号，下次接入可凭它复用安全上下文"],
          ["Authentication parameter RAND / AUTN", "手机用 USIM 校验 AUTN，确认网络是真的（双向鉴权）"],
          ["Authentication response parameter: RES", "手机算出 RES 返回，MME 与 XRES 比对一致即鉴权成功"]
        ],
        explain: "AUTN 校验失败时手机回 Authentication Failure（原因如 MAC failure 或 synch failure），后者用于 SQN 重新同步。",
        spec: "TS 24.301 §5.4.2；TS 33.401 §6.1"
      },
      {
        dir: "MME → UE → MME", iface: "NAS", msg: "Security Mode Command / Security Mode Complete",
        fields: [
          ["Selected NAS security algorithms: 128-EEA2 / 128-EIA2", "选定的 NAS 加密和完整性保护算法"],
          ["Replayed UE security capabilities", "回放手机上报的安全能力，防止被中间人篡改降级"],
          ["Security Mode Complete（已加密 + 完整性保护）", "从这条起 NAS 消息受保护"]
        ],
        explain: "Security Mode Command 本身用新密钥做完整性保护但不加密；手机回的 Security Mode Complete 已经加密。若之前没拿到 IMEISV，MME 也可在这里请求。",
        spec: "TS 24.301 §5.4.3；TS 33.401"
      },
      {
        dir: "MME ↔ HSS", iface: "Diameter（S6a）", msg: "Update-Location-Request / Answer",
        fields: [
          ["ULR-Flags: S6a-indicator …", "告诉 HSS 当前服务这个用户的 MME"],
          ["Subscription-Data: APN-Configuration-Profile", "签约的默认 APN、QCI、ARP、APN-AMBR"],
          ["AMBR: UL 50 Mbps / DL 100 Mbps（示例）", "UE-AMBR 的签约值"]
        ],
        explain: "MME 拿到签约数据后，决定默认承载的 QoS，并选择 SGW 和 PGW（通常基于 APN 做 DNS 查询）。",
        spec: "TS 29.272；TS 23.401 §5.3.2.1"
      },
      {
        dir: "MME → SGW → PGW", iface: "GTPv2-C（S11 / S5）", msg: "Create Session Request / Response",
        fields: [
          ["IMSI、MSISDN、RAT Type: EUTRAN", ""],
          ["APN: cmnet（示例）；PDN Type: IPv4v6", ""],
          ["Bearer Contexts to be created: EBI 5，Bearer QoS { QCI 9，ARP 9 }", "默认承载，EBI 取值 5–15，第一个通常是 5"],
          ["Response：PDN Address Allocation 10.12.34.56（虚构）；S1-U SGW F-TEID", "PGW 分配 IP；SGW 给出用户面上行隧道端点"]
        ],
        explain: "PGW 收到请求后通常经 Gx 向 PCRF 发 CCR-Initial 获取策略（部署 PCC 时），再回 Create Session Response。此时下行用户面还没通，因为 SGW 还不知道基站的隧道端点。",
        spec: "TS 29.274；TS 23.401 §5.3.2.1"
      },
      {
        dir: "MME → eNB", iface: "S1AP", msg: "Initial Context Setup Request（携带 Attach Accept）",
        fields: [
          ["UE Aggregate Maximum Bit Rate", "基站侧对该用户所有非 GBR 承载总速率的限制"],
          ["E-RAB to Be Setup List: E-RAB ID 5，QCI 9，Transport Layer Address + GTP-TEID（SGW 上行端点）", "要求基站建立对应的无线承载和 S1-U 隧道"],
          ["Security Key: KeNB（256 bit）", "由 KASME 推导，基站据此推导 AS 层密钥"],
          ["NAS-PDU: Attach Accept + Activate Default EPS Bearer Context Request", "附着接受，内含 GUTI、TAI list、T3412 和默认承载的 QoS、APN、IP 地址"]
        ],
        explain: "Attach Accept 的关键内容：EPS attach result；T3412（周期性 TAU 定时器）；TAI list（在这些 TA 内移动不用做 TAU）；GUTI（今后用它代替 IMSI）。联合附着成功时还带 LAI 和 TMSI。",
        spec: "TS 36.413 §8.3.1；TS 24.301 §5.5.1.2"
      },
      {
        dir: "eNB → UE", iface: "RRC · SRB1", msg: "SecurityModeCommand + RRCConnectionReconfiguration",
        fields: [
          ["securityConfigSMC: cipheringAlgorithm eea2，integrityProtAlgorithm eia2", "启动 AS 安全（RRC 加密 + 完整性保护、用户面加密）"],
          ["radioResourceConfigDedicated: srb-ToAddModList { SRB2 }，drb-ToAddModList { drb-Identity 1，eps-BearerIdentity 5 }", "建立 SRB2 和承载默认承载的 DRB"],
          ["dedicatedInfoNASList: Attach Accept …", "把 NAS 附着接受转交给手机"]
        ],
        explain: "基站常在这之前或之间发 UECapabilityEnquiry 获取终端能力（MME 没有缓存时）。手机回 SecurityModeComplete 和 RRCConnectionReconfigurationComplete 后，空口承载就绪。",
        spec: "TS 36.331 §5.3.4、§5.3.5"
      },
      {
        dir: "eNB → MME", iface: "S1AP", msg: "Initial Context Setup Response",
        fields: [
          ["E-RAB Setup List: E-RAB ID 5，Transport Layer Address + GTP-TEID（eNB 下行端点）", "基站把自己的下行隧道端点告诉 MME"]
        ],
        explain: "如果基站无法建立某个 E-RAB，会放进 E-RAB Failed to Setup List 并带原因值，是排查承载建立失败的重要线索。",
        spec: "TS 36.413 §8.3.1"
      },
      {
        dir: "UE → MME", iface: "NAS（经 RRC ULInformationTransfer、S1AP Uplink NAS Transport）", msg: "Attach Complete（携带 Activate Default EPS Bearer Context Accept）",
        fields: [
          ["ESM message container: Activate Default EPS Bearer Context Accept（EBI 5）", "手机确认默认承载激活"]
        ],
        explain: "到这里手机已经能发上行数据（上行隧道端点在 Create Session Response 中就已确定）。",
        spec: "TS 24.301 §5.5.1.2"
      },
      {
        dir: "MME → SGW", iface: "GTPv2-C（S11）", msg: "Modify Bearer Request / Response",
        fields: [
          ["Bearer Contexts to be modified: EBI 5，S1-U eNB F-TEID", "把基站的下行隧道端点告诉 SGW"]
        ],
        explain: "SGW 拿到基站的下行端点后，下行用户面打通，附着完成。整个附着在信令跟踪里要按 IMSI / GUTI 和各接口的 UE ID 串起来看。",
        spec: "TS 29.274；TS 23.401 §5.3.2.1"
      }
    ]
  },

  // ───────────── 3.4 切换：X2 切换 ─────────────
  "lte-ho": {
    title: "基于 A3 事件的 X2 切换（同频，MME 和 SGW 不变）",
    intro: "手机在连接态从源小区（PCI 120）移动到同频邻区（PCI 214），两个基站之间有 X2 接口，MME 和 SGW 不变。",
    steps: [
      {
        dir: "源 eNB → UE", iface: "RRC", msg: "RRCConnectionReconfiguration（测量配置）",
        fields: [
          ["measObjectEUTRA: carrierFreq 1300", "测哪个频点：EARFCN 1300 在 Band 3，下行频率 = 1805 + 0.1 ×（1300 − 1200）= 1815 MHz"],
          ["reportConfigEUTRA: eventA3 { a3-Offset 6，reportOnLeave false }，hysteresis 2，timeToTrigger ms320，triggerQuantity rsrp", "a3-Offset 和 hysteresis 以 0.5 dB 为单位：偏置 3 dB，迟滞 1 dB"],
          ["measId 1 = measObjectId 1 + reportConfigId 1", "测量对象和上报配置绑定"]
        ],
        explain: "A3 事件：邻区比服务小区好过偏置（加迟滞）并持续满 TTT 才上报。针对单个邻区还可用 cellIndividualOffset（CIO）微调。",
        spec: "TS 36.331 §5.5.4.4、§6.3.5"
      },
      {
        dir: "UE → 源 eNB", iface: "RRC", msg: "MeasurementReport",
        fields: [
          ["measId: 1", "由哪条测量配置触发"],
          ["measResultPCell: rsrpResult 40，rsrqResult 18", "上报的是索引值：RSRP 索引 40 ≈ −101 dBm；RSRQ 索引 18 ≈ −11 dB"],
          ["measResultNeighCells: physCellId 214，rsrpResult 46", "≈ −95 dBm，比服务小区好约 6 dB，满足 A3 条件"]
        ],
        explain: "LTE RSRP 上报映射：索引 0–97 对应 −140 ~ −44 dBm，索引 n 大致表示 −141+n ≤ RSRP < −140+n（dBm）。看日志先换算成 dBm 再分析。",
        spec: "TS 36.331 §5.5.5；TS 36.133（RSRP / RSRQ 上报映射）"
      },
      {
        dir: "源 eNB → 目标 eNB", iface: "X2AP", msg: "Handover Request",
        fields: [
          ["Old eNB UE X2AP ID: 55；Cause: Handover Desirable for Radio Reasons", ""],
          ["Target Cell ID: ECGI 460-00-0x0A1C3D02（PCI 214）", "基站靠邻区关系表把 PCI 映射成 ECGI，没有邻区关系就无法发起切换"],
          ["GUMMEI；UE Context Information: MME UE S1AP ID，UE Security Capabilities，AS Security Information { KeNB*，NCC }，UE-AMBR", "源站推导出 KeNB* 交给目标站"],
          ["E-RABs To Be Setup List: E-RAB ID 5，QCI 9，UL GTP Tunnel Endpoint（SGW）", "要迁移的承载"],
          ["RRC Context: HandoverPreparationInformation", "终端能力和当前 RRC 配置，目标站据此生成新配置"]
        ],
        explain: "目标站做接纳控制：资源不够可以回 Handover Preparation Failure（带原因值），这是切换准备失败统计的来源。",
        spec: "TS 36.423 §8.2.1"
      },
      {
        dir: "目标 eNB → 源 eNB", iface: "X2AP", msg: "Handover Request Acknowledge",
        fields: [
          ["New eNB UE X2AP ID: 812", ""],
          ["E-RABs Admitted List: E-RAB ID 5，DL GTP Tunnel Endpoint（用于数据前转）", "源站把还没发完的下行数据前转给目标站"],
          ["Target eNB To Source eNB Transparent Container", "内含目标站生成的切换命令（RRCConnectionReconfiguration），源站原样转给手机"]
        ],
        explain: "到这里切换准备完成。源站启动切换执行，目标站开始等待手机接入。",
        spec: "TS 36.423 §8.2.1"
      },
      {
        dir: "源 eNB → UE", iface: "RRC", msg: "RRCConnectionReconfiguration（含 mobilityControlInfo，切换命令）",
        fields: [
          ["mobilityControlInfo: targetPhysCellId 214，t304 ms1000", "T304 内必须在目标小区完成随机接入，否则切换失败、发起 RRC 重建"],
          ["newUE-Identity: 0x5C07", "在目标小区使用的 C-RNTI"],
          ["rach-ConfigDedicated: ra-PreambleIndex 58，ra-PRACH-MaskIndex 0", "专用前导，用于非竞争随机接入，避免冲突"],
          ["securityConfigHO: nextHopChainingCount 2", "手机据此推导目标小区的 KeNB"]
        ],
        explain: "手机收到后立刻断开源小区，同步到目标小区。切换中断时间主要就在这一段。",
        spec: "TS 36.331 §5.3.5.4"
      },
      {
        dir: "源 eNB → 目标 eNB", iface: "X2AP + X2-U", msg: "SN Status Transfer + 数据前转",
        fields: [
          ["E-RABs Subject To Status Transfer: E-RAB ID 5，UL / DL COUNT（PDCP SN + HFN）", "目标站据此接续 PDCP 序号，保证 RLC AM 承载无损"]
        ],
        explain: "源站把缓存的下行包经 X2-U 前转给目标站，避免切换期间丢包。",
        spec: "TS 36.423；TS 36.300"
      },
      {
        dir: "UE → 目标 eNB", iface: "PRACH / MAC", msg: "非竞争随机接入（专用前导 + RAR）",
        fields: [
          ["preambleIndex: 58", "使用切换命令分配的专用前导，不需要竞争解决"],
          ["RAR: Timing Advance Command，UL Grant", "目标小区的上行定时和第一次上行授权"]
        ],
        explain: "非竞争接入只有两步，比四步竞争接入快，也不会和其他手机冲突。专用前导用完或超时才会退回竞争接入。",
        spec: "TS 36.321 §5.1"
      },
      {
        dir: "UE → 目标 eNB", iface: "RRC · SRB1", msg: "RRCConnectionReconfigurationComplete",
        fields: [
          ["rrc-TransactionIdentifier: 1", "在目标小区发出，表示空口切换完成"]
        ],
        explain: "此后上行数据直接走目标站 → SGW；下行数据暂时仍经源站前转，直到路径切换完成。",
        spec: "TS 36.331 §5.3.5.4"
      },
      {
        dir: "目标 eNB → MME → SGW", iface: "S1AP + GTPv2-C（S11）", msg: "Path Switch Request → Modify Bearer Request / Response",
        fields: [
          ["E-RAB To Be Switched in Downlink List: E-RAB ID 5，eNB 下行 GTP-TEID", "让核心网把下行路径切到目标站"],
          ["EUTRAN-CGI、TAI", "手机新的位置"],
          ["SGW → 源 eNB: End Marker", "SGW 切路径后在旧路径上发结束标记，告诉源站前转数据到此为止"]
        ],
        explain: "MME 回 Path Switch Request Acknowledge，带新的 {NH，NCC}，用于下一次切换的密钥推导（前向安全）。",
        spec: "TS 36.413；TS 23.401 §5.5.1.1.2"
      },
      {
        dir: "目标 eNB → 源 eNB", iface: "X2AP", msg: "UE Context Release",
        fields: [
          ["Old eNB UE X2AP ID: 55，New eNB UE X2AP ID: 812", ""]
        ],
        explain: "源站释放该手机的资源，X2 切换结束。若手机跨了 TAI list 之外的跟踪区，切换后还会发起一次 TAU。",
        spec: "TS 36.423"
      }
    ]
  },

  // ───────────── 4.4 TAU（空闲态） ─────────────
  "lte-tau": {
    title: "空闲态跨 MME 的跟踪区更新（TAU，SGW 不变）",
    intro: "手机处于 RRC_IDLE，移动到一个新小区，SIB1 里的 TAC 不在自己的 TAI list 中，于是发起 TAU。新小区归另一个 MME（不在原 MME 池内）管理，SGW 不变。",
    steps: [
      {
        dir: "UE → eNB", iface: "RRC · SRB1", msg: "RRCConnectionSetupComplete（携带 Tracking Area Update Request）",
        fields: [
          ["registeredMME: { mmegi 0x8001, mmec 0x12 }", "原 MME；基站发现它不在自己连接的 MME 池里，另选一个新 MME"],
          ["dedicatedInfoNAS: Tracking Area Update Request", ""]
        ],
        explain: "TAU Request 的关键内容：EPS update type = TA updating（周期性 TAU 时为 periodic updating）；active flag = 0（不需要恢复用户面）；Old GUTI；Last visited registered TAI；EPS bearer context status（EBI 5 激活）。消息用原安全上下文做完整性保护。",
        spec: "TS 24.301 §5.5.3.2；TS 36.331 §5.3.3"
      },
      {
        dir: "eNB → 新 MME", iface: "S1AP", msg: "Initial UE Message（携带 TAU Request）",
        fields: [
          ["NAS-PDU: Tracking Area Update Request", ""],
          ["TAI: 460-00-0x1A3C；EUTRAN-CGI: …", "新的跟踪区和小区"],
          ["S-TMSI: mmec 0x12 + m-TMSI", ""]
        ],
        explain: "新 MME 从 Old GUTI 中解析出原 MME 的 GUMMEI，准备向原 MME 要上下文。",
        spec: "TS 36.413 §8.6.2.1"
      },
      {
        dir: "新 MME ↔ 原 MME", iface: "GTPv2-C（S10）", msg: "Context Request / Context Response / Context Acknowledge",
        fields: [
          ["Request: GUTI，Complete TAU Request message", "原 MME 用它校验 TAU Request 的完整性，确认是合法用户"],
          ["Response: IMSI，MM Context（KASME、NAS COUNT、UE 网络能力）", "安全上下文随用户迁移，通常无需重新鉴权"],
          ["Response: PDN Connections（APN、PGW 地址、SGW S11 F-TEID、Bearer Contexts）", "承载信息迁移到新 MME"]
        ],
        explain: "原 MME 校验失败或拿不到上下文时，新 MME 会发起身份请求（Identity Request）和重新鉴权。",
        spec: "TS 29.274；TS 23.401 §5.3.3"
      },
      {
        dir: "新 MME ↔ SGW", iface: "GTPv2-C（S11）", msg: "Modify Bearer Request / Response",
        fields: [
          ["Sender F-TEID for Control Plane（新 MME S11 地址）", "SGW 今后把下行数据到达通知等发给新 MME"],
          ["User Location Information（如需上报）", "位置变化需要通知 PGW / PCRF 时，SGW 再向 PGW 发 Modify Bearer Request"]
        ],
        explain: "本例 SGW 不变，只更新控制面对端；若新 MME 判断需要换 SGW，则改走 Create Session 流程。",
        spec: "TS 29.274；TS 23.401 §5.3.3"
      },
      {
        dir: "新 MME ↔ HSS ↔ 原 MME", iface: "Diameter（S6a）", msg: "Update-Location-Request / Cancel-Location-Request / Update-Location-Answer",
        fields: [
          ["ULR: User-Name（IMSI），ULR-Flags", "新 MME 向 HSS 登记自己"],
          ["CLR → 原 MME: Cancellation-Type MME_UPDATE_PROCEDURE", "HSS 让原 MME 删除该用户的上下文"],
          ["ULA: Subscription-Data", "签约数据下发给新 MME"]
        ],
        explain: "HSS 保证同一时刻只有一个 MME 为该用户服务。",
        spec: "TS 29.272"
      },
      {
        dir: "新 MME → UE", iface: "NAS（经 S1AP Downlink NAS Transport）", msg: "Tracking Area Update Accept",
        fields: [
          ["EPS update result: TA updated", "联合 TAU 时为 combined TA/LA updated"],
          ["GUTI: 460-00-0x8002-0x21-0x5E3A90C1（虚构）", "新 MME 分配新 GUTI（MMEGI、MMEC 都变了）"],
          ["TAI list: { 0x1A3C, 0x1A3D, 0x1A3E }", "新的跟踪区列表"],
          ["T3412 value: 54 min（示例）；EPS bearer context status: EBI 5", "周期性 TAU 定时器；双方核对承载状态"]
        ],
        explain: "TAI list 越大，TAU 越少，但寻呼要在更多小区发；这是 TA 规划要权衡的点。",
        spec: "TS 24.301 §5.5.3.2"
      },
      {
        dir: "UE → 新 MME", iface: "NAS", msg: "Tracking Area Update Complete",
        fields: [
          ["（无关键字段）", "因为分配了新 GUTI，手机需要确认"]
        ],
        explain: "没有分配新 GUTI 的 TAU（例如同 MME 的周期性 TAU）可以不发 Complete。",
        spec: "TS 24.301 §5.5.3.2"
      },
      {
        dir: "新 MME → eNB → UE", iface: "S1AP + RRC", msg: "UE Context Release Command → RRCConnectionRelease",
        fields: [
          ["Cause: NAS – normal-release", "active flag = 0，没有数据要发，MME 释放 S1 连接"],
          ["RRCConnectionRelease: releaseCause other", "手机回到 RRC_IDLE"]
        ],
        explain: "如果 TAU Request 里 active flag = 1（有上行数据要发），MME 会改为发 Initial Context Setup Request 直接建立用户面承载。",
        spec: "TS 36.413；TS 36.331 §5.3.8"
      }
    ]
  },

  // ───────────── 5.1 CSFB 电路域回落 ─────────────
  "lte-csfb": {
    title: "空闲态主叫 CSFB：重定向回落到 3G（WCDMA）",
    intro: "手机已完成联合附着（combined EPS/IMSI attach），MME 与 MSC/VLR 之间建立了 SGs 关联。用户在 LTE 空闲态拨打电话，网络用 RRC 释放 + 重定向的方式让手机回落到 3G 完成通话。",
    steps: [
      {
        dir: "UE → eNB", iface: "RRC", msg: "RRCConnectionRequest / Setup / SetupComplete（携带 Extended Service Request）",
        fields: [
          ["ue-Identity: s-TMSI { mmec 0x12，m-TMSI 0x5E3A90C1 }", "已附着用户用 S-TMSI"],
          ["establishmentCause: mo-Data", "主叫 CSFB 的 Extended Service Request 通常对应 mo-Data，具体映射见 TS 24.301 附录 D"],
          ["dedicatedInfoNAS: Extended Service Request", ""]
        ],
        explain: "Extended Service Request 的关键内容：Service type = mobile originating CS fallback；NAS key set identifier；M-TMSI。它告诉 MME“我要打电路域电话”。",
        spec: "TS 24.301 §5.6.1；TS 23.272"
      },
      {
        dir: "MME → eNB", iface: "S1AP", msg: "Initial Context Setup Request（含 CS Fallback Indicator）",
        fields: [
          ["CS Fallback Indicator: CS Fallback Required", "要求基站把手机送到 2G/3G"],
          ["Registered LAI: 460-00-0x2A10", "联合附着时登记的位置区，基站可据此选回落目标"],
          ["E-RAB to Be Setup List / Security Key", "空闲态手机需要先恢复上下文"]
        ],
        explain: "如果手机原本处于连接态，MME 改用 UE Context Modification Request 携带 CS Fallback Indicator。",
        spec: "TS 36.413；TS 23.272"
      },
      {
        dir: "eNB → UE", iface: "RRC", msg: "RRCConnectionRelease（带重定向信息）",
        fields: [
          ["releaseCause: other", ""],
          ["redirectedCarrierInfo: utra-FDD 10713（示例 UARFCN）", "告诉手机去哪个 3G 频点"],
          ["idleModeMobilityControlInfo / cellInfoList（可选）", "部分网络在重定向时附带目标小区系统消息（Rel-9 增强），减少手机读系统消息的时间"]
        ],
        explain: "回落方式有重定向（最常用）、PS 切换、CCO 等。基站可以先下发 B1 测量再选目标频点，也可以不测直接“盲重定向”，前者更准、后者更快。",
        spec: "TS 36.331 §5.3.8；TS 23.272"
      },
      {
        dir: "eNB ↔ MME ↔ SGW", iface: "S1AP + GTPv2-C", msg: "UE Context Release Request / Command / Complete",
        fields: [
          ["Cause: Radio Network Layer – CS Fallback triggered", "统计 CSFB 回落次数的依据之一"],
          ["Release Access Bearers / Suspend（视回落目标而定）", "回落到不支持 PS 与 CS 并发的 2G 时，PS 业务会被挂起"]
        ],
        explain: "回落到 3G 时 PS 和 CS 可以并发，数据业务可以在 3G 上继续；回落到 2G 且不支持 DTM 时，数据业务暂停。",
        spec: "TS 36.413；TS 23.272"
      },
      {
        dir: "UE → RNC → MSC", iface: "3G RRC + 24.008 MM/CC", msg: "RRC Connection Request → CM Service Request",
        fields: [
          ["RRC establishment cause: Originating Conversational Call", "3G 侧的建立原因"],
          ["CM service type: Mobile originating call establishment", ""],
          ["Additional update parameters: CSMO（若携带）", "标识这是 CSFB 主叫，便于 MSC 统计和优先处理"]
        ],
        explain: "如果回落小区所在 LA 与登记的 LA 不同，手机要先做位置更新（LAU），再发 CM Service Request，接续时延会明显变长。",
        spec: "TS 24.008；TS 23.272"
      },
      {
        dir: "UE ↔ MSC", iface: "24.008 CC", msg: "Setup → Call Proceeding → Alerting → Connect → Connect Acknowledge",
        fields: [
          ["Setup: Called party BCD number 138xxxx0000（虚构）", "被叫号码"],
          ["Alerting", "被叫振铃，主叫听到回铃音；从拨号到此为 CSFB 接续时延的常用统计终点"]
        ],
        explain: "通话在 3G 电路域进行，手机这期间不在 LTE 上。",
        spec: "TS 24.008"
      },
      {
        dir: "RNC → UE，UE → eNB / MME", iface: "3G RRC + LTE RRC / NAS", msg: "通话结束：快速返回 LTE + TAU",
        fields: [
          ["3G RRC Connection Release（可带 LTE 重定向信息）", "通话结束后让手机尽快回到 LTE（俗称快速返回，因厂家而异）"],
          ["Tracking Area Update Request", "回到 LTE 后通常要发起 TAU，恢复 EPS 侧状态"]
        ],
        explain: "如果没有快速返回，手机要靠 3G 空闲态重选回 LTE，可能在 3G 上停留较长时间。",
        spec: "TS 23.272；TS 24.301 §5.5.3"
      }
    ]
  }
};
