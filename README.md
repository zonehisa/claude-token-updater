# claude-token-updater

macOS専用：Claude CodeのGitHub Actions用トークンをキーチェーンから自動更新するCLIツール

## 概要

macOSのキーチェーンからClaude Codeの認証情報を安全に取得し、GitHub Actionsで使用するSecretsを自動更新します。手動でトークンをコピー&ペーストする必要がなくなります。

## インストール不要！

npxで直接実行できます：

```bash
npx ctup
```

初回実行時は、npxがパッケージのダウンロードを確認します：
```
Need to install the following packages:
  claude-token-updater@1.0.1
Ok to proceed? (y) 
```

確認をスキップしたい場合：
```bash
npx --yes ctup
```

## 必要な環境

- **macOS** (必須)
- Node.js 16以上
- GitHub CLI (`gh`)がインストール済み
- `gh auth login`で認証済み
- Claude Codeにログイン済み

## 使い方

### 🎯 基本的な使い方

```bash
npx claude-token-updater
```

macOSのキーチェーンからClaude Codeの認証情報を自動取得してGitHub Secretsを更新します。

### ヘルプ

```bash
npx ctup --help
```

## 更新されるGitHub Secrets

- `CLAUDE_ACCESS_TOKEN`
- `CLAUDE_REFRESH_TOKEN`
- `CLAUDE_EXPIRES_AT`

## GitHub CLIのインストール

macOSでGitHub CLIをインストールする方法：

**Homebrew**
```bash
brew install gh
```

**MacPorts**
```bash
sudo port install gh
```

詳細: https://cli.github.com/

## トラブルシューティング

### GitHub CLIの認証

初回実行時は以下のコマンドでGitHub CLIの認証を行ってください：

```bash
gh auth login
```

### キーチェーンアクセスの許可

初回実行時はmacOSがキーチェーンアクセスの許可を求める場合があります。
ダイアログが表示されたら「許可」をクリックしてください。

### Claude Codeにログインしていない場合

このツールを使用する前に、Claude Code (https://claude.ai) にログインしている必要があります。

## なぜmacOS専用？

このツールはmacOSのキーチェーン機能を使用してClaude Codeの認証情報を安全に取得します。
キーチェーンはmacOS固有の機能であるため、他のプラットフォームでは動作しません。

Windows/Linux環境でClaude Codeのトークンを更新する場合は、手動で以下の手順を実行してください：

1. ブラウザの開発者ツールを開く
2. アプリケーション/ストレージからLocal Storageを確認
3. `https://claude.ai`のエントリから`Claude Code-credentials`を探す
4. 認証情報をGitHub Secretsに手動で設定

## ライセンス

MIT

## 貢献

Issues、Pull Requestsは大歓迎です！

https://github.com/zonehisa/claude-token-updater
