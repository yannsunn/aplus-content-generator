export default function handler(req, res) {
  // Vercel環境変数からAPIキーを取得
  const apiKey = process.env.GEMINI_API_KEY || '';
  
  res.status(200).json({ 
    apiKey: apiKey,
    configured: apiKey.length > 0
  });
}