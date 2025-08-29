# A+コンテンツ テキスト生成システム

Amazon A+コンテンツ用のマーケティングテキストを自動生成するWebアプリケーションです。

## 機能

- 画像のドラッグ&ドロップアップロード
- AIによる画像分析とテキスト生成（Gemini API使用）
- 生成されたテキストの編集機能
- ワンクリックでのテキストコピー機能

## 技術スタック

- **フロントエンド**: HTML5, Tailwind CSS, Vanilla JavaScript
- **バックエンド**: Node.js, Google Cloud Functions
- **ホスティング**: Vercel（フロントエンド）、Google Cloud（バックエンド）

## セットアップ

1. Gemini APIキーを取得し、`frontend.html`内の`apiKey`変数に設定
2. Vercelにデプロイ: `vercel`
3. バックエンド（オプション）: Google Cloud Functionsにデプロイ

## 使用方法

1. ヘッダー用画像をアップロード（必須）
2. 特徴用画像を最大3枚アップロード（オプション）
3. 「A+コンテンツを生成」ボタンをクリック
4. 生成されたテキストを編集
5. 「全文コピー」でクリップボードにコピー