module.exports = [
  // ───────── 1.1 E-UTRAN 与 EPC 架构、接口 ─────────
  { id: "lte-arch-1", m: "lte-arch", t: "single", q: "连接 MME 与 S-GW、用于建立和修改承载的接口是？", o: ["S1-MME", "S6a", "S11", "S5"], a: 2, e: "S11 连接 MME 与 S-GW，使用 GTPv2-C。S1-MME 连接 eNB 与 MME，S6a 连接 MME 与 HSS，S5 连接 S-GW 与 P-GW。" },
  { id: "lte-arch-2", m: "lte-arch", t: "single", q: "负责为 UE 分配 IP 地址、连接外部 PDN 的网元是？", o: ["P-GW", "MME", "S-GW", "HSS"], a: 0, e: "P-GW 是连接外部网络的网关，负责 UE IP 地址分配、业务过滤与 QoS 执行；S-GW 是 eNB 侧的用户面锚点；MME 只处理信令；HSS 保存签约数据。" },
  { id: "lte-arch-3", m: "lte-arch", t: "multi", q: "下列接口与其传输层协议对应正确的有？", o: ["S1-MME：S1AP / SCTP", "S1-U：GTP-U / UDP", "S6a：Diameter", "X2-C：GTP-U / UDP"], a: [0, 1, 2], e: "X2-C 是控制面，使用 X2AP / SCTP；X2-U 才用 GTP-U / UDP 进行切换数据前转。" },
  { id: "lte-arch-4", m: "lte-arch", t: "judge", q: "MME 既处理 NAS 信令，也负责转发用户面数据。", a: false, e: "EPC 控制面与用户面分离：MME 只处理信令，用户数据经 S1-U 由 S-GW、P-GW 转发。" },

  // ───────── 1.2 协议栈与无线承载 ─────────
  { id: "lte-stack-1", m: "lte-stack", t: "single", q: "在 LTE 空口中，ROHC 头压缩由哪一层完成？", o: ["RRC", "RLC", "MAC", "PDCP"], a: 3, e: "PDCP 负责用户面头压缩、加密和控制面完整性保护；RLC 负责分段重组和 ARQ；MAC 负责复用、HARQ 和调度。" },
  { id: "lte-stack-2", m: "lte-stack", t: "single", q: "SRB0 映射的逻辑信道和使用的 RLC 模式是？", o: ["DCCH，AM", "CCCH，TM", "CCCH，AM", "DCCH，UM"], a: 1, e: "SRB0 映射到 CCCH，RLC 为透明模式，用于 RRCConnectionRequest / Setup 等消息；SRB1、SRB2 映射到 DCCH，使用 AM。" },
  { id: "lte-stack-3", m: "lte-stack", t: "multi", q: "关于 LTE 承载，下列说法正确的有？", o: ["E-RAB 由无线承载和 S1 承载组成", "EPS 承载标识 EBI 取值 5–15", "用户面数据在 PDCP 层同时做加密和完整性保护", "每个 PDN 连接至少有一个默认承载"], a: [0, 1, 3], e: "LTE 的 PDCP 只对控制面（SRB）做完整性保护，用户面只加密（中继节点等特殊场景除外）。其余三项均正确。" },
  { id: "lte-stack-4", m: "lte-stack", t: "judge", q: "MIB 通过 BCCH → BCH → PBCH 发送，而 SIB 通过 BCCH → DL-SCH → PDSCH 发送。", a: true, e: "MIB 走专用的 BCH / PBCH；SIB1 及其他 SI 消息走 DL-SCH，在 PDSCH 上由 SI-RNTI 调度。" },

  // ───────── 1.3 频段、EARFCN 与 FDD / TDD ─────────
  { id: "lte-bands-1", m: "lte-bands", t: "single", q: "Band 1 下行 EARFCN 为 300，其中心频率是多少？（Band 1：F_DL_low = 2110 MHz，N_Offs-DL = 0）", o: ["2110 MHz", "2130 MHz", "2140 MHz", "2170 MHz"], a: 2, e: "F_DL = 2110 + 0.1 × (300 − 0) = 2140 MHz。" },
  { id: "lte-bands-2", m: "lte-bands", t: "single", q: "LTE 的信道栅格（载波中心频率的步进）是？", o: ["15 kHz", "100 kHz", "180 kHz", "200 kHz"], a: 1, e: "LTE 中心频率必须为 100 kHz 的整数倍，EARFCN 每加 1 对应 0.1 MHz。15 kHz 是子载波间隔，180 kHz 是 RB 带宽，200 kHz 是 GSM 的信道间隔。" },
  { id: "lte-bands-3", m: "lte-bands", t: "multi", q: "下列频段中属于 TDD 频段的有？", o: ["Band 3", "Band 39", "Band 40", "Band 41"], a: [1, 2, 3], e: "Band 3（1.8G）是 FDD 频段；Band 39（F）、40（E）、41（D）都是 TDD 频段。" },
  { id: "lte-bands-4", m: "lte-bands", t: "judge", q: "TD-LTE 网络中，相邻基站之间可以不做时间同步，只要各自配置相同的上下行配比即可。", a: false, e: "TDD 上下行同频分时，基站间必须严格时间同步，否则一站的下行会落入邻站的上行时段造成强干扰；配比一致和时间同步两者都需要。" },

  // ───────── 1.4 标识体系 ─────────
  { id: "lte-ids-1", m: "lte-ids", t: "single", q: "S-TMSI 由哪两部分组成？", o: ["MCC + MSIN", "MMEGI + MMEC", "TAC + M-TMSI", "MMEC + M-TMSI"], a: 3, e: "S-TMSI = MMEC（8 比特）+ M-TMSI（32 比特），共 40 比特，用于寻呼和 RRCConnectionRequest；GUTI 则是 GUMMEI + M-TMSI。" },
  { id: "lte-ids-2", m: "lte-ids", t: "single", q: "某小区 PCI = 302，其 N_ID(1) 和 N_ID(2) 分别是？", o: ["100 和 2", "151 和 0", "302 和 0", "100 和 1"], a: 0, e: "PCI = 3 × N_ID(1) + N_ID(2)，302 = 3 × 100 + 2，所以 N_ID(1) = 100，N_ID(2) = 2，即 PCI 模 3 = 2。" },
  { id: "lte-ids-3", m: "lte-ids", t: "multi", q: "关于 LTE 标识，下列说法正确的有？", o: ["宏站 ECI 共 28 比特，由 20 比特 eNB ID 和 8 比特 Cell ID 组成", "TAI 由 PLMN 和 TAC 组成", "PCI 共有 1008 个取值", "P-RNTI 是固定值 FFFE"], a: [0, 1, 3], e: "LTE PCI 共 504 个（168 × 3），1008 个是 5G NR 的 PCI 数量。其余说法正确。" },
  { id: "lte-ids-4", m: "lte-ids", t: "judge", q: "两个相邻小区的 PCI 模 3 相同，可能导致 CRS 互相干扰、SINR 下降。", a: true, e: "PCI 模 3 相同意味着 N_ID(2) 相同，PSS 序列相同，且 2 / 4 端口下 CRS 频域位置相同，在重叠覆盖区会互相干扰。" }
];
