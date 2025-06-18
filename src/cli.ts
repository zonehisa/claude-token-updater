import type { CLIOptions } from './types.js';
import { log, showBanner } from './utils.js';

/**
 * ヘルプを表示
 */
export function showHelp(): void {
  showBanner();
  
  log('使用方法:', 'yellow');
  log('  npx ctup              # キーチェーンから自動更新');
  log('  npx --yes ctup        # 確認なしで実行（初回時）');
  log('  npx ctup -h           # このヘルプを表示\n');
  
  log('説明:', 'yellow');
  log('  macOSのキーチェーンからClaude Codeの認証情報を取得し、');
  log('  GitHub Actionsで使用するシークレットを自動更新します。\n');
  
  log('必要な環境:', 'yellow');
  log('  • macOS');
  log('  • Node.js 16以上');
  log('  • GitHub CLI (gh)');
  log('  • GitHub CLIでログイン済み');
  log('  • Claude Codeにログイン済み\n');
  
  log('更新されるシークレット:', 'yellow');
  log('  • CLAUDE_ACCESS_TOKEN');
  log('  • CLAUDE_REFRESH_TOKEN');
  log('  • CLAUDE_EXPIRES_AT\n');
  
  log('詳細:', 'yellow');
  log('  https://github.com/zonehisa/claude-token-updater\n', 'cyan');
}

/**
 * CLIオプションを解析
 */
export function parseOptions(args: string[]): CLIOptions {
  const options: CLIOptions = {};
  
  for (const arg of args) {
    switch (arg) {
      case '--help':
      case '-h':
        options.help = true;
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
    }
  }
  
  return options;
}