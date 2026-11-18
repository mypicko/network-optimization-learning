// 5G 路径的精选资源，按模块 id 索引
// type：video 视频 / article 文章 / book 书籍 / lab 实验环境 / tool 工具 / doc 官方文档
// 社区资源（video / article）由 tools/ 下的挖掘流程产生，在 review.html 审核后写回本文件
// 字段：title（必填）、url（可选，书籍可不填）、meta（来源·时长等短信息）、note（一句推荐理由）
window.RESOURCES = window.RESOURCES || {};

(function () {
  // ---------- 可复用条目 ----------
  const BOOK_DAHLMAN = {
    type: "book",
    title: "《5G NR 标准：下一代无线通信技术》",
    meta: "Dahlman / Parkvall / Sköld 著，机械工业出版社中译本",
    note: "爱立信标准专家所写，NR 空口和高层协议最权威的系统教材，阶段 2、3 的主教材。"
  };
  const BOOK_ZAIDI = {
    type: "book",
    title: "《5G NR 物理层技术详解：原理、模型和组件》",
    meta: "Zaidi 等著，机械工业出版社中译本",
    note: "偏物理层原理与设计取舍，适合想弄清“为什么这样设计”的读者。"
  };
  const BOOK_TSE = {
    type: "book",
    title: "Fundamentals of Wireless Communication",
    url: "https://web.stanford.edu/~dntse/wireless_book.html",
    meta: "Tse & Viswanath，作者官网可免费下载",
    note: "无线通信原理经典教材，信道、OFDM、MIMO 讲得透，英文。"
  };
  const SHARETECHNOTE = {
    type: "doc",
    title: "ShareTechnote",
    url: "https://www.sharetechnote.com/",
    meta: "英文个人技术站",
    note: "以图表和真实日志讲 LTE/NR 协议细节，查某个信令或参数时很好用。"
  };
  const SYS_OVERVIEW = {
    type: "doc",
    title: "3GPP：5G System Overview",
    url: "https://www.3gpp.org/technologies/5g-system-overview",
    meta: "3gpp.org",
    note: "3GPP 官方的 5G 系统概览，几页纸建立整体架构印象。"
  };
  const RELEASES = {
    type: "doc",
    title: "3GPP Releases 列表",
    url: "https://www.3gpp.org/specifications-technologies/releases",
    meta: "3gpp.org",
    note: "每个 Release 的冻结时间和特性总结（Release Description）。"
  };
  const OPEN5GS = {
    type: "lab",
    title: "Open5GS",
    url: "https://open5gs.org/open5gs/docs/",
    meta: "开源 5GC / EPC，C 语言",
    note: "装在一台 Linux 虚拟机上就能跑完整核心网，文档有 5G SA 快速上手教程。"
  };
  const FREE5GC = {
    type: "lab",
    title: "free5GC",
    url: "https://free5gc.org/",
    meta: "开源 5GC，Go 语言",
    note: "严格按 R15/R16 服务化架构实现，读源码对照 TS 23.501/23.502 很直观。"
  };
  const UERANSIM = {
    type: "lab",
    title: "UERANSIM",
    url: "https://github.com/aligungr/UERANSIM",
    meta: "开源 UE + gNB 模拟器",
    note: "不需要射频硬件，配合 Open5GS 或 free5GC 就能完成注册、PDU 会话。"
  };
  const SRSRAN = {
    type: "lab",
    title: "srsRAN Project",
    url: "https://docs.srsran.com/projects/project/en/latest/",
    meta: "开源 5G gNB（CU/DU），C++",
    note: "配置文件里能直接看到 SCS、带宽、SSB、BWP 等参数；支持 ZMQ 无射频仿真。"
  };
  const OAI = {
    type: "lab",
    title: "OpenAirInterface 5G",
    url: "https://gitlab.eurecom.fr/oai/openairinterface5g",
    meta: "开源 gNB / UE / 5GC",
    note: "学术界和 O-RAN 社区常用，支持 F1 接口 CU/DU 分离部署。"
  };
  const WIRESHARK = {
    type: "tool",
    title: "Wireshark",
    url: "https://www.wireshark.org/",
    meta: "抓包分析",
    note: "能解码 NGAP、NAS-5GS、PFCP、HTTP/2（SBI）等协议，配合实验环境抓包看信令。"
  };
  const SIONNA = {
    type: "lab",
    title: "Sionna",
    url: "https://github.com/NVlabs/sionna",
    meta: "NVIDIA 开源链路级仿真库，Python",
    note: "自带 OFDM、MIMO、LDPC、5G NR PUSCH 的教程 notebook，适合做实操任务。"
  };

  window.RESOURCES["5g"] = {
    // 阶段 0 前置基础
    "s0-ofdm": [BOOK_TSE, SIONNA],
    "s0-mimo": [
      { ...BOOK_TSE, note: "第 7–8 章讲 MIMO 空间复用与容量，第 10 章讲多用户 MIMO。" },
      SIONNA
    ],
    "s0-lte": [SHARETECHNOTE],

    // 阶段 1 全局视图
    "s1-scenarios": [
      {
        type: "doc",
        title: "ITU-R M.2083：IMT-2020 愿景",
        url: "https://www.itu.int/rec/R-REC-M.2083",
        meta: "itu.int",
        note: "三大场景和八项关键能力指标（“花瓣图”）的出处。"
      },
      SYS_OVERVIEW
    ],
    "s1-releases": [RELEASES],
    "s1-deploy": [SYS_OVERVIEW, BOOK_DAHLMAN],

    // 阶段 2 NR 空口物理层
    "s2-numerology": [BOOK_DAHLMAN, BOOK_ZAIDI, SRSRAN],
    "s2-ssb": [BOOK_DAHLMAN, SRSRAN],
    "s2-channels": [BOOK_DAHLMAN, BOOK_ZAIDI],
    "s2-coding": [BOOK_ZAIDI, SIONNA],
    "s2-beam": [BOOK_DAHLMAN, BOOK_ZAIDI],

    // 阶段 3 高层协议与接入网
    "s3-stack": [BOOK_DAHLMAN, SHARETECHNOTE],
    "s3-rrc": [BOOK_DAHLMAN, SHARETECHNOTE],
    "s3-access": [BOOK_DAHLMAN, SRSRAN, WIRESHARK],
    "s3-mobility": [BOOK_DAHLMAN, SHARETECHNOTE],
    "s3-ran-arch": [OAI, SRSRAN],

    // 阶段 4 5G 核心网
    "s4-sba": [FREE5GC, OPEN5GS, SYS_OVERVIEW],
    "s4-registration": [OPEN5GS, UERANSIM, WIRESHARK],
    "s4-pdu": [OPEN5GS, UERANSIM, WIRESHARK],
    "s4-qos": [OPEN5GS, FREE5GC],
    "s4-slicing": [UERANSIM, OPEN5GS],
    "s4-security": [FREE5GC, WIRESHARK],

    // 阶段 5 端到端业务
    "s5-e2e": [
      { ...UERANSIM, note: "Open5GS + UERANSIM 一台电脑跑通“开机到上网”，用 Wireshark 抓全流程。" },
      OPEN5GS,
      WIRESHARK
    ],
    "s5-paging": [UERANSIM, WIRESHARK],
    "s5-voice": [SHARETECHNOTE],

    // 阶段 6 部署与优化
    "s6-kpi": [SHARETECHNOTE],
    "s6-coverage": [BOOK_DAHLMAN],
    "s6-troubleshoot": [SHARETECHNOTE],

    // 阶段 7 演进与前沿
    "s7-r16-r17": [RELEASES],
    "s7-advanced": [
      RELEASES,
      {
        type: "doc",
        title: "ITU-R M.2160：IMT-2030（6G）框架",
        url: "https://www.itu.int/rec/R-REC-M.2160",
        meta: "itu.int",
        note: "6G 六大场景与能力指标的官方框架。"
      }
    ]
  };
})();
