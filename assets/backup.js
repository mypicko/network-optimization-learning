// 备份：把学习进度、笔记、错题本打包成一个 JSON 文件导出，或从文件导入合并
// 文件格式：{ app: "pathway-backup", version: 2, exported, progress, status, notes, review }（status 为模块“学习中 / 跳过”状态，旧备份没有）
// 兼容旧版只含笔记的导出文件（app: "pathway-notes"）
// 纯函数（buildBackup / parseBackup / mergeProgress）可在 Node 里单元测试
(function (root) {
  const PROGRESS_KEY = "pathway-progress-v1";

  const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);

  // 进度格式：{ [主题 id]: { [模块或课程 id]: 完成时间戳 } }；合并取并集，同一项保留较早的完成时间
  function mergeProgress(cur, inc) {
    const out = {};
    const add = (src) => Object.entries(isObj(src) ? src : {}).forEach(([pid, mods]) => {
      if (!isObj(mods)) return;
      out[pid] = { ...(out[pid] || {}) };
      Object.entries(mods).forEach(([mid, ts]) => {
        if (typeof ts !== "number" || !isFinite(ts)) return;
        out[pid][mid] = out[pid][mid] ? Math.min(out[pid][mid], ts) : ts;
      });
    });
    add(cur);
    add(inc);
    return out;
  }

  const countProgress = (p) => Object.values(isObj(p) ? p : {}).reduce((a, m) => a + (isObj(m) ? Object.keys(m).length : 0), 0);

  function buildBackup({ progress, status, notes, review }, now) {
    return { app: "pathway-backup", version: 2, exported: now, progress: progress || {}, status: status || {}, notes: notes || {}, review: review || { items: {} } };
  }

  function parseBackup(text) {
    let data;
    try { data = JSON.parse(text); } catch (e) { throw new Error("文件不是有效的 JSON"); }
    if (!isObj(data)) throw new Error("不是本站导出的备份文件");
    if (data.app === "pathway-notes") return { progress: null, status: null, notes: data, review: null };
    if (data.app !== "pathway-backup") throw new Error("不是本站导出的备份文件");
    return {
      progress: isObj(data.progress) ? data.progress : null,
      status: isObj(data.status) ? data.status : null,
      notes: isObj(data.notes) ? { ...data.notes, app: "pathway-notes" } : null,
      review: isObj(data.review) ? data.review : null
    };
  }

  const pure = { mergeProgress, countProgress, buildBackup, parseBackup, PROGRESS_KEY };
  if (typeof module !== "undefined" && module.exports) { module.exports = pure; return; }

  function readProgress() {
    try { const v = JSON.parse(localStorage.getItem(PROGRESS_KEY)); return isObj(v) ? v : {}; } catch (e) { return {}; }
  }

  root.Backup = {
    exportText() {
      const notes = root.NotesStore ? JSON.parse(root.NotesStore.exportJson()) : {};
      const review = root.ReviewStore ? root.ReviewStore.all() : { items: {} };
      const status = root.ModuleStatus ? root.ModuleStatus.allStatus() : {};
      return JSON.stringify(buildBackup({ progress: readProgress(), status, notes, review }, new Date().toISOString()), null, 2);
    },
    // 返回各部分导入的条数；任何一部分失败都抛出，界面上提示
    importText(text) {
      const parsed = parseBackup(text);
      const result = { progress: 0, status: 0, terms: 0, comments: 0, bookmarks: 0, review: 0 };
      if (parsed.progress) {
        const before = countProgress(readProgress());
        const merged = mergeProgress(readProgress(), parsed.progress);
        try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(merged)); } catch (e) { throw new Error("浏览器存储不可用，进度未能导入"); }
        result.progress = countProgress(merged) - before;
      }
      if (parsed.status && root.ModuleStatus) result.status = root.ModuleStatus.mergeStatus(parsed.status);
      if (parsed.notes && root.NotesStore) Object.assign(result, root.NotesStore.importJson(JSON.stringify(parsed.notes)));
      if (parsed.review && root.ReviewStore) result.review = root.ReviewStore.merge(parsed.review);
      return result;
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
