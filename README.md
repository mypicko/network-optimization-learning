# 通途 · 通信人的系统学习路线

面向国内移动通信从业者的系统化学习网站：不堆碎片知识和新闻，每个主题是一条分阶段的学习路径。

访问地址：国内 <https://learn.promptso.top> · 海外备用 <https://mypicko.github.io/network-optimization-learning/>（部署、访问统计、搜索引擎收录见 [国内服务器部署.md](国内服务器部署.md)）

## 当前内容
- **5G 入门快线**（`quickstart.html?t=5g`）：9 节课、约 11 小时，面向零基础和转岗读者。每课有中文讲解、动手练习（不需要现网数据）和即时判分的自测，最后一课按岗位推荐完整路径中的模块
- **术语表**（`glossary.html`）：148 个常用术语和缩写，可搜索、按类别筛选；全站正文中的术语每次出现都加下划线，悬停（手机上点按）显示解释
- **我的笔记**（`notes.html`）：在正文中选中文字后右键（手机上选中后自动弹出），可以添加或修改释义、写评论、收藏。评论和收藏在原文中高亮；自己的释义会替换术语提示（并保留原释义对照）。数据只存在本浏览器
- **错题本**（`notes.html#review`）：路径模块的自测题先回忆、再看参考答案并自评；没答对的题和入门快线里答错的选择题自动进错题本。按 1 / 3 / 7 / 14 天间隔复习，连续通过 4 轮移出；首页显示“今天该复习 N 题”，可一键进入只考到期题的模拟考试
- **路线总览**（路径页顶部）：全部阶段和模块一屏看完，模块状态分未开始 / 学习中 / 已完成 / 已掌握跳过，已会的模块可以直接跳过并计入进度
- **站内搜索**（`search.html`）：顶栏搜索框（按 `/` 键聚焦），一次搜模块、讲解小节、自测题、术语、入门快线和我的笔记，结果分组并高亮
- **模拟考试**（`exam.html`）：题库 227 题（判断 41、单选 102、多选 39、问答 45），可选题数、题型和范围（全部 / 按阶段 / 今天该复习 / 只考错题本），随机抽题按题型组卷；客观题交卷自动判分并给出解析和出处，问答题给参考答案由考生自评；答错的题自动进错题本，最近成绩保存在本浏览器
- **工具箱**（`tools.html`）：NR 空口类（NR-ARFCN 与频率换算、参数集与 RB 数、峰值速率估算）和网络规划优化类（链路预算 → 覆盖半径 → 站点数、测量上报值换算、KPI 计算、PCI 规划核查），公式标注 3GPP 出处；相关模块里有“动手算一算”入口
- **网优案例库**（`cases.html`）：12 个原创典型案例，覆盖、切换、掉线、接入、速率、干扰、核心网各类都有；先看现象和数据判断原因，再展开定位过程、根因、措施和验证；相关模块里有“网优案例”入口
- **信令日志解读**：随机接入、注册、PDU 会话、Xn 切换、寻呼与服务请求 5 个模块带示意信令日志，逐条消息可展开看关键字段、解读和规范出处（按规范结构编写，明确标注非实测）
- **备份**：“我的笔记”页的导出 / 导入备份把学习进度（含学习中 / 跳过状态）、笔记、错题本打包成一个 JSON 文件，换设备可接着学（兼容旧版只含笔记的备份文件）
- **5G 移动通信**（已上线）：9 个阶段、39 个模块、约 153 小时
  前置基础 → 5G 全局视图 → NR 空口物理层 → NR 高层协议与接入网 → 5G 核心网 → 端到端业务与信令 → 网络规划（网优方向，选学）→ 测试与优化（网优方向，选学）→ 演进与前沿
- **4G LTE**（已上线，`pathway.html?t=lte`）：8 个阶段、39 个模块、约 150 小时，题库 156 道客观题、10 个原创案例、5 段信令日志
  无线与系统基础 → 网络架构与标识 → 物理层 → 高层协议与空口流程 → EPC 核心网 → 语音与互操作 → 网络规划与优化（网优方向，选学）→ 演进
  内容稿在 `tools/lte-parts/`（各阶段路线条目与题目，`node tools/lte-parts/build.cjs` 合成 `data/pathways/lte.js` 和 `data/exam/lte.js`），讲解在 `data/lessons/lte/L0–L7.js`
- 跨路线互链：模块里的“相关路线”（字段 `xref`）在 5G 和 LTE 对应模块之间互相跳转；考试、案例库顶部可切换主题
- IMS 与语音、射频与天线、承载传输、无线网优、O-RAN、蜂窝物联网、卫星 NTN：规划中

每个模块包含：学习目标、知识讲解（小节带层级编号，如 0.1.1）、配图、核心概念、3GPP 规范出处、信令流程图（部分）、自测题、实操任务、精选资源。展开模块后，左侧导航会在所属阶段下列出该模块的小节目录，并高亮当前阅读位置。

> 模块 id 是学习进度、错题本、笔记的存储键。调整阶段结构时只移动模块、不改 id（例如“测试与优化”阶段里的 `s6-kpi`、“演进与前沿”阶段里的 `s7-r16-r17` 都沿用旧 id），否则用户的学习记录会丢失。

