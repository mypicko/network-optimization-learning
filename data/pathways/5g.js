// 5G 学习路径数据
// 结构：pathway → stages（阶段）→ modules（模块）
// 每个模块：学习目标、核心概念、规范出处、信令流程（可选，Mermaid）、自测题、实操任务、精选资源
// tools（可选）：工具箱里相关的计算器 id（arfcn / numerology / rate），见 tools.html
window.PATHWAYS = window.PATHWAYS || {};

window.PATHWAYS["5g"] = {
  id: "5g",
  title: "5G 移动通信",
  subtitle: "从无线基础到端到端信令、网优与演进，面向一线从业者的系统化路径",
  audience: "无线 / 核心网 / 网优工程师，以及希望系统掌握 5G 的通信从业者",
  version: "以 3GPP R15–R18 为主线",
  stages: [
    // ───────────────────────── 阶段 0 ─────────────────────────
    {
      id: "s0",
      title: "前置基础",
      summary: "5G 建立在 OFDM、MIMO 和 LTE 体系之上。基础牢，后面读规范才不吃力。",
      modules: [
        {
          id: "s0-ofdm",
          tools: ["numerology"],
          title: "OFDM 与调制",
          hours: 4,
          goals: [
            "说清 OFDM 为什么能对抗多径、子载波正交的含义",
            "理解循环前缀（CP）的作用和代价",
            "知道 QPSK / 16QAM / 64QAM / 256QAM 与频谱效率、SINR 门限的关系"
          ],
          concepts: ["子载波", "子载波间隔", "循环前缀 CP", "IFFT/FFT", "星座图", "调制阶数", "CP-OFDM", "DFT-s-OFDM"],
          specs: [
            { id: "TS 38.211", note: "§4 帧结构与参数集；§6/§7 上下行调制方式" }
          ],
          quiz: [
            {
              q: "CP 越长越好吗？",
              a: "不是。CP 越长，能容忍的时延扩展越大，但 CP 是冗余开销，会降低有效传输效率。5G 正常 CP 下 CP 时长随子载波间隔增大而缩短，所以高 SCS 适合时延扩展小的场景（如毫米波小覆盖）。"
            },
            {
              q: "5G 上行为什么同时支持 DFT-s-OFDM？",
              a: "DFT-s-OFDM 的峰均比（PAPR）更低，终端功放效率更高，适合覆盖受限的小区边缘上行；CP-OFDM 频谱效率和 MIMO 支持更好，适合信道条件好的场景。"
            }
          ],
          practice: "用 Python 或 MATLAB 生成一个 64 子载波的 OFDM 符号，加 CP，经过两径信道后去 CP 做 FFT，观察有无 CP 时星座图的差异。"
        },
        {
          id: "s0-mimo",
          title: "多天线与 MIMO 基础",
          hours: 4,
          goals: [
            "区分发射分集、空间复用、波束赋形三种多天线用法",
            "理解秩（Rank）、层（Layer）、预编码的含义",
            "知道信道状态信息（CSI）在闭环 MIMO 中的作用"
          ],
          concepts: ["SU-MIMO", "MU-MIMO", "Rank / Layer", "预编码", "波束赋形", "信道互易性（TDD）", "CSI 反馈"],
          specs: [
            { id: "TS 38.214", note: "§5.2 CSI 上报（概念了解即可）" }
          ],
          quiz: [
            {
              q: "为什么 TDD 系统更容易做 Massive MIMO？",
              a: "TDD 上下行同频，基站可利用信道互易性，通过测量上行 SRS 直接估计下行信道，无需终端反馈大量 CSI，天线数越多这个优势越明显。"
            }
          ],
          practice: "找一份现网 5G 终端日志（或路测软件截图），找到 Rank 指示（RI）和 CQI，观察它们随位置变化的规律。"
        },
        {
          id: "s0-lte",
          title: "4G LTE 体系回顾",
          hours: 6,
          goals: [
            "画出 LTE 的 E-UTRAN + EPC 架构（eNB、MME、SGW、PGW、HSS、PCRF）",
            "说清 LTE 附着和默认承载建立的主要步骤",
            "理解 LTE 协议栈（RRC/PDCP/RLC/MAC/PHY）各层职责"
          ],
          concepts: ["eNB", "MME", "SGW / PGW", "HSS", "S1 / X2 接口", "EPS 承载", "QCI", "附着流程"],
          specs: [
            { id: "TS 36.300", note: "E-UTRAN 总体描述" },
            { id: "TS 23.401", note: "EPC 架构与流程" }
          ],
          quiz: [
            {
              q: "LTE 中 MME 和 SGW 的分工是什么？",
              a: "MME 负责控制面：NAS 信令、移动性管理、鉴权、承载管理控制；SGW 负责用户面：数据转发、作为 eNB 间切换的用户面锚点。5G 进一步把控制面拆成 AMF/SMF，用户面统一为 UPF。"
            }
          ],
          practice: "不看资料，在纸上画出 LTE 附着流程的主要消息，再对照 TS 23.401 检查遗漏。后面学 5G 注册时对比两者差异。"
        }
      ]
    },

    // ───────────────────────── 阶段 1 ─────────────────────────
    {
      id: "s1",
      title: "5G 全局视图",
      summary: "先建立全局地图：5G 要解决什么问题、标准怎么演进、网络怎么部署。",
      modules: [
        {
          id: "s1-scenarios",
          tools: ["rate"],
          title: "三大场景与关键指标",
          hours: 2,
          goals: [
            "说出 eMBB、URLLC、mMTC 三大场景及典型业务",
            "了解 IMT-2020 关键指标：峰值速率、用户体验速率、时延、连接密度、移动性等"
          ],
          concepts: ["eMBB", "URLLC", "mMTC", "IMT-2020", "峰值速率 20 Gbps（下行）", "空口时延 1 ms 量级（URLLC）", "连接密度 10⁶/km²"],
          specs: [
            { id: "TS 22.261", note: "5G 系统业务需求" },
            { id: "TR 38.913", note: "场景与需求研究" }
          ],
          quiz: [
            {
              q: "三大场景是不是都能用同一套网络配置同时最优满足？",
              a: "不能。不同场景对速率、时延、可靠性、功耗的要求相互冲突，这正是 5G 引入灵活参数集（numerology）、网络切片、边缘计算的原因——用一张物理网络按需提供不同的逻辑能力。"
            }
          ],
          practice: "列出你所在网络或单位实际开展的 5G 业务，把它们归入三大场景，看看哪个场景真正落地最多。"
        },
        {
          id: "s1-releases",
          title: "3GPP 标准演进：R15 到 R18",
          hours: 2,
          goals: [
            "知道 3GPP 组织结构（TSG RAN、TSG SA、TSG CT 三个技术规范组）和规范编号规律",
            "掌握各 Release 的主要特性，能判断某个功能从哪个版本开始支持"
          ],
          concepts: ["R15：5G 第一版（NSA/SA）", "R16：URLLC 增强、工业物联网、V2X、NR-U、定位", "R17：RedCap、NTN 卫星、FR2-2", "R18：5G-Advanced 第一版", "38 系列 = NR 无线", "23 系列 = 系统架构", "24 系列 = NAS 协议", "33 系列 = 安全"],
          specs: [
            { id: "3gpp.org", note: "Specifications → 按系列号查找，下载 .zip 中的 Word 文件" }
          ],
          quiz: [
            {
              q: "看到 TS 38.331 和 TS 24.501，分别是什么？",
              a: "38.331 是 NR RRC 协议（无线侧 TSG RAN 负责）；24.501 是 5GS 的 NAS 协议（TSG CT 负责）。编号首位数字段就能大致判断所属领域。"
            }
          ],
          practice: "到 3gpp.org 下载 TS 38.300 最新版本，浏览目录，记下你最关心的 5 个章节，后续模块会反复用到。"
        },
        {
          id: "s1-deploy",
          tools: ["arfcn", "rate"],
          title: "部署方式：NSA 与 SA",
          hours: 3,
          goals: [
            "区分 Option 3x（NSA）和 Option 2（SA）的架构差异",
            "理解 EN-DC 双连接中主节点、辅节点的角色",
            "了解国内运营商 5G 频段分布与共建共享"
          ],
          concepts: ["NSA Option 3x", "SA Option 2", "EN-DC", "MeNB / SgNB", "MCG / SCG", "共建共享", "n41 / n78 / n79 / n28"],
          specs: [
            { id: "TS 37.340", note: "多连接（EN-DC）总体描述" },
            { id: "TS 38.101-1", note: "FR1 频段定义" }
          ],
          quiz: [
            {
              q: "NSA Option 3x 中，控制面和用户面分别怎么走？",
              a: "控制面锚定在 LTE eNB（主节点）和 EPC；用户面数据在 gNB（辅节点）分流，大部分数据直接经 gNB 传输。核心网仍是 EPC，所以 NSA 无法使用 5GC 才有的网络切片等能力。"
            },
            {
              q: "国内四家运营商的 5G 主力频段大致是？",
              a: "中国移动：n41（2.6 GHz）+ n79（4.9 GHz）；中国电信与中国联通共建共享 n78（3.5 GHz）；中国广电：n28（700 MHz，与中国移动共建共享）+ n79。"
            }
          ],
          practice: "用手机工程模式或网络测试 App 查看当前接入的是 NSA 还是 SA、频段是多少、PCI 是多少。"
        }
      ]
    },

    // ───────────────────────── 阶段 2 ─────────────────────────
    {
      id: "s2",
      title: "NR 空口物理层",
      summary: "5G 无线的核心。重点掌握灵活参数集、帧结构、SSB 和物理信道。",
      modules: [
        {
          id: "s2-numerology",
          tools: ["numerology", "arfcn"],
          title: "参数集、帧结构与 BWP",
          hours: 5,
          goals: [
            "掌握 μ 与子载波间隔、时隙长度的对应关系",
            "理解时隙格式与 TDD 上下行配比",
            "理解 BWP（部分带宽）的设计目的"
          ],
          concepts: ["SCS = 15 × 2^μ kHz", "帧 10 ms / 子帧 1 ms", "正常 CP 下每时隙 14 符号", "每子帧 2^μ 个时隙", "PRB = 12 个子载波", "FR1 最大 100 MHz / FR2 最大 400 MHz", "TDD 帧结构（如 DDDSU）", "BWP"],
          specs: [
            { id: "TS 38.211", note: "§4.2 参数集；§4.3 帧结构" },
            { id: "TS 38.213", note: "§11.1 时隙格式配置" }
          ],
          quiz: [
            {
              q: "SCS = 30 kHz 时，一个时隙多长？一个子帧有几个时隙？",
              a: "μ = 1，每个子帧 2 个时隙，时隙长 0.5 ms，每时隙 14 个符号（正常 CP）。"
            },
            {
              q: "为什么需要 BWP？",
              a: "5G 载波可达 100 MHz 甚至 400 MHz，要求所有终端都在全带宽收发既耗电又不必要。BWP 让终端只在部分带宽上工作，可按业务量切换，节省功耗，也便于支持不同能力的终端。"
            }
          ],
          practice: "根据你所在网络的 TDD 配置（如 2.5 ms 双周期或 5 ms 单周期），画出一个周期内的 D/S/U 时隙分布，并估算上下行资源比例。"
        },
        {
          id: "s2-ssb",
          tools: ["arfcn"],
          title: "SSB 与小区搜索",
          hours: 4,
          goals: [
            "知道 SSB 的组成：PSS、SSS、PBCH",
            "理解 PCI 的计算和规划原则",
            "理解 SSB 波束扫描与 MIB/SIB1 的获取过程"
          ],
          concepts: ["PSS / SSS / PBCH", "SSB 占 4 个符号、20 个 RB", "PCI 共 1008 个（3 × 336）", "SSB 波束扫描", "MIB", "SIB1", "SS-RSRP / SS-SINR"],
          specs: [
            { id: "TS 38.211", note: "§7.4.3 SS/PBCH 块" },
            { id: "TS 38.213", note: "§4.1 小区搜索" },
            { id: "TS 38.215", note: "物理层测量（SS-RSRP 等定义）" }
          ],
          quiz: [
            {
              q: "PCI 规划要避免哪些冲突？",
              a: "要避免同频相邻小区 PCI 相同（冲突）和同一小区的两个邻区 PCI 相同（混淆）；另外要尽量规避 PCI mod 3 相同，减少 PSS 序列和部分参考信号之间的干扰。"
            }
          ],
          practice: "在路测或终端日志里找到 MIB 和 SIB1 的解码内容，对照 TS 38.331 理解每个字段的含义。"
        },
        {
          id: "s2-channels",
          title: "物理信道与参考信号",
          hours: 6,
          goals: [
            "说出上下行各物理信道的用途",
            "区分 DMRS、CSI-RS、SRS、PTRS 的作用",
            "理解 PDCCH、CORESET、搜索空间、DCI 的关系"
          ],
          concepts: ["PDSCH / PDCCH / PBCH", "PUSCH / PUCCH / PRACH", "DMRS：解调", "CSI-RS：信道测量", "SRS：上行探测", "PTRS：相位跟踪（高频）", "CORESET", "搜索空间", "DCI 格式"],
          specs: [
            { id: "TS 38.211", note: "物理信道和参考信号" },
            { id: "TS 38.212", note: "DCI / UCI 格式" },
            { id: "TS 38.213", note: "§10 PDCCH 监听" }
          ],
          quiz: [
            {
              q: "5G 为什么取消了 LTE 的 CRS（小区参考信号）？",
              a: "CRS 是“永远在线”的信号，即使无业务也持续发送，带来干扰和能耗，并限制了灵活性。5G 改为按需发送的 DMRS、CSI-RS 等，实现“极简载波”，更节能也更适合波束赋形。"
            }
          ],
          practice: "在一份终端日志中找一条 DCI 1_1 调度，读出它分配的 RB、MCS、HARQ 进程号，算出这次调度的传输块大致大小。"
        },
        {
          id: "s2-coding",
          tools: ["rate"],
          title: "信道编码与 HARQ",
          hours: 3,
          goals: [
            "知道 LDPC 和 Polar 码分别用在哪里",
            "理解 MCS、码率与 BLER 的关系",
            "理解 HARQ 重传与软合并"
          ],
          concepts: ["LDPC：数据信道", "Polar：控制信道（PBCH / DCI / UCI）", "MCS 表", "传输块 TBS", "BLER 目标 10%", "HARQ-ACK", "CBG 重传"],
          specs: [
            { id: "TS 38.212", note: "§5 信道编码" },
            { id: "TS 38.214", note: "§5.1.3 MCS 与 TBS 确定" }
          ],
          quiz: [
            {
              q: "现网中 BLER 长期远低于 10% 是好事吗？",
              a: "不一定。这可能说明链路自适应过于保守，MCS 选得偏低，浪费了频谱效率。一般以初传 BLER 约 10% 为目标，在吞吐量和重传之间取得平衡。"
            }
          ],
          practice: "取一段下行吞吐量测试数据，画出 MCS、BLER、吞吐量随时间的曲线，观察三者的关系。"
        },
        {
          id: "s2-beam",
          title: "Massive MIMO 与波束管理",
          hours: 5,
          goals: [
            "理解 64T64R / 32T32R 等 AAU 配置的含义",
            "掌握波束管理的三个环节：波束扫描、测量上报、波束指示",
            "了解波束失败恢复（BFR）"
          ],
          concepts: ["AAU", "64T64R", "广播波束 / 业务波束", "TCI 状态", "QCL 关系", "波束失败恢复", "Type I / Type II 码本"],
          specs: [
            { id: "TS 38.214", note: "§5.1.5 天线端口 QCL；§5.2 CSI 码本" },
            { id: "TS 38.213", note: "§6 链路恢复" }
          ],
          quiz: [
            {
              q: "广播波束（SSB 波束）的配置会影响什么？",
              a: "影响覆盖范围和接入：SSB 波束的方向、宽度、数量决定了小区的同步和广播覆盖形状。现网常根据场景（广场、高楼、道路）选择不同的 SSB 波束模式来优化覆盖。"
            }
          ],
          practice: "了解你所在网络 AAU 的 SSB 波束配置方案（如 8 波束），结合实际地形分析为何选择这种方案。"
        }
      ]
    },

    // ───────────────────────── 阶段 3 ─────────────────────────
    {
      id: "s3",
      title: "NR 高层协议与接入网架构",
      summary: "协议栈各层的职责、RRC 状态机、随机接入与移动性，以及 gNB 内部的 CU/DU 拆分。",
      modules: [
        {
          id: "s3-stack",
          title: "NR 协议栈",
          hours: 4,
          goals: [
            "说出用户面 SDAP / PDCP / RLC / MAC / PHY 和控制面 RRC / NAS 的职责",
            "理解 SDAP 新增的意义：QoS 流到 DRB 的映射",
            "理解 RLC 的 TM / UM / AM 三种模式"
          ],
          concepts: ["SDAP：QoS 流 → DRB 映射", "PDCP：加密、完整性保护、重排序", "RLC：分段、ARQ", "MAC：调度、HARQ、复用", "SRB / DRB", "逻辑信道 / 传输信道"],
          specs: [
            { id: "TS 38.300", note: "§6 层二总体" },
            { id: "TS 37.324", note: "SDAP" },
            { id: "TS 38.323", note: "PDCP" },
            { id: "TS 38.322", note: "RLC" },
            { id: "TS 38.321", note: "MAC" }
          ],
          quiz: [
            {
              q: "5G 用户面比 LTE 多了哪一层？为什么？",
              a: "多了 SDAP。5G QoS 以 QoS 流（QFI 标识）为粒度，而空口以 DRB 承载数据，SDAP 负责把 QoS 流映射到 DRB，并在空口包头标记 QFI。LTE 中 EPS 承载与无线承载是一一对应的，不需要这一层。"
            }
          ],
          practice: "在终端日志中找一条 RRCReconfiguration，找到其中的 DRB 配置、PDCP 和 RLC 参数，理解每个参数对应哪一层。"
        },
        {
          id: "s3-rrc",
          title: "RRC 状态与系统消息",
          hours: 3,
          goals: [
            "掌握 RRC_IDLE、RRC_INACTIVE、RRC_CONNECTED 三态及转换",
            "理解 INACTIVE 态的价值：快速恢复、省电",
            "理解 RRC 状态与 CM / RM 状态的对应关系"
          ],
          concepts: ["RRC_IDLE", "RRC_INACTIVE", "RRC_CONNECTED", "RRCResume", "CM-IDLE / CM-CONNECTED", "RM-REGISTERED", "SIB1 / 按需系统消息"],
          specs: [
            { id: "TS 38.331", note: "§4.2.1 UE 状态；§5.3 连接控制" },
            { id: "TS 38.304", note: "空闲态与 INACTIVE 态过程" }
          ],
          quiz: [
            {
              q: "UE 处于 RRC_INACTIVE 时，核心网看到的是什么状态？",
              a: "CM-CONNECTED。INACTIVE 态下 UE 的上下文仍保留在 gNB 和核心网，N2 连接不释放，所以恢复时无需重新走完整的连接建立和核心网交互，时延和信令开销都更小。"
            }
          ],
          practice: "统计一段日志中 RRC 状态切换的次数和原因，判断网络是否启用了 INACTIVE 态。"
        },
        {
          id: "s3-access",
          title: "随机接入与 RRC 连接建立",
          hours: 4,
          goals: [
            "掌握四步随机接入（Msg1–Msg4）过程",
            "了解 R16 引入的两步随机接入（MsgA / MsgB）",
            "能从日志中分析接入失败的环节"
          ],
          concepts: ["PRACH 前导码", "RAR", "Msg3：RRCSetupRequest", "Msg4：竞争解决", "RRCSetupComplete 携带 NAS 消息", "两步 RACH", "竞争 / 非竞争随机接入"],
          specs: [
            { id: "TS 38.321", note: "§5.1 随机接入过程" },
            { id: "TS 38.213", note: "§8 随机接入" },
            { id: "TS 38.331", note: "§5.3.3 RRC 连接建立" }
          ],
          flow: `sequenceDiagram
    participant UE
    participant gNB
    participant AMF
    UE->>gNB: Msg1 随机接入前导（PRACH）
    gNB->>UE: Msg2 随机接入响应 RAR（TA、UL Grant、TC-RNTI）
    UE->>gNB: Msg3 RRCSetupRequest
    gNB->>UE: Msg4 RRCSetup（竞争解决）
    UE->>gNB: RRCSetupComplete（携带 NAS 注册请求）
    gNB->>AMF: NGAP Initial UE Message`,
          quiz: [
            {
              q: "终端反复发 Msg1 但收不到 Msg2，可能是什么原因？",
              a: "常见原因有：上行覆盖不足（前导功率不够）、PRACH 参数配置问题（根序列冲突、时域位置不匹配）、上行干扰、或基站侧未检测到。可先看 UE 发射功率是否已到上限，再查 PRACH 配置和底噪。"
            }
          ],
          practice: "在日志中找到一次完整的接入过程，标出 Msg1–Msg4 的时间戳，计算接入时延。"
        },
        {
          id: "s3-mobility",
          title: "移动性管理：测量与切换",
          hours: 5,
          goals: [
            "掌握 A1–A6、B1/B2 测量事件的含义",
            "理解连接态切换流程（基于 Xn 和基于 N2）",
            "理解空闲态小区重选与连接态切换的区别"
          ],
          concepts: ["A3 事件：邻区比服务区好一个偏置", "A2 / A5", "B1：NSA 添加辅节点", "TTT（触发时间）", "Hysteresis（迟滞）", "Xn 切换", "N2 切换", "条件切换 CHO（R16）", "小区重选"],
          specs: [
            { id: "TS 38.331", note: "§5.5 测量；§5.3.5 RRC 重配置" },
            { id: "TS 38.300", note: "§9 移动性与状态转换" },
            { id: "TS 38.304", note: "小区选择与重选" }
          ],
          quiz: [
            {
              q: "现网乒乓切换多，应该调哪些参数？",
              a: "可以适当增大 A3 偏置或迟滞、延长 TTT，让切换更“稳重”；同时检查是否存在覆盖重叠严重、缺少主导小区的区域，从根源上做覆盖优化。参数调整要兼顾不要造成切换过晚导致掉话。"
            }
          ],
          practice: "从一次切换的日志中找出 MeasurementReport、RRCReconfiguration（含 reconfigurationWithSync）和 RRCReconfigurationComplete，算出切换中断时间。"
        },
        {
          id: "s3-ran-arch",
          title: "NG-RAN 架构：CU / DU 与接口",
          hours: 3,
          goals: [
            "理解 gNB 拆分为 CU 和 DU，以及 CU-CP / CU-UP 的进一步拆分",
            "说出 NG、Xn、F1、E1 接口的作用",
            "了解前传、中传、回传的概念"
          ],
          concepts: ["gNB-CU / gNB-DU", "CU-CP / CU-UP", "F1 接口（F1AP）", "E1 接口", "NG 接口（NGAP / N3）", "Xn 接口", "前传 / 中传 / 回传", "eCPRI"],
          specs: [
            { id: "TS 38.401", note: "NG-RAN 总体架构" },
            { id: "TS 38.413", note: "NGAP" },
            { id: "TS 38.423", note: "XnAP" },
            { id: "TS 38.473", note: "F1AP" }
          ],
          quiz: [
            {
              q: "CU / DU 之间按什么协议层切分？",
              a: "3GPP 标准化的 F1 切分点在 PDCP 与 RLC 之间（高层切分 Option 2）：CU 包含 RRC、SDAP、PDCP，DU 包含 RLC、MAC、PHY。DU 与射频单元之间的低层切分（如 O-RAN 7.2x）不属于 3GPP F1 范畴。"
            }
          ],
          practice: "画出你所在网络的实际组网：AAU、BBU（或 CU/DU）、传输设备、核心网之间的连接关系和接口名称。"
        }
      ]
    },

    // ───────────────────────── 阶段 4 ─────────────────────────
    {
      id: "s4",
      title: "5G 核心网（5GC）",
      summary: "服务化架构、网元分工、QoS、切片与安全。理解 5GC 才能理解端到端。",
      modules: [
        {
          id: "s4-sba",
          title: "服务化架构与网元",
          hours: 5,
          goals: [
            "画出 5GC 服务化架构图，说出每个网元的职责",
            "理解 SBA 与传统点对点接口的区别",
            "理解 NRF 的服务注册与发现机制"
          ],
          concepts: ["AMF：接入与移动性", "SMF：会话管理", "UPF：用户面", "AUSF：鉴权服务", "UDM / UDR：签约数据", "PCF：策略", "NRF：服务发现", "NSSF：切片选择", "NEF：能力开放", "SBI（HTTP/2 + JSON）", "N1 / N2 / N3 / N4 / N6"],
          specs: [
            { id: "TS 23.501", note: "§4 架构；§6 网元功能" },
            { id: "TS 29.500", note: "SBA 技术实现" }
          ],
          quiz: [
            {
              q: "N2、N3、N4、N6 分别连接什么？",
              a: "N2：gNB ↔ AMF（控制面，NGAP）；N3：gNB ↔ UPF（用户面，GTP-U）；N4：SMF ↔ UPF（PFCP，下发转发规则）；N6：UPF ↔ 数据网络（如互联网）。"
            },
            {
              q: "4G 网元在 5GC 中大致对应什么？",
              a: "MME 的移动性管理 → AMF，会话管理 → SMF；SGW/PGW 用户面 → UPF，PGW 控制面 → SMF；HSS → UDM/AUSF；PCRF → PCF。"
            }
          ],
          practice: "用开源 5GC（如 free5GC 或 Open5GS）搭一套实验环境，跑通 NF 注册到 NRF 的过程，抓包观察 SBI 的 HTTP/2 消息。"
        },
        {
          id: "s4-registration",
          title: "注册流程",
          hours: 4,
          goals: [
            "掌握初始注册的完整流程和每一步的目的",
            "区分初始注册、移动性注册更新、周期性注册",
            "理解 5G-GUTI 与 SUCI 在注册中的使用"
          ],
          concepts: ["Registration Request / Accept / Complete", "注册类型", "5G-GUTI", "SUCI / SUPI", "AMF 选择", "UE 上下文"],
          specs: [
            { id: "TS 23.502", note: "§4.2.2.2 注册流程" },
            { id: "TS 24.501", note: "§5.5.1 注册过程（NAS）" }
          ],
          flow: `sequenceDiagram
    participant UE
    participant gNB
    participant AMF
    participant AUSF
    participant UDM
    UE->>gNB: RRC 建立 + Registration Request（SUCI 或 5G-GUTI）
    gNB->>AMF: NGAP Initial UE Message
    AMF->>AUSF: 鉴权请求
    AUSF->>UDM: 获取鉴权向量
    AMF->>UE: Authentication Request / Response
    AMF->>UE: NAS Security Mode Command / Complete
    AMF->>UDM: Nudm_UECM_Registration + 获取签约数据
    AMF->>UE: Registration Accept（分配 5G-GUTI、允许的切片）
    UE->>AMF: Registration Complete`,
          quiz: [
            {
              q: "UE 首次注册时发 SUCI 而不是 SUPI，为什么？",
              a: "SUPI（通常是 IMSI）是永久身份，明文传输会被窃听跟踪。SUCI 是用归属网络公钥加密后的 SUPI，只有归属网络（UDM 的 SIDF）能解密，解决了 4G 中 IMSI 明文暴露的隐私问题。"
            }
          ],
          practice: "在开源 5GC + 模拟终端（如 UERANSIM）环境中抓一次注册流程的包，按上图逐条对应 NAS 和 NGAP 消息。"
        },
        {
          id: "s4-pdu",
          title: "PDU 会话建立",
          hours: 4,
          goals: [
            "掌握 PDU 会话建立流程中 AMF、SMF、UPF、PCF 的交互",
            "理解 DNN、S-NSSAI、SSC 模式的含义",
            "理解 N4 会话如何把转发规则下发给 UPF"
          ],
          concepts: ["PDU 会话", "DNN（相当于 APN）", "S-NSSAI", "SSC 模式 1/2/3", "PFCP：PDR / FAR / QER", "UPF 选择", "N3 隧道（GTP-U TEID）"],
          specs: [
            { id: "TS 23.502", note: "§4.3.2 PDU 会话建立" },
            { id: "TS 29.244", note: "PFCP（N4）" }
          ],
          flow: `sequenceDiagram
    participant UE
    participant gNB
    participant AMF
    participant SMF
    participant PCF
    participant UPF
    UE->>AMF: PDU Session Establishment Request（NAS）
    AMF->>SMF: Nsmf_PDUSession_CreateSMContext
    SMF->>PCF: 获取会话策略（SM Policy）
    SMF->>UPF: N4 会话建立（PDR / FAR / QER）
    SMF->>AMF: N1N2MessageTransfer（NAS Accept + N2 信息）
    AMF->>gNB: PDU Session Resource Setup Request
    gNB->>UE: RRCReconfiguration（建立 DRB）
    gNB->>AMF: PDU Session Resource Setup Response（gNB 侧 TEID）
    AMF->>SMF: Nsmf_PDUSession_UpdateSMContext
    SMF->>UPF: N4 会话修改（下行隧道信息）`,
          quiz: [
            {
              q: "为什么 PDU 会话建立后还要做一次 N4 会话修改？",
              a: "N4 建立时 UPF 还不知道下行数据该发到 gNB 的哪个隧道端点。gNB 在资源建立响应中给出自己的 N3 TEID，SMF 再通过 N4 修改把它告诉 UPF，下行用户面才真正打通。"
            }
          ],
          practice: "在实验环境中抓包，找到 N3 上下行的 GTP-U TEID，并分别在 NGAP 和 PFCP 消息中定位它们是在哪一步分配的。"
        },
        {
          id: "s4-qos",
          title: "5G QoS 模型",
          hours: 3,
          goals: [
            "理解 QoS 流（QFI）作为 5G QoS 的最小粒度",
            "掌握 5QI、ARP、GBR / Non-GBR 的含义",
            "理解 QoS 规则在 UE、gNB、UPF 三处的作用"
          ],
          concepts: ["QoS 流 / QFI", "5QI", "5QI 1：语音（GBR）", "5QI 5：IMS 信令", "5QI 9：默认尽力而为", "ARP", "GFBR / MFBR", "Session-AMBR / UE-AMBR", "反射 QoS"],
          specs: [
            { id: "TS 23.501", note: "§5.7 QoS 模型；表 5.7.4-1 标准 5QI" },
            { id: "TS 23.503", note: "策略与计费控制" }
          ],
          quiz: [
            {
              q: "一个 PDU 会话里可以有多个 QoS 流吗？和 DRB 什么关系？",
              a: "可以。一个 PDU 会话可包含多个 QoS 流，每个由 QFI 标识；gNB 通过 SDAP 把一个或多个 QoS 流映射到 DRB，映射关系由 gNB 决定，比 4G 承载一一对应更灵活。"
            }
          ],
          practice: "查阅 TS 23.501 的标准 5QI 表，找出时延预算最小的几个 5QI，思考它们对应什么业务。"
        },
        {
          id: "s4-slicing",
          title: "网络切片",
          hours: 3,
          goals: [
            "理解切片的标识 S-NSSAI（SST + SD）",
            "理解 Requested / Allowed / Configured NSSAI 的区别",
            "理解切片选择过程以及无线侧、核心网侧如何保障切片"
          ],
          concepts: ["S-NSSAI = SST（8 位）+ SD（24 位，可选）", "SST 1 eMBB / 2 URLLC / 3 MIoT", "NSSAI", "NSSF", "切片隔离", "无线资源预留"],
          specs: [
            { id: "TS 23.501", note: "§5.15 网络切片" },
            { id: "TS 28.530", note: "切片管理" }
          ],
          quiz: [
            {
              q: "切片只是核心网的事吗？",
              a: "不是。端到端切片涉及无线（资源预留、调度优先级）、传输（如 FlexE / VPN 隔离）和核心网（专用 SMF/UPF 等）。只在核心网切而无线和传输不配合，无法保证切片的 SLA。"
            }
          ],
          practice: "调研一个国内行业专网案例（如电力、港口、矿山），分析它用的是哪种切片或专网方案。"
        },
        {
          id: "s4-security",
          title: "5G 安全",
          hours: 3,
          goals: [
            "理解 5G-AKA 与 EAP-AKA' 两种鉴权方式",
            "理解密钥层级：K → KAUSF → KSEAF → KAMF → 接入层 / NAS 层密钥",
            "了解 5G 相比 4G 的安全增强"
          ],
          concepts: ["5G-AKA", "EAP-AKA'", "SUCI 隐私保护", "SEAF", "密钥派生", "用户面完整性保护", "SEPP（漫游安全）"],
          specs: [
            { id: "TS 33.501", note: "§6.1 鉴权；§6.2 密钥层级" }
          ],
          quiz: [
            {
              q: "5G 相比 4G 在安全上主要增强了哪些？",
              a: "主要有：SUCI 加密永久身份；归属网络参与鉴权确认（拜访网络无法伪造鉴权结果）；支持用户面完整性保护；统一鉴权框架支持非 3GPP 接入；漫游间通过 SEPP 保护信令。"
            }
          ],
          practice: "在注册抓包中找到 Authentication Request 中的 RAND 和 AUTN，以及 Security Mode Command 中选定的加密和完整性算法。"
        }
      ]
    },

    // ───────────────────────── 阶段 5 ─────────────────────────
    {
      id: "s5",
      title: "端到端业务与信令",
      summary: "把无线和核心网串起来：一次开机上网、一次语音通话、一次寻呼背后发生了什么。",
      modules: [
        {
          id: "s5-e2e",
          title: "从开机到上网：端到端全流程",
          hours: 4,
          goals: [
            "能完整讲述 UE 开机到第一个数据包上网的全过程",
            "能把每一步对应到具体的协议、网元和接口"
          ],
          concepts: ["小区搜索", "系统消息读取", "随机接入", "RRC 建立", "注册", "PDU 会话建立", "用户面打通"],
          specs: [
            { id: "TS 38.300", note: "无线侧总体" },
            { id: "TS 23.502", note: "核心网流程" }
          ],
          quiz: [
            {
              q: "开机上网大致有哪几个大阶段？",
              a: "① 小区搜索与同步（SSB）→ ② 读取 MIB / SIB1 → ③ 随机接入与 RRC 建立 → ④ 注册（鉴权、安全、获取签约）→ ⑤ PDU 会话建立（分配 IP、建 DRB、打通 N3）→ ⑥ 开始收发数据。"
            }
          ],
          practice: "用一份完整的终端日志，从第一条 MIB 到第一个用户面数据，标注每个阶段的起止时间，形成你自己的“端到端时间线”。"
        },
        {
          id: "s5-paging",
          title: "服务请求与寻呼",
          hours: 3,
          goals: [
            "理解 UE 发起和网络发起的服务请求流程",
            "理解注册区（TAI List）与寻呼范围的关系",
            "理解 INACTIVE 态下的 RAN 寻呼"
          ],
          concepts: ["Service Request", "寻呼（Paging）", "TA / TAI List", "RAN 通知区（RNA）", "寻呼时机（PO / PF）", "DRX"],
          specs: [
            { id: "TS 23.502", note: "§4.2.3 服务请求" },
            { id: "TS 38.304", note: "§7 寻呼" }
          ],
          quiz: [
            {
              q: "TAI List 配得大有什么优缺点？",
              a: "优点是 UE 移动时注册更新少，节省信令和终端电量；缺点是寻呼时要在更大范围内寻呼，寻呼负荷增大。需要根据用户移动性和话务模型权衡。"
            }
          ],
          practice: "统计你所在网络的寻呼成功率和每 TA 的寻呼负荷，分析 TA 规划是否合理。"
        },
        {
          id: "s5-voice",
          title: "5G 语音：EPS Fallback 与 VoNR",
          hours: 4,
          goals: [
            "理解 5G 语音的两种方案：EPS Fallback 与 VoNR",
            "理解 IMS 在 5G 语音中的角色",
            "了解影响语音体验的关键指标：接续时延、掉话率、MOS"
          ],
          concepts: ["IMS", "P-CSCF", "SIP", "EPS Fallback", "VoNR", "5QI 1 / 5QI 5", "接续时延", "MOS"],
          specs: [
            { id: "TS 23.501", note: "§5.16.3 IMS 语音支持" },
            { id: "TS 23.502", note: "§4.13.6 EPS Fallback" },
            { id: "TS 23.228", note: "IMS 架构" }
          ],
          quiz: [
            {
              q: "EPS Fallback 的接续时延为什么比 VoNR 长？",
              a: "EPS Fallback 在呼叫建立过程中需要把 UE 从 5G 回落到 4G（通过重定向或切换），再在 LTE 上建立 VoLTE 承载，多了一次跨系统转换，因此接续时延更长；VoNR 直接在 5G 上建立语音 QoS 流。"
            }
          ],
          practice: "用支持 VoNR 的手机分别在开启和关闭 VoNR 时拨打电话，比较接续时延，并在日志中找到回落发生的时刻。"
        }
      ]
    },

    // ───────────────────────── 阶段 6 ─────────────────────────
    {
      id: "s6",
      title: "网络部署与优化",
      summary: "把理论落到现网：覆盖、干扰、KPI 和典型问题分析。",
      modules: [
        {
          id: "s6-kpi",
          tools: ["rate"],
          title: "关键 KPI 与无线测量",
          hours: 4,
          goals: [
            "掌握 SS-RSRP、SS-RSRQ、SS-SINR 的含义和经验门限",
            "掌握接入性、保持性、移动性、资源利用、速率五大类 KPI",
            "理解 KPI 的计数器统计口径"
          ],
          concepts: ["SS-RSRP / SS-RSRQ / SS-SINR", "RRC 建立成功率", "无线掉线率", "切换成功率", "PRB 利用率", "上下行用户平均速率", "性能计数器"],
          specs: [
            { id: "TS 38.215", note: "物理层测量定义" },
            { id: "TS 28.552", note: "5G 性能测量" },
            { id: "TS 28.554", note: "5G 端到端 KPI" }
          ],
          quiz: [
            {
              q: "RSRP 好但速率低，可能是什么原因？",
              a: "常见原因：SINR 差（干扰大、重叠覆盖严重）、小区负荷高（PRB 利用率高、用户多）、Rank 低（无法多流传输）、传输或核心网瓶颈、终端能力限制。RSRP 只反映信号强度，不反映信号质量和资源情况。"
            }
          ],
          practice: "取一个小区一周的 KPI 数据，找出指标最差的时段，结合话务量分析原因。"
        },
        {
          id: "s6-coverage",
          title: "覆盖与干扰优化",
          hours: 5,
          goals: [
            "理解上下行覆盖不平衡问题与上行覆盖增强手段",
            "掌握重叠覆盖、越区覆盖、弱覆盖的识别与处理",
            "了解 TDD 远端干扰和大气波导干扰"
          ],
          concepts: ["链路预算", "上行覆盖受限", "重叠覆盖", "越区覆盖", "天线下倾角 / 方位角", "大气波导干扰", "远端干扰", "上行底噪"],
          specs: [
            { id: "TS 38.104", note: "基站射频指标" },
            { id: "TS 38.101-1", note: "终端射频指标（FR1）" }
          ],
          quiz: [
            {
              q: "为什么 5G 中高频段往往是上行覆盖受限？",
              a: "终端发射功率远小于基站（通常 23–26 dBm 对比基站数百瓦），且 3.5 GHz 等中频段路径损耗大；TDD 上行时隙占比又少。因此常用上下行解耦（SUL）、载波聚合到低频、DFT-s-OFDM 等方式增强上行。"
            }
          ],
          practice: "选一段路测数据，用 RSRP 和 SINR 画出覆盖分布图，找出重叠覆盖区域并提出天线调整建议。"
        },
        {
          id: "s6-troubleshoot",
          title: "典型问题分析方法",
          hours: 5,
          goals: [
            "建立从现象 → 指标 → 信令 → 根因的分析思路",
            "掌握接入失败、掉线、切换失败、低速率四类问题的排查套路",
            "学会把问题定界到无线、传输、核心网或终端"
          ],
          concepts: ["问题定界", "信令跟踪", "RRC Reestablishment", "RLF（无线链路失败）", "T310 / N310", "切换失败原因", "端到端拨测"],
          specs: [
            { id: "TS 38.331", note: "§5.3.10 无线链路失败；§5.3.7 RRC 重建" }
          ],
          quiz: [
            {
              q: "RLF 是怎么判定的？",
              a: "物理层连续上报 N310 次失步（out-of-sync）后启动 T310 定时器；若 T310 超时前未收到足够的同步指示（N311 次 in-sync）则判定 RLF。此外随机接入失败、RLC 达到最大重传次数等也会触发 RLF。"
            }
          ],
          practice: "整理你遇到过的 3 个典型问题，按“现象 → 关键指标 → 关键信令 → 根因 → 解决方案”的格式写成案例，这是最好的复习。"
        }
      ]
    },

    // ───────────────────────── 阶段 7 ─────────────────────────
    {
      id: "s7",
      title: "演进与前沿",
      summary: "R16 以后的增强、5G-Advanced，以及通往 6G 的方向。",
      modules: [
        {
          id: "s7-r16-r17",
          title: "R16 / R17 关键增强",
          hours: 4,
          goals: [
            "了解 URLLC 与工业物联网（TSN 集成）增强",
            "了解 RedCap 轻量化终端的定位与能力裁剪",
            "了解 NTN 卫星接入的基本原理与挑战"
          ],
          concepts: ["URLLC 增强", "TSN 集成", "NR-V2X", "NR 定位", "RedCap", "NTN", "IAB（接入回传一体化）", "NR-U"],
          specs: [
            { id: "TS 38.300", note: "各 Release 新增章节（RedCap、NTN 等）" },
            { id: "TS 23.501", note: "§5.27/5.28 TSN 相关" }
          ],
          quiz: [
            {
              q: "RedCap 终端相比普通 5G 终端裁剪了什么？",
              a: "主要裁剪带宽（FR1 最大 20 MHz）、天线数（最少 1 收）、支持半双工 FDD 等，从而降低成本和功耗，面向可穿戴设备、视频监控、工业传感器等中速率场景。"
            }
          ],
          practice: "调研国内 RedCap 商用进展，列出已支持的模组和典型应用场景。"
        },
        {
          id: "s7-advanced",
          title: "5G-Advanced 与 6G 展望",
          hours: 3,
          goals: [
            "了解 5G-Advanced（R18 起）的主要方向",
            "了解 AI/ML 与空口、网络运维结合的研究",
            "了解 6G（IMT-2030）的时间线与关键技术方向"
          ],
          concepts: ["5G-Advanced", "AI/ML 空口", "网络节能", "XR 增强", "通感一体化", "IMT-2030", "R20：6G 研究启动"],
          specs: [
            { id: "3GPP R18/R19", note: "5G-Advanced 工作项" },
            { id: "ITU-R M.2160", note: "IMT-2030 框架建议书" }
          ],
          quiz: [
            {
              q: "5G-Advanced 和 6G 是什么关系？",
              a: "5G-Advanced 是 5G 的持续演进（R18、R19 等），在现有 5G 框架上增强；6G 是面向 2030 年的新一代系统，3GPP 从 R20 开始 6G 研究。5G-Advanced 中的很多研究（如 AI 原生、通感一体）是通往 6G 的过渡。"
            }
          ],
          practice: "选一个你最感兴趣的 6G 方向，读一份运营商或设备商的公开白皮书，写 500 字总结。"
        }
      ]
    }
  ]
};
