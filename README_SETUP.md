# AppSuite ポートフォリオ：自動サムネイル完全版

既存のポートフォリオの検索・ダークモード・詳細表示を残し、各Webアプリの実画面をサムネイルとして自動表示する版です。

## 仕組み

1. `apps-data.js` にアプリ一覧を登録します。
2. `index.html` は `thumbnails/<id>.jpg` を最優先で表示します。
3. 初回など画像がまだ無いときだけ Thum.io を一時フォールバックとして使います。
4. GitHub Actions が毎日、日本時間03:10ごろに全アプリをPlaywrightで撮影します。
5. 画像に変更がある場合だけ `thumbnails/` を自動コミットします。
6. `manifest.json` の更新時刻をキャッシュバスターに使います。

## 導入手順

1. ZIPの中身を `nakatasapporo-create/nakatasapporo-create.github.io` のルートへアップロードし、既存 `index.html` を置き換えます。
2. GitHubの `Settings` → `Actions` → `General` → `Workflow permissions` で、必要なら `Read and write permissions` を有効にします。
3. `Actions` → `Update app thumbnails` → `Run workflow` を1回実行します。
4. 成功すると `thumbnails/` に各アプリのJPEGと `manifest.json` が追加されます。

## 新しいアプリを追加する方法

`apps-data.js` の `APP_DATA` 配列へ1件追加してmainへpushするだけです。Actionsが自動起動し、新しいサムネイルも生成します。

```js
{
  id: "newapp",
  title: "新しいアプリ",
  description: "説明文",
  category: "utility",
  tags: ["Utility"],
  icon: "fa-solid fa-star",
  path: "https://nakatasapporo-create.github.io/newapp/",
  gradient: "from-blue-600 to-cyan-500",
  releaseDate: "2026-09"
}
```

## 外部サムネイルサービスを使わない場合

`index.html` の

```js
const USE_REMOTE_THUMBNAIL_FALLBACK = true;
```

を `false` に変更してください。ローカル画像が無い場合はグラデーション＋アイコン表示になります。

## 手元のPCで撮影する場合

```bash
npm install
npx playwright install chromium
npm run screenshots
```

## 追加した改善

- 実画面サムネイル表示
- サムネイルクリックでアプリ起動
- 詳細モーダルにも実画面表示
- 画像取得失敗時フォールバック
- GitHub Actionsによる毎日自動更新
- 新規アプリ追加時の自動撮影
- 登録順 / 新しい順 / 名前順
- スマホ / iPad / PC対応
- ダークモード、検索、カテゴリ絞り込み維持
- 遅延読み込み、キャッシュ更新対策
- Escapeキー、背景クリックでモーダルを閉じる
