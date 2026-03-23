// main.js
// 负责：加载词典、查词、模糊提示

// 全局保存词典数据
let DICT = {};

// 1. 加载 dictionary.json
fetch("./dictionary.json")
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    console.log("词典数据加载成功：", data);
    DICT = data; // 保存到全局变量，后面查词要用
  })
  .catch(function (error) {
    console.error("加载词典数据失败：", error);
  });

// 2. 获取页面上的元素（搜索相关）
const inputEl = document.getElementById("word-input");
const btnEl = document.getElementById("search-btn");
const resultEl = document.getElementById("result");
const suggestionsEl = document.getElementById("suggestions");

// 3. 简单的大小写不敏感查找函数（精确匹配）
function findWord(raw) {
  const q = raw.trim();
  if (!q) return null;

  const candidates = [
    q,
    q.toLowerCase(),
    q[0].toUpperCase() + q.slice(1).toLowerCase()
  ];

  for (const c of candidates) {
    if (Object.prototype.hasOwnProperty.call(DICT, c)) {
      return { key: c, entry: DICT[c] };
    }
  }

  return null; // 没找到
}

// 4. 把词条渲染成 HTML 文本
function renderEntry(word, entry) {
  const pos = entry.pos || "unknown";
  const zh = entry.translation_zh || "（暂无中文释义）";

  let html = "";
  html += `<h2>${word}</h2>`;
  html += `<p>中文释义：${zh}</p>`;
  html += `<p>词性：${pos}</p>`;

  if (pos === "verb") {
    const f = entry.forms || {};
    html += `<p>不定式：${f.infinitive || "-"}</p>`;
    html += `<p>现在时 ich：${f.present?.["ich"] || "-"}</p>`;
    html += `<p>过去时 ich：${f.preterite?.["ich"] || "-"}</p>`;
    html += `<p>Partizip II：${f.partizip_ii || "-"}</p>`;
  } else if (pos === "noun") {
    const f = entry.forms || {};
    html += `<p>性别：${entry.gender || "?"}</p>`;
    html += `<p>单数：${f.singular || "-"}</p>`;
    html += `<p>复数：${f.plural || "-"}</p>`;

    // 四格变化表
    const cases = f.cases || {};
    const sg = cases.singular || {};
    const pl = cases.plural || {};

    html += `
      <h3>格变化（Kasus）</h3>
      <table border="1" cellpadding="4" cellspacing="0" style="border-collapse:collapse;">
        <thead>
          <tr>
            <th>数/格</th>
            <th>主格<br/>(Nominativ)</th>
            <th>属格<br/>(Genitiv)</th>
            <th>与格<br/>(Dativ)</th>
            <th>宾格<br/>(Akkusativ)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>单数 (Singular)</td>
            <td>${sg.nominative || "-"}</td>
            <td>${sg.genitive || "-"}</td>
            <td>${sg.dative || "-"}</td>
            <td>${sg.accusative || "-"}</td>
          </tr>
          <tr>
            <td>复数 (Plural)</td>
            <td>${pl.nominative || "-"}</td>
            <td>${pl.genitive || "-"}</td>
            <td>${pl.dative || "-"}</td>
            <td>${pl.accusative || "-"}</td>
          </tr>
        </tbody>
      </table>
    `;
  } else if (pos === "adjective") {
    const f = entry.forms || {};
    html += `<p>原级 (Positiv)：${f.positive || "-"}</p>`;
    html += `<p>比较级 (Komparativ)：${f.comparative || "-"}</p>`;
    html += `<p>最高级 (Superlativ)：${f.superlative || "-"}</p>`;
  }

  return html;
}

// 5. 精确查询处理
function doSearch() {
  const value = inputEl.value;
  if (!value.trim()) {
    resultEl.innerHTML = "请输入一个德语单词。";
    return;
  }

  const found = findWord(value);
  if (!found) {
    resultEl.innerHTML = `未在词典中找到：<strong>${value}</strong>`;
  } else {
    resultEl.innerHTML = renderEntry(found.key, found.entry);
  }
}

// 6. 模糊匹配：返回候选数组
function getSuggestions(raw) {
  const q = raw.trim().toLowerCase();
  if (q.length < 2) {
    return [];
  }

  const results = [];
  for (const word of Object.keys(DICT)) {
    if (word.toLowerCase().includes(q)) {
      results.push(word);
    }
  }
  return results.slice(0, 8);
}

// 7. 渲染模糊提示列表
function renderSuggestions(list) {
  if (!list.length) {
    suggestionsEl.innerHTML = "";
    return;
  }

  let html = '<ul style="list-style:none; padding-left:0; margin:4px 0;">';
  for (const w of list) {
    html += `
      <li
        style="padding:4px 8px; cursor:pointer; border:1px solid #ddd; border-radius:4px; margin-bottom:4px;"
        data-word="${w}"
      >
        ${w}
      </li>
    `;
  }
  html += "</ul>";

  suggestionsEl.innerHTML = html;

  // 绑定点击事件
  const items = suggestionsEl.querySelectorAll("li[data-word]");
  items.forEach(function (item) {
    item.addEventListener("click", function () {
      const w = this.getAttribute("data-word");
      inputEl.value = w;
      suggestionsEl.innerHTML = "";
      doSearch();
    });
  });
}

// 8. 绑定事件
inputEl.addEventListener("input", function () {
  const value = inputEl.value;
  const suggs = getSuggestions(value);
  renderSuggestions(suggs);
});

btnEl.addEventListener("click", doSearch);
inputEl.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    doSearch();
  }
});