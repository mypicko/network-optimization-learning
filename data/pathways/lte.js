// 4G LTE 学习路径数据（由 tools/lte-parts/build.cjs 从各阶段编写稿合成，改内容请改 tools/lte-parts/ 后重新生成）
// 结构同 data/pathways/5g.js：pathway → stages（阶段）→ modules（模块）；xref 为跨路线互链
window.PATHWAYS = window.PATHWAYS || {};

window.PATHWAYS["lte"] = {
  "id": "lte",
  "title": "4G LTE",
  "subtitle": "从 OFDMA 物理层到 EPC 核心网、语音互操作与网优，面向一线从业者的 LTE 系统化路径",
  "audience": "无线 / 核心网 / 网优工程师，以及需要系统掌握 LTE 的通信从业者",
  "version": "以 3GPP R8–R14 为主线",
  "stages": [
    {
      "id": "L0",
      "title": "无线与系统基础",
      "summary": "先弄清 LTE 从哪里来、要解决什么问题，再打牢 OFDMA / SC-FDMA 与多天线这两块物理层地基，后面所有阶段都建立在这里。",
      "modules": [
        {
          "id": "lte-evolution",
          "title": "从 2G/3G 到 LTE：演进与 EPS 总体",
          "hours": 3,
          "goals": [
            "能说清 GSM → UMTS/HSPA → LTE → LTE-A 的演进脉络和各代的关键版本",
            "理解 LTE 的设计目标：全 IP、扁平化、低时延、带宽可伸缩",
            "能画出 EPS（E-UTRAN + EPC）的总体结构，并说出它与 3G 网络的主要区别",
            "理解 LTE 取消电路域带来的后果：语音要靠 CSFB 或 VoLTE"
          ],
          "concepts": [
            "3GPP 版本（R8 / R10 / R13）",
            "LTE 与 SAE",
            "EPS = E-UTRAN + EPC",
            "取消 RNC 的扁平架构",
            "纯分组域（无 CS 域）",
            "带宽可伸缩 1.4–20 MHz",
            "IMT-Advanced 与 LTE-Advanced",
            "TD-LTE 与 LTE FDD"
          ],
          "specs": [
            {
              "id": "TR 25.913",
              "note": "E-UTRA / E-UTRAN 需求（LTE 设计目标）"
            },
            {
              "id": "TS 36.300",
              "note": "E-UTRAN 总体描述"
            },
            {
              "id": "TS 23.401",
              "note": "EPS 总体架构（E-UTRAN 接入）"
            }
          ],
          "quiz": [
            {
              "q": "LTE 为什么要取消 RNC，把它的功能放到哪里去了？",
              "a": "取消 RNC 是为了减少用户面和控制面的节点跳数，降低时延和组网成本。原 RNC 的无线资源管理、调度、加密、头压缩等功能下沉到 eNB，移动性管理等控制功能上移到核心网的 MME，形成 eNB 直连 EPC 的扁平架构。"
            },
            {
              "q": "LTE 网络没有电路域，终端怎么打电话？",
              "a": "早期主要靠 CSFB：来去电时把终端回落到 2G/3G 的电路域完成通话；成熟阶段用 VoLTE，把语音作为 IMS 上的 IP 业务承载在 LTE 上，并用 SRVCC 解决移出 LTE 覆盖时的语音连续性。详见阶段 5。"
            },
            {
              "q": "人们常说 LTE R8 是“3.9G”，LTE-A 才是“真 4G”，这种说法依据是什么？",
              "a": "ITU 对 4G（IMT-Advanced）提出的指标（如低速场景 1 Gbps 峰值）R8 并未满足，3GPP 在 R10 推出 LTE-Advanced（载波聚合、更多层 MIMO 等）后才作为 IMT-Advanced 候选技术获认可。不过商用和市场宣传上 R8 LTE 普遍称为 4G。"
            }
          ],
          "practice": "整理一张“2G / 3G / 4G 对照表”：列出各代的接入技术、核心网组成（CS / PS 域）、是否有 RNC/BSC 这类控制器、典型峰值速率，并用手机工程模式或 “设置 → 关于手机 → 状态” 查看自己当前驻留的网络制式。",
          "xref": [
            {
              "t": "5g",
              "m": "s1-scenarios",
              "note": "5G 要解决什么新问题"
            }
          ]
        },
        {
          "id": "lte-ofdma",
          "title": "OFDMA 与 SC-FDMA",
          "hours": 4,
          "goals": [
            "理解 OFDM 如何用正交子载波和循环前缀对抗多径",
            "掌握 LTE 的时频资源基本单位：子载波 15 kHz、RE、RB（12 子载波 × 1 时隙）",
            "能由信道带宽说出对应的 RB 数，并估算资源格的 RE 数量",
            "说清上行为什么采用 SC-FDMA（DFT-s-OFDM）以及由此带来的调度约束"
          ],
          "concepts": [
            "正交子载波",
            "循环前缀 CP（常规 / 扩展）",
            "子载波间隔 15 kHz",
            "资源粒子 RE",
            "资源块 RB = 12 × 7 符号",
            "信道带宽与 RB 数",
            "PAPR（峰均比）",
            "SC-FDMA = DFT 扩展 OFDM",
            "QPSK / 16QAM / 64QAM"
          ],
          "specs": [
            {
              "id": "TS 36.211",
              "note": "物理信道与调制（资源格、OFDM / SC-FDMA 信号生成）"
            },
            {
              "id": "TS 36.101",
              "note": "UE 射频要求（信道带宽与传输带宽配置）"
            },
            {
              "id": "TS 36.104",
              "note": "基站射频要求"
            }
          ],
          "quiz": [
            {
              "q": "20 MHz 的 LTE 载波有 100 个 RB，只占 18 MHz，剩下的 2 MHz 干什么用？",
              "a": "100 × 180 kHz = 18 MHz 是传输带宽，两侧余下的约 1 MHz 作为保护带，用来满足邻道泄漏和频谱模板要求，防止干扰相邻载波。1.4 MHz 带宽只有 6 个 RB（1.08 MHz），保护带占比更大。"
            },
            {
              "q": "循环前缀越长越好吗？LTE 为什么同时定义常规 CP 和扩展 CP？",
              "a": "CP 越长越能抵抗大时延扩展，但 CP 不承载数据，越长开销越大。常规 CP（约 4.7 μs）满足绝大多数场景，每时隙 7 个符号；扩展 CP（约 16.7 μs）用于超大小区或 MBSFN 等时延扩展很大的场景，每时隙只剩 6 个符号。"
            },
            {
              "q": "上行 SC-FDMA 给终端分配 RB 时有什么限制？",
              "a": "R8 上行要求一个终端的 PUSCH 占用频域连续的 RB（R10 起支持两簇非连续分配），且 RB 数需满足 2、3、5 的幂次乘积，以便 DFT 实现。这是为了保持单载波特性、降低 PAPR，代价是调度灵活度下降。"
            }
          ],
          "practice": "用 Excel 或 Python 自己算一张表：1.4 / 3 / 5 / 10 / 15 / 20 MHz 各自的 RB 数、子载波数、每 1 ms 子帧的 RE 总数（常规 CP），并估算 20 MHz、64QAM、单层、扣除约 25% 开销后的物理层速率（示例计算，标出你的假设）。",
          "xref": [
            {
              "t": "5g",
              "m": "s0-ofdm",
              "note": "NR 的灵活参数集"
            }
          ]
        },
        {
          "id": "lte-mimo",
          "title": "LTE 多天线与传输模式",
          "hours": 4,
          "goals": [
            "区分发射分集、空间复用、波束赋形三类多天线技术的目的和适用场景",
            "掌握 LTE 下行 TM1–TM10 的特点、对应天线端口和参考信号",
            "理解 CQI / PMI / RI 反馈与开环 / 闭环的关系",
            "能从路测或基站配置中判断小区使用的传输模式并解释速率表现"
          ],
          "concepts": [
            "发射分集（SFBC）",
            "空间复用与秩（Rank）",
            "码字与层",
            "预编码与码本",
            "CQI / PMI / RI",
            "传输模式 TM1–TM10",
            "天线端口（CRS 0–3、DMRS 5/7–14、CSI-RS 15–22）",
            "单 / 双流波束赋形",
            "MU-MIMO"
          ],
          "specs": [
            {
              "id": "TS 36.213",
              "note": "物理层过程（传输模式、CSI 上报）"
            },
            {
              "id": "TS 36.211",
              "note": "层映射、预编码与参考信号"
            },
            {
              "id": "TS 36.306",
              "note": "UE 无线接入能力（UE 类别）"
            }
          ],
          "quiz": [
            {
              "q": "TM3 和 TM4 都是空间复用，现网为什么常把高速移动场景配成 TM3？",
              "a": "TM4 是闭环空间复用，依赖 UE 上报的 PMI 选择预编码；高速移动时信道变化快，PMI 上报到使用时已经过时，反而性能下降。TM3 是开环（大时延 CDD），不依赖 PMI，只用 RI 和 CQI，对信道变化更鲁棒。"
            },
            {
              "q": "终端 RI 长期为 1，但 SINR 很高，可能是什么原因？",
              "a": "空间复用需要信道有足够的“秩”，即多条不相关的传播路径。常见原因有：视距强径环境导致天线间相关性高、天线极化或安装问题（如两路馈线接反、一路故障）、传输模式被配置为发射分集或单流波束赋形、终端只有单接收天线等。"
            }
          ],
          "practice": "用路测软件或手机工程模式（部分机型可显示）记录 TM、RI、CQI 与 SINR，分别在近点、中点、远点各采样一段，整理 RI=2 的比例与 SINR 的关系；没有路测条件时，可阅读 TS 36.213 中传输模式表格，自己整理一张 TM 与 DCI 格式、天线端口对照表。"
        }
      ]
    },
    {
      "id": "L1",
      "title": "网络架构与标识",
      "summary": "搭起 LTE 的“地图”：网元和接口怎么连、协议栈怎么分层、承载怎么串起来、频点怎么换算、各种标识各管什么，看信令和工参时才不会迷路。",
      "modules": [
        {
          "id": "lte-arch",
          "title": "E-UTRAN 与 EPC 架构、接口",
          "hours": 4,
          "goals": [
            "能画出 eNB、MME、S-GW、P-GW、HSS、PCRF 的组网图并标出接口名称",
            "说清 eNB 与 MME、S-GW 的功能分工，理解控制面与用户面分离",
            "掌握 X2、S1-MME、S1-U、S11、S5/S8、S6a、Gx、SGi 等接口的作用和协议",
            "理解 S1-Flex、MME Pool 的意义以及它对容灾和负荷分担的价值"
          ],
          "concepts": [
            "eNB（演进型基站）",
            "MME / S-GW / P-GW",
            "HSS 与 PCRF",
            "控制面与用户面分离",
            "X2 与 S1 接口",
            "S11、S5/S8、S6a、SGi",
            "S1-Flex 与 MME Pool",
            "与 2G/3G 及 CS 域的互通接口（S3、S4、SGs、Sv）"
          ],
          "specs": [
            {
              "id": "TS 36.300",
              "note": "E-UTRAN 总体描述与功能划分"
            },
            {
              "id": "TS 23.401",
              "note": "EPS 架构、网元功能与参考点"
            },
            {
              "id": "TS 36.413",
              "note": "S1AP"
            },
            {
              "id": "TS 36.423",
              "note": "X2AP"
            }
          ],
          "quiz": [
            {
              "q": "S1-MME 和 S1-U 分别连到哪里，承载什么，用什么协议？",
              "a": "S1-MME 连接 eNB 与 MME，承载控制信令，协议栈为 S1AP / SCTP / IP；S1-U 连接 eNB 与 S-GW，承载用户数据，协议栈为 GTP-U / UDP / IP。两者分离体现了控制面与用户面分离的设计。"
            },
            {
              "q": "X2 接口没配或断了，会有什么影响？",
              "a": "X2 主要用于切换和小区间协调（负荷信息、干扰协调等）。X2 不可用时，eNB 间切换只能走 S1 切换，经 MME 中转，时延更长、信令更多；ANR 自动邻区、ICIC 等依赖 X2 的功能也会受影响，但业务一般不会中断。"
            },
            {
              "q": "为什么一个 eNB 要同时连多个 MME（S1-Flex）？",
              "a": "一组 MME 组成 MME Pool 共同服务一片区域，eNB 连到池内多台 MME，可以按权重为新用户选择 MME，实现负荷分担；某台 MME 故障时，用户可被其他 MME 接管，提高可靠性，也减少了跨 MME 的移动性信令。"
            }
          ],
          "practice": "不看资料，在纸上画出 EPS 组网图：网元 eNB、MME、S-GW、P-GW、HSS、PCRF、外部 PDN，标出每个接口名、承载的是控制面还是用户面、传输层协议（SCTP / UDP / Diameter 等）；再与 TS 23.401 的非漫游架构图核对。"
        },
        {
          "id": "lte-stack",
          "title": "协议栈与无线承载",
          "hours": 4,
          "goals": [
            "画出 Uu 口控制面与用户面协议栈，说清 NAS、RRC、PDCP、RLC、MAC、PHY 各层职责",
            "掌握 RLC 三种模式（TM / UM / AM）及适用场景",
            "掌握逻辑信道、传输信道、物理信道的分类与映射关系",
            "理解 SRB0/1/2、DRB 以及 EPS 承载 = 无线承载 + S1 承载 + S5/S8 承载的端到端结构"
          ],
          "concepts": [
            "NAS / RRC",
            "PDCP：头压缩 ROHC、加密、完整性保护",
            "RLC：TM / UM / AM",
            "MAC：复用、HARQ、调度",
            "逻辑 / 传输 / 物理信道映射",
            "SRB0 / SRB1 / SRB2",
            "DRB 与 E-RAB",
            "EPS 承载与 TEID"
          ],
          "specs": [
            {
              "id": "TS 36.300",
              "note": "无线协议架构与信道映射"
            },
            {
              "id": "TS 36.321",
              "note": "MAC"
            },
            {
              "id": "TS 36.322",
              "note": "RLC"
            },
            {
              "id": "TS 36.323",
              "note": "PDCP"
            }
          ],
          "quiz": [
            {
              "q": "SRB1 和 SRB2 有什么区别？",
              "a": "两者都映射到 DCCH、RLC 用 AM 模式。SRB1 在 RRC 连接建立时就建立，承载 RRC 消息和捎带的 NAS 消息；SRB2 在安全激活后随 RRC 重配建立，专门承载 NAS 消息，优先级低于 SRB1。SRB0 则用于 CCCH 上的 RRC 连接建立 / 重建类消息，RLC 为 TM 模式。"
            },
            {
              "q": "VoLTE 语音包和 FTP 下载分别适合哪种 RLC 模式，为什么？",
              "a": "语音对时延敏感、能容忍少量丢包，重传反而会让包过时，适合 UM 模式；FTP 要求数据完整，适合 AM 模式，靠 ARQ 重传保证可靠。TM 模式不加头，只用于 BCCH、PCCH 和 SRB0 等少数场景。"
            },
            {
              "q": "LTE 的完整性保护作用在哪些数据上？",
              "a": "LTE 的 PDCP 只对控制面（SRB 上的 RRC 信令）做完整性保护，对用户面只做加密不做完整性保护（中继节点等特殊场景除外）。NAS 消息另有 NAS 层的加密和完整性保护，在 MME 与 UE 之间完成。"
            }
          ],
          "practice": "拿一份公开的 LTE 信令日志样例（或路测软件自带的演示日志），找出一条 RRCConnectionSetup 和一条 RRCConnectionReconfiguration，标出其中 SRB / DRB 的配置：RLC 模式、逻辑信道号、eps-BearerIdentity 与 drb-Identity 的对应关系。",
          "xref": [
            {
              "t": "5g",
              "m": "s3-stack",
              "note": "NR 协议栈新增的 SDAP"
            }
          ]
        },
        {
          "id": "lte-bands",
          "title": "频段、EARFCN 与 FDD / TDD",
          "hours": 3,
          "goals": [
            "认识 3GPP 定义的常用 LTE 频段（Band 1/3/5/8/28/34/38/39/40/41 等）及其双工方式",
            "能用 TS 36.101 的公式在 EARFCN 与中心频率之间互相换算",
            "比较 FDD 与 TDD 在频谱使用、上下行配比、同步要求和干扰特点上的差异"
          ],
          "concepts": [
            "Band 编号与双工方式",
            "上下行频率与双工间隔",
            "EARFCN 与 100 kHz 信道栅格",
            "F_DL = F_DL_low + 0.1 × (N_DL − N_Offs-DL)",
            "FDD 成对频谱",
            "TDD 非成对频谱与上下行配比",
            "TDD 全网同步与远端干扰",
            "保护带与载波间隔"
          ],
          "specs": [
            {
              "id": "TS 36.101",
              "note": "UE 射频要求（工作频段表、EARFCN 换算）"
            },
            {
              "id": "TS 36.104",
              "note": "基站射频要求"
            },
            {
              "id": "TS 36.211",
              "note": "帧结构类型 1（FDD）/ 类型 2（TDD）"
            }
          ],
          "quiz": [
            {
              "q": "Band 3 的下行 EARFCN 为 1650，中心频率是多少？对应的上行 EARFCN 和频率呢？",
              "a": "Band 3 下行 F_DL_low = 1805 MHz、N_Offs-DL = 1200，F_DL = 1805 + 0.1 × (1650 − 1200) = 1850 MHz。上行 N_Offs-UL = 19200、F_UL_low = 1710 MHz，上行 EARFCN 默认为 1650 + 18000 = 19650，F_UL = 1710 + 0.1 × (19650 − 19200) = 1755 MHz，双工间隔 95 MHz。（示例计算）"
            },
            {
              "q": "为什么 TD-LTE 网络要求全网严格时间同步？",
              "a": "TDD 上下行共用同一频率、按时间切换。若相邻基站时间不同步或上下行配比不一致，一个基站在发下行时另一个基站正在收上行，强下行信号会直接干扰上行接收，造成严重的基站间干扰。因此通常依靠 GPS / 北斗或 1588v2 实现全网同步，并统一上下行配比。"
            }
          ],
          "practice": "按 TS 36.101 的工作频段表，自己做一个 EARFCN 换算小表（Excel 公式或 Python 函数均可），至少覆盖 Band 1、3、8、38、39、40、41；再用手机工程模式读取当前服务小区的 EARFCN，换算出频率并判断频段和双工方式。"
        },
        {
          "id": "lte-ids",
          "title": "标识体系：IMSI、GUTI、TAI、ECGI、PCI",
          "hours": 3,
          "goals": [
            "掌握用户类标识（IMSI、IMEI、MSISDN、GUTI、S-TMSI）的结构与使用场合",
            "掌握位置与网络类标识（TAI、ECGI、eNB ID、GUMMEI）的组成",
            "理解 PCI 的 504 个取值如何由 PSS / SSS 组合而成，以及模 3 / 模 6 / 模 30 规则的来源",
            "认识空口常用 RNTI 和 S1 / X2 上的 UE 标识，能在信令中识别它们"
          ],
          "concepts": [
            "IMSI = MCC + MNC + MSIN",
            "GUTI = GUMMEI + M-TMSI",
            "S-TMSI = MMEC + M-TMSI",
            "TAI = PLMN + TAC，TA List",
            "ECGI = PLMN + ECI（eNB ID + Cell ID）",
            "PCI = 3 × N_ID(1) + N_ID(2)",
            "C-RNTI / RA-RNTI / P-RNTI / SI-RNTI",
            "MME UE S1AP ID / eNB UE S1AP ID"
          ],
          "specs": [
            {
              "id": "TS 23.003",
              "note": "编号、寻址与标识"
            },
            {
              "id": "TS 36.211",
              "note": "同步信号与物理小区标识"
            },
            {
              "id": "TS 36.321",
              "note": "RNTI 取值"
            },
            {
              "id": "TS 36.413",
              "note": "S1AP 中的 UE 标识"
            }
          ],
          "quiz": [
            {
              "q": "为什么空口上尽量用 GUTI / S-TMSI 而不是 IMSI？",
              "a": "IMSI 是用户永久身份，明文在空口传输会被截获和跟踪用户。GUTI 由 MME 分配并可定期重分配，S-TMSI 是它的缩短形式，用于寻呼和 RRC 连接请求，既保护隐私又节省空口比特。只有在网络无法识别临时标识时才会要求 UE 上报 IMSI。"
            },
            {
              "q": "某 eNB ID 为 456789，小区的 Cell ID 为 2，ECI 是多少？",
              "a": "宏站 ECI 共 28 位，高 20 位为 eNB ID、低 8 位为 Cell ID，所以 ECI = 456789 × 256 + 2 = 116937986（示例）。在工参、话统和信令中经常需要在 ECI 与 eNB ID + Cell ID 之间换算。"
            },
            {
              "q": "两个邻区 PCI 模 3 相同会有什么问题？",
              "a": "PCI 模 3 的结果就是 N_ID(2)，决定了 PSS 序列，也影响 2/4 端口时 CRS 的频域位置。邻区模 3 相同，CRS 会在相同 RE 上互相干扰，导致 RSRP 测量偏差、SINR 下降，在重叠覆盖区尤为明显，PCI 规划时应尽量避免（详见 6.2）。"
            }
          ],
          "practice": "用手机工程模式或路测软件记录当前服务小区的 PLMN、TAC、ECI、PCI、EARFCN，把 ECI 拆成 eNB ID + Cell ID，把 PCI 拆成 N_ID(1) 与 N_ID(2)，并计算 PCI 模 3、模 6、模 30 的值；移动一段距离后重复，观察哪些标识变了。"
        }
      ]
    },
    {
      "id": "L2",
      "title": "物理层",
      "summary": "从 10 ms 无线帧和资源网格出发，依次拆解小区搜索与系统消息、上下行物理信道和参考信号，再落到调度、AMC、HARQ、功率控制与 DRX，建立“空口资源怎么分、怎么用”的完整图景。",
      "modules": [
        {
          "id": "lte-frame",
          "title": "帧结构与 TDD 上下行配置",
          "hours": 4,
          "goals": [
            "能画出 LTE 无线帧、子帧、时隙、符号的层级关系并说出各自时长",
            "能说出 PRB 的定义以及 1.4–20 MHz 各带宽对应的 PRB 数",
            "能读懂 TDD 上下行配置 0–6 和特殊子帧配置，并估算上下行资源比例",
            "理解 GP 长度与覆盖距离、TDD 邻区同步之间的关系"
          ],
          "concepts": [
            "Ts 基本时间单位",
            "10 ms 无线帧 / 1 ms 子帧 / 0.5 ms 时隙",
            "常规 CP 与扩展 CP",
            "RE、RB、PRB",
            "帧结构类型 1（FDD）与类型 2（TDD）",
            "TDD 上下行配置 0–6",
            "特殊子帧 DwPTS / GP / UpPTS",
            "5 ms 与 10 ms 转换周期"
          ],
          "specs": [
            {
              "id": "TS 36.211",
              "note": "§4 帧结构；§6.2 下行资源网格"
            },
            {
              "id": "TS 36.101",
              "note": "信道带宽与传输带宽配置（PRB 数）"
            }
          ],
          "quiz": [
            {
              "q": "为什么 20 MHz 的 LTE 小区只用 100 个 PRB（18 MHz），而不是把 20 MHz 用满？",
              "a": "100 个 PRB × 180 kHz = 18 MHz，剩余约 2 MHz 作为两侧保护带，用来满足邻道泄漏和频谱模板要求，避免干扰相邻载波。LTE 的带宽利用率约 90%，1.4 MHz 带宽只有 6 个 PRB，利用率更低。"
            },
            {
              "q": "TDD 配置 2 搭配特殊子帧 10:2:2，与配置 1 相比对用户感知有什么影响？",
              "a": "配置 2 每 5 ms 只有 1 个上行子帧，下行资源更多、下行峰值速率更高，但上行容量减少，上行 HARQ 反馈和调度时延也会变长。适合下行业务为主的场景；上行业务多（如视频上传、上行密集话务）时配置 1 更均衡。"
            },
            {
              "q": "相邻 TDD 小区可以使用不同的上下行配置吗？",
              "a": "原则上同频相邻小区必须采用相同的上下行配置和帧同步，否则一个小区在发下行时另一个小区在收上行，会产生基站对基站、终端对终端的交叉时隙干扰。因此 TDD 网络通常要求全网 GPS/北斗等时间同步并统一配置。"
            }
          ],
          "practice": "用手机工程模式或路测软件查看一个 TDD-LTE 小区的 subframeAssignment 和 specialSubframePatterns，画出该小区 10 ms 内每个子帧的 D/S/U 分布，并计算下行符号占比（示例计算即可）。"
        },
        {
          "id": "lte-cellsearch",
          "title": "小区搜索与系统消息",
          "hours": 4,
          "goals": [
            "能按顺序说出开机小区搜索的步骤以及每步获得的信息",
            "能根据 PSS/SSS 计算 PCI，理解 504 个 PCI 的构成",
            "能说出 MIB、SIB1、SIB2 各自承载的关键参数",
            "理解 SI 窗口调度与系统消息变更通知机制"
          ],
          "concepts": [
            "PSS / SSS 与中心 72 子载波",
            "PCI = 3 × N_ID(1) + N_ID(2)",
            "PBCH 与 MIB（40 ms TTI）",
            "SFN 系统帧号",
            "SIB1（80 ms 周期）",
            "SI 消息与 SI 窗口",
            "SI-RNTI",
            "systemInfoValueTag 与修改周期"
          ],
          "specs": [
            {
              "id": "TS 36.211",
              "note": "§6.11 同步信号；§6.6 PBCH"
            },
            {
              "id": "TS 36.331",
              "note": "§5.2 系统信息；MIB 与 SIB 定义"
            },
            {
              "id": "TS 36.304",
              "note": "小区选择"
            }
          ],
          "quiz": [
            {
              "q": "终端如何从 PSS 和 SSS 得到 10 ms 帧定时？",
              "a": "PSS 每 5 ms 重复一次且两次内容相同，只能给出 5 ms 定时和 N_ID(2)。SSS 在子帧 0 和子帧 5 使用不同的交织顺序，终端检测出是哪一个，就能区分前后半帧，得到 10 ms 帧边界，同时得到 N_ID(1)。"
            },
            {
              "q": "MIB 只给了 SFN 的高 8 位，终端怎么得到完整的 10 位 SFN？",
              "a": "PBCH 的传输周期是 40 ms，在 4 个连续无线帧中各发送一次（不同加扰段）。终端解出 MIB 时，根据成功解码所对应的是 40 ms 内的第几个 10 ms 段，推出 SFN 的低 2 位。"
            },
            {
              "q": "运营维护修改了一个小区的 SIB2 参数，驻留在该小区的空闲态终端是怎么知道的？",
              "a": "eNB 在当前修改周期内通过寻呼消息中的 systemInfoModification 指示通知终端，并在下一个修改周期边界开始发送新内容；同时 SIB1 中的 systemInfoValueTag 会改变。终端据此在下一个修改周期重新读取系统消息。"
            }
          ],
          "practice": "用 QXDM/路测软件或开源 srsRAN 的日志，抓一次开机驻留过程，按时间顺序找到 MIB、SIB1、SIB2 的解码记录，列出 dl-Bandwidth、TAC、q-RxLevMin、prach-ConfigIndex 等参数的取值。"
        },
        {
          "id": "lte-dl",
          "title": "下行物理信道与参考信号",
          "hours": 5,
          "goals": [
            "能说出 PBCH、PCFICH、PHICH、PDCCH、PDSCH 各自的作用和位置",
            "理解 CCE、聚合等级、搜索空间与 DCI 格式的关系",
            "能画出 CRS 端口 0–3 在一个 RB 内的分布，估算 CRS 开销",
            "能区分 CRS、DM-RS、CSI-RS 的用途及对应传输模式"
          ],
          "concepts": [
            "控制区与数据区",
            "CFI 与 PCFICH",
            "PHICH 组与 Ng",
            "REG / CCE / 聚合等级 1、2、4、8",
            "公共与 UE 专用搜索空间",
            "DCI 格式与 RNTI",
            "CRS 端口 0–3 与 PCI mod 6 频移",
            "DM-RS 与 CSI-RS",
            "PDSCH 资源分配类型 0/1/2"
          ],
          "specs": [
            {
              "id": "TS 36.211",
              "note": "§6 下行物理信道与参考信号"
            },
            {
              "id": "TS 36.212",
              "note": "§5.3.3 DCI 格式"
            },
            {
              "id": "TS 36.213",
              "note": "§7 PDSCH 相关过程；§9 PDCCH 相关过程"
            }
          ],
          "quiz": [
            {
              "q": "为什么小区用户多时会出现“PDCCH 拥塞”，有哪些常见缓解手段？",
              "a": "每个被调度的 UE 都需要占用若干 CCE 发 DCI，覆盖差的 UE 还要用高聚合等级（4 或 8），控制区 CCE 总数有限，就会出现 DCI 放不下、调度失败。常见手段包括提高 CFI（增加控制区符号）、优化覆盖以降低聚合等级、调整 PHICH 资源（Ng）、在支持的版本中使用 EPDCCH 等，具体做法因厂家而异。"
            },
            {
              "q": "4 端口 CRS 比 2 端口 CRS 多了什么开销？",
              "a": "端口 2、3 在每个时隙的第 2 个符号（符号 1）上各增加参考信号 RE，每 RB 对每子帧 CRS 总 RE 从 16 个增加到 24 个，开销从约 9.5% 增加到约 14.3%，换来更多发射分集或空间复用层的可能。"
            },
            {
              "q": "RSRP 测的是哪个参考信号？为什么空载小区也能测到稳定的 RSRP？",
              "a": "RSRP 基于 CRS 测量（通常是端口 0，必要时含端口 1）。CRS 在全带宽、每个下行子帧都发送，与是否有业务无关，所以空载小区的 RSRP 依然稳定；而 RSRQ、SINR 会随邻区负载变化。"
            }
          ],
          "practice": "画一个 RB 对（12 子载波 × 14 符号）的网格，按 PCI = 你自编的一个示例值，标出 2 端口 CRS 和 CFI = 2 时控制区的 RE 位置，数一数剩余可用于 PDSCH 的 RE 数。"
        },
        {
          "id": "lte-ul",
          "title": "上行物理信道、PRACH 与 SRS",
          "hours": 5,
          "goals": [
            "能说出 PUSCH、PUCCH、PRACH 的作用及资源位置",
            "能区分 PUCCH 格式 1/1a/1b/2/2a/2b/3 承载的 UCI",
            "掌握 PRACH 格式 0–4 的适用场景以及根序列、Ncs 与小区半径的关系",
            "理解上行 DMRS 与 SRS 的用途和 PCI mod 30 规则的来源"
          ],
          "concepts": [
            "SC-FDMA 与连续 RB 分配",
            "PUSCH 与 UCI 复用",
            "PUCCH 位于带宽边缘、时隙间跳频",
            "PUCCH 格式 1/2/3",
            "PRACH 格式 0–4，占用 6 个 PRB",
            "64 个前导与根序列",
            "zeroCorrelationZoneConfig（Ncs）",
            "上行 DMRS 与序列组",
            "SRS 周期与非周期",
            "时间提前 TA"
          ],
          "specs": [
            {
              "id": "TS 36.211",
              "note": "§5 上行物理信道与参考信号（§5.7 PRACH）"
            },
            {
              "id": "TS 36.213",
              "note": "§10 PUCCH 相关过程；SRS 过程"
            },
            {
              "id": "TS 36.321",
              "note": "§5.1 随机接入过程（MAC 侧）"
            }
          ],
          "quiz": [
            {
              "q": "为什么 LTE 上行 PUSCH 要求分配连续的 RB？",
              "a": "上行采用 SC-FDMA（DFT 扩展 OFDM），映射到连续子载波上才能保持单载波特性和较低的峰均比，从而降低终端功放回退、提升覆盖和续航。R10 引入了簇状分配放宽此限制，但基本形态仍以连续分配为主。"
            },
            {
              "q": "小区覆盖半径变大时，PRACH 规划要跟着调哪些参数？",
              "a": "需要更大的 Ncs（zeroCorrelationZoneConfig），使循环移位窗口能容纳更大的往返时延；Ncs 变大后一个根序列能生成的前导变少，需要更多根序列凑够 64 个，根序列规划的复用距离也会变紧。超远覆盖时还需要换用 CP 更长的 PRACH 格式（如格式 1 或 3）。"
            },
            {
              "q": "SRS 在 TDD 系统中有什么特别价值？",
              "a": "TDD 上下行同频，信道具有互易性，基站用 SRS 估计上行信道后可直接用于下行波束赋形（如 TM7/TM8 等），不依赖终端反馈 PMI；同时 SRS 也用于上行频选调度。"
            }
          ],
          "practice": "设定一个示例小区半径（如 5 km），用讲解中的近似公式估算所需 Ncs，查表选择 zeroCorrelationZoneConfig，并计算凑满 64 个前导需要几个根序列。"
        },
        {
          "id": "lte-sched",
          "title": "调度、AMC 与 HARQ",
          "hours": 4,
          "goals": [
            "理解 1 ms TTI 调度的基本流程及常见调度算法的取舍",
            "能读懂 CQI 表和 MCS 表，说出 CQI → MCS → TBS 的链路",
            "掌握 FDD 与 TDD 下的 HARQ 时序、进程数与同步 / 异步特性",
            "能用 TBS 表估算单用户峰值速率"
          ],
          "concepts": [
            "1 ms TTI 调度",
            "轮询 / 最大 C/I / 比例公平",
            "CQI / PMI / RI",
            "周期与非周期 CSI 上报",
            "MCS 0–28 与 29–31",
            "TBS 索引与 TBS 表",
            "目标误块率 10%",
            "HARQ 8 进程与 n+4 时序",
            "上行同步 / 下行异步 HARQ",
            "SR、BSR、PHR"
          ],
          "specs": [
            {
              "id": "TS 36.213",
              "note": "§7.1.7 MCS 与 TBS；§7.2 CSI 上报；§8 PUSCH 相关过程"
            },
            {
              "id": "TS 36.321",
              "note": "§5.3 / §5.4 HARQ、SR、BSR、PHR"
            },
            {
              "id": "TS 36.306",
              "note": "UE 能力等级"
            }
          ],
          "quiz": [
            {
              "q": "UE 上报 CQI = 15，但实际调度的 MCS 一直不高，可能是什么原因？",
              "a": "常见原因有：基站对 CQI 做了外环修正（根据 ACK/NACK 统计调整偏置，误码多会下调）；可用 PRB 少或用户多导致资源分摊；终端能力或配置不支持更高阶调制；控制区开销、RI 只有 1 层等。需要结合 BLER、RI、PRB 利用率一起看。"
            },
            {
              "q": "为什么 LTE 上行 HARQ 采用同步方式，下行采用异步方式？",
              "a": "上行同步 HARQ 的重传时刻固定（FDD 为 8 ms 后），非自适应重传只需 PHICH 发 NACK，不必再发 PDCCH，节省控制开销。下行异步 HARQ 由 DCI 显式指示进程号，调度更灵活，基站可按信道和负载决定何时重传。"
            },
            {
              "q": "估算：20 MHz FDD、2 层空间复用、64QAM 最高 MCS 时的峰值速率约多少？",
              "a": "100 PRB、I_TBS = 26 时单层 TBS 为 75376 bit，每 1 ms 一个 TB，单层约 75 Mbit/s，两层约 150 Mbit/s，这就是常说的 Cat4 下行峰值约 150 Mbit/s 的来源（未计 256QAM 与载波聚合）。"
            }
          ],
          "practice": "在路测或工程模式日志中记录一段时间内的 CQI、RI、MCS、调度 PRB 数和初传 BLER，作散点或时序对比，判断 AMC 是否跟得上信道变化（无现网数据可用开源 srsRAN 仿真日志）。"
        },
        {
          "id": "lte-power",
          "title": "功率控制与 DRX",
          "hours": 3,
          "goals": [
            "能写出 PUSCH 功控公式并解释 P0、α、PL、ΔTF、f(i) 的含义",
            "理解 PUCCH、SRS、PRACH 功控与 PUSCH 的差异",
            "理解下行 referenceSignalPower 与 PA/PB 的关系",
            "能说出连接态 DRX 各定时器的作用以及时延与省电的取舍"
          ],
          "concepts": [
            "开环 + 闭环功控",
            "P0-NominalPUSCH 与 P0-UE-PUSCH",
            "部分路损补偿因子 α",
            "TPC 累积与绝对模式",
            "Pcmax 与功率余量 PHR",
            "referenceSignalPower",
            "PA / PB",
            "连接态 DRX：onDuration / InactivityTimer / 长短周期",
            "空闲态寻呼 DRX"
          ],
          "specs": [
            {
              "id": "TS 36.213",
              "note": "§5 功率控制"
            },
            {
              "id": "TS 36.321",
              "note": "§5.7 DRX"
            },
            {
              "id": "TS 36.304",
              "note": "§7 寻呼"
            }
          ],
          "quiz": [
            {
              "q": "把 α 从 1 调到 0.8，对小区内的近点和远点用户分别有什么影响？",
              "a": "α 小于 1 时路损只被部分补偿：远点用户（路损大）的发射功率相对降低，对邻区的上行干扰减小，但自身 SINR 和速率下降；近点用户影响较小。整体上倾向于提升小区平均频谱效率、牺牲部分边缘用户速率，通常需要配合 P0 一起调整。"
            },
            {
              "q": "连接态 DRX 的 drx-InactivityTimer 设置过短或过长分别会怎样？",
              "a": "过短：一次调度后很快进入睡眠，突发数据到来时要等到下一个 onDuration，时延变大；过长：数据结束后终端仍长时间监听 PDCCH，耗电增加。实际取值要结合业务（如 VoLTE 的 20 ms 包间隔）和省电目标折中。"
            }
          ],
          "practice": "在终端日志中找到一次 RRC 重配置里的 drx-Config 和 uplinkPowerControlDedicated 字段，记录 onDurationTimer、longDRX-Cycle、p0-UE-PUSCH 等取值，解释每个参数对时延 / 耗电 / 上行干扰的影响。"
        }
      ]
    },
    {
      "id": "L3",
      "title": "高层协议与空口流程",
      "summary": "沿着终端从开机驻留、接入、测量、切换到掉线重建的完整生命周期，打通 LTE 空口控制面（RRC / MAC）的主线流程，并了解载波聚合等 LTE-A 关键技术。这是读懂信令日志和做网优的基本功。",
      "modules": [
        {
          "id": "lte-rrc",
          "title": "RRC 状态、空闲态与小区重选",
          "hours": 4,
          "goals": [
            "说清 LTE 两种 RRC 状态（RRC_IDLE / RRC_CONNECTED）各自的行为以及与 ECM 状态的对应关系",
            "能用 S 准则判断一个小区能否驻留，并能手算 Srxlev",
            "掌握基于优先级的异频 / 异系统重选和基于 R 准则的同频重选规则",
            "能从 SIB3 / SIB4 / SIB5 中读出重选参数，并解释它们对驻留行为的影响"
          ],
          "concepts": [
            "RRC_IDLE / RRC_CONNECTED",
            "适合小区 / 可接受小区",
            "S 准则（Srxlev、Squal）",
            "q-RxLevMin",
            "cellReselectionPriority",
            "threshX-High / threshX-Low / threshServingLow",
            "R 准则（Qhyst、Qoffset）",
            "Treselection",
            "s-IntraSearch / s-NonIntraSearch"
          ],
          "specs": [
            {
              "id": "TS 36.304",
              "note": "空闲态过程：小区选择、重选、寻呼"
            },
            {
              "id": "TS 36.331",
              "note": "RRC 状态与系统消息 SIB3–SIB8 的参数定义"
            },
            {
              "id": "TS 36.133",
              "note": "空闲态测量与重选的性能要求"
            }
          ],
          "quiz": [
            {
              "q": "某高优先级异频频点信号很好，但终端迟迟不重选过去，可能是哪些原因？",
              "a": "先看目标频点的 Srxlev（或 Squal）是否持续高于 threshX-High 达到 Treselection；再确认终端在当前小区驻留已超过 1 秒；还要检查 SIB5 中该频点是否真的配置了更高的 cellReselectionPriority、是否在 RRCConnectionRelease 中下发了专用优先级覆盖了广播优先级，以及目标小区是否被禁止（barred）。"
            },
            {
              "q": "为什么同频重选要给服务小区加 Qhyst？",
              "a": "Qhyst 让邻区必须比服务小区好出一个迟滞量才能排到第一，配合 Treselection 可以抑制终端在两个信号相近的小区之间来回重选（乒乓重选），减少无谓的 TAU 和寻呼丢失风险。代价是重选变“迟钝”，取值过大会导致终端驻留在较差小区。"
            }
          ],
          "practice": "用手机工程模式或路测软件记录空闲态下的服务小区 RSRP / RSRQ，结合公开的 SIB3 参数（可从路测软件解码的系统消息里读）手算 Srxlev 和 R 值，观察一次同频重选发生前后数值是否符合 R 准则。"
        },
        {
          "id": "lte-access",
          "title": "随机接入与 RRC 连接建立",
          "hours": 4,
          "goals": [
            "掌握竞争随机接入 Msg1–Msg4 的内容与 RA-RNTI、TC-RNTI、竞争解决机制",
            "区分竞争与非竞争随机接入及各自的触发场景",
            "画出 RRCConnectionRequest 到 Initial Context Setup 的完整信令流程",
            "能按信令分段定位接入失败的原因"
          ],
          "concepts": [
            "PRACH 前导（64 个 / 小区）",
            "RA-RNTI",
            "RAR：TA、UL Grant、TC-RNTI",
            "RRCConnectionRequest（S-TMSI / 随机数、establishmentCause）",
            "竞争解决 MAC CE",
            "RRCConnectionSetup / SetupComplete",
            "T300 与 RRCConnectionReject",
            "接入等级限制（ACB）",
            "S1AP Initial UE Message / Initial Context Setup"
          ],
          "specs": [
            {
              "id": "TS 36.321",
              "note": "MAC 层随机接入过程"
            },
            {
              "id": "TS 36.331",
              "note": "RRC 连接建立、安全模式、RRC 重配置"
            },
            {
              "id": "TS 36.300",
              "note": "随机接入与连接建立总体描述"
            },
            {
              "id": "TS 36.413",
              "note": "S1AP：Initial UE Message、Initial Context Setup"
            }
          ],
          "flow": "sequenceDiagram\n    participant UE\n    participant eNB\n    participant MME\n    UE->>eNB: Msg1 随机接入前导（PRACH）\n    eNB->>UE: Msg2 随机接入响应 RAR（TA、UL Grant、TC-RNTI）\n    UE->>eNB: Msg3 RRCConnectionRequest（S-TMSI 或随机数、建立原因）\n    eNB->>UE: Msg4 竞争解决 + RRCConnectionSetup（建立 SRB1）\n    UE->>eNB: RRCConnectionSetupComplete（携带 NAS 消息）\n    eNB->>MME: S1AP Initial UE Message\n    MME->>eNB: S1AP Initial Context Setup Request（E-RAB、安全密钥）\n    eNB->>UE: SecurityModeCommand\n    UE->>eNB: SecurityModeComplete\n    eNB->>UE: RRCConnectionReconfiguration（SRB2、DRB、测量配置）\n    UE->>eNB: RRCConnectionReconfigurationComplete\n    eNB->>MME: S1AP Initial Context Setup Response",
          "quiz": [
            {
              "q": "Msg3 中的 RRCConnectionRequest 为什么有时携带 S-TMSI，有时携带随机数？",
              "a": "终端已在该网络注册、持有有效 GUTI 时，用 S-TMSI 作为初始标识，便于 MME 定位上下文；没有有效 S-TMSI（如首次开机附着）时，携带 40 比特随机数。无论哪种，基站都会在 Msg4 的竞争解决 MAC CE 里回显 Msg3 内容，终端比对一致即竞争成功。"
            },
            {
              "q": "RRC 连接建立成功率正常，但 E-RAB 建立成功率偏低，应该往哪查？",
              "a": "说明问题出在 RRCConnectionSetupComplete 之后：可能是 MME 拒绝（看 NAS 拒绝原因和 S1AP 失败原因）、安全模式失败、基站准入拒绝（资源不足），或 RRCConnectionReconfiguration 下发后终端不回 Complete（空口质量差、终端不支持配置）。按 Initial Context Setup 请求到响应之间的每一步排查。"
            }
          ],
          "practice": "在路测软件或公开的 LTE 信令样例日志中，找一次完整的接入过程，标出 Msg1 到 RRCConnectionReconfigurationComplete 每条消息的时间戳，算出控制面接入时延，并指出哪一段耗时最长。",
          "xref": [
            {
              "t": "5g",
              "m": "s3-access",
              "note": "NR 随机接入与两步 RACH"
            }
          ]
        },
        {
          "id": "lte-meas",
          "title": "测量配置与测量事件",
          "hours": 4,
          "goals": [
            "说出 measObject、reportConfig、measId、quantityConfig、measGapConfig 的作用和绑定关系",
            "写出 A1–A6、B1、B2 事件的进入条件并理解各偏置项含义",
            "理解迟滞、TTT、层 3 滤波对上报时机的影响",
            "知道什么时候需要测量间隙以及 s-Measure 的作用"
          ],
          "concepts": [
            "measObjectEUTRA",
            "reportConfigEUTRA / reportConfigInterRAT",
            "measId",
            "A3：Mn + Ofn + Ocn − Hys > Mp + Ofp + Ocp + Off",
            "Hysteresis / timeToTrigger",
            "层 3 滤波（filterCoefficient）",
            "测量间隙 gp0 / gp1",
            "s-Measure",
            "周期上报与事件上报"
          ],
          "specs": [
            {
              "id": "TS 36.331",
              "note": "测量配置、测量事件与测量报告"
            },
            {
              "id": "TS 36.133",
              "note": "RSRP / RSRQ 测量上报映射与测量性能要求"
            },
            {
              "id": "TS 36.214",
              "note": "RSRP、RSRQ、RSSI 的物理层定义"
            }
          ],
          "quiz": [
            {
              "q": "同频切换常用 A3，异频切换为什么常配 A2 + A5（或 A4）的组合？",
              "a": "异频测量通常需要测量间隙，会占用调度时间、影响速率，所以不能一直开。先用 A2（服务小区差于门限）启动异频测量和 gap，再用 A5（服务差于门限 1 且邻区好于门限 2）或 A4 触发切换，服务小区恢复后用 A1 停止测量。这样只在需要时才付出测量代价。"
            },
            {
              "q": "增大 timeToTrigger 会带来什么影响？",
              "a": "条件需要持续满足更长时间才上报，可以过滤信号短时波动，减少乒乓和误切换；但在高速场景或信号快速衰落时会导致切换过晚，增加掉线风险。通常结合迟滞和 CIO 一起调整，不同场景（高铁、室分）取值不同。"
            }
          ],
          "practice": "在一份测量控制消息（RRCConnectionReconfiguration 中的 measConfig）里，画出 measObject、reportConfig、measId 的对应关系表，并写出每个 A3 / A2 事件换算成 dB 的实际门限、迟滞和 TTT。"
        },
        {
          "id": "lte-ho",
          "title": "切换：X2、S1 与异系统",
          "hours": 5,
          "goals": [
            "完整描述基于 X2 的切换流程（准备、执行、完成三阶段）",
            "说清 S1 切换与 X2 切换的触发条件和信令差异",
            "了解 LTE 到 UTRAN / GERAN 的 PS 切换与重定向两种方式",
            "能根据信令定位切换准备失败和切换执行失败"
          ],
          "concepts": [
            "切换准备 / 执行 / 完成",
            "X2AP Handover Request / Acknowledge",
            "mobilityControlInfo 与 T304",
            "SN Status Transfer 与数据前转",
            "Path Switch Request",
            "S1AP Handover Required / Handover Command",
            "MobilityFromEUTRACommand",
            "重定向（redirectedCarrierInfo）",
            "End Marker"
          ],
          "specs": [
            {
              "id": "TS 36.300",
              "note": "Intra-E-UTRAN 与 Inter-RAT 移动性总体流程"
            },
            {
              "id": "TS 36.423",
              "note": "X2AP 切换相关过程"
            },
            {
              "id": "TS 36.413",
              "note": "S1AP 切换与路径转换过程"
            },
            {
              "id": "TS 23.401",
              "note": "基于 X2 / S1 的切换与异系统切换（核心网侧）"
            }
          ],
          "flow": "sequenceDiagram\n    participant UE\n    participant S as 源 eNB\n    participant T as 目标 eNB\n    participant MME\n    participant SGW\n    UE->>S: MeasurementReport（如 A3 事件）\n    S->>T: X2AP Handover Request\n    T->>S: Handover Request Acknowledge（含切换命令）\n    S->>UE: RRCConnectionReconfiguration（mobilityControlInfo）\n    S->>T: SN Status Transfer + 数据前转\n    UE->>T: 随机接入（通常为非竞争）\n    UE->>T: RRCConnectionReconfigurationComplete\n    T->>MME: S1AP Path Switch Request\n    MME->>SGW: Modify Bearer Request\n    SGW->>MME: Modify Bearer Response\n    MME->>T: Path Switch Request Acknowledge\n    T->>S: X2AP UE Context Release",
          "quiz": [
            {
              "q": "什么情况下会走 S1 切换而不是 X2 切换？",
              "a": "源、目标 eNB 之间没有 X2 接口或 X2 不可用；需要更换 MME（跨 MME Pool）；目标 eNB 拒绝 X2 切换；或运营商策略禁止 X2 切换。S1 切换由 MME 中转切换准备信令，时延更长，跨 MME 时还要经 S10 接口。"
            },
            {
              "q": "终端收到切换命令后在目标小区接入失败，会发生什么？",
              "a": "终端收到 mobilityControlInfo 后启动 T304，若 T304 超时仍未完成目标小区随机接入，即判定切换失败，回退到原配置并发起 RRC 连接重建，重建原因为 handoverFailure（见 3.5）。重建能否成功取决于所选小区是否有该终端上下文。"
            }
          ],
          "practice": "在一次切换信令中找出 MeasurementReport、带 mobilityControlInfo 的 RRCConnectionReconfiguration、目标小区 RRCConnectionReconfigurationComplete，计算“测量报告到切换命令”的准备时延和“切换命令到 Complete”的执行时延，并判断这是 X2 还是 S1 切换。",
          "xref": [
            {
              "t": "5g",
              "m": "s3-mobility",
              "note": "NR 的测量与切换"
            }
          ]
        },
        {
          "id": "lte-rlf",
          "title": "无线链路失败与 RRC 重建",
          "hours": 3,
          "goals": [
            "说清 RLF 的三类触发条件以及 N310 / T310 / N311 的作用",
            "掌握 RRC 连接重建流程和 T311、T301 的含义",
            "知道重建失败的常见原因以及重建原因值的含义",
            "了解 RLF Report 与 MRO 如何用于识别过早、过晚和切错小区"
          ],
          "concepts": [
            "失步 / 同步指示（Qout / Qin）",
            "N310 / T310 / N311",
            "RLC 最大重传",
            "随机接入问题",
            "RRCConnectionReestablishmentRequest",
            "reestablishmentCause",
            "T311 / T301",
            "RLF Report 与 MRO"
          ],
          "specs": [
            {
              "id": "TS 36.331",
              "note": "无线链路失败检测与 RRC 连接重建"
            },
            {
              "id": "TS 36.133",
              "note": "无线链路监测（Qout / Qin）要求"
            },
            {
              "id": "TS 36.300",
              "note": "无线链路失败与移动鲁棒性优化（MRO）"
            }
          ],
          "quiz": [
            {
              "q": "RRC 重建失败（收到 RRCConnectionReestablishmentReject）最常见的原因是什么？",
              "a": "终端选到的小区没有它的上下文：比如掉线后选到了一个既不是源小区、也没有做过切换准备的小区。此外目标小区拥塞、shortMAC-I 校验失败也会导致拒绝。被拒后终端回到 RRC_IDLE，业务需要重新建立连接，用户感知为掉线。"
            },
            {
              "q": "T310 设得过短和过长分别有什么问题？",
              "a": "过短：短时深衰落就判 RLF，触发不必要的重建甚至掉线；过长：链路早已不可用，终端仍在苦等恢复，迟迟不去重建，用户感知为“卡死”。一般结合 N310 与场景（高铁、室内）来权衡。"
            }
          ],
          "practice": "在掉线类日志中找出 RRCConnectionReestablishmentRequest，读出其中的 reestablishmentCause 与 physCellId，判断这次重建发生在源小区还是邻区、是切换失败还是其他失败，并看重建是否成功。"
        },
        {
          "id": "lte-ca",
          "title": "载波聚合与 LTE-A 关键技术",
          "hours": 4,
          "goals": [
            "理解载波聚合的 PCell / SCell 概念、三种聚合方式和终端能力要求",
            "说清 SCell 的配置、激活 / 去激活机制和跨载波调度",
            "了解 R10–R12 其他 LTE-A 关键技术：增强 MIMO、eICIC、CoMP、双连接",
            "能估算典型 CA 组合下的理论峰值速率"
          ],
          "concepts": [
            "成员载波 CC",
            "PCell / SCell",
            "带内连续 / 带内非连续 / 带间 CA",
            "SCell 激活去激活 MAC CE",
            "sCellDeactivationTimer",
            "跨载波调度（CIF）",
            "UE 能力与频段组合",
            "eICIC / ABS",
            "CoMP、双连接"
          ],
          "specs": [
            {
              "id": "TS 36.300",
              "note": "载波聚合与双连接总体描述"
            },
            {
              "id": "TS 36.321",
              "note": "SCell 激活 / 去激活"
            },
            {
              "id": "TS 36.101",
              "note": "CA 频段组合与带宽等级"
            },
            {
              "id": "TS 36.306",
              "note": "UE 类别与能力"
            }
          ],
          "quiz": [
            {
              "q": "为什么 SCell 配置之后还要单独“激活”？",
              "a": "配置（RRC 重配置）比较慢、信令开销大；激活 / 去激活用 MAC CE 完成，速度快。没有数据时让 SCell 处于去激活状态，终端不监听其 PDCCH、不上报其 CSI，可以省电；有大数据量时再快速激活。sCellDeactivationTimer 超时会自动去激活。"
            },
            {
              "q": "为什么 PCell 很重要，SCell 失败却不会导致掉线？",
              "a": "RRC 连接、NAS 移动性、安全、PUCCH（R13 前）都只在 PCell 上；无线链路监测也针对 PCell。SCell 只是额外的数据通道，质量差时可去激活或删除，不影响连接；PCell 发生 RLF 才会触发重建。"
            }
          ],
          "practice": "查阅 TS 36.101 中国内常用频段的 CA 组合（如 B3 与 B1 / B41 相关组合），用手机工程模式查看手机是否处于 CA 状态、PCell 和 SCell 的频点与带宽，并按“每 20 MHz 2×2 约 150 Mbps”的经验值估算理论峰值（示例计算）。"
        }
      ]
    },
    {
      "id": "L4",
      "title": "EPC 核心网",
      "summary": "MME、SGW、PGW、HSS、PCRF 如何分工协作，完成附着、承载建立、移动性管理、鉴权安全与策略计费。看懂 EPC 信令，才能把“上不了网、打不了电话”定界到具体网元和具体一步。",
      "modules": [
        {
          "id": "lte-epc",
          "title": "EPC 网元与接口详解",
          "hours": 4,
          "goals": [
            "说出 MME、SGW、PGW、HSS、PCRF 各自的职责和不负责的事情",
            "说出 S1-MME、S1-U、S11、S5/S8、S6a、Gx、SGi、S10、SGs 的两端网元与承载协议",
            "理解 MME 池、NNSF 以及基于 DNS 的 SGW / PGW 选择机制",
            "能根据抓包中的协议和端口判断信令走在哪个接口上"
          ],
          "concepts": [
            "MME：NAS 信令与移动性",
            "SGW：本地移动锚点、下行缓存",
            "PGW：IP 分配与 PCEF",
            "HSS：签约数据与鉴权向量",
            "GTPv2-C / GTP-U",
            "S1AP over SCTP",
            "Diameter（S6a / Gx）",
            "MME 池与 GUMMEI",
            "CUPS 控制面 / 用户面分离"
          ],
          "specs": [
            {
              "id": "TS 23.401",
              "note": "EPS 架构、网元功能与参考点"
            },
            {
              "id": "TS 29.274",
              "note": "GTPv2-C（S11 / S5 / S8 / S10）"
            },
            {
              "id": "TS 29.272",
              "note": "S6a / S6d Diameter 接口"
            },
            {
              "id": "TS 36.413",
              "note": "S1AP"
            }
          ],
          "quiz": [
            {
              "q": "终端处于 ECM-IDLE 时，下行数据到达，是哪个网元先发现并缓存数据？之后发生什么？",
              "a": "SGW。空闲态时 SGW 上没有该终端的 S1-U 下行隧道信息，它把数据缓存起来并向 MME 发 Downlink Data Notification；MME 在 TAI 列表范围内寻呼终端，终端回 Service Request 恢复连接后，SGW 拿到新的 eNB 隧道地址再把缓存数据发下去。"
            },
            {
              "q": "S5 和 S8 有什么区别？",
              "a": "两者都是 SGW 与 PGW 之间的接口，功能相同。S5 用于 SGW 与 PGW 在同一运营商网络内的场景；S8 用于漫游归属地路由（SGW 在拜访网、PGW 在归属网），多了跨运营商的安全和计费考虑。协议上常用 GTPv2-C + GTP-U，也可以用 PMIP。"
            },
            {
              "q": "eNB 收到一个终端的 RRC 连接，怎么知道该把 NAS 消息送给池里的哪台 MME？",
              "a": "eNB 的 NNSF 功能根据终端在 RRC 中提供的 S-TMSI 中的 MMEC（或 registeredMME 中的 GUMMEI）找到原来为它服务的 MME；如果终端是首次附着或对应 MME 不可用，eNB 按负荷等因素在池内选择一台 MME。"
            }
          ],
          "practice": "用开源 EPC（如 Open5GS 的 EPC 部分）配合 srsRAN 4G 搭建实验环境，用 Wireshark 抓 S1AP、GTPv2-C、Diameter 报文，按协议和端口把每条消息归到对应接口，画出你环境的接口图。"
        },
        {
          "id": "lte-attach",
          "title": "附着与默认承载建立",
          "hours": 5,
          "goals": [
            "完整复述 TS 23.401 附着流程，说出每一步涉及的网元和目的",
            "理解附着与默认承载“同时完成”的设计：Attach Request 中捎带 PDN Connectivity Request",
            "掌握 EMM-DEREGISTERED / EMM-REGISTERED 与 ECM-IDLE / ECM-CONNECTED 状态的含义",
            "能根据 EMM / ESM 原因值初步定位附着失败"
          ],
          "concepts": [
            "Attach Request / Accept / Complete",
            "PDN Connectivity Request（ESM 捎带）",
            "Update Location（S6a）",
            "Create Session（S11 / S5）",
            "Initial Context Setup",
            "Activate Default EPS Bearer Context",
            "EMM 与 ECM 状态",
            "联合附着（EPS / IMSI）",
            "EMM / ESM 原因值"
          ],
          "specs": [
            {
              "id": "TS 23.401",
              "note": "附着流程（E-UTRAN Initial Attach）"
            },
            {
              "id": "TS 24.301",
              "note": "EMM 附着过程与 ESM 默认承载激活"
            },
            {
              "id": "TS 36.413",
              "note": "Initial Context Setup"
            }
          ],
          "flow": "sequenceDiagram\n    participant UE\n    participant eNB\n    participant MME\n    participant HSS\n    participant SGW\n    participant PGW\n    UE->>eNB: RRC 建立，RRCConnectionSetupComplete 携带 Attach Request + PDN Connectivity Request\n    eNB->>MME: S1AP Initial UE Message\n    MME->>HSS: Authentication Information Request\n    HSS->>MME: Authentication Information Answer（EPS 鉴权向量）\n    MME->>UE: Authentication Request / Response\n    MME->>UE: NAS Security Mode Command / Complete\n    MME->>HSS: Update Location Request\n    HSS->>MME: Update Location Answer（签约数据）\n    MME->>SGW: Create Session Request\n    SGW->>PGW: Create Session Request\n    PGW->>SGW: Create Session Response（UE IP、上行 TEID）\n    SGW->>MME: Create Session Response\n    MME->>eNB: Initial Context Setup Request（Attach Accept + Activate Default EPS Bearer Context Request）\n    eNB->>UE: AS Security Mode Command、RRCConnectionReconfiguration\n    UE->>eNB: RRCConnectionReconfigurationComplete\n    eNB->>MME: Initial Context Setup Response（eNB 下行 TEID）\n    UE->>MME: Attach Complete + Activate Default EPS Bearer Context Accept\n    MME->>SGW: Modify Bearer Request（eNB 下行 TEID）\n    SGW->>MME: Modify Bearer Response",
          "quiz": [
            {
              "q": "为什么 LTE 附着完成后终端一定“永远在线”有 IP 地址，而 2G/3G 附着后不一定？",
              "a": "LTE 把 PDN 连接建立捎带在附着过程中：Attach Request 里必带 PDN Connectivity Request，附着成功的同时建立默认承载并分配 IP 地址。2G/3G 的 GPRS 附着与 PDP 上下文激活是两个独立过程，附着后不一定有 PDP 上下文。"
            },
            {
              "q": "附着时 Initial Context Setup Response 之后，为什么还要做 Modify Bearer Request？",
              "a": "Create Session 阶段 SGW 只知道 PGW 的地址，还不知道 eNB 的下行隧道地址；eNB 在 Initial Context Setup Response 中才给出自己的 S1-U 下行 TEID 和 IP。MME 用 Modify Bearer Request 把它告诉 SGW，下行用户面才真正打通。"
            },
            {
              "q": "附着被拒，原因值 #19 ESM failure，下一步看什么？",
              "a": "#19 表示附着中捎带的 ESM 过程（默认承载建立）失败，要去看 Attach Reject 里携带的 PDN Connectivity Reject 的 ESM 原因值，例如 #27 APN 缺失或未知、#33 未签约该业务选项、#26 资源不足，再对应查 HSS 签约、DNS 解析或 SGW / PGW 侧的 GTP 原因。"
            }
          ],
          "practice": "在开源 EPC + srsRAN 环境（或手机工程模式 / 路测软件的 NAS 日志）中抓一次完整附着，按流程图逐条标注 NAS、S1AP、Diameter、GTPv2-C 消息，记录 Attach Accept 中下发的 GUTI、TAI 列表、T3412 和默认承载的 EBI、QCI、APN-AMBR。",
          "xref": [
            {
              "t": "5g",
              "m": "s4-registration",
              "note": "5G 注册流程对比"
            }
          ]
        },
        {
          "id": "lte-bearer",
          "title": "EPS 承载与 QoS",
          "hours": 4,
          "goals": [
            "理解 EPS 承载、E-RAB、DRB、S1 承载、S5/S8 承载之间一一对应的关系",
            "掌握 QCI、ARP、GBR / MBR、APN-AMBR、UE-AMBR 的含义和执行位置",
            "熟记 TS 23.203 标准 QCI 表中 QCI 1–9 的资源类型、优先级、时延和丢包指标",
            "理解专用承载由网络发起建立的流程和 TFT 的作用"
          ],
          "concepts": [
            "默认承载 / 专用承载",
            "GBR / Non-GBR",
            "QCI",
            "ARP（优先级、抢占能力 / 被抢占性）",
            "APN-AMBR / UE-AMBR",
            "TFT 与包过滤器",
            "EBI 5–15",
            "E-RAB = DRB + S1 承载"
          ],
          "specs": [
            {
              "id": "TS 23.401",
              "note": "承载模型、专用承载激活流程"
            },
            {
              "id": "TS 23.203",
              "note": "Table 6.1.7 标准 QCI 特性"
            },
            {
              "id": "TS 24.301",
              "note": "ESM 承载上下文过程"
            }
          ],
          "quiz": [
            {
              "q": "APN-AMBR 和 UE-AMBR 分别由谁执行？为什么 GBR 承载不受它们限制？",
              "a": "APN-AMBR 由 PGW 执行（上下行），终端在上行也执行；UE-AMBR 由 eNB 执行。AMBR 约束的是一组 Non-GBR 承载的总速率，GBR 承载有自己的 GBR / MBR 控制，所以不计入 AMBR。"
            },
            {
              "q": "VoLTE 通话为什么要建 QCI 1 专用承载而不是复用 QCI 9 默认承载？",
              "a": "语音需要稳定速率和低时延：QCI 1 是 GBR，时延预算 100 ms，允许 10^-2 丢包，基站会为它预留资源并配合 RLC UM、ROHC 等优化；QCI 9 是 Non-GBR 尽力而为，拥塞时没有保障。此外 IMS 信令走 QCI 5 承载，优先级最高。"
            }
          ],
          "practice": "在手机工程模式或路测软件中查看当前承载列表，记录每条承载的 EBI、QCI、APN；若有 VoLTE 终端，在通话前后对比承载数量变化，找到 QCI 1 专用承载建立与释放对应的 NAS 消息。",
          "xref": [
            {
              "t": "5g",
              "m": "s4-qos",
              "note": "5G QoS Flow 模型"
            }
          ]
        },
        {
          "id": "lte-tau",
          "title": "TAU、寻呼与服务请求",
          "hours": 4,
          "goals": [
            "说出 TAU 的触发条件和类型，区分 MME 内 TAU 与跨 MME TAU",
            "掌握 TAI 列表、T3412 周期 TAU、移动可达定时器与隐式分离的关系",
            "完整复述网络触发的服务请求（寻呼）流程和终端发起的服务请求流程",
            "理解 S1 释放后 ECM-IDLE 状态下哪些上下文保留、哪些释放"
          ],
          "concepts": [
            "TAI 列表",
            "TAU 类型（普通 / 联合 / 周期）",
            "T3412 与移动可达定时器",
            "Downlink Data Notification",
            "S1AP Paging 与 S-TMSI",
            "Service Request",
            "S1 Release",
            "Active flag"
          ],
          "specs": [
            {
              "id": "TS 23.401",
              "note": "TAU、服务请求、S1 释放流程"
            },
            {
              "id": "TS 24.301",
              "note": "EMM TAU 与服务请求过程、定时器"
            },
            {
              "id": "TS 36.304",
              "note": "寻呼时机计算"
            }
          ],
          "flow": "sequenceDiagram\n    participant UE\n    participant eNB\n    participant MME\n    participant SGW\n    Note over UE,SGW: 网络触发的服务请求（终端处于 ECM-IDLE）\n    SGW->>MME: Downlink Data Notification（缓存下行数据）\n    MME->>SGW: Downlink Data Notification Ack\n    MME->>eNB: S1AP Paging（S-TMSI、TAI 列表）\n    eNB->>UE: RRC Paging\n    UE->>eNB: 随机接入 + RRCConnectionRequest（mt-Access）\n    UE->>eNB: RRCConnectionSetupComplete 携带 Service Request\n    eNB->>MME: S1AP Initial UE Message\n    MME->>eNB: Initial Context Setup Request（E-RAB 列表、KeNB）\n    eNB->>UE: AS Security Mode Command、RRCConnectionReconfiguration\n    eNB->>MME: Initial Context Setup Response（eNB 下行 TEID）\n    MME->>SGW: Modify Bearer Request\n    SGW->>MME: Modify Bearer Response\n    SGW->>UE: 转发缓存的下行数据",
          "quiz": [
            {
              "q": "终端在 TAI 列表内的跟踪区之间移动要不要做 TAU？TAI 列表大小如何取舍？",
              "a": "不需要，只有进入列表以外的 TA 或周期定时器 T3412 到期等情况才触发 TAU。TAI 列表越大，TAU 信令越少，但寻呼时要在更多基站下发，寻呼负荷越大；列表越小则相反。现网通常结合话务和移动模式规划，常见做法还会把终端上一次所在 TA 放进列表以抑制边界乒乓 TAU。"
            },
            {
              "q": "MME 寻呼不到终端，可能是什么原因？",
              "a": "终端可能已移出覆盖或在弱覆盖区收不到寻呼；寻呼范围（TAI 列表、寻呼策略）未覆盖终端实际位置；终端处于 PSM 等省电状态不监听寻呼；MME 中 TAI 列表与基站配置的 TAC 不一致；或空口寻呼拥塞丢弃。需结合 MME 寻呼统计和终端侧日志定界。"
            }
          ],
          "practice": "用手机工程模式或路测软件记录一段跨 TAC 的移动过程，找出每次 TAU Request 的类型和触发原因，对比 TAU Accept 中下发的 TAI 列表，判断哪些 TAC 变化没有触发 TAU、为什么。"
        },
        {
          "id": "lte-security",
          "title": "鉴权与安全（EPS-AKA）",
          "hours": 3,
          "goals": [
            "复述 EPS-AKA 流程：鉴权向量的组成、终端和网络各自验证什么",
            "画出 EPS 密钥层次：K → CK / IK → KASME → NAS 密钥与 KeNB → AS 密钥",
            "区分 NAS 安全模式与 AS 安全模式，以及加密与完整性保护的覆盖范围",
            "能根据 Authentication Failure 原因值区分 MAC 失败与同步失败"
          ],
          "concepts": [
            "EPS 鉴权向量：RAND / XRES / AUTN / KASME",
            "双向鉴权（AUTN 验证网络）",
            "SQN 与同步失败（AUTS）",
            "KASME 与 KSIASME",
            "NAS / AS 安全模式命令",
            "EEA / EIA 算法（SNOW 3G、AES、ZUC）",
            "KeNB、NH 与 NCC",
            "NAS COUNT / PDCP COUNT"
          ],
          "specs": [
            {
              "id": "TS 33.401",
              "note": "EPS 安全架构、EPS-AKA、密钥层次"
            },
            {
              "id": "TS 24.301",
              "note": "鉴权与 NAS 安全模式过程"
            },
            {
              "id": "TS 33.102",
              "note": "UMTS AKA 与 SQN 机制（EPS-AKA 的基础）"
            }
          ],
          "quiz": [
            {
              "q": "EPS-AKA 中，终端如何验证网络是真的？网络又如何验证终端？",
              "a": "终端的 USIM 用自己的根密钥 K 和收到的 RAND 计算期望的 MAC，与 AUTN 中的 MAC 比较，并检查 SQN 是否在可接受范围，从而确认 AUTN 出自归属网络。网络侧由 MME 比较终端返回的 RES 与鉴权向量中的 XRES，一致则认为终端合法。"
            },
            {
              "q": "LTE 空口用户面有完整性保护吗？",
              "a": "普通终端的空口用户面数据只加密不做完整性保护（完整性保护只用于 RRC 信令和 NAS 信令；中继节点场景例外）。这是 LTE 安全的一个已知弱点，5G 引入了可选的用户面完整性保护。"
            }
          ],
          "practice": "在开源 EPC 实验环境中配置测试卡的 K / OPc，抓一次附着，找到 Authentication Request 中的 RAND、AUTN 和 Security Mode Command 中选定的 EEA / EIA 算法；故意把 OPc 配错一次，观察终端回的 Authentication Failure 原因值。",
          "xref": [
            {
              "t": "5g",
              "m": "s4-security",
              "note": "5G-AKA 与 SUCI"
            }
          ]
        },
        {
          "id": "lte-pcc",
          "title": "PCC 策略控制与计费",
          "hours": 3,
          "goals": [
            "说出 PCC 架构中 PCRF、PCEF、AF、OCS、OFCS、SPR 的职责",
            "掌握 Gx、Rx、Gy、Gz 接口的作用和主要 Diameter 消息",
            "理解 PCC 规则的组成以及动态规则与预定义规则的区别",
            "能复述 VoLTE 呼叫中 Rx → Gx → 专用承载的触发链路"
          ],
          "concepts": [
            "PCRF / PCEF",
            "PCC 规则（SDF 模板、QCI、ARP、计费键）",
            "Gx：CCR / CCA、RAR / RAA",
            "Rx：AAR / AAA",
            "在线计费 Gy 与配额",
            "离线计费与 CDR",
            "事件触发器",
            "用量监控"
          ],
          "specs": [
            {
              "id": "TS 23.203",
              "note": "PCC 架构与功能"
            },
            {
              "id": "TS 29.212",
              "note": "Gx / Gxx 接口"
            },
            {
              "id": "TS 29.214",
              "note": "Rx 接口"
            },
            {
              "id": "TS 32.299",
              "note": "Diameter 计费应用（Gy / Ro、Rf）"
            }
          ],
          "quiz": [
            {
              "q": "动态 PCC 规则和预定义 PCC 规则有什么区别？",
              "a": "动态规则由 PCRF 在 Gx 消息中完整下发（包括 SDF 模板、QoS、计费参数），可按会话实时生成；预定义规则事先配置在 PCEF（PGW）上，PCRF 只需通过规则名激活或去激活。预定义规则常用于需要 DPI 识别的业务（如定向流量包），动态规则常用于 VoLTE 这类由 AF 实时提供媒体信息的业务。"
            },
            {
              "q": "预付费用户余额用完时，Gy 上发生了什么？",
              "a": "OCS 在最后一次授予配额时可携带最终单元指示（Final-Unit-Indication），配额耗尽后 PGW 按指示执行终止、限制访问或重定向到充值页面等动作；也可能直接以拒绝应答结束信用控制会话。具体动作取决于运营商计费策略。"
            }
          ],
          "practice": "用公开资料或开源 PCRF / OCS 模拟器（如 Open5GS 自带的 PCRF）抓一次附着中的 Gx CCR-Initial / CCA-Initial，找出下发的默认承载 QCI、APN-AMBR 和事件触发器；再画出 VoLTE 主叫时 Rx AAR 到专用承载建立的完整消息链。"
        }
      ]
    },
    {
      "id": "L5",
      "title": "语音与互操作",
      "summary": "LTE 是纯分组网络，语音要么回落到 2G/3G（CSFB），要么走 IMS（VoLTE）；再加上离开 LTE 覆盖时的 SRVCC，以及与 5G 之间的锚点、切换和 N26 互操作。",
      "modules": [
        {
          "id": "lte-csfb",
          "title": "CSFB 电路域回落",
          "hours": 4,
          "goals": [
            "说清 CSFB 为什么存在，以及联合附着、SGs 接口在其中的作用",
            "能画出主叫、被叫 CSFB 的信令流程，指出回落方式（重定向 / PS 切换 / CCO）的差别",
            "能分析 CSFB 接续时延长、回落失败、通话后不回 LTE 等常见问题"
          ],
          "concepts": [
            "联合附着（combined EPS/IMSI attach）",
            "SGs 接口与 SGsAP",
            "TAI 到 LAI 的映射",
            "Extended Service Request",
            "CS Fallback Indicator",
            "RRC 释放重定向 / PS 切换 / CCO",
            "被叫寻呼（CN domain = CS）",
            "SMS over SGs",
            "通话后快速返回 LTE"
          ],
          "specs": [
            {
              "id": "TS 23.272",
              "note": "EPS 中的电路域回落（CSFB）总体流程"
            },
            {
              "id": "TS 29.118",
              "note": "SGs 接口 SGsAP 协议"
            },
            {
              "id": "TS 24.301",
              "note": "联合附着、Extended Service Request 等 NAS 过程"
            },
            {
              "id": "TS 36.331",
              "note": "RRCConnectionRelease 重定向、MobilityFromEUTRACommand"
            }
          ],
          "flow": "sequenceDiagram\n    participant UE\n    participant eNB\n    participant MME\n    participant MSC as MSC/VLR\n    participant RAN as 2G/3G 无线网\n    Note over UE,MSC: 前提：UE 已完成联合附着，MME 与 MSC/VLR 建立 SGs 关联\n    UE->>MME: Extended Service Request（主叫 CS 回落）\n    MME->>eNB: S1AP UE Context Modification Request（CS Fallback Indicator）\n    eNB-->>UE: 可选：下发 2G/3G 测量\n    eNB->>UE: RRCConnectionRelease（redirectedCarrierInfo 指向 2G/3G 频点）\n    eNB->>MME: S1AP UE Context Release Request\n    UE->>RAN: 在 2G/3G 小区接入\n    UE->>MSC: 必要时位置更新（LAU），随后 CM Service Request\n    MSC->>UE: 电路域呼叫建立（Setup / Call Proceeding / Alerting / Connect）",
          "quiz": [
            {
              "q": "CSFB 被叫时，MSC 是怎么找到正在 LTE 上的用户的？",
              "a": "联合附着后 MSC/VLR 记录了该用户关联的 MME。来电时 MSC 通过 SGs 接口向 MME 发 SGsAP-PAGING-REQUEST；MME 若 UE 空闲就在 TA 列表内寻呼（CN domain 标为 CS），若 UE 连接态就下发 CS SERVICE NOTIFICATION。UE 回 Extended Service Request 后回落到 2G/3G，在那边回寻呼响应。"
            },
            {
              "q": "CSFB 接续时延比 2G/3G 原生呼叫长，主要多在哪些环节？",
              "a": "多出了 LTE 侧的 Extended Service Request 与上下文修改、RRC 释放（若要先测量还要加测量时间）、在 2G/3G 读系统消息和接入，以及位置区不一致时的位置更新。优化思路是用 TA/LA 一致规划避免 LAU、用带系统信息的重定向或 PS 切换减少读系统消息时间、尽量免测量直接重定向。"
            },
            {
              "q": "为什么 SMS over SGs 不需要回落？",
              "a": "短信数据量小，可以封装在 NAS 消息（UPLINK / DOWNLINK NAS TRANSPORT）里，经 MME 和 SGs 接口与 MSC 交换，终端始终留在 LTE。只有语音这类电路域呼叫才需要回落。"
            }
          ],
          "practice": "用手机工程模式或路测软件，关闭 VoLTE 开关后拨打电话，记录从拨号到 2G/3G 接入、再到挂机后返回 LTE 的全过程，标出 Extended Service Request、RRCConnectionRelease（看 redirectedCarrierInfo）和 LAU 的时间点，计算接续时延构成。"
        },
        {
          "id": "lte-volte",
          "title": "VoLTE 概览",
          "hours": 4,
          "goals": [
            "说出 VoLTE 涉及的 IMS 主要网元和 EPC 中的配合（IMS APN、PCRF、专用承载）",
            "能用一句话描述 IMS 注册和一次 VoLTE 呼叫的主线",
            "掌握 QCI 1 / QCI 5 / QCI 2 的含义，以及空口为语音所做的优化",
            "了解 VoLTE 关键指标的定义口径"
          ],
          "concepts": [
            "IMS APN 与默认承载（QCI 5）",
            "QCI 1 语音专用承载（GBR）",
            "P-CSCF / I-CSCF / S-CSCF / TAS",
            "P-CSCF 发现（PCO）",
            "Rx / Gx 与专用承载建立",
            "IMS 注册（REGISTER / 401 / 200 OK）",
            "RLC UM、ROHC、TTI Bundling、SPS",
            "AMR-WB / EVS",
            "IMS VoPS 指示"
          ],
          "specs": [
            {
              "id": "TS 23.228",
              "note": "IMS 总体架构与流程"
            },
            {
              "id": "TS 24.229",
              "note": "基于 SIP / SDP 的 IMS 呼叫控制"
            },
            {
              "id": "TS 23.203",
              "note": "PCC 架构与标准 QCI 特性表"
            },
            {
              "id": "TS 23.401",
              "note": "专用承载激活、IMS 相关的 EPS 过程"
            }
          ],
          "quiz": [
            {
              "q": "VoLTE 用户开机后，在打第一个电话之前已经建立了哪些承载？",
              "a": "至少两个 PDN 连接：互联网 APN 的默认承载，以及 IMS APN 的默认承载（QCI 5，承载 SIP 信令）。终端在 IMS APN 上完成 SIP 注册。QCI 1 语音专用承载要到呼叫建立时才由 PCRF 触发建立，通话结束后释放。"
            },
            {
              "q": "为什么语音专用承载通常配置 RLC UM 而不是 AM？",
              "a": "语音对时延敏感、对少量丢包相对容忍，AM 的重传会引入额外时延和抖动，迟到的语音包即使到达也没有意义；UM 不重传、时延小。可靠性靠 HARQ、TTI Bundling 和编解码器的抗丢包能力来保证。"
            }
          ],
          "practice": "在支持 VoLTE 的手机上抓一次通话日志（工程模式或路测软件），找出 IMS APN 的默认承载、呼叫时新增的 EPS 承载（看 QCI 和 GBR 速率）以及 RRC 重配置中语音 DRB 的 RLC 模式和 ROHC 配置。",
          "xref": [
            {
              "t": "5g",
              "m": "s5-voice",
              "note": "5G 语音：EPS Fallback 与 VoNR"
            }
          ]
        },
        {
          "id": "lte-srvcc",
          "title": "SRVCC 与 eSRVCC",
          "hours": 3,
          "goals": [
            "理解 SRVCC 解决的问题：VoLTE 用户离开 LTE 覆盖时语音不断",
            "掌握 Sv 接口、STN-SR、C-MSISDN、SCC AS 等关键要素，能讲清 SRVCC 主流程",
            "理解 eSRVCC 引入 ATCF/ATGW 缩短中断时间的原理",
            "能定位 SRVCC 失败与语音中断长的常见原因"
          ],
          "concepts": [
            "SRVCC（PS 到 CS 的语音连续性）",
            "Sv 接口（MME ↔ MSC Server）",
            "STN-SR 与 C-MSISDN",
            "SCC AS 会话锚定",
            "SRVCC HO Indication",
            "B2 测量事件",
            "eSRVCC：ATCF / ATGW",
            "aSRVCC / mid-call 等增强",
            "语音中断时间"
          ],
          "specs": [
            {
              "id": "TS 23.216",
              "note": "SRVCC 总体架构与流程"
            },
            {
              "id": "TS 23.237",
              "note": "IMS 业务连续性（SCC AS、ATCF）"
            },
            {
              "id": "TS 29.280",
              "note": "Sv 接口"
            }
          ],
          "quiz": [
            {
              "q": "SRVCC 中 MME 为什么要“拆分承载”？",
              "a": "UE 同时有 QCI 1 语音承载和其他数据承载。MME 根据 QCI 1 识别出语音承载，只把语音部分通过 Sv 接口交给 MSC Server 做 PS 到 CS 的切换；非语音承载则走普通 PS 切换（目标支持时）或被挂起。"
            },
            {
              "q": "eSRVCC 为什么能缩短语音中断？",
              "a": "基本 SRVCC 的会话转移要一直通知到对端（远端更新），路径长、时延大。eSRVCC 在拜访网 P-CSCF 附近引入 ATCF/ATGW 作为媒体锚点，STN-SR 指向 ATCF，切换时只需在本地把媒体从 LTE 侧切到 MSC 侧，对端无感，中断时间显著缩短。"
            }
          ],
          "practice": "在 LTE 覆盖边缘（如地下车库入口）用 VoLTE 通话并慢慢走出覆盖，在日志里找出 B2 测量报告、MobilityFromEUTRACommand 及在 3G/2G 的切换完成，估算从最后一个 LTE 语音包到第一个 CS 语音帧的中断时间。"
        },
        {
          "id": "lte-interwork",
          "title": "4G / 5G 互操作",
          "hours": 4,
          "goals": [
            "从 LTE 侧理解 NSA 锚点：锚点小区要配置什么、B1 如何触发 SgNB 添加",
            "掌握 SA 场景下 LTE 与 NR 之间重选、重定向、切换三种手段的取舍",
            "理解 N26 接口的作用，以及有无 N26 对互操作和业务连续性的影响",
            "能从 LTE 参数和信令角度排查“不上 5G”“回不了 5G”问题"
          ],
          "concepts": [
            "EN-DC 锚点小区",
            "upperLayerIndication（5G 图标）",
            "B1-NR 测量与 SgNB 添加",
            "SCG 失败与释放",
            "LTE 与 NR 重选优先级（SIB24 / SIB5）",
            "4G→5G 重定向 / 切换",
            "N26 接口（MME ↔ AMF）",
            "SMF+PGW-C 等合设网元",
            "QCI ↔ 5QI 映射"
          ],
          "specs": [
            {
              "id": "TS 23.501",
              "note": "§5.17 互通与迁移（与 EPC 互通）"
            },
            {
              "id": "TS 23.502",
              "note": "§4.11 与 EPC 的系统间互通流程"
            },
            {
              "id": "TS 37.340",
              "note": "EN-DC 多连接总体"
            },
            {
              "id": "TS 36.331",
              "note": "B1-NR 测量、SIB24、upperLayerIndication"
            }
          ],
          "quiz": [
            {
              "q": "NSA 用户在某 LTE 小区下始终不显示 5G，从 LTE 侧要查哪些点？",
              "a": "先看这个小区是不是锚点：是否给 NR 频点配了 B1 测量和 NR 邻区、SIB2 是否带 upperLayerIndication；再看终端能力和签约（是否被限制 NR 作为辅 RAT）；然后看 B1 门限是否过高、X2 是否正常、SgNB 添加是否被拒。非锚点频点的用户需要先被引导到锚点频点。"
            },
            {
              "q": "N26 接口对 SA 与 LTE 的互操作有什么意义？",
              "a": "N26 连接 MME 和 AMF，用于传递 UE 移动性和会话上下文。有 N26 时可以做连接态的系统间切换，IP 地址和会话保持，中断短；没有 N26 时只能靠重定向或空闲态重选，终端要在目标侧重新注册或附着并通过合设的 SMF+PGW-C 恢复会话，中断更长。"
            }
          ],
          "practice": "用支持 SA 的手机在 5G 覆盖边缘来回走动，在日志中分别找出一次 5G→4G 和 4G→5G 的转换，判断它是重选、重定向还是切换（看 RRCRelease / MobilityFromEUTRACommand 等消息），并记录每次的业务中断时长。",
          "xref": [
            {
              "t": "5g",
              "m": "s1-deploy",
              "note": "NSA / SA 部署方式"
            }
          ]
        }
      ]
    },
    {
      "id": "L6",
      "title": "网络规划与优化",
      "track": "网优方向",
      "summary": "从链路预算、PCI / PRACH / TAC 参数规划，到 KPI 体系与覆盖、干扰、切换、接入、速率、VoLTE 的专题优化，建立 LTE 网优的完整方法。",
      "modules": [
        {
          "id": "lte-plan",
          "title": "规划与链路预算",
          "hours": 4,
          "tools": [
            "budget"
          ],
          "goals": [
            "能按上下行分别列出 LTE 链路预算的各项增益、损耗和余量，算出 MAPL",
            "会由基站总功率换算 RS 功率（RE 功率），并据此做下行 RSRP 覆盖预算",
            "理解传播模型选择与校正、覆盖半径与站间距的推算方法",
            "能从覆盖和容量两个角度估算站点数，并说清两者取大的道理"
          ],
          "concepts": [
            "MAPL",
            "RS 功率（RE 功率）",
            "接收灵敏度",
            "阴影衰落余量",
            "穿透损耗",
            "干扰余量",
            "Okumura-Hata / COST231-Hata",
            "传播模型校正（CW 测试）",
            "上下行平衡"
          ],
          "specs": [
            {
              "id": "TR 36.942",
              "note": "射频系统场景与传播模型"
            },
            {
              "id": "TS 36.101",
              "note": "终端射频指标，功率等级 3 为 23 dBm"
            },
            {
              "id": "TS 36.104",
              "note": "基站射频指标"
            }
          ],
          "quiz": [
            {
              "q": "20 MHz 带宽、单端口总功率 46 dBm 的 LTE 小区，RS 功率大约是多少？为什么下行覆盖要用 RS 功率而不是总功率来算？",
              "a": "20 MHz 有 1200 个子载波，平均每 RE 功率约 46 − 10·lg1200 ≈ 46 − 30.8 = 15.2 dBm（假设 RS 与数据 RE 等功率，示例）。终端测量的 RSRP 是单个 CRS RE 的功率，覆盖门限也按 RSRP 定，所以下行覆盖预算要从 RS 功率出发，带宽越大同样总功率下 RS 功率越低。"
            },
            {
              "q": "为什么 LTE 规划常说“上行受限”？有哪些手段改善上行覆盖？",
              "a": "终端只有约 23 dBm，远低于基站，且上行要在多个 PRB 上铺开功率，所以多数场景上行先到极限。改善手段有：边缘用户少分 PRB 提升单 PRB 功率谱密度、基站多天线接收分集（4R 等）、降低馈线损耗（RRU 上塔）、VoLTE 用 TTI bundling，以及选用低频段。"
            }
          ],
          "practice": "用工具箱的链路预算计算器，分别按 1.8 GHz 和 2.6 GHz、室外覆盖室内场景做一次上行预算（参数自拟并标注示例），比较 MAPL 差异，再用 COST231-Hata 公式估算两者的覆盖半径比。",
          "xref": [
            {
              "t": "5g",
              "m": "s6-budget",
              "note": "5G 链路预算"
            }
          ]
        },
        {
          "id": "lte-params",
          "title": "PCI、邻区、PRACH 与 TAC 规划",
          "hours": 4,
          "goals": [
            "掌握 LTE 504 个 PCI 的结构，理解模 3、模 6、模 30 规则背后的物理意义",
            "能做无冲突、无混淆、模 3 错开的 PCI 规划，并会检查复用距离",
            "会根据小区半径选择 PRACH 零相关区配置并计算所需根序列数",
            "理解邻区规划原则、ANR 的作用，以及 TAC / TA List 边界的划分方法"
          ],
          "concepts": [
            "PCI = 3×组号 + 组内号",
            "PCI 冲突与混淆",
            "模 3（PSS、多端口 CRS）",
            "模 6（CRS 频域偏移）",
            "模 30（上行 DMRS 序列组）",
            "根序列与 Ncs",
            "邻区漏配 / 冗余",
            "ANR",
            "TAC 与 TA List"
          ],
          "specs": [
            {
              "id": "TS 36.211",
              "note": "§6.11 同步信号、§6.10 参考信号、§5.7 PRACH"
            },
            {
              "id": "TS 36.300",
              "note": "ANR 等 SON 功能"
            },
            {
              "id": "TS 23.401",
              "note": "跟踪区与 TA List"
            }
          ],
          "quiz": [
            {
              "q": "同站三个扇区为什么通常分配同一 PCI 组内的三个 PCI？",
              "a": "同一组内三个 PCI 的模 3 值分别为 0、1、2，正好错开 PSS 序列，2 端口及以上时 CRS 的频域位置也错开，避免同站相邻扇区间 CRS 互相碰撞、影响 RS-SINR 和信道估计。"
            },
            {
              "q": "PCI 冲突和 PCI 混淆有什么区别？",
              "a": "冲突是两个同频相邻（覆盖有重叠）的小区用了相同 PCI，终端无法区分，严重时同步和解调都会出错。混淆是某小区的两个同频邻区 PCI 相同，测量报告只带 PCI，基站不知道终端报的是哪一个，可能切到错误小区导致切换失败。"
            },
            {
              "q": "小区半径越大，PRACH 需要的根序列数为什么越多？",
              "a": "半径越大，往返时延越大，需要的循环移位间隔 Ncs 越大；长度 839 的 ZC 根序列能生成的前导数约为 ⌊839/Ncs⌋，不够 64 个时要用多个连续根序列补齐，所以需要的根序列数增加，相邻小区根序列复用也越紧张。"
            }
          ],
          "practice": "画一个 7 站 21 扇区的蜂窝示意图，自己分配 PCI（要求同站模 3 错开、相邻小区无冲突无混淆），并按假设的小区半径选择 Ncs、算出每个小区占用的根序列数。"
        },
        {
          "id": "lte-kpi",
          "title": "KPI 体系与无线测量",
          "hours": 4,
          "tools": [
            "kpi"
          ],
          "goals": [
            "能说清 RSRP、RSRQ、RSSI、SINR 的定义、上报范围和相互关系",
            "掌握接入性、保持性、移动性、业务量与资源、语音五大类 KPI 及常用公式",
            "理解计数器、统计口径与 MR / MDT 数据的来源和局限",
            "会用“全网 → TOP 小区 → 时段 → 原因值”的思路从 KPI 定位问题"
          ],
          "concepts": [
            "RSRP（−140 ~ −44 dBm，映射 0–97）",
            "RSRQ = N×RSRP / RSSI",
            "RS-SINR",
            "无线接通率",
            "E-RAB 掉线率",
            "切换成功率",
            "PRB 利用率",
            "MR 覆盖率",
            "TOP N 小区分析"
          ],
          "specs": [
            {
              "id": "TS 36.214",
              "note": "物理层测量定义（RSRP、RSRQ、RSSI、上行干扰功率）"
            },
            {
              "id": "TS 36.133",
              "note": "测量精度与上报映射"
            },
            {
              "id": "TS 32.425",
              "note": "E-UTRAN 性能测量（计数器）"
            },
            {
              "id": "TS 32.450",
              "note": "E-UTRAN KPI 定义"
            }
          ],
          "quiz": [
            {
              "q": "RSRP 很好但 RSRQ 很差，可能是什么情况？",
              "a": "RSRQ = N×RSRP / RSSI，RSSI 包含本小区负荷、邻区信号、干扰和噪声。RSRP 好而 RSRQ 差，说明 RSSI 很大：要么是本小区或邻区负荷高，要么是重叠覆盖或外部干扰强。需要结合 SINR、邻区电平和 PRB 利用率区分是“忙”还是“乱”。"
            },
            {
              "q": "无线接通率通常怎么计算？为什么要分两段？",
              "a": "常见口径是 RRC 连接建立成功率 × E-RAB 建立成功率。两段分别对应空口信令连接和业务承载建立，失败原因和责任环节不同：前者多与覆盖、干扰、PRACH 和拥塞有关，后者还涉及安全模式、核心网和传输，分开统计才能定界。"
            }
          ],
          "practice": "用手机工程模式（或路测软件）在室外、室内、电梯口三处各记录 10 次 RSRP、RSRQ、SINR，填成表格，分析三个量的变化规律，并用 RSRP 上报映射关系把其中一个 dBm 值换算成上报索引。",
          "xref": [
            {
              "t": "5g",
              "m": "s6-kpi",
              "note": "5G KPI 与测量"
            }
          ]
        },
        {
          "id": "lte-coverage",
          "title": "覆盖与干扰优化",
          "hours": 5,
          "goals": [
            "能识别弱覆盖、越区覆盖、重叠覆盖、无主导小区四类覆盖问题并给出调整手段",
            "理解 CRS 干扰与网络负荷的关系，解释模 3 干扰在不同负荷下的表现",
            "会用上行 PRB 级干扰功率判断底噪抬升，区分内部与外部干扰",
            "掌握 TDD 大气波导远端干扰的特征、成因与规避措施"
          ],
          "concepts": [
            "弱覆盖 / 越区覆盖",
            "重叠覆盖度",
            "无主导小区",
            "CRS 干扰与负荷",
            "PA / PB 功率配置",
            "上行底噪抬升",
            "外部干扰排查",
            "大气波导远端干扰",
            "GP 与特殊子帧配置"
          ],
          "specs": [
            {
              "id": "TS 36.214",
              "note": "上行接收干扰功率（Received Interference Power）测量"
            },
            {
              "id": "TS 36.213",
              "note": "§5.2 下行功率分配（PA / PB）"
            },
            {
              "id": "TS 36.211",
              "note": "CRS 结构、TDD 特殊子帧配置"
            }
          ],
          "quiz": [
            {
              "q": "为什么说空载时 LTE 网络也有干扰？",
              "a": "LTE 的 CRS 不论有没有用户都持续全带宽发送。邻区即使空载，其 CRS 也会落到本小区的 CRS 或数据 RE 上，形成干扰。所以 LTE 的干扰水平和重叠覆盖关系很大，负荷升高后邻区 PDSCH 也开始发，干扰进一步加重。"
            },
            {
              "q": "TDD 大气波导远端干扰有哪些典型特征？",
              "a": "多在春夏季、夜间到清晨出现，日出后减弱；大片区域、大量小区同时出现上行底噪抬升；干扰集中在 UpPTS 和上行子帧靠前的符号，越往后越轻，呈“斜坡”状；受扰站往往在沿海、平原或湖泊附近，干扰源可能在上百公里外。"
            }
          ],
          "practice": "设想一个“RSRP 普遍 −85 dBm、SINR 却在 0 dB 附近”的路段（示例），写一份分析思路：要看哪些数据（扫频、邻区电平、工参、PCI 模 3），可能的根因，以及对应的天馈和参数调整方案。"
        },
        {
          "id": "lte-mobility-opt",
          "title": "切换与掉线优化",
          "hours": 4,
          "goals": [
            "掌握 A3、A5 事件公式中各参数的作用，以及调整方向对切换的影响",
            "能区分过晚切换、过早切换、切换到错误小区三类问题并给出对策",
            "理解 RLF 判定（T310、N310、N311）与 RRC 重建，能分类分析掉线原因",
            "会用“掉线点前后的测量报告和信令”还原掉线过程"
          ],
          "concepts": [
            "A3：Off / Hys / TTT",
            "CIO（Ocn）",
            "A5 双门限",
            "过晚 / 过早 / 错误小区切换",
            "乒乓切换",
            "MRO",
            "RLF 与 T310 / N310",
            "RRC 重建",
            "E-RAB 异常释放"
          ],
          "specs": [
            {
              "id": "TS 36.331",
              "note": "§5.5.4 测量上报触发、§5.3.11 无线链路失败"
            },
            {
              "id": "TS 36.300",
              "note": "移动性鲁棒性优化（MRO）"
            },
            {
              "id": "TS 36.133",
              "note": "无线链路监测相关要求"
            }
          ],
          "quiz": [
            {
              "q": "某小区切换失败多为“过晚切换”，可以怎么调参数？",
              "a": "让切换更早触发：对目标邻区调大 CIO、适当减小 A3 偏置或迟滞、缩短 TTT。同时要先排除邻区漏配和覆盖问题，并观察乒乓切换是否随之增加，调整幅度一般每次 1–2 dB 或一档 TTT，逐步验证。"
            },
            {
              "q": "终端在掉线前未收到切换命令，常见原因有哪些？",
              "a": "可能是邻区漏配导致根本没触发测量上报；测量报告上行发不出去（上行弱覆盖或干扰）；基站收到报告但切换准备失败（目标小区准入拒绝、X2 故障）；或者切换命令下发时下行质量已太差，终端收不到 RRCConnectionReconfiguration。"
            }
          ],
          "practice": "画出 A3 事件的触发示意图（横轴时间、纵轴 RSRP，标出 Off、Hys、TTT），然后分别画出 CIO +3 dB 和 TTT 从 320 ms 改为 640 ms 后触发点如何移动（数值为示例）。"
        },
        {
          "id": "lte-access-opt",
          "title": "接入与速率优化",
          "hours": 4,
          "goals": [
            "能把接入失败分成 RRC、S1 信令、E-RAB 三段，并按每段的原因值排查",
            "理解 Msg1–Msg5 各步失败的典型原因与对应参数",
            "掌握影响下行速率的因素：CQI、RANK、MCS、BLER、PRB 利用率、调度用户数、CA",
            "会用速率拆解公式定位低速率的瓶颈"
          ],
          "concepts": [
            "接入分段",
            "Msg2 / Msg3 / Msg5 失败",
            "RRC Connection Reject",
            "初始上下文建立失败",
            "CQI → MCS → TBS",
            "RANK 与传输模式",
            "BLER 目标",
            "PRB 利用率与调度份额",
            "载波聚合"
          ],
          "specs": [
            {
              "id": "TS 36.321",
              "note": "§5.1 随机接入过程"
            },
            {
              "id": "TS 36.213",
              "note": "§7.1.7 MCS 与 TBS 确定、§7.2 CSI 上报"
            },
            {
              "id": "TS 36.306",
              "note": "终端类别与能力"
            }
          ],
          "flow": "sequenceDiagram\n    participant UE\n    participant eNB\n    participant MME\n    UE->>eNB: Msg1 前导\n    eNB->>UE: Msg2 RAR\n    UE->>eNB: Msg3 RRCConnectionRequest\n    eNB->>UE: Msg4 RRCConnectionSetup\n    UE->>eNB: Msg5 RRCConnectionSetupComplete\n    Note over UE,eNB: 以上为 RRC 段\n    eNB->>MME: Initial UE Message\n    MME->>eNB: Initial Context Setup Request\n    Note over eNB,MME: S1 信令段\n    eNB->>UE: SecurityModeCommand / RRCConnectionReconfiguration\n    UE->>eNB: SecurityModeComplete / RRCConnectionReconfigurationComplete\n    eNB->>MME: Initial Context Setup Response\n    Note over UE,MME: E-RAB 建立完成",
          "quiz": [
            {
              "q": "RRC 建立失败中“基站发了 RRCConnectionSetup 但收不到 Setup Complete”占比高，说明什么？",
              "a": "下行已经能把 Msg4 送到终端（或至少基站发出了），问题多在上行：终端的 Msg5 发不上来，常见于上行弱覆盖、上行干扰（底噪抬升）或上下行覆盖不平衡。应查小区上行干扰功率、上行功控参数和覆盖边缘的 RSRP 分布。"
            },
            {
              "q": "一个用户 RSRP 很好、SINR 也不错，但下载速率低，可能有哪些原因？",
              "a": "可从“每 PRB 效率 × 分到的 PRB 数”拆：效率侧看 RANK 是否长期为 1、MCS 和 BLER 是否正常；资源侧看小区 PRB 利用率和同时调度的用户数是否很高、是否支持 CA；此外还要排除终端能力、传输带宽、核心网或服务器侧（TCP 窗口、服务器限速）的瓶颈。"
            }
          ],
          "practice": "用手机测速软件在同一地点分别于闲时和忙时测速 5 次，同时用工程模式记录 RSRP、SINR、RANK（如可显示）和 CA 状态，用速率拆解公式解释两组结果的差别。"
        },
        {
          "id": "lte-volte-opt",
          "title": "VoLTE 语音质量优化",
          "hours": 4,
          "goals": [
            "掌握 VoLTE 接通率、掉话率、MOS、eSRVCC 切换比例与成功率等核心指标的含义",
            "理解影响 MOS 的因素：丢包、抖动、时延、编码速率，以及 RTP 指标的分析方法",
            "知道 TTI bundling、RoHC、SPS、DRX 等 VoLTE 增强特性的作用与代价",
            "能对单通、吞字、断续、掉话等典型问题做分段排查"
          ],
          "concepts": [
            "QCI 1 / QCI 5",
            "VoLTE 接通率",
            "QCI1 E-RAB 掉话率",
            "MOS 与 POLQA",
            "RTP 丢包与抖动",
            "eSRVCC 切换比例",
            "TTI bundling",
            "RoHC",
            "单通 / 吞字"
          ],
          "specs": [
            {
              "id": "TS 23.203",
              "note": "标准化 QCI 特性（QCI 1 会话语音、QCI 5 IMS 信令）"
            },
            {
              "id": "TS 23.216",
              "note": "SRVCC / eSRVCC"
            },
            {
              "id": "TS 26.114",
              "note": "IMS 多媒体电话（MTSI）媒体处理"
            },
            {
              "id": "ITU-T P.863",
              "note": "POLQA 客观语音质量评估"
            }
          ],
          "quiz": [
            {
              "q": "为什么 eSRVCC 切换比例“越低越好”，而 eSRVCC 成功率“越高越好”？",
              "a": "eSRVCC 比例反映 VoLTE 通话中有多少要回落到 2G / 3G 电路域，比例高说明 LTE 覆盖或 B2 门限设置让语音过早离开 LTE，回落后语音质量和后续业务体验都会下降。成功率则衡量真正需要回落时能否不掉话，必须尽量高。两者要一起看，单纯压低比例可能导致掉话上升。"
            },
            {
              "q": "路测中 MOS 偏低，但没有掉话，应该先看哪些指标？",
              "a": "先看 RTP 丢包率和抖动，再看对应时段的 RSRP、SINR、上行 BLER、切换次数。丢包集中在切换点附近多为切换中断或频繁切换；集中在弱覆盖区多为上行受限；同时检查语音编码速率（如 AMR-WB 是否降速）和是否频繁触发 eSRVCC。"
            }
          ],
          "practice": "整理一张 VoLTE 问题排查表：列出单通、吞字、断续、掉话、未接通五种现象，分别写出要看的指标、信令点和可能原因（不需要现网数据，可基于本模块讲解）。"
        }
      ]
    },
    {
      "id": "L7",
      "title": "演进",
      "summary": "LTE 并没有停在 R10：R13 起的 LTE-Advanced Pro 带来了 LAA、FD-MIMO、NB-IoT / eMTC 和 V2X；而在 5G 时代，LTE 频谱正在被重耕、与 NR 动态共享，LTE 自身转向覆盖、语音与物联网的长期基础网。",
      "modules": [
        {
          "id": "lte-pro",
          "title": "LTE-A Pro 增强",
          "hours": 3,
          "goals": [
            "说出 LTE-Advanced Pro 的版本范围及主要增强方向",
            "理解 LAA 在非授权频谱上的工作方式与 LBT 的必要性",
            "了解 FD-MIMO、大规模载波聚合、V2X、短 TTI 等特性的定位",
            "能判断哪些增强在国内现网有实际意义"
          ],
          "concepts": [
            "LTE-Advanced Pro（R13 起）",
            "LAA / eLAA 与 LBT",
            "FD-MIMO（垂直维波束）",
            "最多 32 个成员载波的 CA",
            "LWA（LTE-WLAN 聚合）",
            "V2X 与 PC5 直连",
            "短 TTI / 低时延增强",
            "高阶调制（256QAM 上行、1024QAM 下行）"
          ],
          "specs": [
            {
              "id": "TS 36.300",
              "note": "E-UTRAN 总体描述（各版本新特性概述）"
            },
            {
              "id": "TS 36.213",
              "note": "LAA 信道接入（LBT）等物理层过程"
            },
            {
              "id": "TS 36.211",
              "note": "物理信道与调制"
            }
          ],
          "quiz": [
            {
              "q": "LAA 为什么一定要有 LBT？",
              "a": "非授权频段上还有 Wi-Fi 等其他系统，许多国家和地区的法规要求先听后发。LBT 让 LAA 在发送前先做信道空闲评估，信道忙就退避，从而与 Wi-Fi 公平共存；不做 LBT 的 LTE 会持续占用信道，严重压制 Wi-Fi。"
            },
            {
              "q": "FD-MIMO 和 LTE R10 的 8 天线传输相比，主要变化是什么？",
              "a": "R10 的波束赋形基本只在水平维度。FD-MIMO 使用二维平面阵列，同时在水平和垂直两个维度形成波束，并扩展了 CSI-RS 端口数和码本，可以分辨高楼不同楼层的用户、提升多用户 MIMO 容量。它是 5G Massive MIMO 的先导。"
            }
          ],
          "practice": "查阅 3GPP 官网的 Release 13 / 14 / 15 特性列表（公开资料），整理一张表：特性名称、所属版本、解决的问题、你认为在国内现网是否部署过，并说明理由。"
        },
        {
          "id": "lte-iot",
          "title": "NB-IoT 与 eMTC",
          "hours": 3,
          "goals": [
            "说出 NB-IoT 与 eMTC 在带宽、速率、移动性、语音支持上的区别",
            "理解 NB-IoT 三种部署方式和覆盖增强（重复传输）的原理",
            "掌握 PSM、eDRX 两种省电机制和 CIoT 控制面 / 用户面优化",
            "能为一个具体物联网场景选择合适的技术（NB-IoT、eMTC、LTE Cat.1）"
          ],
          "concepts": [
            "NB-IoT：180 kHz、单 PRB",
            "独立 / 保护带 / 带内部署",
            "eMTC（Cat-M1）：1.4 MHz 窄带",
            "覆盖增强与重复传输",
            "PSM 与 T3324 / T3412",
            "eDRX",
            "控制面 CIoT 优化（Data over NAS）",
            "用户面 CIoT 优化（RRC Suspend / Resume）",
            "LTE Cat.1 / Cat.1bis"
          ],
          "specs": [
            {
              "id": "TS 36.211",
              "note": "NB-IoT 与 eMTC 物理信道"
            },
            {
              "id": "TS 36.300",
              "note": "NB-IoT、eMTC 总体描述"
            },
            {
              "id": "TS 23.401",
              "note": "CIoT EPS 优化、PSM、eDRX"
            },
            {
              "id": "TS 24.301",
              "note": "PSM、eDRX 等 NAS 协商"
            }
          ],
          "quiz": [
            {
              "q": "PSM 和 eDRX 都能省电，怎么选？",
              "a": "PSM 期间终端完全不可达，只有自己醒来（周期 TAU 或有上行数据）时才能收下行，适合只需定期上报、对下行实时性无要求的场景，如水表。eDRX 是拉长寻呼周期，终端仍可被寻呼，只是有分钟级到小时级的时延，适合偶尔需要下发指令的场景，如共享单车锁、烟感复位。两者也可以组合使用。"
            },
            {
              "q": "既然 NB-IoT 覆盖更好，为什么共享设备、穿戴类产品常用 eMTC 或 Cat.1？",
              "a": "NB-IoT 速率很低、R13 连接态不支持切换、不支持语音，适合静止、低频、小数据。移动中的设备需要切换能力，穿戴设备可能需要语音或较高速率，eMTC 支持连接态移动性和 VoLTE，Cat.1 速率更高、生态成熟，因此更合适。"
            }
          ],
          "practice": "设想一个智慧停车地磁项目（每天上报约 10 次、每次几十字节、设备埋在地下、电池要用 5 年以上），从覆盖、功耗、速率、移动性、模组成本五个方面比较 NB-IoT、eMTC、Cat.1，写出选择结论和 PSM / eDRX 的参数设想（数值为示例）。"
        },
        {
          "id": "lte-refarm",
          "title": "频谱重耕、DSS 与 4G 演进",
          "hours": 3,
          "goals": [
            "理解频谱重耕的动因和 2G/3G→4G→5G 的典型重耕路径",
            "掌握 LTE-NR 动态频谱共享（DSS）的基本原理和开销来源",
            "能评估一个频段是“重耕给 NR”还是“DSS 共享”更合适",
            "了解 5G 时代 LTE 网络的定位：覆盖底座、语音、物联网与锚点"
          ],
          "concepts": [
            "频谱重耕（refarming）",
            "2G/3G 退网",
            "LTE 带宽档位（1.4–20 MHz）",
            "DSS 动态频谱共享",
            "NR 对 LTE CRS 的速率匹配",
            "MBSFN 子帧方式",
            "共享开销",
            "4G 网络精简（减频 / 减站）"
          ],
          "specs": [
            {
              "id": "TS 36.101",
              "note": "E-UTRA 频段与信道带宽"
            },
            {
              "id": "TS 38.214",
              "note": "NR PDSCH 速率匹配（含 LTE CRS 图样）"
            },
            {
              "id": "TS 38.331",
              "note": "lte-CRS-ToMatchAround 等 DSS 相关配置"
            }
          ],
          "quiz": [
            {
              "q": "DSS 的开销主要来自哪里？",
              "a": "同一载波上既要发 LTE 的 CRS、PDCCH 和同步信号，又要发 NR 的 SSB、PDCCH、DMRS 等；NR 必须避开 LTE CRS 所在的资源粒子（速率匹配），或借用 MBSFN 子帧放 NR 信号。两套控制和参考信号叠加，加上调度协调的限制，导致总可用资源少于单独部署 LTE 或 NR。"
            },
            {
              "q": "什么情况下宁可把频段直接重耕给 NR，而不是做 DSS？",
              "a": "当该频段上的 LTE 话务已经很低、主流终端已支持 NR 该频段、且周边 4G 有其他频段可承接 LTE 用户时，直接重耕可避免 DSS 的持续开销，NR 能拿到完整频谱和更好的性能。反之 LTE 用户和话务还多时，DSS 是平滑过渡手段。"
            }
          ],
          "practice": "用公开的工信部频率分配信息和运营商公开报道，整理国内 900 MHz / 1800 MHz / 2.1 GHz 三个频段从 2G/3G 到 4G、5G 的用途变迁时间线，注明信息来源。"
        }
      ]
    }
  ]
};
