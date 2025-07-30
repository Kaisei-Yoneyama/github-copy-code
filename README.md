# github-copy-code

GitHub の差分ページでコードをクリップボードにコピーできるようにするブラウザー拡張機能

## 対応ページ

- `/{owner}/{repo}/commit/{commit_sha}`
- `/{owner}/{repo}/pull/{pull_number}/files`
- `/{owner}/{repo}/pull/{pull_number}/commits/{commit_sha}`

## デプロイ

この拡張機能は GitHub Actions を使用して自動的にデプロイされます。

### 自動デプロイ

- `main` ブランチにプッシュされた際に自動的にワークフローが実行されます。
- `package.json` のバージョンが変更されている場合のみデプロイが実行されます。
  - Chrome Web Store への自動アップロードとリリースの作成が行われます。

以下のシークレットを設定する必要があります。

- `EXTENSION_ID`: Chrome Web Store 拡張機能 ID
- `CLIENT_ID`: Google クライアント ID
- `CLIENT_SECRET`: Google クライアントシークレット
- `REFRESH_TOKEN`: Google リフレッシュトークン

### 手動デプロイ

ローカルでビルドしてデプロイする場合は以下のコマンドを実行してください。  
生成された ZIP ファイルは `.output` ディレクトリに出力されます。

```bash
npm run zip
```

## テンプレートの管理

拡張機能のポップアップからテンプレートを管理できます。  
ポップアップを開くにはブラウザーのツールバーにある拡張機能のアイコンをクリックしてください。

カスタムテンプレートを使用するにはテンプレートを作成してデフォルトに指定してください。  
デフォルトに指定するには ⭐ ボタンをクリックしてください。

> [!WARNING]
> デフォルトテンプレートが指定されていない場合は以下のサンプルテンプレートが使用されます。
>
> ````
> <!-- Sample template -->
> {{#hunkList}}
> {{#collapseWhitespace}}```{{langId}} {{#isFirst}}filePath={{filePath}}{{/isFirst}} newStart={{newStart}} oldStart={{oldStart}}{{/collapseWhitespace}}
> {{{code}}}
> ```
> {{/hunkList}}
> ````

## テンプレートの記法

Mustache テンプレートエンジンを使用しているため、任意のマークアップのテンプレートを記述できます。

> [!NOTE]
> Mustache 構文の詳細は公式のマニュアルを参照してください。  
> https://mustache.github.io/mustache.5.html

### `{{#trimWhitespace}} … {{/trimWhitespace}}`

- タグ種別: Section (Lambda)
- 説明: 囲んだ内容の前後の空白を削除します。  
  例: `{{#trimWhitespace}}  Hello, world!  {{/trimWhitespace}}` → `Hello, world!`

### `{{#collapseWhitespace}} … {{/collapseWhitespace}}`

- タグ種別: Section (Lambda)
- 説明: 囲んだ内容の連続する空白を単一の空白に置き換えます。  
  例: `{{#collapseWhitespace}}Hello,    world!{{/collapseWhitespace}}` → `Hello, world!`

### `{{#isAdded}} … {{/isAdded}}`

### `{{#isDeleted}} … {{/isDeleted}}`

### `{{#isModified}} … {{/isModified}}`

- タグ種別: Section (Non-False Value)
- 説明: ファイルが追加/削除/変更された場合のみ囲んだ内容を処理します。

### `{{#hunkList}} … {{/hunkList}}`

- タグ種別: Section (Non-Empty List)
- 説明: 差分のハンクリストを反復処理します。
  この内側では以下のタグが使用できます。

#### `{{code}}`

- タグ種別: Variable
- 説明: コードブロックの内容を表します。  
  HTML エスケープが不要な場合は `{{{code}}}` を使用してください。  
  変更 (modified) の場合は行頭に `+` や `-` が付きますが、追加 (added) や削除 (deleted) の場合は付きません。

#### `{{langId}}`

- タグ種別: Variable
- 説明: コードブロックの言語識別子を表します。
  シンタックスハイライトの言語指定に使用できます。
  変更 (modified) の場合は `diff-` プレフィックスが付きますが、追加 (added) や削除 (deleted) の場合は付きません。
  例: 変更時: `diff-tsx`, 追加時: `tsx`, 削除時: `tsx`

#### `{{filePath}}`

- タグ種別: Variable
- 説明: リポジトリルートからのファイルパスを表します。
  例: `entrypoints/popup/App.tsx`

#### `{{fileName}}`

- タグ種別: Variable
- 説明: ファイル名（ベースファイル名）を表します。
  例: `App.tsx`

#### `{{newStart}}`

#### `{{oldStart}}`

- タグ種別: Variable
- 説明: 変更前/変更後のハンクの開始行番号を表します。

#### `{{#isFirst}} … {{/isFirst}}`

#### `{{#isLast}} … {{/isLast}}`

- タグ種別: Section (Non-False Value)
- 説明: 最初のハンク/最後のハンクの場合のみ囲んだ内容を処理します。

> [!TIP]
> Section は条件を反転 (Inverted Section) させることもできます。詳細は公式のマニュアルを参照してください。  
> https://mustache.github.io/mustache.5.html#Inverted-Sections

## テンプレートの例

### 拡張 Markdown コードブロック

以下はファイルパスや行番号を指定できるように拡張した Markdown コードブロックのためのテンプレートです。

````mustache
{{#hunkList}}
{{#collapseWhitespace}}```{{langId}} {{#isFirst}}filePath={{filePath}}{{/isFirst}} newStart={{newStart}} oldStart={{oldStart}}{{/collapseWhitespace}}
{{{code}}}
```
{{/hunkList}}
````
