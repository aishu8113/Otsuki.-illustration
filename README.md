# Otuki. — CMS連携・GitHub Pages公開準備版

## 今回の変更
- 今回アップロードされた index/contact/works、CSS、app.js、data.js をベースに構築。
- デザインとカルーセルは維持し、`cms-bridge.js` で旧microCMSの公開JSONを変換。
- `.github/workflows/update-cms.yml` は30分ごとにmicroCMSからJSONを取得。GitHub Secretsの `MICROCMS_API_KEY` を利用（APIキーは公開コードに書かない）。
- **旧サイトのテスト作品や文章は読み込まない初期設定**。`data.js` の `cmsWorksEnabled` と `cmsSettingsEnabled` は `false`。

## 公開までの手順
1. **画像フォルダを追加**：今回の添付に `img/` がないため、ローカルの `img` フォルダをこのZIP内のルートにそのまま追加してください。特に `img/KV/KV_01.png`、`img/MVイラスト/`、`img/skeb/`、`img/創作/`。`assets/` は同梱済み。
2. GitHubの既存リポジトリの**バックアップを取ってから**、このフォルダ内のファイルをリポジトリのルートにアップロード。`.github` フォルダも含める。既存の `MICROCMS_API_KEY` Secret は保持。
3. GitHub Settings → Pages → Build and deployment → Deploy from a branch → `main` / `/(root)`（既存の設定に合わせて確認）。公開URLで `index.html`、`works.html`、`contact.html` と画像をチェック。
4. GitHub Actions → `Update CMS Data` → `Run workflow` でJSON生成を確認。**最初はCMSの作品を表示しません**。
5. microCMSで旧テスト作品を削除・非公開にし、新しいサイトの作品を登録。その後 `data.js` の `cmsWorksEnabled: true` に変更してpush。以降の作品更新はCMSのみでOK。
6. 受付状況をCMS管理したくなったら、旧テスト文を更新した上で `cmsSettingsEnabled: true` に変更。
7. Google Search Consoleで公開URLを登録・URL検査→インデックス登録リクエスト。公開しただけではGoogle検索への掲載は保証されません。

## 注意事項
- `img/` は未添付なのでこのZIPだけでは現在の作品画像は表示されません。ファイル名・大文字小文字に注意。
- `data.js` の `email` は空です。Contactフォームは直接送信ではなく、メールアプリ起動方式。メールアドレスを設定するまで送信不可。
- `assets/oil-night*.webp` は試作の生成背景素材。公開利用方針に合わせて差し替えてください。
- `works.json` の既存フィールドにカテゴリはありません。カテゴリ未設定はIllustration扱い。Character分類を使う場合はCMSに `category` フィールドを追加し、値 `character` を指定してください。
- CMSが一時的に読み込めない場合、ローカルの `data.js` 作品にフォールバックします。`file://` でのfetchは制限されるので、CMS接続の確認はGitHub Pagesまたはローカルサーバーで行ってください。
- GitHub Actionsのcronは実行が遅延する場合があります。手動実行も可能です。100件超の作品はAPIページネーションの追加が必要です。
- 旧リポジトリのファイルが残る場合は不要な旧ページを削除してください。Search Consoleに古いページが残る可能性があります。

