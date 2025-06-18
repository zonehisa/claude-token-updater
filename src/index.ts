#!/usr/bin/env node

import { log, showBanner, isMacOS, checkGitHubCLI, checkGitHubAuth } from './utils.js';
import { runAutoUpdate } from './auto-update.js';
import { showHelp, parseOptions } from './cli.js';

/**
 * 環境チェック
 */
function checkEnvironment(): void {
  // macOSチェック
  if (!isMacOS()) {
    log('✗ このツールはmacOS専用です', 'red');
    log('\nmacOSのキーチェーン機能を使用してClaude Codeのトークンを', 'yellow');
    log('安全に管理・更新します。\n', 'yellow');
    process.exit(1);
  }
  
  // GitHub CLIチェック
  if (!checkGitHubCLI()) {
    log('✗ GitHub CLI (gh) がインストールされていません', 'red');
    log('\nインストール方法:', 'yellow');
    log('  brew install gh\n', 'cyan');
    process.exit(1);
  }
  
  // 認証チェック
  if (!checkGitHubAuth()) {
    log('✗ GitHub CLIが認証されていません', 'red');
    log('\n以下のコマンドで認証してください:', 'yellow');
    log('  gh auth login\n', 'cyan');
    process.exit(1);
  }
}

/**
 * メイン処理
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const options = parseOptions(args);
  
  // ヘルプ表示
  if (options.help) {
    showHelp();
    return;
  }
  
  showBanner();
  checkEnvironment();
  
  try {
    log('🔑 キーチェーンからClaude Codeの認証情報を取得します...', 'blue');
    await runAutoUpdate();
  } catch (error) {
    // エラーは各モジュールで処理済み
    process.exit(1);
  }
}

// エラーハンドリング
process.on('uncaughtException', (error: Error) => {
  log(`\n✗ エラーが発生しました: ${error.message}`, 'red');
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown) => {
  log(`\n✗ エラーが発生しました: ${reason}`, 'red');
  process.exit(1);
});

// 実行
main().catch((error: Error) => {
  log(`\n✗ エラー: ${error.message}`, 'red');
  process.exit(1);
});