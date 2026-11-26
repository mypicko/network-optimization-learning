# LTE 路线编写规范（给各阶段编写代理）

站点：「通途 · 通信人的系统学习路线」，纯静态站，面向国内移动通信从业者（无线 / 核心网 / 网优工程师、转岗者）。
已有 5G 路线可作为风格和质量标杆：`data/pathways/5g.js`、`data/lessons/5g/*.js`、`data/exam/5g.js`。**动笔前先读 5G 的 `s3-access` 模块（路线条目、讲解、考题）感受粒度。**

## 硬性规则
1. 全部简体中文；协议名、信令名、参数名保持英文原样（如 RRCConnectionRequest、prach-ConfigIndex）。
2. **全部原创**：不抄教材、培训课件、厂商文档的例题和案例；数值示例自己编，标注“示例”。
3. **不使用任何运营商 / 厂商的现网数据、工参、内部案例**。
4. 技术事实必须准确，以 3GPP 规范为准（36 系列无线、23.401 EPC、24.301 NAS、33.401 安全、23.203 PCC、23.272 CSFB、23.216 SRVCC 等）。规范章节号拿不准就只写规范号不写 §，**不要编造章节号或数值**。厂商实现相关的内容说“常见做法”“因厂家而异”。
5. 讲解面向工程实践：讲清“是什么、为什么这样设计、现网怎么看/怎么用、常见坑”。可与 5G 对比（一句话即可，5G 路线另有详解）。
6. 文本里可用 `**加粗**`；不要用其他 Markdown（不要 `#`、反引号、链接语法）。
7. 字符串里出现英文双引号要转义或改用中文引号“”。Mermaid 用反引号模板字符串。
8. 只写分配给你的文件，不改仓库其他文件，不 git commit。

## 你要交付的 3 个文件（N = 你的阶段号，可能多个阶段，每个阶段各一套）

### 1) `tools/lte-parts/stage-N.modules.js` —— 路线条目
```js
// 阶段 N 标题
module.exports = {
  id: "L0", title: "无线与系统基础", summary: "一句到两句阶段说明。", // 网优阶段加 track: "网优方向"
  modules: [
    {
      id: "lte-ofdma",            // 用分配给你的 id，不得改
      title: "OFDMA 与 SC-FDMA",  // 用分配给你的标题（可微调措辞）
      hours: 4,                   // 用分配的学时
      // tools: ["budget"],       // 仅当分配表写了才加
      goals: ["3–4 条“学完你能……”的能力目标"],
      concepts: ["6–9 个核心概念短语"],
      specs: [{ id: "TS 36.211", note: "§6 下行物理信道" }],   // 2–4 条
      // flow: `sequenceDiagram ...`,   // 流程类模块加一张 Mermaid 时序图（参与者用英文：UE / eNB / MME / SGW / PGW / HSS 等）
      quiz: [{ q: "问答题", a: "参考答案（2–4 句）" }, { q: "…", a: "…" }],   // 每模块 2–3 道问答
      practice: "一条实操任务（不需要现网数据也能做，或说明用路测软件/手机工程模式/公开资料）"
    }
  ]
};
```

### 2) `data/lessons/lte/LN.js` —— 知识讲解（最重要，每模块 5–7 个小节）
```js
// LTE 路径 · 阶段 N 标题：模块知识讲解
window.LESSONS = window.LESSONS || {};
window.LESSONS["lte"] = window.LESSONS["lte"] || {};

Object.assign(window.LESSONS["lte"], {
  // ───────────── N.1 模块标题 ─────────────
  "lte-xxx": {
    sections: [
      { h: "小节标题", p: ["段落"], list: ["要点"], steps: ["有序步骤"],
        table: { head: ["列1", "列2"], rows: [["…", "…"]] },
        flow: `sequenceDiagram ...`,   // 可选
        after: ["表格/图之后的段落"], tip: "一条实践提示（可选）" }
    ]
  }
});
```
每个小节至少有 p / list / steps / table / flow 中的一种；字段都可选。表格多用、段落别太长。每个模块讲解约 1500–3000 字。

### 3) `tools/lte-parts/exam-N.js` —— 考试客观题（每模块 4 道：单选 2、多选 1、判断 1 为宜）
```js
module.exports = [
  // ───────── N.1 模块标题 ─────────
  { id: "lte-xxx-1", m: "lte-xxx", t: "single", q: "题干", o: ["A", "B", "C", "D"], a: 1, e: "解析，说明为什么对、其他为什么错" },
  { id: "lte-xxx-2", m: "lte-xxx", t: "multi",  q: "…", o: ["…","…","…","…"], a: [0, 2], e: "…" },
  { id: "lte-xxx-3", m: "lte-xxx", t: "judge",  q: "…", a: false, e: "…" }
];
```
单选正确答案下标在 0–3 间分散，不要总是同一个位置。题目必须能从你写的讲解里找到依据。

