// contribute.js
// 负责：投稿按钮、本地存储投稿列表、清除投稿、导出投稿

// 只声明一次这些常量，对应 index.html 里的元素 id
const contributeBtn = document.getElementById("contribute-btn");
const contributeListEl = document.getElementById("contribute-list");
const clearContributionsBtn = document.getElementById("clear-contributions-btn");
const exportContributionsBtn = document.getElementById("export-contributions-btn");
const exportContributionsOutput = document.getElementById("export-contributions-output");

// 从 localStorage 读取已有投稿
function loadContributions() {
  const raw = window.localStorage.getItem("de_dict_contributions");
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) {
      return arr;
    }
    return [];
  } catch (e) {
    console.error("解析本地投稿数据失败：", e);
    return [];
  }
}

// 保存投稿到 localStorage
function saveContributions(list) {
  window.localStorage.setItem("de_dict_contributions", JSON.stringify(list));
}

// 把投稿列表渲染到页面
function renderContributions() {
  const list = loadContributions();
  if (!list.length) {
    contributeListEl.innerHTML = "当前还没有本地投稿。";
    return;
  }

  let html = "<ol>";
  list.forEach(function (item, index) {
    html += `<li><strong>${item.word}</strong> - ${item.translation} <span style="color:#999;font-size:12px;">(第 ${index + 1} 条)</span></li>`;
  });
  html += "</ol>";

  contributeListEl.innerHTML = html;
}

// 页面加载时先渲染一次
renderContributions();

// 点击“投稿一个新单词”按钮时
contributeBtn.addEventListener("click", function () {
  const word = window.prompt("请输入要投稿的德语单词：");
  if (!word || !word.trim()) {
    return; // 用户取消或没填
  }

  const zh = window.prompt("请输入该单词的中文释义：");
  if (!zh || !zh.trim()) {
    return;
  }

  const contribution = {
    word: word.trim(),
    translation: zh.trim(),
    time: new Date().toISOString()
  };

  const list = loadContributions();
  list.push(contribution);
  saveContributions(list);
  renderContributions();

  alert("感谢投稿！已在本机记录。后续由站长统一整理进词典。");
});

// 点击“清除所有投稿”按钮时
clearContributionsBtn.addEventListener("click", function () {
  if (!window.confirm("确定要清除当前浏览器里的所有投稿记录吗？此操作不可恢复。")) {
    return;
  }

  window.localStorage.removeItem("de_dict_contributions");
  renderContributions();
  // 同时清空导出文本框
  if (exportContributionsOutput) {
    exportContributionsOutput.value = "";
  }
  alert("已清除本机中的所有投稿记录。");
});

// 导出投稿为文本
function exportContributions() {
  const list = loadContributions();
  if (!list.length) {
    exportContributionsOutput.value = "当前没有可导出的投稿。";
    return;
  }

  // 生成文本，每一行：序号. 单词 - 中文释义
  const lines = list.map(function (item, index) {
    return `${index + 1}. ${item.word} - ${item.translation}`;
  });

  exportContributionsOutput.value = lines.join("\n");
}

// 点击“导出投稿”按钮时
exportContributionsBtn.addEventListener("click", function () {
  exportContributions();
  alert("已根据本机投稿生成导出文本，可在下面文本框中复制。");
});