module.exports = [
  // ───────── 5.1 CSFB 电路域回落 ─────────
  { id: "lte-csfb-1", m: "lte-csfb", t: "single", q: "CSFB 中，MME 与 MSC/VLR 之间的接口是？", o: ["S6a", "Sv", "SGs", "S11"], a: 2, e: "SGs 接口（SGsAP）用于联合附着时的位置更新、被叫寻呼和 SMS。Sv 是 SRVCC 用的 MME–MSC Server 接口；S6a 连 HSS；S11 连 SGW。" },
  { id: "lte-csfb-2", m: "lte-csfb", t: "single", q: "UE 在 LTE 上发起 CSFB 主叫时，向 MME 发送的 NAS 消息是？", o: ["Extended Service Request", "Service Request", "Attach Request", "CM Service Request"], a: 0, e: "CSFB 使用 Extended Service Request 指示主叫或被叫 CS 回落。普通 Service Request 只恢复 PS 承载；CM Service Request 是回落到 2G/3G 之后向 MSC 发的电路域消息。" },
  { id: "lte-csfb-3", m: "lte-csfb", t: "multi", q: "关于 CSFB，下列说法正确的有？", o: ["终端需要先完成联合附着（combined EPS/IMSI attach）", "被叫时 MSC 通过 SGs 向 MME 发寻呼请求", "短信也必须回落到 2G/3G 才能收发", "回落后若位置区与联合附着时不同，可能需要先做位置更新"], a: [0, 1, 3], e: "SMS over SGs 将短信封装在 NAS 消息中经 MME 和 SGs 传递，不需要回落。其余三项均正确。" },
  { id: "lte-csfb-4", m: "lte-csfb", t: "judge", q: "RRC 释放重定向方式下，终端到达 2G/3G 后通常还要自己搜索小区并读取系统消息，这是 CSFB 接续时延较长的原因之一。", a: true, e: "普通重定向只给出目标频点，终端需自行搜小区、读系统消息；R9 带系统信息的重定向或 PS 切换可以缩短这部分时间。" },

  // ───────── 5.2 VoLTE 概览 ─────────
  { id: "lte-volte-1", m: "lte-volte", t: "single", q: "VoLTE 中承载语音媒体（RTP）的 EPS 承载通常是？", o: ["QCI 5 Non-GBR", "QCI 9 Non-GBR", "QCI 2 GBR", "QCI 1 GBR"], a: 3, e: "语音媒体用 QCI 1 GBR 专用承载；QCI 5 承载 SIP 信令；QCI 2 用于视频通话；QCI 9 一般是普通数据默认承载。" },
  { id: "lte-volte-2", m: "lte-volte", t: "single", q: "VoLTE 呼叫中，QCI 1 专用承载由谁触发建立？", o: ["终端主动向 MME 申请", "P-CSCF 经 Rx 通知 PCRF，PCRF 经 Gx 让 PGW 发起", "eNB 根据话务自行建立", "HSS 在注册时预先建立"], a: 1, e: "专用承载是网络发起的：P-CSCF 把 SDP 中的媒体信息经 Rx 报给 PCRF，PCRF 经 Gx 下发规则，PGW 发 Create Bearer Request，最终由 eNB 建立语音 DRB。" },
  { id: "lte-volte-3", m: "lte-volte", t: "multi", q: "下列哪些是 LTE 空口为 VoLTE 语音做的常见优化？", o: ["语音 DRB 使用 RLC UM", "ROHC 头压缩", "TTI Bundling", "语音 DRB 强制使用 RLC AM 以保证零丢包"], a: [0, 1, 2], e: "语音对时延敏感，用 RLC UM 避免重传时延；ROHC 压缩 RTP/UDP/IP 头；TTI Bundling 提升上行边缘覆盖。AM 重传会增加时延和抖动，不适合语音。" },
  { id: "lte-volte-4", m: "lte-volte", t: "judge", q: "在 TS 23.203 的标准 QCI 中，QCI 5 的优先级数值比 QCI 1 更小（即优先级更高）。", a: true, e: "QCI 5 优先级为 1，QCI 1 优先级为 2。SIP 信令丢失会直接导致呼叫失败，因此优先级最高、丢包率要求 10⁻⁶。" },

  // ───────── 5.3 SRVCC 与 eSRVCC ─────────
  { id: "lte-srvcc-1", m: "lte-srvcc", t: "single", q: "SRVCC 中，MME 与 MSC Server 之间用于 PS 到 CS 切换的接口是？", o: ["Sv", "SGs", "Gx", "S10"], a: 0, e: "Sv 接口（TS 29.280）承载 SRVCC PS to CS Request / Response 等消息。SGs 用于 CSFB；Gx 是 PCRF–PGW；S10 是 MME 之间的接口。" },
  { id: "lte-srvcc-2", m: "lte-srvcc", t: "single", q: "eSRVCC 相比 R8 SRVCC 缩短语音中断的关键是？", o: ["取消了测量过程", "终端同时连接 LTE 和 3G", "在服务网引入 ATCF/ATGW 锚定媒体，切换时无需更新对端", "改用 CSFB 实现"], a: 2, e: "eSRVCC 把会话锚点放到服务网 P-CSCF 附近的 ATCF/ATGW，STN-SR 指向 ATCF，媒体在本地切换，对端无感。SRVCC 仍是单无线，需要测量。" },
  { id: "lte-srvcc-3", m: "lte-srvcc", t: "multi", q: "SRVCC 能够执行的前提条件包括？", o: ["UE 有 QCI 1 语音承载", "HSS 签约中有 STN-SR 和 C-MSISDN", "MME 已向 eNB 指示 SRVCC Operation Possible", "UE 必须已完成联合附着"], a: [0, 1, 2], e: "SRVCC 针对 VoLTE 语音（QCI 1），依赖签约中的 STN-SR、C-MSISDN 和 eNB 收到的 SRVCC Operation Possible。联合附着是 CSFB 的前提，不是 SRVCC 的前提。" },
  { id: "lte-srvcc-4", m: "lte-srvcc", t: "judge", q: "SRVCC 中 MME 会把 UE 的全部 EPS 承载（包括数据承载）都通过 Sv 接口交给 MSC Server 转换为电路域。", a: false, e: "MME 只把语音承载拆分出来经 Sv 做 PS 到 CS 转换；非语音承载在目标支持时走普通 PS 切换，否则被挂起。" },

  // ───────── 5.4 4G / 5G 互操作 ─────────
  { id: "lte-interwork-1", m: "lte-interwork", t: "single", q: "LTE SIB2 中的 upperLayerIndication 的作用是？", o: ["指示终端立即添加 SgNB", "告诉终端该区域有 5G 可用，用于显示 5G 图标", "配置 B1-NR 测量门限", "指示核心网为 5GC"], a: 1, e: "upperLayerIndication（R15）只影响终端的 5G 图标显示，不代表 SCG 已建立。SgNB 添加由 B1-NR 测量触发。" },
  { id: "lte-interwork-2", m: "lte-interwork", t: "single", q: "N26 接口连接的是哪两个网元？", o: ["eNB 与 gNB", "SGW 与 UPF", "HSS 与 UDM", "MME 与 AMF"], a: 3, e: "N26 是 MME 与 AMF 之间的接口，用于 EPC 与 5GC 之间传递移动性和会话上下文，支持系统间切换。eNB 与 gNB 之间是 X2（EN-DC）。" },
  { id: "lte-interwork-3", m: "lte-interwork", t: "multi", q: "关于 SA 与 LTE 的互操作，下列说法正确的有？", o: ["有 N26 时连接态可做系统间切换，IP 地址保持", "LTE SIB24 携带 NR 频点的重选优先级等信息", "SMF+PGW-C 合设是保证 4G/5G 间会话连续的基础", "没有 N26 时 4G 与 5G 之间完全无法迁移"], a: [0, 1, 2], e: "无 N26 时仍可通过重定向、重选，终端在 4G 重新附着并以切换类型的 PDN 连接借助合设网元恢复会话，只是中断更长。" },
  { id: "lte-interwork-4", m: "lte-interwork", t: "judge", q: "NSA（EN-DC）下 SCG 失败时，终端会同时失去 LTE 连接并重新附着。", a: false, e: "SCG 失败只释放 5G 辅节点部分，终端通过 SCGFailureInformationNR 上报后仍保持在 LTE 锚点上。" }
];
