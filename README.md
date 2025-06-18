# claude-token-updater

Claude CodeのGitHub Actions用トークンを簡単に更新するCLIツール

## インストール不要！

npxで直接実行できます：

```bash
npx claude-token-updater
```

## プラットフォーム対応

- **macOS**: ✅ 自動モード（キーチェーン連携）、✅ 手動モード
- **Windows**: ✅ 手動モード（自動的に切り替わります）
- **Linux**: ✅ 手動モード（自動的に切り替わります）

## 使い方

### 🎯 自動モード（macOS限定）

```bash
npx claude-token-updater
```

macOSのキーチェーンからClaude Codeの認証情報を自動取得してGitHub Secretsを更新します。

**注意**: 自動モードはmacOSのキーチェーンを使用するため、macOS専用です。Windows/Linuxでは自動的に手動モードに切り替わります。

### 📝 手動モード（全プラットフォーム対応）

```bash
npx claude-token-updater --manual
```

JSONを貼り付けてトークンを更新します。Windows、Linux、macOSで利用可能です。

### 🌐 ブラウザヘルパー

```bash
npx claude-token-updater --browser
```

ブラウザの開発者ツールからトークンを取得する方法を表示します。

### ヘルプ

```bash
npx claude-token-updater --help
```

## 必要な環境

- Node.js 16以上
- GitHub CLI (`gh`)がインストール済み
- `gh auth login`で認証済み
- Claude Codeにログイン済み（自動モードの場合）

## 更新されるGitHub Secrets

- `CLAUDE_ACCESS_TOKEN`
- `CLAUDE_REFRESH_TOKEN`
- `CLAUDE_EXPIRES_AT`

## GitHub CLIのインストール

### プラットフォーム別インストール方法

**macOS (Homebrew)**
```bash
brew install gh
```

**Windows (winget)**
```bash
winget install --id GitHub.cli
```

**Linux (各ディストリビューション)**
- Ubuntu/Debian: `sudo apt install gh`
- Fedora: `sudo dnf install gh`
- Arch: `sudo pacman -S github-cli`

詳細: https://cli.github.com/

## トラブルシューティング

### GitHub CLIの認証

```bash
gh auth login
```

### キーチェーンアクセスの許可（macOS）

初回実行時はキーチェーンアクセスの許可が必要な場合があります。

### 手動モードへの切り替え

自動取得に失敗した場合は、手動モードを使用してください：

```bash
npx claude-token-updater --manual
```

## ライセンス

MIT

## 貢献

Issues、Pull Requestsは大歓迎です！

https://github.com/zonehisa/claude-token-updater