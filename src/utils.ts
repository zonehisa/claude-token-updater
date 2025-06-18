import { execSync } from 'child_process';
import type { ConsoleColor, ExecutionResult } from './types.js';

/**
 * ANSI色コード定義
 */
const colors: Record<ConsoleColor, string> = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

/**
 * 色付きコンソール出力
 */
export function log(message: string, color: ConsoleColor = 'reset'): void {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * バナー表示
 */
export function showBanner(): void {
  log('\n╔═══════════════════════════════════════╗', 'cyan');
  log('║     Claude Token Updater v1.0.1       ║', 'cyan');
  log('║ Update GitHub Secrets for Claude Code ║', 'cyan');
  log('╚═══════════════════════════════════════╝\n', 'cyan');
}

/**
 * プラットフォームチェック
 */
export function isMacOS(): boolean {
  return process.platform === 'darwin';
}

/**
 * GitHub CLIがインストールされているかチェック
 */
export function checkGitHubCLI(): boolean {
  try {
    execSync('gh --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * GitHub CLIの認証状態を確認
 */
export function checkGitHubAuth(): boolean {
  try {
    execSync('gh auth status', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * コマンド実行のラッパー
 */
export function executeCommand(
  command: string,
  options: { silent?: boolean } = {}
): ExecutionResult {
  try {
    const output = execSync(command, {
      encoding: 'utf-8',
      stdio: options.silent ? 'pipe' : 'inherit'
    });
    
    return {
      success: true,
      message: output?.toString().trim()
    };
  } catch (error) {
    return {
      success: false,
      error: error as Error
    };
  }
}

/**
 * エラーメッセージの整形
 */
export function formatError(error: Error | unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}
