// 浏览器模式抓取 B 站候选视频：在已登录 bilibili.com 的页面里运行（开发者工具 Console 粘贴，或由 Claude 在浏览器面板执行）
// 不导出 Cookie：请求直接由页面发出，带着你自己的登录状态。只调用 B 站网页本身使用的公开接口，请求间隔 3–6 秒。
// 用法：
//   1. 粘贴本文件全部内容并回车
//   2. await BiliMine.search({ "s0-ofdm": ["OFDM 原理", …], … })        // 搜索（词表见 tools/queries/5g.json）
//      copy(JSON.stringify(BiliMine.dump()))  → 存成 dump.json → python tools/bili_import.py dump.json --pick 15
//   3. await BiliMine.details({ "s0-ofdm": ["BV…", …], … })           // 抓 --pick 打印的 BV 号的详情、热评、字幕
//      copy(JSON.stringify(BiliMine.dump()))  → 存成 dump.json → python tools/bili_import.py dump.json
//   4. python tools/score.py，然后按 tools/README.md 第 4、5 步审核
// 页面需保持在前台：浏览器会大幅降速后台标签页里的定时器。
(function () {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const pause = () => sleep(3000 + Math.random() * 3000);
  const get = async (url) => (await fetch(url, { credentials: "include" })).json();
  const strip = (s) => { const d = document.createElement("div"); d.innerHTML = s; return d.textContent; };

  // ---------- WBI 签名（字幕接口需要；算法同 tools/bili_client.py） ----------
  const TAB = [46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49, 33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40, 61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11, 36, 20, 34, 44, 52];
  function md5(str) {
    const rh = (n) => { let s = ""; for (let j = 0; j <= 3; j++) s += ((n >> (j * 8 + 4)) & 15).toString(16) + ((n >> (j * 8)) & 15).toString(16); return s; };
    const ad = (x, y) => { const l = (x & 0xffff) + (y & 0xffff); return (((x >> 16) + (y >> 16) + (l >> 16)) << 16) | (l & 0xffff); };
    const rl = (n, c) => (n << c) | (n >>> (32 - c));
    const cm = (q, a, b, x, s, t) => ad(rl(ad(ad(a, q), ad(x, t)), s), b);
    const F = [(b, c, d) => (b & c) | (~b & d), (b, c, d) => (b & d) | (c & ~d), (b, c, d) => b ^ c ^ d, (b, c, d) => c ^ (b | ~d)];
    const S = [[7, 12, 17, 22], [5, 9, 14, 20], [4, 11, 16, 23], [6, 10, 15, 21]];
    const K = Array.from({ length: 64 }, (_, i) => Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32) | 0);
    const idx = (r, i) => [i, (5 * i + 1) % 16, (3 * i + 5) % 16, (7 * i) % 16][r];
    const u = unescape(encodeURIComponent(str));
    const nb = ((u.length + 8) >> 6) + 1;
    const x = new Array(nb * 16).fill(0);
    for (let i = 0; i < u.length; i++) x[i >> 2] |= u.charCodeAt(i) << ((i % 4) * 8);
    x[u.length >> 2] |= 0x80 << ((u.length % 4) * 8);
    x[nb * 16 - 2] = u.length * 8;
    let h = [1732584193, -271733879, -1732584194, 271733878];
    for (let o = 0; o < x.length; o += 16) {
      let [a, b, c, d] = h;
      for (let i = 0; i < 64; i++) {
        const r = i >> 4;
        const t = cm(F[r](b, c, d), a, b, x[o + idx(r, i % 16)], S[r][i % 4], K[i]);
        a = d; d = c; c = b; b = t;
      }
      h = [ad(h[0], a), ad(h[1], b), ad(h[2], c), ad(h[3], d)];
    }
    return h.map(rh).join("");
  }
  let mixin = null;
  async function wbi(params) {
    if (!mixin) {
      const nav = (await get("https://api.bilibili.com/x/web-interface/nav")).data;
      const stem = (u) => u.split("/").pop().split(".")[0];
      const orig = stem(nav.wbi_img.img_url) + stem(nav.wbi_img.sub_url);
      mixin = TAB.map((i) => orig[i]).join("").slice(0, 32);
    }
    const p = { ...params, wts: Math.floor(Date.now() / 1000) };
    const q = Object.keys(p).sort().map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(String(p[k]).replace(/[!'()*]/g, ""))}`).join("&");
    return `${q}&w_rid=${md5(q + mixin)}`;
  }

  const state = { modules: {}, progress: { done: 0, total: 0, phase: "idle" }, errors: [] };
  const mod = (mid) => state.modules[mid] || (state.modules[mid] = { hits: {}, queries_done: [], videos: {} });

  async function searchOne(q) {
    for (const wait of [0, 20000, 45000]) {  // 搜得太快时 B 站会返回空结果，等一会儿再试
      if (wait) await sleep(wait);
      try {
        const r = await get(`https://api.bilibili.com/x/web-interface/search/type?search_type=video&page=1&keyword=${encodeURIComponent(q)}`);
        const res = (r.data && r.data.result) || [];
        if (res.length) return res;
      } catch (e) { state.errors.push(`${q}: ${e.message}`); }
    }
    return [];
  }

  async function search(queries, perQuery = 10) {
    state.progress = { done: 0, total: Object.values(queries).flat().length, phase: "search" };
    for (const [mid, qs] of Object.entries(queries)) {
      const m = mod(mid);
      for (const q of qs) {
        const res = (await searchOne(q)).filter((x) => x.bvid).slice(0, perQuery);
        res.forEach((x, i) => {
          const e = m.hits[x.bvid] || (m.hits[x.bvid] = { title: strip(x.title || ""), queries: {} });
          e.queries[q] = i + 1;
        });
        if (res.length) m.queries_done.push(q);
        state.progress.done++;
        await pause();
      }
    }
    state.progress.phase = "search-done";
  }

  async function subtitle(aid, cid) {
    const p = await get(`https://api.bilibili.com/x/player/wbi/v2?${await wbi({ aid, cid })}`);
    const subs = (p.data && p.data.subtitle && p.data.subtitle.subtitles) || [];
    const zh = subs.find((s) => (s.lan || "").includes("zh")) || subs[0];
    if (!zh || !zh.subtitle_url) return "";
    const url = zh.subtitle_url.startsWith("//") ? `https:${zh.subtitle_url}` : zh.subtitle_url;
    const body = await (await fetch(url)).json();
    return (body.body || []).map((l) => l.content).join("\n");
  }

  async function detailOne(bvid) {
    const v = await get(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`);
    if (v.code !== 0) throw new Error(`view code ${v.code}`);
    const d = v.data, st = d.stat || {};
    const out = {
      bvid: d.bvid, aid: d.aid, cid: d.cid, title: d.title || "", desc: (d.desc || "").slice(0, 300),
      owner: (d.owner || {}).name || "", pubdate: d.pubdate || 0, duration: d.duration || 0,
      pages: (d.pages || []).length, season: !!d.ugc_season, view: st.view || 0, favorite: st.favorite || 0,
      like: st.like || 0, coin: st.coin || 0, share: st.share || 0, reply: st.reply || 0, danmaku: st.danmaku || 0
    };
    await pause();
    const r = await get(`https://api.bilibili.com/x/v2/reply?type=1&oid=${d.aid}&sort=2&ps=20&pn=1`);
    out.comments = ((r.data && r.data.replies) || []).map((c) => ({ text: ((c.content || {}).message || "").slice(0, 200), like: c.like || 0 }));
    await pause();
    try { out.subtitle = await subtitle(d.aid, d.cid); } catch (e) { out.subtitle = ""; state.errors.push(`${bvid} 字幕: ${e.message}`); }
    return out;
  }

  async function details(picks) {
    state.progress = { done: 0, total: Object.values(picks).flat().length, phase: "details" };
    for (const [mid, bvids] of Object.entries(picks)) {
      const m = mod(mid);
      for (const bvid of bvids) {
        if (!m.videos[bvid]) {
          try { m.videos[bvid] = await detailOne(bvid); } catch (e) { state.errors.push(`${bvid}: ${e.message}`); }
          await pause();
        }
        state.progress.done++;
      }
    }
    state.progress.phase = "details-done";
  }

  window.BiliMine = { search, details, state, dump: () => state.modules, md5 };
})();
