// OpenAI GPT-4 Vision APIを使用した実装例
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

  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  try {
    const { images } = req.body;
    
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'No images provided' });
    }

    // GPT-4 Vision API呼び出し
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',  // 最新のマルチモーダルモデル
        messages: [
          {
            role: 'system',
            content: 'あなたはAmazon A+コンテンツの専門ライターです。商品画像を分析し、購買意欲を高める魅力的な日本語の商品説明を生成してください。'
          },
          {
            role: 'user',
            content: [
              { 
                type: 'text', 
                text: `以下の${images.length}枚の商品画像を分析してください。1枚目はメインヘッダー画像、残りは特徴を表す画像です。

以下のJSON形式で返してください（マークダウンなし）：
{
  "header": {
    "headline": "魅力的なキャッチコピー（20-30文字）",
    "body": "商品の詳細説明（100-150文字）"
  },
  "features": [
    {
      "headline": "特徴の見出し（15-25文字）",
      "body": "特徴の説明（50-100文字）"
    }
  ]
}` 
              },
              ...images.map(imageData => ({
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${imageData}`,
                  detail: 'high'
                }
              }))
            ]
          }
        ],
        max_tokens: 1500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      return res.status(response.status).json({ 
        error: 'Failed to generate content',
        details: errorData.error?.message 
      });
    }

    const result = await response.json();
    const content = result.choices[0].message.content;
    
    // JSONを抽出してパース
    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (e) {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[0]);
      } else {
        // フォールバック
        parsedContent = {
          header: {
            headline: "優れた商品の魅力をご紹介",
            body: "この商品は、お客様のニーズに応える優れた機能と品質を兼ね備えています。"
          },
          features: images.slice(1).map((_, i) => ({
            headline: `特徴${i + 1}`,
            body: `この特徴により、より快適にご利用いただけます。`
          }))
        };
      }
    }
    
    return res.status(200).json(parsedContent);
    
  } catch (error) {
    console.error('Error in analyze endpoint:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}