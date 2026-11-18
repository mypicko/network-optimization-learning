// 生成 data/figures/5g.js：把配图按模块挂到讲解的小节上
// 用法：node tools/figures/build.mjs
// at：小节标题中的关键词（找不到时放到该模块最后一节）
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import * as phy from "./phy.mjs";
import * as net from "./net.mjs";

const FIGURES = {
  "s0-ofdm": [
    { at: "正交", svg: phy.ofdmSpectrum(), caption: "OFDM 子载波频谱：子载波相互重叠，但每个子载波在其他子载波的中心频点处幅度为零" },
    { at: "循环前缀", svg: phy.cyclicPrefix(), caption: "循环前缀：只要多径延迟小于 CP，接收窗口里就不会混入下一个符号" }
  ],
  "s0-mimo": [
    { at: "三种用法", svg: phy.mimoUses(), caption: "多天线的三种用法" }
  ],
  "s1-scenarios": [
    { at: "三大场景", svg: phy.scenarios(), caption: "5G 三大场景及典型业务" }
  ],
  "s1-deploy": [
    {
      at: "EN-DC",
      caption: "NSA（Option 3x）与 SA（Option 2）的连接方式",
      flow: `flowchart LR
  subgraph NSA["NSA（Option 3x）"]
    U1["终端"] -- "LTE：信令 + 数据" --> E1["4G 基站 eNB（主节点）"]
    U1 -- "NR：数据" --> G1["5G 基站 gNB（辅节点）"]
    E1 <-- "X2" --> G1
    E1 -- "S1-C 信令" --> EPC[("4G 核心网 EPC")]
    G1 -- "S1-U 数据" --> EPC
  end
  subgraph SA["SA（Option 2）"]
    U2["终端"] -- "NR：信令 + 数据" --> G2["5G 基站 gNB"]
    G2 -- "NG" --> C5[("5G 核心网 5GC")]
  end`
    }
  ],
  "s2-numerology": [
    { at: "帧、子帧", svg: phy.frameStructure(), caption: "NR 帧结构：子载波间隔每翻一倍，时隙长度减半" },
    { at: "资源网格", svg: phy.resourceGrid(), caption: "资源网格中的 RE 和 RB" }
  ],
  "s2-ssb": [
    { at: "SSB 的结构", svg: phy.ssbStructure(), caption: "SSB 的时频结构" },
    { at: "波束扫描", svg: phy.ssbBeamSweep(), caption: "SSB 波束扫描与突发集" }
  ],
  "s2-coding": [
    {
      at: "处理链",
      caption: "下行数据的物理层处理链（PDSCH）",
      flow: `flowchart TB
  subgraph A["比特级处理"]
    direction LR
    TB["传输块"] --> CRC["加 CRC"] --> SEG["码块分割"] --> LDPC["LDPC 编码"] --> RM["速率匹配"] --> SCR["加扰"]
  end
  subgraph B["符号级处理"]
    direction LR
    MOD["调制（QPSK～256QAM）"] --> LM["层映射"] --> PRE["预编码"] --> RE["映射到 RE"] --> OFDM["OFDM 调制"]
  end
  A --> B`
    }
  ],
  "s2-beam": [
    {
      at: "三个环节",
      caption: "波束管理的三个环节：先粗后细",
      flow: `flowchart LR
  P1["P1 粗扫<br/>基站用较宽的 SSB 波束扫一遍<br/>终端选出最好的"] --> P2["P2 细扫<br/>在选中的方向上<br/>用更窄的 CSI-RS 波束细调"] --> P3["P3 终端侧<br/>基站固定发送波束<br/>终端调整自己的接收波束"]`
    }
  ],
  "s3-stack": [
    { at: "全景", svg: net.protocolStack(), caption: "NR 控制面与用户面协议栈" }
  ],
  "s3-mobility": [
    { at: "测量事件", svg: net.eventA3(), caption: "A3 事件：最常用的同频切换触发事件" }
  ],
  "s3-ran-arch": [
    {
      at: "为什么要拆分",
      caption: "gNB 拆分为 CU、DU、RU 后的接口",
      flow: `flowchart TB
  C["5GC：AMF / UPF"]
  CP["CU-CP<br/>RRC、PDCP-C"]
  UP["CU-UP<br/>SDAP、PDCP-U"]
  DU["DU<br/>RLC、MAC、高层 PHY"]
  RU["RU / AAU<br/>低层 PHY、射频"]
  C -- "NG（回传）" --- CP
  C -- "NG-U（回传）" --- UP
  CP -- "E1" --- UP
  CP -- "F1-C" --- DU
  UP -- "F1-U（中传）" --- DU
  DU -- "前传（eCPRI）" --- RU`
    }
  ],
  "s4-sba": [
    { at: "网元功能", svg: net.sba(), caption: "5G 核心网服务化架构" }
  ],
  "s4-qos": [
    {
      at: "QoS 流",
      caption: "一个 PDU 会话里的 QoS 流、DRB 与 N3 隧道",
      flow: `flowchart LR
  subgraph S["一个 PDU 会话"]
    F1["QoS 流 QFI 1<br/>上网（非 GBR）"]
    F2["QoS 流 QFI 2<br/>视频（非 GBR）"]
    F3["QoS 流 QFI 3<br/>语音（GBR）"]
  end
  F1 -- "SDAP 映射" --> D1["DRB 1"]
  F2 -- "SDAP 映射" --> D1
  F3 -- "SDAP 映射" --> D2["DRB 2"]
  D1 -- "空口" --> G["gNB"]
  D2 -- "空口" --> G
  G -- "N3：每个会话一条 GTP-U 隧道<br/>包头带 QFI" --> U["UPF"]`
    }
  ],
  "s4-slicing": [
    {
      at: "端到端",
      caption: "端到端切片需要无线、承载、核心网三个域配合",
      flow: `flowchart LR
  UE["终端<br/>请求 S-NSSAI"] --> RAN["无线接入网<br/>PRB 预留、调度优先级"] --> TN["承载网<br/>FlexE、VPN 隔离"] --> CN["核心网<br/>按切片选择 SMF / UPF"]
  CN --> A["切片 A：公众上网（eMBB）"]
  CN --> B["切片 B：行业专网（UPF 下沉园区）"]`
    }
  ],
  "s4-security": [
    {
      at: "密钥层次",
      caption: "5G 密钥层次（5G-AKA）",
      flow: `flowchart TB
  K["K：长期密钥<br/>存在 SIM 卡和 UDM/ARPF 中"] --> CK["CK、IK"] --> KA["K_AUSF（AUSF）"] --> KS["K_SEAF（SEAF）"] --> KM["K_AMF（AMF）"]
  KM --> NAS["K_NASint / K_NASenc<br/>NAS 信令完整性与加密"]
  KM --> KG["K_gNB（gNB）"]
  KG --> RRC["K_RRCint / K_RRCenc<br/>RRC 信令"]
  KG --> UPK["K_UPint / K_UPenc<br/>用户面数据"]`
    }
  ],
  "s5-paging": [
    { at: "寻呼时机", svg: net.pagingDrx(), caption: "空闲态终端的 DRX 与寻呼时机" }
  ],
  "s6-kpi": [
    { at: "经验参考门限", svg: net.rsrpSinrQuadrant(), caption: "用 RSRP 和 SINR 两个维度判断问题类型" }
  ],
  "s6-coverage": [
    { at: "链路预算", svg: net.linkBudget(), caption: "链路电平图：覆盖距离由最大允许路损决定" }
  ],
  "s6-troubleshoot": [
    {
      at: "问题定界",
      caption: "问题定界的判断思路",
      flow: `flowchart TD
  A{"影响范围？"} -->|"特定机型或版本"| T["终端问题"]
  A -->|"单小区 / 单站"| B{"有告警或底噪抬升？"}
  B -->|"有"| H["硬件、干扰或该站传输"]
  B -->|"没有"| P["参数、覆盖、邻区"]
  A -->|"一片区域同时恶化"| I["区域性干扰（如大气波导）<br/>或共用的传输节点"]
  A -->|"无线正常但业务失败"| C{"看 NAS 原因值和用户面"}
  C -->|"注册或会话被拒"| CN["核心网：签约、策略、网元"]
  C -->|"有 IP 但速率低或丢包"| TR["传输、UPF 或互联网出口"]`
    },
    {
      at: "低速率",
      caption: "低速率的拆解：哪一项掉下来，哪一项就是瓶颈",
      flow: `flowchart LR
  R["用户速率"] --> T["时域：调度比例<br/>用户多、数据源不足"]
  R --> F["频域：分配的 RB 数<br/>多用户分享、带宽配置"]
  R --> E["每 RB 比特数<br/>Rank × 调制 × 码率<br/>根源是 SINR"]
  R --> L["1 − BLER<br/>突发干扰、链路自适应"]`
    }
  ],
  "s7-r16-r17": [
    { at: "NTN", svg: net.ntn(), caption: "NTN 透明转发：卫星只做中继，基站在地面" }
  ]
};

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "..", "..", "data", "figures", "5g.js");
const body = `// 5G 路径讲解配图（由 tools/figures/build.mjs 生成，请修改生成脚本后重新运行，不要手工编辑）
window.FIGURES = window.FIGURES || {};
window.FIGURES["5g"] = ${JSON.stringify(FIGURES, null, 1)};
`;
writeFileSync(out, body, "utf8");
const n = Object.values(FIGURES).reduce((a, l) => a + l.length, 0);
console.log(`已生成 ${out}：${Object.keys(FIGURES).length} 个模块，${n} 张图`);
