export default async function handler(req, res) {
  // 允许跨域，方便从 xmu703.xyz 调用
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    // 预检请求，直接返回 204 即可
    return res.status(204).end();
  }

  if (req.method === "GET") {
    // 先返回一个固定的测试数据
    return res.status(200).json({
      ok: true,
      message: "GET /api/contribute 正常工作（暂时是测试数据）。",
      contributions: [],
    });
  }

  if (req.method === "POST") {
    const body = req.body; // Vercel 会自动解析 JSON

    console.log("收到投稿：", body);

    // 现在还没接数据库，先直接把收到的内容回传
    return res.status(200).json({
      ok: true,
      message: "POST /api/contribute 收到投稿（暂时未存数据库）。",
      received: body,
    });
  }

  // 其它方法不支持
  return res.status(405).json({ ok: false, error: "Method Not Allowed" });
}