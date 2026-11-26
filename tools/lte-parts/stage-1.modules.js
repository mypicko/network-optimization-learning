// 阶段 1 网络架构与标识
module.exports = {
  id: "L1", title: "网络架构与标识",
  summary: "搭起 LTE 的“地图”：网元和接口怎么连、协议栈怎么分层、承载怎么串起来、频点怎么换算、各种标识各管什么，看信令和工参时才不会迷路。",
  modules: [
    {
      id: "lte-arch",
      title: "E-UTRAN 与 EPC 架构、接口",
      hours: 4,
      goals: [
        "能画出 eNB、MME、S-GW、P-GW、HSS、PCRF 的组网图并标出接口名称",
        "说清 eNB 与 MME、S-GW 的功能分工，理解控制面与用户面分离",
        "掌握 X2、S1-MME、S1-U、S11、S5/S8、S6a、Gx、SGi 等接口的作用和协议",
        "理解 S1-Flex、MME Pool 的意义以及它对容灾和负荷分担的价值"
      ],
      concepts: ["eNB（演进型基站）", "MME / S-GW / P-GW", "HSS 与 PCRF", "控制面与用户面分离", "X2 与 S1 接口", "S11、S5/S8、S6a、SGi", "S1-Flex 与 MME Pool", "与 2G/3G 及 CS 域的互通接口（S3、S4、SGs、Sv）"],
      specs: [
        { id: "TS 36.300", note: "E-UTRAN 总体描述与功能划分" },
        { id: "TS 23.401", note: "EPS 架构、网元功能与参考点" },
        { id: "TS 36.413", note: "S1AP" },
        { id: "TS 36.423", note: "X2AP" }
      ],
      quiz: [
        {
          q: "S1-MME 和 S1-U 分别连到哪里，承载什么，用什么协议？",
          a: "S1-MME 连接 eNB 与 MME，承载控制信令，协议栈为 S1AP / SCTP / IP；S1-U 连接 eNB 与 S-GW，承载用户数据，协议栈为 GTP-U / UDP / IP。两者分离体现了控制面与用户面分离的设计。"
        },
        {
          q: "X2 接口没配或断了，会有什么影响？",
          a: "X2 主要用于切换和小区间协调（负荷信息、干扰协调等）。X2 不可用时，eNB 间切换只能走 S1 切换，经 MME 中转，时延更长、信令更多；ANR 自动邻区、ICIC 等依赖 X2 的功能也会受影响，但业务一般不会中断。"
        },
        {
          q: "为什么一个 eNB 要同时连多个 MME（S1-Flex）？",
          a: "一组 MME 组成 MME Pool 共同服务一片区域，eNB 连到池内多台 MME，可以按权重为新用户选择 MME，实现负荷分担；某台 MME 故障时，用户可被其他 MME 接管，提高可靠性，也减少了跨 MME 的移动性信令。"
        }
      ],
      practice: "不看资料，在纸上画出 EPS 组网图：网元 eNB、MME、S-GW、P-GW、HSS、PCRF、外部 PDN，标出每个接口名、承载的是控制面还是用户面、传输层协议（SCTP / UDP / Diameter 等）；再与 TS 23.401 的非漫游架构图核对。"
    },
    {
      id: "lte-stack",
      title: "协议栈与无线承载",
      hours: 4,
      goals: [
        "画出 Uu 口控制面与用户面协议栈，说清 NAS、RRC、PDCP、RLC、MAC、PHY 各层职责",
        "掌握 RLC 三种模式（TM / UM / AM）及适用场景",
        "掌握逻辑信道、传输信道、物理信道的分类与映射关系",
        "理解 SRB0/1/2、DRB 以及 EPS 承载 = 无线承载 + S1 承载 + S5/S8 承载的端到端结构"
      ],
      concepts: ["NAS / RRC", "PDCP：头压缩 ROHC、加密、完整性保护", "RLC：TM / UM / AM", "MAC：复用、HARQ、调度", "逻辑 / 传输 / 物理信道映射", "SRB0 / SRB1 / SRB2", "DRB 与 E-RAB", "EPS 承载与 TEID"],
      specs: [
        { id: "TS 36.300", note: "无线协议架构与信道映射" },
        { id: "TS 36.321", note: "MAC" },
        { id: "TS 36.322", note: "RLC" },
        { id: "TS 36.323", note: "PDCP" }
      ],
      quiz: [
        {
          q: "SRB1 和 SRB2 有什么区别？",
          a: "两者都映射到 DCCH、RLC 用 AM 模式。SRB1 在 RRC 连接建立时就建立，承载 RRC 消息和捎带的 NAS 消息；SRB2 在安全激活后随 RRC 重配建立，专门承载 NAS 消息，优先级低于 SRB1。SRB0 则用于 CCCH 上的 RRC 连接建立 / 重建类消息，RLC 为 TM 模式。"
        },
        {
          q: "VoLTE 语音包和 FTP 下载分别适合哪种 RLC 模式，为什么？",
          a: "语音对时延敏感、能容忍少量丢包，重传反而会让包过时，适合 UM 模式；FTP 要求数据完整，适合 AM 模式，靠 ARQ 重传保证可靠。TM 模式不加头，只用于 BCCH、PCCH 和 SRB0 等少数场景。"
        },
        {
          q: "LTE 的完整性保护作用在哪些数据上？",
          a: "LTE 的 PDCP 只对控制面（SRB 上的 RRC 信令）做完整性保护，对用户面只做加密不做完整性保护（中继节点等特殊场景除外）。NAS 消息另有 NAS 层的加密和完整性保护，在 MME 与 UE 之间完成。"
        }
      ],
      practice: "拿一份公开的 LTE 信令日志样例（或路测软件自带的演示日志），找出一条 RRCConnectionSetup 和一条 RRCConnectionReconfiguration，标出其中 SRB / DRB 的配置：RLC 模式、逻辑信道号、eps-BearerIdentity 与 drb-Identity 的对应关系。"
    },
    {
      id: "lte-bands",
      title: "频段、EARFCN 与 FDD / TDD",
      hours: 3,
      goals: [
        "认识 3GPP 定义的常用 LTE 频段（Band 1/3/5/8/28/34/38/39/40/41 等）及其双工方式",
        "能用 TS 36.101 的公式在 EARFCN 与中心频率之间互相换算",
        "比较 FDD 与 TDD 在频谱使用、上下行配比、同步要求和干扰特点上的差异"
      ],
      concepts: ["Band 编号与双工方式", "上下行频率与双工间隔", "EARFCN 与 100 kHz 信道栅格", "F_DL = F_DL_low + 0.1 × (N_DL − N_Offs-DL)", "FDD 成对频谱", "TDD 非成对频谱与上下行配比", "TDD 全网同步与远端干扰", "保护带与载波间隔"],
      specs: [
        { id: "TS 36.101", note: "UE 射频要求（工作频段表、EARFCN 换算）" },
        { id: "TS 36.104", note: "基站射频要求" },
        { id: "TS 36.211", note: "帧结构类型 1（FDD）/ 类型 2（TDD）" }
      ],
      quiz: [
        {
          q: "Band 3 的下行 EARFCN 为 1650，中心频率是多少？对应的上行 EARFCN 和频率呢？",
          a: "Band 3 下行 F_DL_low = 1805 MHz、N_Offs-DL = 1200，F_DL = 1805 + 0.1 × (1650 − 1200) = 1850 MHz。上行 N_Offs-UL = 19200、F_UL_low = 1710 MHz，上行 EARFCN 默认为 1650 + 18000 = 19650，F_UL = 1710 + 0.1 × (19650 − 19200) = 1755 MHz，双工间隔 95 MHz。（示例计算）"
        },
        {
          q: "为什么 TD-LTE 网络要求全网严格时间同步？",
          a: "TDD 上下行共用同一频率、按时间切换。若相邻基站时间不同步或上下行配比不一致，一个基站在发下行时另一个基站正在收上行，强下行信号会直接干扰上行接收，造成严重的基站间干扰。因此通常依靠 GPS / 北斗或 1588v2 实现全网同步，并统一上下行配比。"
        }
      ],
      practice: "按 TS 36.101 的工作频段表，自己做一个 EARFCN 换算小表（Excel 公式或 Python 函数均可），至少覆盖 Band 1、3、8、38、39、40、41；再用手机工程模式读取当前服务小区的 EARFCN，换算出频率并判断频段和双工方式。"
    },
    {
      id: "lte-ids",
      title: "标识体系：IMSI、GUTI、TAI、ECGI、PCI",
      hours: 3,
      goals: [
        "掌握用户类标识（IMSI、IMEI、MSISDN、GUTI、S-TMSI）的结构与使用场合",
        "掌握位置与网络类标识（TAI、ECGI、eNB ID、GUMMEI）的组成",
        "理解 PCI 的 504 个取值如何由 PSS / SSS 组合而成，以及模 3 / 模 6 / 模 30 规则的来源",
        "认识空口常用 RNTI 和 S1 / X2 上的 UE 标识，能在信令中识别它们"
      ],
      concepts: ["IMSI = MCC + MNC + MSIN", "GUTI = GUMMEI + M-TMSI", "S-TMSI = MMEC + M-TMSI", "TAI = PLMN + TAC，TA List", "ECGI = PLMN + ECI（eNB ID + Cell ID）", "PCI = 3 × N_ID(1) + N_ID(2)", "C-RNTI / RA-RNTI / P-RNTI / SI-RNTI", "MME UE S1AP ID / eNB UE S1AP ID"],
      specs: [
        { id: "TS 23.003", note: "编号、寻址与标识" },
        { id: "TS 36.211", note: "同步信号与物理小区标识" },
        { id: "TS 36.321", note: "RNTI 取值" },
        { id: "TS 36.413", note: "S1AP 中的 UE 标识" }
      ],
      quiz: [
        {
          q: "为什么空口上尽量用 GUTI / S-TMSI 而不是 IMSI？",
          a: "IMSI 是用户永久身份，明文在空口传输会被截获和跟踪用户。GUTI 由 MME 分配并可定期重分配，S-TMSI 是它的缩短形式，用于寻呼和 RRC 连接请求，既保护隐私又节省空口比特。只有在网络无法识别临时标识时才会要求 UE 上报 IMSI。"
        },
        {
          q: "某 eNB ID 为 456789，小区的 Cell ID 为 2，ECI 是多少？",
          a: "宏站 ECI 共 28 位，高 20 位为 eNB ID、低 8 位为 Cell ID，所以 ECI = 456789 × 256 + 2 = 116937986（示例）。在工参、话统和信令中经常需要在 ECI 与 eNB ID + Cell ID 之间换算。"
        },
        {
          q: "两个邻区 PCI 模 3 相同会有什么问题？",
          a: "PCI 模 3 的结果就是 N_ID(2)，决定了 PSS 序列，也影响 2/4 端口时 CRS 的频域位置。邻区模 3 相同，CRS 会在相同 RE 上互相干扰，导致 RSRP 测量偏差、SINR 下降，在重叠覆盖区尤为明显，PCI 规划时应尽量避免（详见 6.2）。"
        }
      ],
      practice: "用手机工程模式或路测软件记录当前服务小区的 PLMN、TAC、ECI、PCI、EARFCN，把 ECI 拆成 eNB ID + Cell ID，把 PCI 拆成 N_ID(1) 与 N_ID(2)，并计算 PCI 模 3、模 6、模 30 的值；移动一段距离后重复，观察哪些标识变了。"
    }
  ]
};
