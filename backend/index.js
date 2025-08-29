const functions = require('@google-cloud/functions-framework');

// CORSを許可するための設定
const enableCors = (req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
  } else {
    next();
  }
};

/**
 * テキスト生成ロジック本体
 * @param {object} product - 商品情報オブジェクト
 * @returns {object} - 生成されたテキストのオブジェクト
 */
const generateAplusContent = (product) => {
    const output = { header: {}, features: [] };
    const funKeyword = product.keywords.find(k => k.includes('楽し') || k.includes('便利')) || '素晴らしい';

    // モジュール1: ヘッダー
    output.header.headline = `ただのカップじゃない。最高の「${funKeyword}時間」を、このカップから。`;
    output.header.body = `鮮やかな赤がパーティーを彩る、定番の${product.product_name}。それは単なる飲み物の容器ではなく、仲間との絆を深め、忘れられない瞬間を創り出すための特別なアイテムです。大容量サイズは、ドリンクはもちろん、フードやゲーム、さらにはDIYクラフトまで、アイデア次第で無限の可能性を秘めています。さあ、このカップで、あなたの日常に「もっと${funKeyword}」をプラスしませんか？`;

    // モジュール2: 特徴
    product.features.forEach(feature => {
        let headline = '';
        let body = '';
        switch (feature.title) {
            case "フード＆ドリンク":
                headline = "ドリンクも、フードも、これ一つで。";
                body = "定番のドリンクカップとしてはもちろん、個別のサラダや前菜を盛り付ける「カップテール」スタイルにも最適。取り分け不要で衛生的、後片付けも簡単。パーティーフードの新しい常識です。";
                break;
            case "エンターテイメント":
                headline = "パーティーが盛り上がる、最高のスパイス。";
                body = "このカップがあれば、そこがパーティーゲームの会場に早変わり。世界中で大人気の「ビアポン」を始め、様々なカップゲームを楽しめます。シンプルなルールで誰もがすぐに夢中になれるから、初対面のゲスト同士でも自然と会話が弾みます。";
                break;
            case "クリエイティビティ":
                headline = "使った後も、楽しみは続く。";
                body = "パーティーが終わっても、楽しみはまだ終わりません。丈夫で加工しやすいこのカップは、お子様との工作にもぴったりの素材です。動物のおもちゃ、お洒落なLEDランタンなど、創造力を働かせて世界に一つだけの作品作りを。思い出を形に残す、新しいリサイクルの形です。";
                break;
            default:
                headline = feature.title;
                body = feature.description;
                break;
        }
        output.features.push({ headline, body });
    });
    return output;
};


// HTTPトリガーで関数を登録
functions.http('generateContent', (req, res) => {
    // CORSミドルウェアを実行
    enableCors(req, res, () => {
        // POSTメソッド以外は許可しない
        if (req.method !== 'POST') {
            return res.status(405).send('Method Not Allowed');
        }

        // リクエストボディから商品情報を取得
        const productInfo = req.body;

        // 必須データがあるかチェック
        if (!productInfo || !productInfo.product_name || !productInfo.features) {
            return res.status(400).send('Invalid product data provided.');
        }

        try {
            // テキスト生成ロジックを実行
            const generatedContent = generateAplusContent(productInfo);
            // 生成されたコンテンツをJSON形式で返す
            res.status(200).json(generatedContent);
        } catch (error) {
            console.error("Error generating content:", error);
            res.status(500).send('Internal Server Error');
        }
    });
});