# 通信学习路径

面向国内移动通信从业者的系统化学习网站：不堆碎片知识和新闻，每个主题是一条分阶段的学习路径。

## 当前内容
- **5G 入门快线**（`quickstart.html?t=5g`）：9 节课、约 11 小时，面向零基础和转岗读者。每课有中文讲解、动手练习（不需要现网数据）和即时判分的自测，最后一课按岗位推荐完整路径中的模块
- **术语表**（`glossary.html`）：148 个常用术语和缩写，可搜索、按类别筛选；全站正文中的术语自动加虚线下划线，悬停（手机上点按）显示解释
- **5G 移动通信**（已上线）：8 个阶段、30 个模块、约 117 小时
  前置基础 → 5G 全局视图 → NR 空口物理层 → NR 高层协议与接入网 → 5G 核心网 → 端到端业务与信令 → 网络部署与优化 → 演进与前沿
- 4G LTE、IMS 与语音、射频与天线、承载传输、无线网优、O-RAN、蜂窝物联网、卫星 NTN：规划中

每个模块包含：学习目标、知识讲解（带小目录）、核心概念、3GPP 规范出处、信令流程图（部分）、自测题、实操任务、精选资源。

## 本地预览
```bash
python3 -m http.server 8000
# 打开 http://localhost:8000
```
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
data/lessons/5g/s0–s7.js 5G 各模块的知识讲解（按阶段分文件）
assets/lesson.js         讲解与课程的共用渲染器
data/resources/5g.js     手工精选资源（书籍、开源实验环境、官方文档）
data/resources/5g-community.js  社区精选视频（由 tools/review.html 导出）
tools/                   社区资源挖掘脚本（本地运行，见 tools/README.md）
assets/app.js            渲染与进度
assets/style.css         样式（支持深色模式、手机端）
assets/vendor/           本地化的 Mermaid（信令流程图）
```

## 新增术语
在 `data/glossary.js` 中加一行即可，全站自动生效。术语按完整单词匹配（区分大小写），同一个模块或课程里只标注第一次出现；资源列表、链接、代码和流程图里不标注。

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
