# 通信学习路径

面向国内移动通信从业者的系统化学习网站：不堆碎片知识和新闻，每个主题是一条分阶段的学习路径。

## 当前内容
- **5G 移动通信**（已上线）：8 个阶段、30 个模块、约 117 小时
  前置基础 → 5G 全局视图 → NR 空口物理层 → NR 高层协议与接入网 → 5G 核心网 → 端到端业务与信令 → 网络部署与优化 → 演进与前沿
- 4G LTE、IMS 与语音、射频与天线、承载传输、无线网优、O-RAN、蜂窝物联网、卫星 NTN：规划中

每个模块包含：学习目标、核心概念、3GPP 规范出处、信令流程图（部分）、自测题、实操任务、精选资源。

## 本地预览
```bash
python3 -m http.server 8000
# 打开 http://localhost:8000
```
纯静态站点，无需构建，可直接部署到 GitHub Pages。学习进度保存在浏览器 localStorage 中，无需登录。

## 目录结构
```
index.html               主题列表
pathway.html             学习路径页（?t=5g）
data/topics.js           主题目录
data/pathways/5g.js      5G 路径内容
data/resources/5g.js     手工精选资源（书籍、开源实验环境、官方文档）
data/resources/5g-community.js  社区精选视频（由 tools/review.html 导出）
tools/                   社区资源挖掘脚本（本地运行，见 tools/README.md）
assets/app.js            渲染与进度
assets/style.css         样式（支持深色模式、手机端）
assets/vendor/           本地化的 Mermaid（信令流程图）
```

## 新增一个主题
1. 复制 `data/pathways/5g.js` 为新文件，按相同结构编写阶段和模块
2. 在 `data/topics.js` 中把对应主题的 `status` 改为 `live`
3. 在 `index.html` 和 `pathway.html` 中引入新的数据文件（资源文件放在 `data/resources/`）

## 精选资源
- 规范出处里的 `TS xx.xxx` 编号会自动链接到 3GPP 官方归档目录
- `data/resources/5g.js`：书籍、开源实验环境（Open5GS、free5GC、UERANSIM、srsRAN、OpenAirInterface）、官方文档，已覆盖全部 30 个模块
- `data/resources/5g-community.js`：从 B 站等中文社区挖出的“被反复推荐”的视频，流程见 [tools/README.md](tools/README.md)
