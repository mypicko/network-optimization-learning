# 社区资源挖掘工具

给学习路径的每个模块找 3–5 个**被不同的人反复推荐**的视频，思路参考 Karpathy 的 HackerTube。

- 只用 Python 3.8+ 标准库，Windows / macOS 都能直接运行，**不需要 pip install**
- **必须在国内网络下、在你自己的电脑上运行**（云端连不上 B 站，海外 IP 也会被拦）
- 所有命令都在**项目根目录**下执行

## 流程总览

```
queries/5g.json ──► bili_fetch.py ──► out/bili/*.json ──► score.py ──► out/candidates-5g.js
 (每模块搜索词)     (搜索/详情/评论/字幕)                   (打分)              │
                                       out/subs/*.txt ──► Claude 审核字幕 ──┤
                                                         out/claude_review-5g.json
                                                                            ▼
                         data/resources/5g-community.js ◄── review.html（你勾选、导出）
```

## 第 1 步：（推荐）配置 B 站登录 Cookie

不配置也能跑，但**未登录时搜索限流很严**（经常要等 20–45 秒重试），而且拿不到字幕。

1. 浏览器登录 bilibili.com，按 F12 → Network（网络）→ 刷新页面 → 点任意一个请求 → 在请求头里复制 `Cookie:` 后面的整串内容
2. 存成 `tools/bili_cookie.txt`（该文件已被 `.gitignore` 忽略，不会提交到仓库）

也可以用环境变量 `BILI_COOKIE` 代替文件。Cookie 等同于登录凭证，不要发给别人。

## 第 2 步：抓取候选视频

```bash
python tools/bili_fetch.py
```

- 默认每个搜索词取前 10 条，每个模块抓排名前 15 的视频详情、热门评论（只存文本和点赞数，不存评论者用户名）和字幕
- 每次请求间隔随机 3–6 秒，全部 30 个模块大约需要 1.5–2 小时；可随时 Ctrl+C，重跑会从断点继续
- 只抓部分模块：`python tools/bili_fetch.py --modules s4-pdu s4-qos`
- 标题里没有任何通信术语的视频（比如“PDU”搜到电源插座）不会抓详情
- Windows 上若终端显示乱码，先执行 `chcp 65001`

## 第 3 步：打分

```bash
python tools/score.py
```

| 信号 | 权重 | 说明 |
|---|---|---|
| 收藏率（收藏 ÷ 播放） | 35 | 4% 记满分，最能说明“值得回来看” |
| 跨平台提及 | 20 | 来自 `out/mentions-5g.json`，格式 `{"BV号": 次数}`（知乎 / 通信人家园，待做） |
| 评论推荐话语 | 15 | “讲得最清楚”“工作后回来看”“终于懂了”等 |
| 多个搜索词命中 | 15 | 同一模块的不同搜索词都搜到它 |
| 点赞 + 投币率 | 8 | |
| 播放量（对数） | 7 | |
| 系列 / 合集 | 5 | 多 P 或合集 |

降权：2019 年以前发布（−15）、短于 3 分钟（−10）、播放量低于 1000（×0.7）、标题和简介不含通信相关词（×0.2）。

## 第 4 步：让 Claude 审核字幕

在 Claude Code 里对 Claude 说：

> 读 tools/out/candidates-5g.js 里每个模块排名靠前的视频，以及 tools/out/subs/ 下对应的字幕，结合 data/pathways/5g.js 里该模块的学习目标，判断是否对题、有无技术错误、深度如何，每个写一句推荐理由，结果写到 tools/out/claude_review-5g.json。

格式：
```json
{ "BV1xxxx": { "relevant": true, "accurate": true, "depth": "入门", "reason": "用信令截图逐条讲 PDU 会话建立，适合第一次学。" } }
```

然后重新运行 `python tools/score.py`：不对题、有错误的会自动排到后面，推荐理由会预填到审核页。

## 第 5 步：审核并写回网站

1. 用浏览器打开 `tools/review.html`（直接双击即可）
2. 每个模块勾选 3–5 个，按需修改推荐理由（勾选状态自动保存在浏览器里）
3. 点“导出”，把下载的 `5g-community.js` 放到 `data/resources/`，覆盖同名文件
4. 刷新网站即可看到

导出的公开文件只包含视频标题、链接、时长和推荐理由，不包含任何用户名和评论原文。

## 测试

```bash
python -m unittest discover tools/tests
```

## 文件说明

| 文件 | 作用 |
|---|---|
| `queries/5g.json` | 每个模块的搜索词，可直接修改 |
| `bili_client.py` | B 站接口客户端（WBI 签名、慢速请求、Cookie 读取） |
| `bili_fetch.py` | 抓取候选视频 |
| `score.py` | 打分，生成审核数据 |
| `review.html` | 审核页 |
| `out/` | 抓取的原始数据（不提交到仓库） |

## 待做

- 知乎：你收集 10–20 个“5G 怎么学”类问题链接，脚本只读这些页面，统计其中提到的 B 站视频和书籍 → `out/mentions-5g.json`
- 通信人家园：抓资料区和经验区的推荐帖，同样汇总到 `mentions`
