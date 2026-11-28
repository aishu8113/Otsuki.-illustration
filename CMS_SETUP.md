# microCMSの設定手順 | Otsuki.-illustration

**重要**：このサイトは既存のmicroCMS `https://otuki.microcms.io` を利用する構成です。APIは増やさず、既存の `works`（リスト形式）、`site-settings`（オブジェクト形式）、`activities`（リスト形式）を使います。表示名は変更可ですが、**エンドポイント名は変更しない**でください。

## 1. 作品一覧（`works`）

API設定 → APIスキーマに以下を用意します。既存フィールドは削除不要。

| 表示名 | ID | 種類 |
| --- | --- | --- |
| 作品タイトル | `title` | テキストフィールド |
| 作品画像 | `image` | 画像 |
| 作品説明 | `description` | テキストエリア |
| カテゴリー | `category` | セレクトフィールド（選択肢 `illustration` / `character`、複数選択OFF） |
| 表示順 | `displayOrder` | 数字 |
| TOPに表示 | `showOnTop` | 真偽値 |

- 作品画像はmicroCMSの「メディア」から登録。GitHubへの画像アップロード不要。
- `displayOrder` は数字の小さい順（1, 2, 3…）。未入力は最後。
- `showOnTop` をOFFにすると、TOPには出さずWORKSにのみ表示。未設定の作品はTOPに表示します。
- 公開中の作品を削除/下書きに戻すと、次回の同期後にサイトから消えます。※メディアライブラリ上の元画像削除とは別。
- **既存テスト作品**は、登録したままだとサイトに表示されます。公開前に削除または非公開にしてください。

## 2. サイト設定（`site-settings`）

左の「Otuki.illustrator」→ API設定 → APIスキーマ。現在不要な旧説明文フィールドを整理して構いません。ただし**依頼受付状況 `requestStatus`** は残してください。削除する前に旧データのバックアップを推奨します。

画像の項目（どれも必須OFF）:

| 表示名 | ID | 種類 |
| --- | --- | --- |
| KV後景 | `heroBack` | 画像 |
| KVメイン | `heroMain` | 画像 |
| KV前景 | `heroFront` | 画像 |
| PROFILE左側画像 | `profileCoverImage` | 画像 |
| プロフィール画像 | `profileImage` | 画像 |
| CONTACT画像スライド | `contactSlides` | 複数画像 |
| Illustrationサービス画像 | `serviceIllustrationImage` | 画像 |
| Live2Dサービス画像 | `serviceLive2dImage` | 画像 |
| Characterサービス画像 | `serviceCharacterImage` | 画像 |
| 動画サムネイル① | `moviePoster1` | 画像 |
| 動画サムネイル② | `moviePoster2` | 画像 |

テキスト・リンクの項目（必要なものだけ追加）:

| 表示名 | ID | 種類 |
| --- | --- | --- |
| 依頼受付状況 | `requestStatus` | 既存の種類のまま |
| プロフィール紹介文 | `profileDescription` | テキストエリア |
| Illustration説明 | `serviceIllustrationDescription` | テキストエリア |
| Live2D説明 | `serviceLive2dDescription` | テキストエリア |
| Character説明 | `serviceCharacterDescription` | テキストエリア |
| お問い合わせ先 | `contactEmail` | テキストフィールド |
| Xのリンク | `xUrl` | テキストフィールド |
| Instagramのリンク | `instagramUrl` | テキストフィールド |
| YouTubeのリンク | `youtubeUrl` | テキストフィールド |
| Skebのリンク | `skebUrl` | テキストフィールド |
| pixivのリンク | `pixivUrl` | テキストフィールド |
| 動画タイトル①/② | `movieTitle1` / `movieTitle2` | テキストフィールド |
| 動画説明①/② | `movieDescription1` / `movieDescription2` | テキストエリア |
| 動画URL①/② | `movieVideoUrl1` / `movieVideoUrl2` | テキストフィールド |

### サービスを増減したい場合（任意）

`site-settings` に `services` という**繰り返しフィールド**を作り、カスタムフィールドの子項目を `title`（テキスト）、`image`（画像）、`description`（テキストエリア）として設定できます。`services` にデータがあればその件数・順番でPROFILEのサービスカードを生成します。**繰り返しフィールドを作らない場合は**、表の `serviceIllustrationImage` などの固定3枠を使います。子項目のAPI IDを `serviceTitle` / `serviceImage` / `serviceDescription` にした場合にも対応しています。microCMSでの実際のレスポンス形式が異なる場合は `cms-bridge.js` の該当部分を調整してください。

**KVの透過部分**にはページ共通の夜空背景 `assets/oil-night.webp` がそのまま見えます。レイヤー画像3枚は同じ透明キャンバス（例: 1920×1080）で位置を合わせて用意してください。PNGまたは透過WebP推奨。スマホは上下の空きや画像切れに注意。

PROFILE左側の画像とプロフィール丸アイコンは別々のフィールド。未設定時は仮画像が表示されます。CONTACTの `contactSlides` は1枚なら固定、2枚以上なら6秒ごとにフェード。スマホでは非表示。

SNSのURLは `https://` から始まる実URLを入力してください。未入力はリンクなしの名称表示です。`contactEmail` が未設定の場合、CONTACTフォームからメールアプリを起動できません。

## 3. Topics（任意、既存 `activities` API）

PROFILEのTopicsは、`activities` の公開コンテンツから取得します。次の項目を登録できます（既存と違う場合は追加）。

| 表示名 | ID | 種類 |
| --- | --- | --- |
| トピック見出し | `title` | テキストフィールド |
| トピック説明 | `description` | テキストエリア |
| 表示日 | `date` | 日時（任意） |

公開中の最大8件を表示します。古いテスト活動記録を表示したくない場合は、非公開・削除してください。空の場合は「お知らせは準備中です。」が表示されます。

## 4. 反映の確認方法

1. microCMSで変更を**公開**する（下書きのままでは公開APIに反映されない）。
2. GitHubのActionsから **Update CMS Data** を手動実行する、または約30分ごとの自動更新を待つ。スケジュール実行は遅延する場合あり。
3. `data/works.json` と `data/site-settings.json` に登録情報が反映されていることを確認。
4. GitHub Pagesのデプロイ成功後、ブラウザをハードリロード。
5. 画像が出ないときは、メディアの公開URLとAPIフィールドIDの大文字小文字を確認する。

## 5. 削除・更新時の注意

- APIスキーマのフィールド削除は、過去データの復元に影響します。対象内容を確認してから操作してください。
- 公開コンテンツと「メディア」内のファイルは別。使い回している画像をメディアから消すと別ページまで画像が消えることがあります。
- サイトの全ページをCMSで管理するために、APIキーをJSやHTMLに書く必要はありません。GitHub Secretsだけに保存します。
- APIを追加する必要はありません。既存の5つのエンドポイント構成を維持してください。
