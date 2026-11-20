// P0 功能的纯逻辑单元测试：错题本、备份合并、站内搜索
// 运行：node --test tools/tests/
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const root = path.join(__dirname, "..", "..");
const R = require(path.join(root, "assets/review.js"));
const B = require(path.join(root, "assets/backup.js"));
const S = require(path.join(root, "assets/search-index.js"));

// 加载站点真实数据（数据文件写到 window 上）
global.window = {};
["data/pathways/5g.js", "data/glossary.js", "data/quickstart/5g.js",
  ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `data/lessons/5g/s${i}.js`)].forEach((f) => require(path.join(root, f)));
const W = global.window;

const meta = { key: "5g/s0-ofdm/0", q: "CP 越长越好吗？", a: "不是。", title: "0.1 OFDM", page: "pathway.html?t=5g", scope: "s0-ofdm-q1" };

test("错题本：答错入本、答对移出、计数累加，且不修改旧状态", () => {
  const s0 = { items: {} };
  const s1 = R.applyRecord(s0, meta, false, "2026-01-01");
  assert.deepEqual(s0, { items: {} });
  assert.equal(R.listWrong(s1).length, 1);
  assert.equal(s1.items[meta.key].wrong, 1);
  const s2 = R.applyRecord(s1, meta, false, "2026-01-02");
  assert.equal(s2.items[meta.key].wrong, 2);
  const s3 = R.applyRecord(s2, meta, true, "2026-01-03");
  assert.equal(R.listWrong(s3).length, 0);
  assert.equal(s3.items[meta.key].right, 1);
  assert.equal(s1.items[meta.key].status, "wrong");
});

test("错题本：已掌握、删除、缺少 key 报错", () => {
  const s1 = R.applyRecord({ items: {} }, meta, false, "t1");
  assert.equal(R.listWrong(R.applyMaster(s1, meta.key, "t2")).length, 0);
  assert.deepEqual(R.applyRemove(s1, meta.key).items, {});
  assert.throws(() => R.applyRecord({ items: {} }, { q: "x" }, false, "t"), /题目标识/);
});

test("错题本：合并以较新的记录为准，忽略非法条目", () => {
  const cur = R.applyRecord({ items: {} }, meta, false, "2026-01-02");
  const older = R.applyRecord({ items: {} }, meta, true, "2026-01-01");
  assert.equal(R.applyMerge(cur, older).items[meta.key].status, "wrong");
  const newer = R.applyRecord({ items: {} }, meta, true, "2026-01-03");
  assert.equal(R.applyMerge(cur, newer).items[meta.key].status, "ok");
  const bad = { items: { x: { key: "x", status: "weird", q: "q" }, y: null } };
  assert.deepEqual(Object.keys(R.applyMerge(cur, bad).items), [meta.key]);
  assert.deepEqual(R.normalize("garbage"), { items: {} });
});

test("备份：进度取并集并保留较早时间，过滤非法值", () => {
  const cur = { "5g": { a: 200, b: 100 } };
  const inc = { "5g": { a: 100, c: 300, bad: "x" }, other: "nope" };
  assert.deepEqual(B.mergeProgress(cur, inc), { "5g": { a: 100, b: 100, c: 300 } });
  assert.equal(B.countProgress({ "5g": { a: 1, b: 2 }, q: { c: 3 } }), 3);
});

test("备份：解析新格式、兼容旧笔记格式、拒绝其他文件", () => {
  const text = JSON.stringify(B.buildBackup({ progress: { "5g": { a: 1 } }, notes: { terms: [] }, review: { items: {} } }, "now"));
  const p = B.parseBackup(text);
  assert.deepEqual(p.progress, { "5g": { a: 1 } });
  assert.equal(p.notes.app, "pathway-notes");
  const old = B.parseBackup(JSON.stringify({ app: "pathway-notes", terms: [] }));
  assert.equal(old.progress, null);
  assert.equal(old.notes.app, "pathway-notes");
  assert.throws(() => B.parseBackup("{bad"), /JSON/);
  assert.throws(() => B.parseBackup(JSON.stringify({ app: "x" })), /备份文件/);
});

const docs = S.buildIndex({ pathways: W.PATHWAYS, lessons: W.LESSONS, glossary: W.GLOSSARY, quickstart: W.QUICKSTART, notes: null });

test("搜索：索引覆盖全部 30 个模块、全部自测题和术语", () => {
  const n = (t) => docs.filter((d) => d.type === t).length;
  assert.equal(n("module"), 30);
  const quizCount = W.PATHWAYS["5g"].stages.flatMap((s) => s.modules).reduce((a, m) => a + (m.quiz || []).length, 0);
  assert.equal(n("quiz"), quizCount);
  assert.equal(n("term"), W.GLOSSARY.length);
  assert.ok(n("section") > 100);
});

test("搜索：术语精确命中排第一，小节锚点与 lesson.js 的规则一致", () => {
  const groups = S.search(docs, "BWP");
  assert.equal(groups[0].type, "term");
  assert.ok(groups[0].items[0].title.startsWith("BWP"));
  const sec = docs.find((d) => d.type === "section" && d.href.includes("#s0-ofdm-x1"));
  assert.ok(sec && sec.title.startsWith("0.1.1 "));
});

test("搜索：多关键词需同时命中、大小写不敏感、无结果返回空", () => {
  const g = S.search(docs, "pdu 会话");
  assert.ok(g.length > 0);
  g.forEach((grp) => grp.items.forEach((d) => {
    const all = (d.title + " " + d.text).toLowerCase();
    assert.ok(all.includes("pdu") && all.includes("会话"));
  }));
  assert.deepEqual(S.search(docs, "这个词绝对不存在xyz"), []);
  assert.deepEqual(S.search(docs, "   "), []);
});

test("搜索：高亮会转义 HTML，摘要截取命中位置", () => {
  assert.equal(S.highlight("<b>CP</b> 循环前缀", "cp"), "&lt;b&gt;<mark>CP</mark>&lt;/b&gt; 循环前缀");
  const sn = S.snippet("a".repeat(100) + "目标词" + "b".repeat(100), "目标词");
  assert.ok(sn.startsWith("…") && sn.includes("目标词") && sn.endsWith("…"));
  assert.equal(S.glossarySlug("5G NR"), "g-5G_20NR");
});
