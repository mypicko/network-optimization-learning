// 5G 路径 · 阶段 5 端到端业务与信令：模块知识讲解
window.LESSONS = window.LESSONS || {};
window.LESSONS["5g"] = window.LESSONS["5g"] || {};

Object.assign(window.LESSONS["5g"], {
  // ───────────── 5.1 开机到上网 ─────────────
  "s5-e2e": {
    sections: [
      {
        h: "全流程总览",
        table: {
          head: ["阶段", "关键消息", "协议 / 接口", "涉及网元", "这一步拿到了什么"],
          rows: [
            ["① 小区搜索", "PSS、SSS、PBCH", "物理层", "UE、gNB", "同步、PCI、SSB 索引"],
            ["② 系统消息", "MIB、SIB1", "RRC（广播）", "UE、gNB", "接入参数、随机接入配置"],
            ["③ 随机接入", "Msg1–Msg4", "MAC / RRC", "UE、gNB", "上行同步、C-RNTI"],
            ["④ RRC 建立", "RRCSetup、RRCSetupComplete", "RRC", "UE、gNB", "SRB1，可以传 NAS"],
            ["⑤ 注册", "Registration Request … Complete", "NAS（N1）、NGAP（N2）、SBI", "UE、AMF、AUSF、UDM、PCF", "身份确认、安全、5G-GUTI、TAI 列表、允许的切片"],
            ["⑥ 接入层安全与能力", "SecurityModeCommand、UECapabilityEnquiry", "RRC", "UE、gNB", "空口加密、终端能力"],
            ["⑦ PDU 会话", "PDU Session Establishment … N4 修改", "NAS、NGAP、PFCP、SBI", "UE、gNB、AMF、SMF、UPF、PCF、UDM", "IP 地址、DRB、N3 隧道"],
            ["⑧ 上网", "DNS 查询、TCP / HTTP", "用户面", "UE、gNB、UPF、互联网", "业务数据"]
          ]
        }
      },
      {
        h: "完整信令时序",
        flow: `sequenceDiagram
    participant UE
    participant gNB
    participant AMF
    participant SMF
    participant UPF
    Note over UE,gNB: 小区搜索，读 MIB / SIB1
    UE->>gNB: Msg1 前导
    gNB->>UE: Msg2 随机接入响应
    UE->>gNB: Msg3 RRCSetupRequest
    gNB->>UE: Msg4 RRCSetup
    UE->>gNB: RRCSetupComplete（Registration Request）
    gNB->>AMF: Initial UE Message
    AMF->>UE: 鉴权、NAS 安全模式
    AMF->>gNB: Initial Context Setup（Registration Accept）
    gNB->>UE: RRC 安全模式、能力查询、RRC 重配置
    UE->>AMF: Registration Complete
    UE->>AMF: PDU Session Establishment Request
    AMF->>SMF: 创建会话上下文
    SMF->>UPF: N4 会话建立
    SMF->>AMF: N1N2MessageTransfer
    AMF->>gNB: PDU Session Resource Setup Request
    gNB->>UE: RRC 重配置（建 DRB，带会话接受）
    gNB->>AMF: PDU Session Resource Setup Response
    AMF->>SMF: 更新会话（基站隧道地址）
    SMF->>UPF: N4 会话修改
    Note over UE,UPF: 用户面打通，开始上网`
      },
      {
        h: "在日志里怎么找到每一步",
        list: [
          "**终端侧日志**（路测或终端抓取工具）：能看到空口的 RRC 消息和解密后的 NAS 消息，以及物理层测量（RSRP、SINR）和调度信息。",
          "**基站侧信令跟踪**：能看到 RRC、NGAP、XnAP 消息，适合多用户问题。",
          "**核心网侧**：在 N2、N4、SBI 上抓包，能看到 NGAP、PFCP、HTTP/2 消息。",
          "建议做法：以 RRCSetupRequest 为起点、以第一个用户面数据包为终点，把每条关键消息的时间戳记下来，形成“端到端时间线”。"
        ]
      },
      {
        h: "常见卡点与对应的排查方向",
        table: {
          head: ["卡在哪一步", "常见原因", "排查方向"],
          rows: [
            ["搜不到 5G 小区", "终端不支持该频段、5G 开关关闭、无覆盖", "终端能力、频段、SSB 覆盖"],
            ["随机接入失败", "上行覆盖或干扰", "见 3.3 的分段排查表"],
            ["注册被拒", "签约、切片、区域限制", "5GMM 原因值（见 4.2）"],
            ["注册成功但没有 IP", "PDU 会话建立失败", "5GSM 原因值、DNN 和签约"],
            ["有 IP 但打不开网页", "DNS、用户面路由、UPF 或防火墙", "用户面抓包：DNS 是否有响应、TCP 是否建立"]
          ]
        },
        tip: "端到端思维是区分初级和高级工程师的关键：遇到“上不了网”，先判断卡在哪个阶段，再去找对应专业的人，而不是一上来就调参数。"
      }
    ]
  },

  // ───────────── 5.2 服务请求与寻呼 ─────────────
  "s5-paging": {
    sections: [
      {
        h: "为什么需要寻呼",
        p: [
          "终端进入空闲态（CM-IDLE）后，核心网只知道它在 **TAI 列表**中的某个跟踪区内，不知道具体在哪个小区。有下行数据或来电时，必须在整个 TAI 列表范围内“喊一声”，这就是**寻呼**。终端听到后发起**服务请求**，重新建立连接。"
        ]
      },
      {
        h: "网络发起的服务请求",
        flow: `sequenceDiagram
    participant UE
    participant gNB
    participant AMF
    participant SMF
    participant UPF
    Note over UPF: 下行数据到达，终端处于空闲态
    UPF->>SMF: 下行数据通知（数据先缓存）
    SMF->>AMF: N1N2MessageTransfer
    AMF->>gNB: NGAP Paging（发给 TAI 列表内的基站）
    gNB->>UE: 空口寻呼（P-RNTI 调度）
    UE->>gNB: 随机接入 + RRC 建立（Service Request）
    gNB->>AMF: Initial UE Message
    AMF->>gNB: Initial Context Setup（恢复 PDU 会话资源）
    gNB->>UE: RRC 重配置，恢复 DRB
    AMF->>SMF: 更新会话（基站隧道地址）
    SMF->>UPF: N4 会话修改
    UPF->>UE: 转发缓存的下行数据`,
        after: ["**终端发起的服务请求**更简单：终端有上行数据要发，直接随机接入、RRC 建立、发 Service Request，核心网恢复会话的用户面资源即可。"]
      },
      {
        h: "寻呼时机：终端什么时候醒来听",
        list: [
          "空闲态终端按 **DRX 周期**（如 32、64、128、256 个无线帧）周期性醒来，只在自己的**寻呼帧（PF）**中的**寻呼时机（PO）**监听 PDCCH。",
          "PF 和 PO 由终端标识（5G-S-TMSI 取模）、DRX 周期和小区配置算出，网络和终端算出来一致，所以网络知道什么时候发寻呼终端能听到。",
          "NR 的一个 PO 包含多个 PDCCH 监听时机，对应各个 SSB 波束——寻呼要在所有波束上各发一次，因为基站不知道空闲态终端在哪个波束下。",
          "DRX 周期越长越省电，但寻呼时延越大。"
        ]
      },
      {
        h: "INACTIVE 态的 RAN 寻呼",
        p: [
          "INACTIVE 态终端在核心网看来是“连接”的，下行数据直接送到保存其上下文的**锚点基站**。锚点基站在 **RAN 通知区（RNA）**内发起 RAN 寻呼（经 Xn 通知区内其他基站），用 I-RNTI 识别终端。终端听到后发 RRCResumeRequest 恢复连接，全程不需要核心网参与。"
        ]
      },
      {
        h: "跟踪区规划的权衡",
        table: {
          head: ["", "TAI 列表 / 跟踪区大", "TAI 列表 / 跟踪区小"],
          rows: [
            ["注册更新信令", "少", "多"],
            ["终端耗电", "低", "高"],
            ["寻呼负荷", "高（要在更多小区寻呼）", "低"],
            ["适合", "低话务、高移动区域", "高话务密集区域"]
          ]
        },
        after: ["核心网常用**分级寻呼**降低负荷：先在终端最后所在的小区或基站寻呼，没有响应再扩大到整个 TAI 列表。跟踪区边界应避开高铁、主干道等用户频繁穿越的地方，减少注册更新。"],
        tip: "寻呼成功率是核心网和无线共同关注的指标。寻呼失败常见原因：终端已离开覆盖区、TA 边界处注册更新未完成、寻呼信道拥塞、终端处于弱覆盖收不到寻呼。"
      }
    ]
  },

  // ───────────── 5.3 5G 语音 ─────────────
  "s5-voice": {
    sections: [
      {
        h: "5G 语音的几种方案",
        table: {
          head: ["方案", "组网", "过程", "现状"],
          rows: [
            ["VoLTE", "NSA", "NSA 的控制面在 4G，语音直接用 VoLTE", "NSA 终端的标准做法"],
            ["EPS Fallback", "SA", "发起或接听电话时回落到 4G，用 VoLTE 通话", "SA 早期的主流方案"],
            ["VoNR", "SA", "直接在 5G 上通过 IMS 建立语音", "目标方案，国内正在推进"]
          ]
        },
        after: ["所有方案的语音都由 **IMS** 处理，区别只在于承载语音的无线网络是 4G 还是 5G。"]
      },
      {
        h: "IMS 架构",
        table: {
          head: ["网元", "作用"],
          rows: [
            ["P-CSCF", "终端接入 IMS 的第一跳，SIP 代理，与 PCF 交互申请语音 QoS"],
            ["I-CSCF", "查询用户归属的 S-CSCF"],
            ["S-CSCF", "注册和会话控制核心，触发业务"],
            ["HSS / UDM", "IMS 签约数据"],
            ["TAS（MMTel AS）", "语音业务逻辑：呼叫转移、等待等补充业务"],
            ["SBC", "边界控制，常与 P-CSCF 合设"]
          ]
        },
        after: ["终端开机注册 5G 后，会额外建立一个 DNN 为 ims 的 PDU 会话，其中有一条 5QI 5 的 QoS 流承载 SIP 信令，然后用 SIP REGISTER 向 IMS 注册。"]
      },
      {
        h: "VoNR 呼叫流程",
        flow: `sequenceDiagram
    participant UE as 主叫终端
    participant NG as gNB / 5GC
    participant IMS as IMS（P-CSCF 等）
    UE->>IMS: SIP INVITE（经 5QI 5 信令流）
    IMS->>NG: 经 PCF 申请语音 QoS
    NG->>UE: PDU 会话修改，建立 5QI 1 语音 QoS 流和 DRB
    IMS-->>UE: 183 Session Progress / PRACK / UPDATE
    IMS-->>UE: 180 Ringing（被叫振铃）
    IMS-->>UE: 200 OK（被叫接听）
    UE->>IMS: ACK
    Note over UE,IMS: RTP 语音在 5QI 1 上传输`,
        after: ["空口上，语音 DRB 通常用 **RLC UM**（不重传，避免时延）和 **ROHC 头压缩**，并配合 DRX 省电。"]
      },
      {
        h: "EPS Fallback 怎么回落",
        steps: [
          "呼叫建立时，IMS 触发网络为终端建立 5QI 1 的语音 QoS 流。",
          "基站收到这个请求后，如果配置为 EPS Fallback，就拒绝该 QoS 流（原因是“IMS 语音触发了 EPS 回落”），并发起到 LTE 的切换或重定向。",
          "终端到达 4G 后完成跟踪区更新，网络在 4G 上建立 QCI 1 专用承载，用 VoLTE 继续完成呼叫。",
          "通话结束后，终端再通过重选或切换回到 5G。"
        ],
        after: ["有 N26 接口时走切换，中断短；没有 N26 时走重定向，接续时延更长。"]
      },
      {
        h: "两种方案对比",
        table: {
          head: ["", "EPS Fallback", "VoNR"],
          rows: [
            ["接续时延", "较长，多一次跨系统转换", "较短"],
            ["通话中的数据业务", "在 4G 上", "保持 5G"],
            ["对 5G 网络的要求", "低，依赖 4G VoLTE 网络", "高，需要 5G 连续覆盖和语音优化"],
            ["对终端的要求", "支持回落即可", "终端需支持 VoNR"]
          ]
        }
      },
      {
        h: "语音质量指标",
        list: [
          "**接通率**：呼叫成功建立的比例。",
          "**接续时延**：从拨号到听到回铃音的时间。",
          "**掉话率**：通话中异常中断的比例。",
          "**MOS**：语音质量评分（1–5 分）。编码方式影响很大：AMR-WB 高清语音、EVS 超高清语音质量更好、抗丢包能力更强。",
          "**单通、吞字**：常与上行覆盖、丢包、切换有关。"
        ],
        tip: "语音问题要同时看三层：无线（覆盖、切换、DRX）、核心网和 IMS（SIP 信令时序、QoS 流建立）、终端（是否支持 VoNR、开关状态）。"
      }
    ]
  }
});
