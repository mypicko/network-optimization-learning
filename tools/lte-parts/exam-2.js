module.exports = [
  // ───────── 2.1 帧结构与 TDD 上下行配置 ─────────
  { id: "lte-frame-1", m: "lte-frame", t: "single", q: "LTE 一个 10 ms 无线帧的组成是？", o: ["10 个子帧，每个子帧 1 个时隙", "10 个子帧，每个子帧 2 个时隙", "20 个子帧，每个子帧 2 个时隙", "5 个子帧，每个子帧 2 个时隙"], a: 1, e: "无线帧 10 ms = 10 个 1 ms 子帧，每个子帧含 2 个 0.5 ms 时隙，共 20 个时隙。" },
  { id: "lte-frame-2", m: "lte-frame", t: "single", q: "TDD 上下行配置 2 在一个无线帧内（子帧 0–9）的模式是？", o: ["D S U U U D S U U U", "D S U U D D S U U D", "D S U D D D D D D D", "D S U D D D S U D D"], a: 3, e: "配置 2 为 5 ms 转换周期，每半帧 D S U D D。A 是配置 0，B 是配置 1，C 是配置 5。" },
  { id: "lte-frame-3", m: "lte-frame", t: "multi", q: "关于 TDD 特殊子帧，下列说法正确的有？", o: ["由 DwPTS、GP、UpPTS 三部分组成", "常规 CP 下三部分合计 14 个 OFDM 符号", "GP 越长，能容纳的往返传播时延越大，支持的覆盖距离越远", "UpPTS 用于发送 PSS"], a: [0, 1, 2], e: "TDD 中 PSS 位于 DwPTS 的第 3 个符号，而不是 UpPTS；UpPTS 可承载 SRS 和 PRACH 格式 4。" },
  { id: "lte-frame-4", m: "lte-frame", t: "judge", q: "与 NR 类似，LTE 单播业务的子载波间隔可以配置为 30 kHz。", a: false, e: "LTE 单播子载波间隔固定为 15 kHz（MBSFN 另有 7.5 kHz），没有 NR 那样的多种参数集。" },

  // ───────── 2.2 小区搜索与系统消息 ─────────
  { id: "lte-cellsearch-1", m: "lte-cellsearch", t: "single", q: "终端检测到 N_ID(2) = 2，N_ID(1) = 50，该小区 PCI 为？", o: ["152", "150", "52", "100"], a: 0, e: "PCI = 3 × N_ID(1) + N_ID(2) = 3 × 50 + 2 = 152。" },
  { id: "lte-cellsearch-2", m: "lte-cellsearch", t: "single", q: "以下哪项不在 MIB 中？", o: ["dl-Bandwidth", "phich-Config", "TAC", "systemFrameNumber 的高 8 位"], a: 2, e: "MIB 只有下行带宽、PHICH 配置、SFN 高 8 位和保留位；TAC 在 SIB1 中。" },
  { id: "lte-cellsearch-3", m: "lte-cellsearch", t: "multi", q: "SIB1 中包含下列哪些信息？", o: ["PLMN 标识与 TAC", "其他 SI 消息的调度信息（schedulingInfoList、si-WindowLength）", "TDD 小区的上下行与特殊子帧配置", "PRACH 根序列等随机接入参数"], a: [0, 1, 2], e: "PRACH、PUCCH、上行功控等公共无线资源配置在 SIB2 中，不在 SIB1。" },
  { id: "lte-cellsearch-4", m: "lte-cellsearch", t: "judge", q: "FDD 小区中，PSS 位于子帧 0 和子帧 5 第一个时隙的最后一个 OFDM 符号，SSS 位于其前一个符号。", a: true, e: "这是帧结构类型 1 的同步信号位置；TDD 则是 SSS 在子帧 0、5 的最后一个符号，PSS 在子帧 1、6 的 DwPTS 第 3 个符号。" },

  // ───────── 2.3 下行物理信道与参考信号 ─────────
  { id: "lte-dl-1", m: "lte-dl", t: "single", q: "LTE 中一个 CCE 由几个 REG 组成？", o: ["4", "6", "9", "12"], a: 2, e: "1 CCE = 9 REG = 36 RE，QPSK 调制下承载 72 个编码比特；一个 REG 为 4 个可用 RE。" },
  { id: "lte-dl-2", m: "lte-dl", t: "single", q: "PCFICH 的作用是？", o: ["指示当前子帧控制区占用的 OFDM 符号数", "承载 PUSCH 的 ACK/NACK", "承载 MIB", "承载下行调度 DCI"], a: 0, e: "PCFICH 携带 CFI；ACK/NACK 在 PHICH，MIB 在 PBCH，DCI 在 PDCCH。" },
  { id: "lte-dl-3", m: "lte-dl", t: "multi", q: "关于下行参考信号，下列说法正确的有？", o: ["CRS 用于 RSRP 测量，也用于 TM1–TM6 的解调", "CSI-RS 在 R10 引入，用于信道状态测量", "UE 专用参考信号（DM-RS）用于 TM7–TM10 的解调", "CRS 只在有 PDSCH 调度的 RB 上发送"], a: [0, 1, 2], e: "CRS 在全带宽、每个下行子帧都发送，与是否调度无关；只在被调度 RB 上发送的是 UE 专用参考信号。" },
  { id: "lte-dl-4", m: "lte-dl", t: "judge", q: "常规 CP 下，CRS 端口 2、3 在每个时隙占用的 OFDM 符号数与端口 0、1 相同。", a: false, e: "端口 0、1 每个时隙占 2 个符号（符号 0 和 4），端口 2、3 每个时隙只占 1 个符号（符号 1），因此密度只有一半。" },

  // ───────── 2.4 上行物理信道、PRACH 与 SRS ─────────
  { id: "lte-ul-1", m: "lte-ul", t: "single", q: "PRACH 格式 4 的适用范围是？", o: ["FDD 超远覆盖", "高速铁路专用", "FDD 和 TDD 通用", "仅用于 TDD，在 UpPTS 中发送"], a: 3, e: "格式 4 使用 139 长度短序列、时长很短，只能放在 TDD 特殊子帧的 UpPTS 中，适合小覆盖。" },
  { id: "lte-ul-2", m: "lte-ul", t: "single", q: "PUCCH 在频域上的典型位置是？", o: ["系统带宽中央 6 个 PRB", "系统带宽两侧边缘，且在两个时隙间跳频", "任意位置，由 DCI 指示", "仅在特殊子帧中"], a: 1, e: "PUCCH 放在带宽两侧，两个时隙分别位于两侧获得频率分集，同时把中间连续的 RB 留给 PUSCH。占用中心 6 个 PRB（72 个子载波）的是下行的同步信号和 PBCH。" },
  { id: "lte-ul-3", m: "lte-ul", t: "multi", q: "关于 SRS，下列说法正确的有？", o: ["一般在子帧最后一个 SC-FDMA 符号发送", "TDD 中可利用信道互易性用于下行波束赋形", "可周期发送，R10 起也支持由 DCI 非周期触发", "只能在 PUCCH 所在的 RB 上发送"], a: [0, 1, 2], e: "SRS 用于探测上行信道，带宽按 srs-BandwidthConfig 等配置，可覆盖 PUSCH 区域，并不限于 PUCCH 所在 RB。" },
  { id: "lte-ul-4", m: "lte-ul", t: "judge", q: "LTE 上行 PUSCH 分配的 PRB 数必须能写成 2、3、5 的幂的乘积。", a: true, e: "这是为了让 DFT 扩展的点数便于低复杂度实现，例如 7、11 个 PRB 不允许，而 6、8、9、10、12 等允许。" },

  // ───────── 2.5 调度、AMC 与 HARQ ─────────
  { id: "lte-sched-1", m: "lte-sched", t: "single", q: "FDD LTE 下行最多有多少个 HARQ 进程？", o: ["8", "4", "10", "16"], a: 0, e: "FDD 往返时间 8 ms，8 个停等进程可保证连续传输；TDD 进程数随上下行配置不同而变化，最多可达 15 个。" },
  { id: "lte-sched-2", m: "lte-sched", t: "single", q: "在 CQI 表 1（最高 64QAM）中，CQI = 15 对应哪种调制？", o: ["QPSK", "16QAM", "64QAM", "256QAM"], a: 2, e: "CQI 表 1 中 1–6 为 QPSK，7–9 为 16QAM，10–15 为 64QAM；256QAM 需要 R12 的 CQI 表 2。" },
  { id: "lte-sched-3", m: "lte-sched", t: "multi", q: "关于 FDD LTE 的 HARQ，下列说法正确的有？", o: ["下行 HARQ 为异步，进程号由 DCI 指示", "上行 HARQ 为同步，重传时刻固定", "PDSCH 在子帧 n 接收，ACK/NACK 在子帧 n+4 反馈", "上行重传必须由 PDCCH 调度，PHICH 不起作用"], a: [0, 1, 2], e: "上行非自适应重传只需 PHICH 回 NACK 即可触发，不必发送 PDCCH；自适应重传才需要 DCI 0。" },
  { id: "lte-sched-4", m: "lte-sched", t: "judge", q: "UE 选择上报的 CQI 时，以对应传输块误块率不超过 10% 为准则。", a: true, e: "TS 36.213 规定 UE 上报能使传输块误块率不超过 0.1 的最大 CQI，这也是基站 AMC 默认的初传 BLER 目标约为 10% 的依据。" },

  // ───────── 2.6 功率控制与 DRX ─────────
  { id: "lte-power-1", m: "lte-power", t: "single", q: "PUSCH 功控中路损补偿因子 α = 1 表示？", o: ["完全不补偿路损", "只补偿一半路损", "由 TPC 命令决定补偿量", "完全补偿路损"], a: 3, e: "α 取 0 到 1，α = 1 为完全补偿，路损增加多少发射功率就增加多少；α < 1 为部分补偿。" },
  { id: "lte-power-2", m: "lte-power", t: "single", q: "LTE 下行功率的主要设置方式是？", o: ["快速闭环功控", "按 referenceSignalPower 固定 CRS 功率，配合 PA/PB 设定数据 RE 功率", "终端测量路损后开环调整", "按 SINR 的外环功控"], a: 1, e: "LTE 下行没有像 WCDMA 那样的快速闭环功控，CRS 每 RE 功率恒定，PDSCH 功率通过 PA（UE 级）和 PB（小区级）相对 CRS 设定。" },
  { id: "lte-power-3", m: "lte-power", t: "multi", q: "下列属于连接态 DRX 配置参数的有？", o: ["onDurationTimer", "drx-InactivityTimer", "longDRX-CycleStartOffset", "preambleTransMax"], a: [0, 1, 2], e: "preambleTransMax 是随机接入前导的最大发送次数，属于 RACH 配置，与 DRX 无关。" },
  { id: "lte-power-4", m: "lte-power", t: "judge", q: "PUCCH 功控与 PUSCH 一样使用部分路损补偿因子 α。", a: false, e: "PUCCH 功控公式中路损按完全补偿计算（相当于 α = 1），不引入 α；部分路损补偿只用于 PUSCH 和随 PUSCH 的 SRS。" }
];
