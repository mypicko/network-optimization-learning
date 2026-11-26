// 阶段 7 演进
module.exports = {
  id: "L7", title: "演进",
  summary: "LTE 并没有停在 R10：R13 起的 LTE-Advanced Pro 带来了 LAA、FD-MIMO、NB-IoT / eMTC 和 V2X；而在 5G 时代，LTE 频谱正在被重耕、与 NR 动态共享，LTE 自身转向覆盖、语音与物联网的长期基础网。",
  modules: [
    {
      id: "lte-pro",
      title: "LTE-A Pro 增强",
      hours: 3,
      goals: [
        "说出 LTE-Advanced Pro 的版本范围及主要增强方向",
        "理解 LAA 在非授权频谱上的工作方式与 LBT 的必要性",
        "了解 FD-MIMO、大规模载波聚合、V2X、短 TTI 等特性的定位",
        "能判断哪些增强在国内现网有实际意义"
      ],
      concepts: ["LTE-Advanced Pro（R13 起）", "LAA / eLAA 与 LBT", "FD-MIMO（垂直维波束）", "最多 32 个成员载波的 CA", "LWA（LTE-WLAN 聚合）", "V2X 与 PC5 直连", "短 TTI / 低时延增强", "高阶调制（256QAM 上行、1024QAM 下行）"],
      specs: [
        { id: "TS 36.300", note: "E-UTRAN 总体描述（各版本新特性概述）" },
        { id: "TS 36.213", note: "LAA 信道接入（LBT）等物理层过程" },
        { id: "TS 36.211", note: "物理信道与调制" }
      ],
      quiz: [
        { q: "LAA 为什么一定要有 LBT？", a: "非授权频段上还有 Wi-Fi 等其他系统，许多国家和地区的法规要求先听后发。LBT 让 LAA 在发送前先做信道空闲评估，信道忙就退避，从而与 Wi-Fi 公平共存；不做 LBT 的 LTE 会持续占用信道，严重压制 Wi-Fi。" },
        { q: "FD-MIMO 和 LTE R10 的 8 天线传输相比，主要变化是什么？", a: "R10 的波束赋形基本只在水平维度。FD-MIMO 使用二维平面阵列，同时在水平和垂直两个维度形成波束，并扩展了 CSI-RS 端口数和码本，可以分辨高楼不同楼层的用户、提升多用户 MIMO 容量。它是 5G Massive MIMO 的先导。" }
      ],
      practice: "查阅 3GPP 官网的 Release 13 / 14 / 15 特性列表（公开资料），整理一张表：特性名称、所属版本、解决的问题、你认为在国内现网是否部署过，并说明理由。"
    },
    {
      id: "lte-iot",
      title: "NB-IoT 与 eMTC",
      hours: 3,
      goals: [
        "说出 NB-IoT 与 eMTC 在带宽、速率、移动性、语音支持上的区别",
        "理解 NB-IoT 三种部署方式和覆盖增强（重复传输）的原理",
        "掌握 PSM、eDRX 两种省电机制和 CIoT 控制面 / 用户面优化",
        "能为一个具体物联网场景选择合适的技术（NB-IoT、eMTC、LTE Cat.1）"
      ],
      concepts: ["NB-IoT：180 kHz、单 PRB", "独立 / 保护带 / 带内部署", "eMTC（Cat-M1）：1.4 MHz 窄带", "覆盖增强与重复传输", "PSM 与 T3324 / T3412", "eDRX", "控制面 CIoT 优化（Data over NAS）", "用户面 CIoT 优化（RRC Suspend / Resume）", "LTE Cat.1 / Cat.1bis"],
      specs: [
        { id: "TS 36.211", note: "NB-IoT 与 eMTC 物理信道" },
        { id: "TS 36.300", note: "NB-IoT、eMTC 总体描述" },
        { id: "TS 23.401", note: "CIoT EPS 优化、PSM、eDRX" },
        { id: "TS 24.301", note: "PSM、eDRX 等 NAS 协商" }
      ],
      quiz: [
        { q: "PSM 和 eDRX 都能省电，怎么选？", a: "PSM 期间终端完全不可达，只有自己醒来（周期 TAU 或有上行数据）时才能收下行，适合只需定期上报、对下行实时性无要求的场景，如水表。eDRX 是拉长寻呼周期，终端仍可被寻呼，只是有分钟级到小时级的时延，适合偶尔需要下发指令的场景，如共享单车锁、烟感复位。两者也可以组合使用。" },
        { q: "既然 NB-IoT 覆盖更好，为什么共享设备、穿戴类产品常用 eMTC 或 Cat.1？", a: "NB-IoT 速率很低、R13 连接态不支持切换、不支持语音，适合静止、低频、小数据。移动中的设备需要切换能力，穿戴设备可能需要语音或较高速率，eMTC 支持连接态移动性和 VoLTE，Cat.1 速率更高、生态成熟，因此更合适。" }
      ],
      practice: "设想一个智慧停车地磁项目（每天上报约 10 次、每次几十字节、设备埋在地下、电池要用 5 年以上），从覆盖、功耗、速率、移动性、模组成本五个方面比较 NB-IoT、eMTC、Cat.1，写出选择结论和 PSM / eDRX 的参数设想（数值为示例）。"
    },
    {
      id: "lte-refarm",
      title: "频谱重耕、DSS 与 4G 演进",
      hours: 3,
      goals: [
        "理解频谱重耕的动因和 2G/3G→4G→5G 的典型重耕路径",
        "掌握 LTE-NR 动态频谱共享（DSS）的基本原理和开销来源",
        "能评估一个频段是“重耕给 NR”还是“DSS 共享”更合适",
        "了解 5G 时代 LTE 网络的定位：覆盖底座、语音、物联网与锚点"
      ],
      concepts: ["频谱重耕（refarming）", "2G/3G 退网", "LTE 带宽档位（1.4–20 MHz）", "DSS 动态频谱共享", "NR 对 LTE CRS 的速率匹配", "MBSFN 子帧方式", "共享开销", "4G 网络精简（减频 / 减站）"],
      specs: [
        { id: "TS 36.101", note: "E-UTRA 频段与信道带宽" },
        { id: "TS 38.214", note: "NR PDSCH 速率匹配（含 LTE CRS 图样）" },
        { id: "TS 38.331", note: "lte-CRS-ToMatchAround 等 DSS 相关配置" }
      ],
      quiz: [
        { q: "DSS 的开销主要来自哪里？", a: "同一载波上既要发 LTE 的 CRS、PDCCH 和同步信号，又要发 NR 的 SSB、PDCCH、DMRS 等；NR 必须避开 LTE CRS 所在的资源粒子（速率匹配），或借用 MBSFN 子帧放 NR 信号。两套控制和参考信号叠加，加上调度协调的限制，导致总可用资源少于单独部署 LTE 或 NR。" },
        { q: "什么情况下宁可把频段直接重耕给 NR，而不是做 DSS？", a: "当该频段上的 LTE 话务已经很低、主流终端已支持 NR 该频段、且周边 4G 有其他频段可承接 LTE 用户时，直接重耕可避免 DSS 的持续开销，NR 能拿到完整频谱和更好的性能。反之 LTE 用户和话务还多时，DSS 是平滑过渡手段。" }
      ],
      practice: "用公开的工信部频率分配信息和运营商公开报道，整理国内 900 MHz / 1800 MHz / 2.1 GHz 三个频段从 2G/3G 到 4G、5G 的用途变迁时间线，注明信息来源。"
    }
  ]
};