## 自检（交付前必须做）
```bash
node -e 'require("./tools/lte-parts/stage-N.modules.js"); require("./tools/lte-parts/exam-N.js")'
node -e 'global.window={}; require("./data/lessons/lte/LN.js"); console.log(Object.keys(window.LESSONS.lte))'
```
确认每个分配的模块 id 在三个文件里都有。最后回报：写了哪些文件、每模块小节数和题数、哪些事实你不确定（务必如实列出）。

## 全路线大纲（id / 标题 / 学时 / tools）—— 用来避免各阶段重复，跨模块内容写“见 X.Y”
阶段号 N 即 stage-N / LN.js / exam-N 中的 N；模块编号 = 阶段号.序号。

- **L0 无线与系统基础**（stage 0）
  0.1 lte-evolution 从 2G/3G 到 LTE：演进与 EPS 总体 3h ｜ 0.2 lte-ofdma OFDMA 与 SC-FDMA 4h ｜ 0.3 lte-mimo LTE 多天线与传输模式 4h
- **L1 网络架构与标识**（stage 1）
  1.1 lte-arch E-UTRAN 与 EPC 架构、接口 4h ｜ 1.2 lte-stack 协议栈与无线承载 4h ｜ 1.3 lte-bands 频段、EARFCN 与 FDD / TDD 3h ｜ 1.4 lte-ids 标识体系：IMSI、GUTI、TAI、ECGI、PCI 3h
- **L2 物理层**（stage 2）
  2.1 lte-frame 帧结构与 TDD 上下行配置 4h ｜ 2.2 lte-cellsearch 小区搜索与系统消息 4h ｜ 2.3 lte-dl 下行物理信道与参考信号 5h ｜ 2.4 lte-ul 上行物理信道、PRACH 与 SRS 5h ｜ 2.5 lte-sched 调度、AMC 与 HARQ 4h ｜ 2.6 lte-power 功率控制与 DRX 3h
- **L3 高层协议与空口流程**（stage 3）
  3.1 lte-rrc RRC 状态、空闲态与小区重选 4h ｜ 3.2 lte-access 随机接入与 RRC 连接建立 4h（flow）｜ 3.3 lte-meas 测量配置与测量事件 4h ｜ 3.4 lte-ho 切换：X2、S1 与异系统 5h（flow）｜ 3.5 lte-rlf 无线链路失败与 RRC 重建 3h ｜ 3.6 lte-ca 载波聚合与 LTE-A 关键技术 4h
- **L4 EPC 核心网**（stage 4）
  4.1 lte-epc EPC 网元与接口详解 4h ｜ 4.2 lte-attach 附着与默认承载建立 5h（flow）｜ 4.3 lte-bearer EPS 承载与 QoS 4h ｜ 4.4 lte-tau TAU、寻呼与服务请求 4h（flow）｜ 4.5 lte-security 鉴权与安全（EPS-AKA）3h ｜ 4.6 lte-pcc PCC 策略控制与计费 3h
- **L5 语音与互操作**（stage 5）
  5.1 lte-csfb CSFB 电路域回落 4h（flow）｜ 5.2 lte-volte VoLTE 概览 4h（IMS 细节留给将来的 IMS 路线）｜ 5.3 lte-srvcc SRVCC 与 eSRVCC 3h ｜ 5.4 lte-interwork 4G / 5G 互操作 4h
- **L6 网络规划与优化**（stage 6，track: "网优方向"）
  6.1 lte-plan 规划与链路预算 4h tools ["budget"] ｜ 6.2 lte-params PCI、邻区、PRACH 与 TAC 规划 4h ｜ 6.3 lte-kpi KPI 体系与无线测量 4h tools ["kpi"] ｜ 6.4 lte-coverage 覆盖与干扰优化 5h ｜ 6.5 lte-mobility-opt 切换与掉线优化 4h ｜ 6.6 lte-access-opt 接入与速率优化 4h ｜ 6.7 lte-volte-opt VoLTE 语音质量优化 4h
- **L7 演进**（stage 7）
  7.1 lte-pro LTE-A Pro 增强 3h ｜ 7.2 lte-iot NB-IoT 与 eMTC 3h ｜ 7.3 lte-refarm 频谱重耕、DSS 与 4G 演进 3h

注意 LTE 与 NR 的差异，别把 NR 的规则套到 LTE：例如 LTE PCI 504 个（168×3）、模 3 / 模 6 / 模 30 规则；LTE RSRP 上报范围 −140 ~ −44 dBm 映射 0–97（TS 36.133）；LTE 子载波固定 15 kHz（MBSFN 另有 7.5 kHz）。
