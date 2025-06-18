#!/usr/bin/env node

import type { CLIOptions } from './types.js';
import { log, showBanner, isMacOS, checkGitHubCLI, checkGitHubAuth } from './utils.js';
import { runAutoUpdate } from './auto-update.js';
import { runManualUpdate } from './manual-update.js';
import { showBrowserHelper } from './browser-helper.js';

/**
 * ヘルプを表示
 */
function showHelp(): void {
  showBanner();
  
  log('使用方法:', 'yellow');
  log('  npx claude-token-updater              # 自動モード（macOSのみ）');
  log('  npx claude-token-updater --manual     # 手動モード');
  log('  npx claude-token-updater --browser    # ブラウザヘルパー');
  log('  npx claude-token-updater --help       # このヘルプを表示\n');
  
  log('説明:', 'yellow');
  log('  Claude CodeのGitHub Actions用トークンを簡単に更新します。\n');
  
  log('モード:', 'yellow');
  log('  • 自動モード: macOSのキーチェーンから自動取得（推奨）');
  log('  • 手動モード: JSONを貼り付けて更新');
  log('  • ブラウザヘルパー: ブラウザからトークンを取得する方法を表示\n');
  
  log('必要な環境:', 'yellow');
  log('  • Node.js 16以上');
  log('  • GitHub CLI (gh)');
  log('  • GitHub CLIでログイン済み\n');
  
  log('詳細:', 'yellow');
  log('  https://github.com/zonehisa/claude-token-updater\n', 'cyan');
}

/**
 * CLIオプションを解析
 */
function parseOptions(args: string[]): CLIOptions {
  const options: CLIOptions = {};
  
  for (const arg of args) {
    switch (arg) {
      case '--help':
      case '-h':
        options.help = true;
        break;
      case '--manual':
      case '-m':
        options.manual = true;
        break;
      case '--browser':
      case '-b':
        options.browser = true;
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
    }
  }
  
  return options;
}

/**
 * 環境チェック
 */
function checkEnvironment(): void {
  // GitHub CLIチェック
  if (!checkGitHubCLI()) {
    log('✗ GitHub CLI (gh) がインストールされていません', 'red');
    log('\nインストール方法:', 'yellow');
    log('  brew install gh              # macOS', 'cyan');
    log('  winget install --id GitHub.cli  # Windows', 'cyan');
    log('  https://cli.github.com/         # その他\n', 'cyan');
    process.exit(1);
  }
  
  // 認証チェック
  if (!checkGitHubAuth()) {
    log('✗ GitHub CLIが認証されていません', 'red');
    log('実行: gh auth login', 'yellow');
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
    // モード選択
    if (options.manual) {
      // 手動モード
      log('📝 手動モードで起動します...', 'blue');
      await runManualUpdate();
    } else if (options.browser) {
      // ブラウザヘルパー
      log('🌐 ブラウザヘルパーを表示します...', 'blue');
      showBrowserHelper();
    } else {
      // 自動モード（デフォルト）
      if (!isMacOS()) {
        log('⚠️  自動モードはmacOSでのみ利用可能です', 'yellow');
        log('\n他のプラットフォームでは手動モードを使用してください:', 'cyan');
        log('  npx claude-token-updater --manual\n');
        
        // 手動モードにフォールバック
        log('📝 手動モードに切り替えます...', 'blue');
        await runManualUpdate();
      } else {
        log('🔑 キーチェーンから自動取得します...', 'blue');
        await runAutoUpdate();
      }
    }
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