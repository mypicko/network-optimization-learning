// 阶段 2 物理层
module.exports = {
  id: "L2", title: "物理层", summary: "从 10 ms 无线帧和资源网格出发，依次拆解小区搜索与系统消息、上下行物理信道和参考信号，再落到调度、AMC、HARQ、功率控制与 DRX，建立“空口资源怎么分、怎么用”的完整图景。",
  modules: [
    {
      id: "lte-frame",
      title: "帧结构与 TDD 上下行配置",
      hours: 4,
      goals: [
        "能画出 LTE 无线帧、子帧、时隙、符号的层级关系并说出各自时长",
        "能说出 PRB 的定义以及 1.4–20 MHz 各带宽对应的 PRB 数",
        "能读懂 TDD 上下行配置 0–6 和特殊子帧配置，并估算上下行资源比例",
        "理解 GP 长度与覆盖距离、TDD 邻区同步之间的关系"
      ],
      concepts: ["Ts 基本时间单位", "10 ms 无线帧 / 1 ms 子帧 / 0.5 ms 时隙", "常规 CP 与扩展 CP", "RE、RB、PRB", "帧结构类型 1（FDD）与类型 2（TDD）", "TDD 上下行配置 0–6", "特殊子帧 DwPTS / GP / UpPTS", "5 ms 与 10 ms 转换周期"],
      specs: [
        { id: "TS 36.211", note: "§4 帧结构；§6.2 下行资源网格" },
        { id: "TS 36.101", note: "信道带宽与传输带宽配置（PRB 数）" }
      ],
      quiz: [
        { q: "为什么 20 MHz 的 LTE 小区只用 100 个 PRB（18 MHz），而不是把 20 MHz 用满？", a: "100 个 PRB × 180 kHz = 18 MHz，剩余约 2 MHz 作为两侧保护带，用来满足邻道泄漏和频谱模板要求，避免干扰相邻载波。LTE 的带宽利用率约 90%，1.4 MHz 带宽只有 6 个 PRB，利用率更低。" },
        { q: "TDD 配置 2 搭配特殊子帧 10:2:2，与配置 1 相比对用户感知有什么影响？", a: "配置 2 每 5 ms 只有 1 个上行子帧，下行资源更多、下行峰值速率更高，但上行容量减少，上行 HARQ 反馈和调度时延也会变长。适合下行业务为主的场景；上行业务多（如视频上传、上行密集话务）时配置 1 更均衡。" },
        { q: "相邻 TDD 小区可以使用不同的上下行配置吗？", a: "原则上同频相邻小区必须采用相同的上下行配置和帧同步，否则一个小区在发下行时另一个小区在收上行，会产生基站对基站、终端对终端的交叉时隙干扰。因此 TDD 网络通常要求全网 GPS/北斗等时间同步并统一配置。" }
      ],
      practice: "用手机工程模式或路测软件查看一个 TDD-LTE 小区的 subframeAssignment 和 specialSubframePatterns，画出该小区 10 ms 内每个子帧的 D/S/U 分布，并计算下行符号占比（示例计算即可）。"
    },
    {
      id: "lte-cellsearch",
      title: "小区搜索与系统消息",
      hours: 4,
      goals: [
        "能按顺序说出开机小区搜索的步骤以及每步获得的信息",
        "能根据 PSS/SSS 计算 PCI，理解 504 个 PCI 的构成",
        "能说出 MIB、SIB1、SIB2 各自承载的关键参数",
        "理解 SI 窗口调度与系统消息变更通知机制"
      ],
      concepts: ["PSS / SSS 与中心 72 子载波", "PCI = 3 × N_ID(1) + N_ID(2)", "PBCH 与 MIB（40 ms TTI）", "SFN 系统帧号", "SIB1（80 ms 周期）", "SI 消息与 SI 窗口", "SI-RNTI", "systemInfoValueTag 与修改周期"],
      specs: [
        { id: "TS 36.211", note: "§6.11 同步信号；§6.6 PBCH" },
        { id: "TS 36.331", note: "§5.2 系统信息；MIB 与 SIB 定义" },
        { id: "TS 36.304", note: "小区选择" }
      ],
      quiz: [
        { q: "终端如何从 PSS 和 SSS 得到 10 ms 帧定时？", a: "PSS 每 5 ms 重复一次且两次内容相同，只能给出 5 ms 定时和 N_ID(2)。SSS 在子帧 0 和子帧 5 使用不同的交织顺序，终端检测出是哪一个，就能区分前后半帧，得到 10 ms 帧边界，同时得到 N_ID(1)。" },
        { q: "MIB 只给了 SFN 的高 8 位，终端怎么得到完整的 10 位 SFN？", a: "PBCH 的传输周期是 40 ms，在 4 个连续无线帧中各发送一次（不同加扰段）。终端解出 MIB 时，根据成功解码所对应的是 40 ms 内的第几个 10 ms 段，推出 SFN 的低 2 位。" },
        { q: "运营维护修改了一个小区的 SIB2 参数，驻留在该小区的空闲态终端是怎么知道的？", a: "eNB 在当前修改周期内通过寻呼消息中的 systemInfoModification 指示通知终端，并在下一个修改周期边界开始发送新内容；同时 SIB1 中的 systemInfoValueTag 会改变。终端据此在下一个修改周期重新读取系统消息。" }
      ],
      practice: "用 QXDM/路测软件或开源 srsRAN 的日志，抓一次开机驻留过程，按时间顺序找到 MIB、SIB1、SIB2 的解码记录，列出 dl-Bandwidth、TAC、q-RxLevMin、prach-ConfigIndex 等参数的取值。"
    },
    {
      id: "lte-dl",
      title: "下行物理信道与参考信号",
      hours: 5,
      goals: [
        "能说出 PBCH、PCFICH、PHICH、PDCCH、PDSCH 各自的作用和位置",
        "理解 CCE、聚合等级、搜索空间与 DCI 格式的关系",
        "能画出 CRS 端口 0–3 在一个 RB 内的分布，估算 CRS 开销",
        "能区分 CRS、DM-RS、CSI-RS 的用途及对应传输模式"
      ],
      concepts: ["控制区与数据区", "CFI 与 PCFICH", "PHICH 组与 Ng", "REG / CCE / 聚合等级 1、2、4、8", "公共与 UE 专用搜索空间", "DCI 格式与 RNTI", "CRS 端口 0–3 与 PCI mod 6 频移", "DM-RS 与 CSI-RS", "PDSCH 资源分配类型 0/1/2"],
      specs: [
        { id: "TS 36.211", note: "§6 下行物理信道与参考信号" },
        { id: "TS 36.212", note: "§5.3.3 DCI 格式" },
        { id: "TS 36.213", note: "§7 PDSCH 相关过程；§9 PDCCH 相关过程" }
      ],
      quiz: [
        { q: "为什么小区用户多时会出现“PDCCH 拥塞”，有哪些常见缓解手段？", a: "每个被调度的 UE 都需要占用若干 CCE 发 DCI，覆盖差的 UE 还要用高聚合等级（4 或 8），控制区 CCE 总数有限，就会出现 DCI 放不下、调度失败。常见手段包括提高 CFI（增加控制区符号）、优化覆盖以降低聚合等级、调整 PHICH 资源（Ng）、在支持的版本中使用 EPDCCH 等，具体做法因厂家而异。" },
        { q: "4 端口 CRS 比 2 端口 CRS 多了什么开销？", a: "端口 2、3 在每个时隙的第 2 个符号（符号 1）上各增加参考信号 RE，每 RB 对每子帧 CRS 总 RE 从 16 个增加到 24 个，开销从约 9.5% 增加到约 14.3%，换来更多发射分集或空间复用层的可能。" },
        { q: "RSRP 测的是哪个参考信号？为什么空载小区也能测到稳定的 RSRP？", a: "RSRP 基于 CRS 测量（通常是端口 0，必要时含端口 1）。CRS 在全带宽、每个下行子帧都发送，与是否有业务无关，所以空载小区的 RSRP 依然稳定；而 RSRQ、SINR 会随邻区负载变化。" }
      ],
      practice: "画一个 RB 对（12 子载波 × 14 符号）的网格，按 PCI = 你自编的一个示例值，标出 2 端口 CRS 和 CFI = 2 时控制区的 RE 位置，数一数剩余可用于 PDSCH 的 RE 数。"
    },
    {
      id: "lte-ul",
      title: "上行物理信道、PRACH 与 SRS",
      hours: 5,
      goals: [
        "能说出 PUSCH、PUCCH、PRACH 的作用及资源位置",
        "能区分 PUCCH 格式 1/1a/1b/2/2a/2b/3 承载的 UCI",
        "掌握 PRACH 格式 0–4 的适用场景以及根序列、Ncs 与小区半径的关系",
        "理解上行 DMRS 与 SRS 的用途和 PCI mod 30 规则的来源"
      ],
      concepts: ["SC-FDMA 与连续 RB 分配", "PUSCH 与 UCI 复用", "PUCCH 位于带宽边缘、时隙间跳频", "PUCCH 格式 1/2/3", "PRACH 格式 0–4，占用 6 个 PRB", "64 个前导与根序列", "zeroCorrelationZoneConfig（Ncs）", "上行 DMRS 与序列组", "SRS 周期与非周期", "时间提前 TA"],
      specs: [
        { id: "TS 36.211", note: "§5 上行物理信道与参考信号（§5.7 PRACH）" },
        { id: "TS 36.213", note: "§10 PUCCH 相关过程；SRS 过程" },
        { id: "TS 36.321", note: "§5.1 随机接入过程（MAC 侧）" }
      ],
      quiz: [
        { q: "为什么 LTE 上行 PUSCH 要求分配连续的 RB？", a: "上行采用 SC-FDMA（DFT 扩展 OFDM），映射到连续子载波上才能保持单载波特性和较低的峰均比，从而降低终端功放回退、提升覆盖和续航。R10 引入了簇状分配放宽此限制，但基本形态仍以连续分配为主。" },
        { q: "小区覆盖半径变大时，PRACH 规划要跟着调哪些参数？", a: "需要更大的 Ncs（zeroCorrelationZoneConfig），使循环移位窗口能容纳更大的往返时延；Ncs 变大后一个根序列能生成的前导变少，需要更多根序列凑够 64 个，根序列规划的复用距离也会变紧。超远覆盖时还需要换用 CP 更长的 PRACH 格式（如格式 1 或 3）。" },
        { q: "SRS 在 TDD 系统中有什么特别价值？", a: "TDD 上下行同频，信道具有互易性，基站用 SRS 估计上行信道后可直接用于下行波束赋形（如 TM7/TM8 等），不依赖终端反馈 PMI；同时 SRS 也用于上行频选调度。" }
      ],
      practice: "设定一个示例小区半径（如 5 km），用讲解中的近似公式估算所需 Ncs，查表选择 zeroCorrelationZoneConfig，并计算凑满 64 个前导需要几个根序列。"
    },
    {
      id: "lte-sched",
      title: "调度、AMC 与 HARQ",
      hours: 4,
      goals: [
        "理解 1 ms TTI 调度的基本流程及常见调度算法的取舍",
        "能读懂 CQI 表和 MCS 表，说出 CQI → MCS → TBS 的链路",
        "掌握 FDD 与 TDD 下的 HARQ 时序、进程数与同步 / 异步特性",
        "能用 TBS 表估算单用户峰值速率"
      ],
      concepts: ["1 ms TTI 调度", "轮询 / 最大 C/I / 比例公平", "CQI / PMI / RI", "周期与非周期 CSI 上报", "MCS 0–28 与 29–31", "TBS 索引与 TBS 表", "目标误块率 10%", "HARQ 8 进程与 n+4 时序", "上行同步 / 下行异步 HARQ", "SR、BSR、PHR"],
      specs: [
        { id: "TS 36.213", note: "§7.1.7 MCS 与 TBS；§7.2 CSI 上报；§8 PUSCH 相关过程" },
        { id: "TS 36.321", note: "§5.3 / §5.4 HARQ、SR、BSR、PHR" },
        { id: "TS 36.306", note: "UE 能力等级" }
      ],
      quiz: [
        { q: "UE 上报 CQI = 15，但实际调度的 MCS 一直不高，可能是什么原因？", a: "常见原因有：基站对 CQI 做了外环修正（根据 ACK/NACK 统计调整偏置，误码多会下调）；可用 PRB 少或用户多导致资源分摊；终端能力或配置不支持更高阶调制；控制区开销、RI 只有 1 层等。需要结合 BLER、RI、PRB 利用率一起看。" },
        { q: "为什么 LTE 上行 HARQ 采用同步方式，下行采用异步方式？", a: "上行同步 HARQ 的重传时刻固定（FDD 为 8 ms 后），非自适应重传只需 PHICH 发 NACK，不必再发 PDCCH，节省控制开销。下行异步 HARQ 由 DCI 显式指示进程号，调度更灵活，基站可按信道和负载决定何时重传。" },
        { q: "估算：20 MHz FDD、2 层空间复用、64QAM 最高 MCS 时的峰值速率约多少？", a: "100 PRB、I_TBS = 26 时单层 TBS 为 75376 bit，每 1 ms 一个 TB，单层约 75 Mbit/s，两层约 150 Mbit/s，这就是常说的 Cat4 下行峰值约 150 Mbit/s 的来源（未计 256QAM 与载波聚合）。" }
      ],
      practice: "在路测或工程模式日志中记录一段时间内的 CQI、RI、MCS、调度 PRB 数和初传 BLER，作散点或时序对比，判断 AMC 是否跟得上信道变化（无现网数据可用开源 srsRAN 仿真日志）。"
    },
    {
      id: "lte-power",
      title: "功率控制与 DRX",
      hours: 3,
      goals: [
        "能写出 PUSCH 功控公式并解释 P0、α、PL、ΔTF、f(i) 的含义",
        "理解 PUCCH、SRS、PRACH 功控与 PUSCH 的差异",
        "理解下行 referenceSignalPower 与 PA/PB 的关系",
        "能说出连接态 DRX 各定时器的作用以及时延与省电的取舍"
      ],
      concepts: ["开环 + 闭环功控", "P0-NominalPUSCH 与 P0-UE-PUSCH", "部分路损补偿因子 α", "TPC 累积与绝对模式", "Pcmax 与功率余量 PHR", "referenceSignalPower", "PA / PB", "连接态 DRX：onDuration / InactivityTimer / 长短周期", "空闲态寻呼 DRX"],
      specs: [
        { id: "TS 36.213", note: "§5 功率控制" },
        { id: "TS 36.321", note: "§5.7 DRX" },
        { id: "TS 36.304", note: "§7 寻呼" }
      ],
      quiz: [
        { q: "把 α 从 1 调到 0.8，对小区内的近点和远点用户分别有什么影响？", a: "α 小于 1 时路损只被部分补偿：远点用户（路损大）的发射功率相对降低，对邻区的上行干扰减小，但自身 SINR 和速率下降；近点用户影响较小。整体上倾向于提升小区平均频谱效率、牺牲部分边缘用户速率，通常需要配合 P0 一起调整。" },
        { q: "连接态 DRX 的 drx-InactivityTimer 设置过短或过长分别会怎样？", a: "过短：一次调度后很快进入睡眠，突发数据到来时要等到下一个 onDuration，时延变大；过长：数据结束后终端仍长时间监听 PDCCH，耗电增加。实际取值要结合业务（如 VoLTE 的 20 ms 包间隔）和省电目标折中。" }
      ],
      practice: "在终端日志中找到一次 RRC 重配置里的 drx-Config 和 uplinkPowerControlDedicated 字段，记录 onDurationTimer、longDRX-Cycle、p0-UE-PUSCH 等取值，解释每个参数对时延 / 耗电 / 上行干扰的影响。"
    }
  ]
};
