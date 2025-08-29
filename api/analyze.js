export default async function handler(req, res) {
  // CORSヘッダーの設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const { images } = req.body;
    
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'No images provided' });
    }

    // Gemini 2.0 Flash - 最新の高速モデル
    const modelName = "gemini-2.0-flash-exp";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    
    const prompt = `You are an expert copywriter for Amazon A+ Content. Analyze the following ${images.length} product images. The first image is the main header image, and the subsequent images highlight specific features. Your task is to return a single, valid JSON object with the structure: { "header": { "headline": "...", "body": "..." }, "features": [ { "headline": "...", "body": "..." } ] }. Generate one feature object for each feature image provided after the main header image. The response must be ONLY the JSON object, without any markdown formatting. Write in Japanese.`;
    
    const payload = {
      contents: [{
        parts: [
          { text: prompt },
          ...images.map(data => ({
            inlineData: { mimeType: "image/png", data: data }
          }))
        ]
      }]
    };
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Error:", errorText);
      return res.status(response.status).json({ 
        error: 'Failed to generate content',
        details: errorText 
      });
    }

    const result = await response.json();
    
    if (!result.candidates || !result.candidates[0].content || !result.candidates[0].content.parts || !result.candidates[0].content.parts[0].text) {
      return res.status(500).json({ error: 'Invalid response from AI' });
    }

    const text = result.candidates[0].content.parts[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }
    
    const content = JSON.parse(jsonMatch[0]);
    return res.status(200).json(content);
    
  } catch (error) {
    console.error('Error in analyze endpoint:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}