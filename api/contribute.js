// api/contribute.js
// 一个简单的内存版投稿 API：Vercel 实例存活期间会记住投稿
// 注意：这是临时存储，重新部署或实例重启后会丢失，之后我们再接数据库。

// 在模块顶层维护一个数组，存所有投稿
let contributions = [];

export default async function handler(req, res) {
  // 允许跨域，方便从其他域名调用（例如 xmu703.xyz）
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    // 预检请求
    return res.status(204).end();
  }

  if (req.method === "GET") {
    // 返回当前内存中的全部投稿
    return res.status(200).json({
      ok: true,
      message: "GET /api/contribute 正常工作（内存版）。",
      contributions,
    });
  }

  if (req.method === "POST") {
    const body = req.body; // Vercel 会自动解析 JSON

    if (!body || !body.word || !body.translation) {
      return res.status(400).json({
        ok: false,
        error: "缺少必要字段：word 或 translation",
      });
    }

    const newItem = {
      word: String(body.word).trim(),
      translation: String(body.translation).trim(),
      time: body.time || new Date().toISOString(),
    };

    contributions.push(newItem);
    console.log("当前投稿数量：", contributions.length);

    return res.status(200).json({
      ok: true,
      message: "投稿已记录（内存版，非持久化）。",
      item: newItem,
      total: contributions.length,
    });
  }

  return res.status(405).json({ ok: false, error: "Method Not Allowed" });
}