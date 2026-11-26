module.exports = [
  // ───────── 3.1 RRC 状态、空闲态与小区重选 ─────────
  { id: "lte-rrc-1", m: "lte-rrc", t: "single", q: "LTE 小区选择 S 准则中，Srxlev 的计算不包含下列哪一项？", o: ["Qrxlevmin", "Pcompensation", "Qhyst", "Qrxlevminoffset"], a: 2, e: "Srxlev = Qrxlevmeas − (Qrxlevmin + Qrxlevminoffset) − Pcompensation − Qoffsettemp。Qhyst 是同频重选 R 准则中给服务小区加的迟滞，不属于 S 准则。" },
  { id: "lte-rrc-2", m: "lte-rrc", t: "single", q: "终端驻留在优先级为 3 的频点上，SIB5 中某异频频点优先级为 5。终端重选到该频点需要满足？", o: ["目标小区 Srxlev 持续 Treselection 高于 threshX-High", "服务小区 Srxlev 低于 threshServingLow 且目标高于 threshX-Low", "目标小区 R 值排名第一并持续 Treselection", "服务小区 RSRP 低于 s-NonIntraSearch 即立即重选"], a: 0, e: "目标频点优先级更高，只看目标小区是否高于 threshX-High 并持续 Treselection，与服务小区好坏无关。B 是向低优先级重选的条件，C 是同优先级的排序规则，D 只是测量启动条件。" },
  { id: "lte-rrc-3", m: "lte-rrc", t: "multi", q: "关于 LTE 空闲态，下列说法正确的有？", o: ["RRC_IDLE 下 eNB 不保存该终端的上下文", "RRC_IDLE 对应 ECM-IDLE，网络只知道终端所在的跟踪区", "网络可在 RRCConnectionRelease 中下发专用重选优先级", "cellReselectionPriority 取值 0–7，7 表示最低优先级"], a: [0, 1, 2], e: "LTE 中 cellReselectionPriority 取值 0–7，0 为最低优先级，所以 D 错误。专用优先级配合 T320 有效期使用，会覆盖广播的优先级。" },
  { id: "lte-rrc-4", m: "lte-rrc", t: "judge", q: "只要服务小区 Srxlev 高于 s-IntraSearchP（且 Squal 高于 s-IntraSearchQ），终端可以不进行同频邻区测量。", a: true, e: "这是 TS 36.304 为省电设计的测量启动规则。s-IntraSearch 设得过低时，服务小区还没差到门限终端就不测邻区，会出现“邻区更强却不重选”。" },

  // ───────── 3.2 随机接入与 RRC 连接建立 ─────────
  { id: "lte-access-1", m: "lte-access", t: "single", q: "LTE 竞争随机接入中，RRCConnectionRequest 在哪一步发送？", o: ["Msg1", "Msg2", "Msg4", "Msg3"], a: 3, e: "Msg1 为前导，Msg2 为随机接入响应 RAR，Msg3 在 PUSCH 上携带 RRCConnectionRequest，Msg4 为竞争解决 MAC CE 加 RRCConnectionSetup。" },
  { id: "lte-access-2", m: "lte-access", t: "single", q: "初始接入时，Msg4 中用于竞争解决的是？", o: ["用 RA-RNTI 加扰的 PDCCH", "UE 竞争解决标识 MAC CE，回显 Msg3 内容", "Timing Advance Command", "RRCConnectionSetupComplete"], a: 1, e: "终端比对 MAC CE 回显的内容与自己 Msg3 发的是否一致，一致即竞争成功、TC-RNTI 转为 C-RNTI。RA-RNTI 用于 Msg2 调度；连接态竞争接入才以 C-RNTI 加扰的 PDCCH 作为竞争解决。" },
  { id: "lte-access-3", m: "lte-access", t: "multi", q: "下列哪些场景会触发 LTE 随机接入？", o: ["从 RRC_IDLE 初始接入", "切换时接入目标小区", "RRC 连接重建", "连接态下行数据到达但终端已失去上行同步"], a: [0, 1, 2, 3], e: "四种都是 TS 36.300 列出的随机接入触发场景。下行数据到达时，基站通过 PDCCH order 指示终端发起（通常为非竞争）随机接入以恢复上行同步。" },
  { id: "lte-access-4", m: "lte-access", t: "judge", q: "RRCConnectionSetup 在 SRB1 上发送，它的作用是建立 SRB2。", a: false, e: "RRCConnectionRequest 和 RRCConnectionSetup 都在 SRB0（CCCH）上发送，RRCConnectionSetup 的作用是建立 SRB1。SRB2 和 DRB 在安全激活后由 RRCConnectionReconfiguration 建立。" },

  // ───────── 3.3 测量配置与测量事件 ─────────
  { id: "lte-meas-1", m: "lte-meas", t: "single", q: "LTE 测量事件 A5 的含义是？", o: ["服务小区差于门限 1 且邻区好于门限 2", "邻区比服务小区好一个偏置", "邻区好于门限", "服务小区差于门限 1 且异系统邻区好于门限 2"], a: 0, e: "A5 用于同系统异频（或同频）切换：服务小区差于门限 1 且邻区好于门限 2。B 是 A3，C 是 A4，D 是异系统事件 B2。" },
  { id: "lte-meas-2", m: "lte-meas", t: "single", q: "LTE 测量间隙模式 gp0 的配置是？", o: ["每 80 ms 一个 6 ms 间隙", "每 20 ms 一个 3 ms 间隙", "每 40 ms 一个 6 ms 间隙", "每 40 ms 一个 10 ms 间隙"], a: 2, e: "gp0 为每 40 ms 一个 6 ms 间隙，gp1 为每 80 ms 一个 6 ms 间隙。间隙期间不能调度该终端，会降低速率。" },
  { id: "lte-meas-3", m: "lte-meas", t: "multi", q: "在 A3 事件中，下列哪些调整会让终端更容易向某个特定邻区上报（切换更早）？", o: ["增大该邻区的 CIO（Ocn）", "减小 a3-Offset", "增大 hysteresis", "减小 timeToTrigger"], a: [0, 1, 3], e: "A3 进入条件为 Mn + Ofn + Ocn − Hys > Mp + Ofp + Ocp + Off。增大 Ocn、减小 Off 让不等式更易成立，减小 TTT 让条件持续更短时间即可上报；增大 Hys 则使条件更难满足。" },
  { id: "lte-meas-4", m: "lte-meas", t: "judge", q: "层 3 滤波系数 filterCoefficient 越大，测量结果越平滑，对信号变化的反应也越快。", a: false, e: "Fn = (1 − a) × Fn−1 + a × Mn，a = 1 / 2^(k/4)。k 越大 a 越小，历史值权重越大，结果越平滑但反应越慢。" },

  // ───────── 3.4 切换：X2、S1 与异系统 ─────────
  { id: "lte-ho-1", m: "lte-ho", t: "single", q: "X2 切换完成阶段，目标 eNB 向 MME 发送哪条消息以请求转换下行路径？", o: ["Handover Required", "Handover Notify", "Path Switch Request", "Handover Request Acknowledge"], a: 2, e: "X2 切换由目标 eNB 发送 S1AP Path Switch Request，MME 再通过 Modify Bearer Request 让 SGW 切换路径。Handover Required 和 Handover Notify 属于 S1 切换。" },
  { id: "lte-ho-2", m: "lte-ho", t: "single", q: "切换命令（带 mobilityControlInfo 的 RRCConnectionReconfiguration）由谁生成？", o: ["MME", "目标 eNB", "源 eNB", "SGW"], a: 1, e: "目标 eNB 完成准入后在 Handover Request Acknowledge 的透明容器中生成切换命令，源 eNB 原样转发给终端，这样配置一定符合目标小区的实际资源。" },
  { id: "lte-ho-3", m: "lte-ho", t: "multi", q: "下列哪些情况通常会走 S1 切换而不是 X2 切换？", o: ["源、目标 eNB 之间没有 X2 接口", "需要更换 MME", "同一 eNB 内两个小区之间切换", "X2 链路故障或策略禁止 X2 切换"], a: [0, 1, 3], e: "同一 eNB 内的切换只有空口信令，不经过 X2 或 S1。无 X2、需要换 MME、X2 不可用或被策略禁止时走 S1 切换。" },
  { id: "lte-ho-4", m: "lte-ho", t: "judge", q: "终端收到切换命令后启动 T304，若 T304 超时仍未在目标小区完成接入，终端发起 RRC 连接重建，原因值为 handoverFailure。", a: true, e: "T304 超时即判定切换失败，终端回退原配置并发起重建，reestablishmentCause 为 handoverFailure。" },

  // ───────── 3.5 无线链路失败与 RRC 重建 ─────────
  { id: "lte-rlf-1", m: "lte-rlf", t: "single", q: "物理层连续上报 N310 次失步指示后，终端会？", o: ["立即判定 RLF", "启动 T310", "启动 T311", "立即回到 RRC_IDLE"], a: 1, e: "连续 N310 次失步启动 T310；T310 期间收到连续 N311 次同步则停止；T310 超时才判定 RLF。T311 是 RLF 后重建阶段的小区选择定时器。" },
  { id: "lte-rlf-2", m: "lte-rlf", t: "single", q: "RRC 重建被拒（RRCConnectionReestablishmentReject）最常见的原因是？", o: ["终端未开启 AS 安全", "T310 设置过长", "终端上报的 reestablishmentCause 错误", "所选小区没有该终端的上下文"], a: 3, e: "一般只有源小区和做过切换准备的小区持有终端上下文，选到其他小区重建往往被拒。AS 安全未激活时终端根本不会发起重建，而是直接回到 RRC_IDLE。" },
  { id: "lte-rlf-3", m: "lte-rlf", t: "multi", q: "下列哪些属于触发 LTE 无线链路失败（RLF）的条件？", o: ["T310 超时", "RLC 某 AM 实体重传达到最大次数", "MAC 报告随机接入问题（前导达到最大发送次数）", "A2 事件被触发"], a: [0, 1, 2], e: "TS 36.331 定义的 RLF 触发条件是 T310 超时、MAC 随机接入问题、RLC 最大重传。A2 只是一个测量事件，表示服务小区差于门限，不会直接导致 RLF。" },
  { id: "lte-rlf-4", m: "lte-rlf", t: "judge", q: "MRO 中，“刚切换到目标小区不久就发生 RLF，之后终端回到源小区重建”被判为过晚切换。", a: false, e: "这种情况是过早切换（too early）：目标小区还不够稳定就切了过去。过晚切换是在源小区发生 RLF 后在另一个小区重建，且之前没有切换。" },

  // ───────── 3.6 载波聚合与 LTE-A 关键技术 ─────────
  { id: "lte-ca-1", m: "lte-ca", t: "single", q: "R10 载波聚合最多支持几个成员载波、总带宽最大多少？", o: ["5 个，100 MHz", "2 个，40 MHz", "8 个，160 MHz", "32 个，640 MHz"], a: 0, e: "R10 CA 最多 5 个 CC，每个最大 20 MHz，共 100 MHz。32 个 CC 是 R13 增强型 CA 才支持的。" },
  { id: "lte-ca-2", m: "lte-ca", t: "single", q: "SCell 的激活与去激活通过什么方式完成？", o: ["RRCConnectionReconfiguration", "MAC CE", "系统消息 SIB2", "S1AP 消息"], a: 1, e: "SCell 的增删通过 RRC 重配置，激活 / 去激活通过 MAC CE 快速完成；sCellDeactivationTimer 超时也会自动去激活。" },
  { id: "lte-ca-3", m: "lte-ca", t: "multi", q: "关于 PCell 与 SCell，下列说法正确的有？", o: ["RRC 连接、NAS 移动性和安全都在 PCell 上", "SCell 质量变差会触发 RLF", "PCell 不能被去激活", "跨载波调度时 DCI 中增加 3 比特载波指示域（CIF）"], a: [0, 2, 3], e: "无线链路监测只针对 PCell，SCell 质量差时被去激活或删除，不会触发 RLF，所以 B 错误。" },
  { id: "lte-ca-4", m: "lte-ca", t: "judge", q: "载波聚合主要在 MAC 层实现，每个服务小区有独立的 HARQ 实体，而 PDCP 和 RLC 不感知载波数量。", a: true, e: "CA 的多个载波由同一 MAC 实体调度，每个 CC 独立 HARQ；这与双连接在 PDCP 层分流、两个 MAC 实体的方式不同。" }
];