## 本地预览
```bash
python3 -m http.server 8000
# 打开 http://localhost:8000
```
测试：`python3 -m pytest -q tools/tests`（资源挖掘脚本）和 `node --test tools/tests/*.cjs`（错题本与间隔复习、模块状态、备份、搜索、计算器、考试与题库完整性）。
纯静态站点，无需构建，可直接部署到 GitHub Pages。学习进度保存在浏览器 localStorage 中，无需登录。

## 目录结构
```
index.html               主题列表
quickstart.html          入门快线（?t=5g）
pathway.html             学习路径页（?t=5g）
glossary.html            术语表
data/quickstart/5g.js    5G 入门快线课程内容
data/glossary.js         术语表数据
assets/quickstart.js     入门快线渲染、判分自测
assets/glossary.js       术语自动标注、浮动解释、术语表页
data/topics.js           主题目录
data/pathways/5g.js      5G 路径内容
data/pathways/lte.js     LTE 路径内容（由 tools/lte-parts/build.cjs 生成）
data/lessons/lte/L*.js   LTE 各阶段知识讲解
data/exam/lte.js / data/cases/lte.js / data/logs/lte.js  LTE 题库、案例、信令日志
assets/topic-switch.js   考试 / 案例库的主题切换条
data/lessons/5g/*.js    5G 各模块的知识讲解（s0–s7 按原阶段分文件；planning / optimization / ai 为网优方向和 AI 网优模块）
assets/lesson.js         讲解与课程的共用渲染器（小节编号、配图）
data/figures/5g.js       讲解配图（由 tools/figures/build.mjs 生成）
notes.html               我的笔记（含错题本、备份）
search.html              站内搜索
tools.html               工具箱（计算器）
exam.html                模拟考试
data/exam/5g.js          考试题库（客观题；问答题复用路径自测题）
assets/exam.js           抽题、判分（纯函数）
assets/exam-page.js      考试页面
assets/calc.js           计算器公式（纯函数）
assets/calc-page.js      工具箱页面
assets/plan-calc.js      规划优化计算器公式（纯函数）
assets/plan-calc-page.js 规划优化计算器页面
cases.html               网优案例库
data/cases/5g.js         网优案例数据（原创，数值为虚构示例）
assets/cases.js          案例库渲染与作答记录（localStorage）
data/logs/5g.js          示意信令日志
assets/review.js         错题本与间隔复习（localStorage）
assets/roadmap.js        模块学习状态：未开始 / 学习中 / 已完成 / 跳过（localStorage）
assets/backup.js         备份导出 / 导入（进度 + 笔记 + 错题本）
assets/search-index.js   搜索索引与匹配（纯函数）
assets/search-page.js    搜索页
assets/site-search.js    顶栏搜索框的 / 快捷键
assets/store.js          笔记数据（localStorage）
assets/notes.js          划词菜单、释义 / 评论对话框、原文高亮
assets/notes-page.js     我的笔记页面
data/resources/5g.js     手工精选资源（书籍、开源实验环境、官方文档）
data/resources/5g-community.js  社区精选视频（由 tools/review.html 导出）
tools/                   社区资源挖掘脚本（本地运行，见 tools/README.md）
assets/app.js            渲染与进度
assets/style.css         样式（支持深色模式、手机端）
assets/vendor/           本地化的 Mermaid（信令流程图）
```

## 新增术语
在 `data/glossary.js` 中加一行即可，全站自动生效。术语按完整单词匹配（区分大小写），每次出现都标注；资源列表、链接、代码、配图和流程图里不标注。

## 配图
配图在 `tools/figures/` 中用脚本生成：`phy.mjs`（阶段 0–2）、`net.mjs`（阶段 3–7）画 SVG，`build.mjs` 列出每张图挂在哪个模块的哪个小节（按小节标题关键词匹配），Mermaid 图直接写在 `build.mjs` 里。SVG 只用 `assets/style.css` 中 `.figure svg` 的配色 class，深色模式自动适配。修改后运行：
```bash
node tools/figures/build.mjs
```

## 发布更新
改了 `assets/` 或 `data/` 下的文件后，提交前运行一次：
```bash
python3 tools/bump_version.py
```
它会给 HTML 里引用的 JS / CSS 加上按文件内容生成的版本号（`?v=…`），避免浏览器缓存旧文件导致“新页面 + 旧脚本”出错。推送到 master 后 GitHub Pages 会自动重新部署。

## 新增一个主题
1. 复制 `data/pathways/5g.js` 为新文件，按相同结构编写阶段和模块
2. 在 `data/topics.js` 中把对应主题的 `status` 改为 `live`
3. 在 `index.html` 和 `pathway.html` 中引入新的数据文件（资源文件放在 `data/resources/`，知识讲解放在 `data/lessons/<主题>/`）

## 精选资源
- 规范出处里的 `TS xx.xxx` 编号会自动链接到 3GPP 官方归档目录
- `data/resources/5g.js`：书籍、开源实验环境（Open5GS、free5GC、UERANSIM、srsRAN、OpenAirInterface）、官方文档，已覆盖全部 30 个模块
- `data/resources/5g-community.js`：从 B 站等中文社区挖出的“被反复推荐”的视频，流程见 [tools/README.md](tools/README.md)
