# Otsuki.-illustration | Otuki. 作品サイト

本ZIPは**今回ユーザーがアップロードした index(5).html / works(2).html / contact(2).html / style(5).css / app(2).js / data(2).js / README(2).md のデザインとコードをベースにしたGitHub Pages用のサイト一式**です。`index.html`、`works.html`、`profile.html`、`contact.html`、`style.css`、`app.js`、`cms-bridge.js`、`data.js`、`assets/`、`data/`、`.github/`を含みます。

## 現在の仕様

- 背景：`assets/oil-night.webp` ほか、既存の油絵風背景と星の演出を維持。**GitHubに追加の `img/` 画像は不要**。
- KV：サイト共通背景の上に、microCMSの透過画像 `heroBack`、`heroMain`、`heroFront` を3枚重ねます。3枚の画像は**同じキャンバス比率**で制作してください。何も登録しなければ背景だけ表示します。
- WORKS：microCMSの `works` に登録した作品を一覧表示。`showOnTop` がONの作品をTOP額縁スライダーに表示。`displayOrder` の数字の小さい順。
- PROFILE：左の固定画像、プロフィール画像・説明、Illustration / Live2D / Character Designの画像付き・枠付きサービスカード、Topics。CMSの繰り返しフィールド `services` があればカード件数も自由に増減できます。
- CONTACT：PC左の固定スライド画像（複数枚は6秒ごとに切替）、右だけスクロール。スマホは画像を非表示にしてフォームを全幅表示。
- SNS：共通フッターに X / Instagram / YouTube / Skeb / pixiv。microCMSでURL登録後クリック可能。
- CMS未設定時は仮画像・案内文が表示されます。**microCMSのAPIスキーマの作成は自動では行われません。** 詳しい設定は `CMS_SETUP.md` を参照。

## 公開手順

1. **現在のリポジトリのバックアップ**を取る。既存の `img` はこのパッケージで削除しません（CMS移行が完了後、不要になったものだけ削除）。
2. ZIPを展開し、`Otsuki.-illustration` フォルダの**中身**を既存のGitHubリポジトリ `Otsuki.-illustration` の直下にアップロード。同じファイルを上書き。`.github/workflows/update-cms.yml` も反映。
3. GitHub Pagesを `main` / `/(root)` に設定して公開。背景とレイアウトはここで表示できます。
4. microCMSの既存API `works` と `site-settings` のフィールドを `CMS_SETUP.md` の通りに作成する。古いテスト作品は公開前に非公開/削除。
5. GitHubの **Settings > Secrets and variables > Actions** に `MICROCMS_API_KEY` が設定されているか確認。**ブラウザ用ファイルにAPIキーを記載しない**。
6. **Actions > Update CMS Data > Run workflow** を実行し、緑のチェックを確認。更新された `data/works.json` と `data/site-settings.json` には画像のURLが入る。
7. GitHub Pagesが更新されてから公開サイトを強制更新（Windows: Ctrl+Shift+R）。画像が出れば連携完了。以降、作品・画像・SNS変更はmicroCMSから更新して、定期同期を待つだけです。

注意：GitHub Pagesの公開状態やCMSのフィールドは、このZIPだけでは自動設定されません。インターネットにつながる `https://` サイトでCMSを確認してください。ファイルをダブルクリックして `file://` で開くと、fetchでJSONを読み込めない場合があります。

お問い合わせフォームは実際のサーバー送信機能ではなく、microCMSの `contactEmail` に登録した宛先に対して **mailto:** でメールアプリを開く方式です。メールクライアントの設定が必要で、サイトから自動送信されるものではありません。
