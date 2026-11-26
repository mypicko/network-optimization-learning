module.exports = [
  // ───────── 6.1 规划与链路预算 ─────────
  { id: "lte-plan-1", m: "lte-plan", t: "single", q: "20 MHz、单端口总功率 46 dBm，RS 与数据 RE 等功率时，RS 功率约为？", o: ["15.2 dBm", "18.2 dBm", "21.2 dBm", "46 dBm"], a: 0, e: "20 MHz 有 1200 个子载波，46 − 10lg1200 ≈ 15.2 dBm。18.2 dBm 对应 10 MHz，21.2 dBm 对应 5 MHz，46 dBm 是总功率而非单 RE 功率。" },
  { id: "lte-plan-2", m: "lte-plan", t: "single", q: "上行链路预算中，给边缘用户分配的 PRB 数减半，基站接收灵敏度大约如何变化？", o: ["变差约 3 dB", "不变", "变好约 3 dB", "变好约 6 dB"], a: 2, e: "灵敏度 = −174 + 10lg(B) + NF + SINR 门限，带宽减半噪声功率降低约 3 dB，灵敏度变好约 3 dB，但边缘速率也随之下降。" },
  { id: "lte-plan-3", m: "lte-plan", t: "multi", q: "下列属于链路预算中“余量”或“损耗”项的有？", o: ["阴影衰落余量", "穿透损耗", "干扰余量", "基站天线增益"], a: [0, 1, 2], e: "阴影衰落余量、穿透损耗、干扰余量都从预算中扣除；基站天线增益是增益项，会加到预算中。" },
  { id: "lte-plan-4", m: "lte-plan", t: "judge", q: "规划时取上下行 MAPL 中较大的那个计算覆盖半径，才能保证边缘用户上下行都可用。", a: false, e: "应取较小的半径（较小的 MAPL），否则受限的那一方向在边缘会先失效。LTE 多数场景上行先受限。" },

  // ───────── 6.2 PCI、邻区、PRACH 与 TAC 规划 ─────────
  { id: "lte-params-1", m: "lte-params", t: "single", q: "LTE PCI 的总数及结构是？", o: ["1008 = 336 × 3", "504 = 168 × 3", "512 = 128 × 4", "504 = 126 × 4"], a: 1, e: "LTE PCI = 3 × N_ID(1) + N_ID(2)，组号 0–167、组内号 0–2，共 504 个。1008 = 336 × 3 是 NR。" },
  { id: "lte-params-2", m: "lte-params", t: "single", q: "LTE 中与上行 DMRS / SRS 序列组号相关、规划时要求相邻小区错开的是 PCI 的？", o: ["模 3", "模 6", "模 4", "模 30"], a: 3, e: "上行参考信号的序列组号与 PCI mod 30 相关；模 3 对应 PSS 与多端口 CRS，模 6 对应 CRS 频域偏移。" },
  { id: "lte-params-3", m: "lte-params", t: "multi", q: "关于 PRACH 根序列与 Ncs，下列说法正确的有？", o: ["常规格式的 ZC 序列长度为 839", "Ncs 越大，单个根序列能生成的前导越少", "小区半径越大，通常需要的根序列数越多", "Ncs 越小越好，可以节省根序列且没有副作用"], a: [0, 1, 2], e: "每根前导数约 ⌊839/Ncs⌋，半径大要求 Ncs 大、根序列多。Ncs 过小时远端终端的前导时延会落入相邻循环移位，造成误检，所以并非越小越好。" },
  { id: "lte-params-4", m: "lte-params", t: "judge", q: "某小区的两个同频邻区使用了相同的 PCI，这种情况称为 PCI 混淆。", a: true, e: "混淆是同一小区的两个同频邻区同 PCI，测量报告只带 PCI，基站无法确定目标；冲突则是覆盖重叠的两个同频小区本身同 PCI。" },

  // ───────── 6.3 KPI 体系与无线测量 ─────────
  { id: "lte-kpi-1", m: "lte-kpi", t: "single", q: "LTE RSRP 的上报范围及映射是？", o: ["−156 ~ −31 dBm，映射 0–127", "−140 ~ −44 dBm，映射 0–97", "−19.5 ~ −3 dB，映射 0–34", "−120 ~ −40 dBm，映射 0–80"], a: 1, e: "TS 36.133 中 LTE RSRP 上报范围为 −140 ~ −44 dBm，对应索引 0–97；−19.5 ~ −3 dB 是 RSRQ 的范围。" },
  { id: "lte-kpi-2", m: "lte-kpi", t: "single", q: "RSRP 和 SINR 都很好，但 RSRQ 偏低，最可能的解释是？", o: ["弱覆盖", "PCI 冲突", "本小区负荷较高", "终端故障"], a: 2, e: "RSRQ = N × RSRP / RSSI，RSSI 包含本小区数据 RE 的功率，负荷高时 RSRQ 自然下降；SINR 好说明干扰不严重，RSRP 好排除弱覆盖。" },
  { id: "lte-kpi-3", m: "lte-kpi", t: "multi", q: "下列属于接入性 KPI 的有？", o: ["RRC 连接建立成功率", "E-RAB 建立成功率", "无线接通率", "X2 切换成功率"], a: [0, 1, 2], e: "无线接通率常按 RRC 建立成功率 × E-RAB 建立成功率计算，三者都属接入性；切换成功率属移动性。" },
  { id: "lte-kpi-4", m: "lte-kpi", t: "judge", q: "SINR 的测量方法在 3GPP 中有统一定义，因此不同终端测得的 SINR 可以直接比较。", a: false, e: "3GPP 定义了 RSRP、RSRQ，但没有统一 SINR 测量口径，SINR 是终端或测试软件的实现值，不同终端可能差几个 dB。" },

  // ───────── 6.4 覆盖与干扰优化 ─────────
  { id: "lte-coverage-1", m: "lte-coverage", t: "single", q: "LTE 网络在空载时仍存在明显同频干扰，根本原因是？", o: ["PDCCH 持续满负荷发送", "CRS 不论负荷都全带宽持续发送", "PRACH 持续占用全带宽", "上行 SRS 持续发送"], a: 1, e: "CRS 始终全带宽发送，邻区即使空载，其 CRS 也会落在本小区的 CRS 或数据 RE 上形成干扰。" },
  { id: "lte-coverage-2", m: "lte-coverage", t: "single", q: "TDD 常规 CP 特殊子帧配置 7（10:2:2）中，GP 大约能防护多远的远端下行信号？", o: ["约 4 km", "约 21 km", "约 43 km", "约 190 km"], a: 2, e: "1 个符号约 71.4 μs，对应约 21.4 km，GP 为 2 个符号约 43 km；约 190 km 对应 3:9:2 配置的 9 个符号 GP。" },
  { id: "lte-coverage-3", m: "lte-coverage", t: "multi", q: "下列哪些是 TDD 大气波导远端干扰的典型特征？", o: ["多在夜间到清晨出现", "大面积大量小区同时上行底噪抬升", "干扰在上行起始符号最强、往后逐渐减弱", "只出现在单个小区且全天恒定"], a: [0, 1, 2], e: "远端干扰受气象影响，夜间清晨多、日出后减弱，成片出现，呈斜坡状；单小区全天恒定更像本地外部干扰或器件问题。" },
  { id: "lte-coverage-4", m: "lte-coverage", t: "judge", q: "治理弱覆盖时一味提高 RS 功率，可能把问题转化为重叠覆盖和干扰问题。", a: true, e: "RS 功率提高后覆盖范围扩大，对邻区 CRS 干扰加大，数据 RE 功率也会受影响，所以应优先调整天馈，功率作为微调。" },

  // ───────── 6.5 切换与掉线优化 ─────────
  { id: "lte-mobility-opt-1", m: "lte-mobility-opt", t: "single", q: "A3 事件进入条件中，对某个邻区调大 Ocn（CIO），会产生什么效果？", o: ["切到该邻区更早触发", "切到该邻区更晚触发", "对切换没有影响", "只影响空闲态重选"], a: 0, e: "Ocn 在 A3 公式左边（Mn + Ofn + Ocn − Hys），调大后条件更容易满足，切换提前。CIO 是连接态测量参数，与空闲态重选的 Qoffset 不同。" },
  { id: "lte-mobility-opt-2", m: "lte-mobility-opt", t: "single", q: "终端切到目标小区后很快发生 RLF，随后在源小区发起重建。这属于？", o: ["过晚切换", "切换到错误小区", "乒乓切换", "过早切换"], a: 3, e: "过早切换：目标小区还不够好就切过去，很快失败并回到源小区重建。过晚切换是在源小区就发生 RLF；在第三个小区重建则属错误小区。" },
  { id: "lte-mobility-opt-3", m: "lte-mobility-opt", t: "multi", q: "下列哪些情况会导致终端判定无线链路失败（RLF）？", o: ["T310 超时", "RLC 达到最大重传次数", "MAC 层报告随机接入问题", "收到一次 A3 测量上报配置"], a: [0, 1, 2], e: "T310 超时、RLC 最大重传、随机接入问题都会判定 RLF；收到测量配置是正常流程。" },
  { id: "lte-mobility-opt-4", m: "lte-mobility-opt", t: "judge", q: "重建小区没有终端上下文时，RRC 重建仍然一定能成功。", a: false, e: "重建需要目标基站获得终端上下文，若邻区关系或 X2 缺失导致拿不到上下文，重建会被拒绝，终端回到空闲态，网管记一次掉线。" },

  // ───────── 6.6 接入与速率优化 ─────────
  { id: "lte-access-opt-1", m: "lte-access-opt", t: "single", q: "基站已发 RRCConnectionSetup，但大量收不到 RRCConnectionSetupComplete，首先怀疑？", o: ["核心网 MME 拒绝", "上行受限或上行干扰", "PCI 模 6 冲突", "TAC 规划过大"], a: 1, e: "Msg5 是上行消息，下行已能发出 Msg4，问题多在上行：弱覆盖、底噪抬升或上下行不平衡。MME 处理在 Msg5 之后。" },
  { id: "lte-access-opt-2", m: "lte-access-opt", t: "single", q: "SINR 很好但 RANK 长期为 1，速率只有预期一半左右，优先排查什么？", o: ["TAC 边界", "PRACH 根序列", "天线端口、天馈接反或单通道故障", "TTI bundling 是否开启"], a: 2, e: "SINR 好却无法双流，常是多天线硬件问题（端口故障、天馈接反、通道不平衡），参数调整难以解决。" },
  { id: "lte-access-opt-3", m: "lte-access-opt", t: "multi", q: "下列哪些因素会直接影响用户下行速率？", o: ["CQI 与 MCS", "RANK", "小区 PRB 利用率和调度用户数", "载波聚合是否激活"], a: [0, 1, 2, 3], e: "速率 ≈ 频谱效率（CQI / MCS / RANK）× 分到的 PRB 数 × 调度占比 × 载波数，四项都直接影响。" },
  { id: "lte-access-opt-4", m: "lte-access-opt", t: "judge", q: "LTE 下行外环链路自适应通常以初传 BLER 约 10% 为目标，BLER 长期为 0 反而可能说明 MCS 选择偏保守。", a: true, e: "以约 10% 初传 BLER 为目标是常见做法，在可靠性和频谱效率之间折中；BLER 长期为 0 说明还有提升 MCS 的余地。" },

  // ───────── 6.7 VoLTE 语音质量优化 ─────────
  { id: "lte-volte-opt-1", m: "lte-volte-opt", t: "single", q: "VoLTE 语音媒体（RTP）使用的标准化 QCI 是？", o: ["QCI 5", "QCI 9", "QCI 2", "QCI 1"], a: 3, e: "QCI 1 为 GBR 会话语音，承载 RTP 语音；QCI 5 承载 IMS 信令（SIP）；QCI 9 常用于普通数据。" },
  { id: "lte-volte-opt-2", m: "lte-volte-opt", t: "single", q: "TTI bundling 主要解决 VoLTE 的什么问题？", o: ["上行边缘覆盖不足", "下行 PDCCH 容量不足", "IP 头开销过大", "终端耗电过高"], a: 0, e: "TTI bundling 让同一数据包在连续 4 个 TTI 发送，提高上行边缘覆盖；头开销靠 RoHC，PDCCH 容量靠 SPS，耗电靠 DRX。" },
  { id: "lte-volte-opt-3", m: "lte-volte-opt", t: "multi", q: "下列哪些因素会导致 VoLTE MOS 下降？", o: ["RTP 丢包率升高", "抖动增大", "语音编码速率降档", "RSRQ 上报范围扩展"], a: [0, 1, 2], e: "丢包、抖动、编码速率都直接影响 MOS；RSRQ 上报范围是测量上报能力，与语音质量无直接关系。" },
  { id: "lte-volte-opt-4", m: "lte-volte-opt", t: "judge", q: "为了降低 eSRVCC 切换比例，只需把 B2 门限调低即可，无需关注掉话率。", a: false, e: "只压低 B2 门限而不补 LTE 覆盖，语音会在 LTE 上停留到质量很差，可能把 eSRVCC 换成 VoLTE 掉话。比例、成功率和掉话率要一起看。" }
];
