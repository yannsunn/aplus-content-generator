export default function handler(req, res) {
  // APIキーは公開しない - 設定状況のみ返す
  const apiKey = process.env.GEMINI_API_KEY || '';
  
  res.status(200).json({ 
    configured: apiKey.length > 0
  });
}