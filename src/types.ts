/**
 * Claude Code OAuth認証情報の型定義
 */
export interface ClaudeOAuthCredentials {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  scopes?: string[];
  subscriptionType?: string;
}

/**
 * キーチェーンから取得される認証情報の型
 */
export interface KeychainCredentials {
  claudeAiOauth: ClaudeOAuthCredentials;
}

/**
 * GitHub Secretsの型
 */
export interface GitHubSecrets {
  CLAUDE_ACCESS_TOKEN: string;
  CLAUDE_REFRESH_TOKEN: string;
  CLAUDE_EXPIRES_AT: string;
}

/**
 * CLIのオプション型
 */
export interface CLIOptions {
  manual?: boolean;
  browser?: boolean;
  help?: boolean;
  verbose?: boolean;
}

/**
 * 色付きコンソール出力用の色定義
 */
export type ConsoleColor = 'reset' | 'green' | 'red' | 'yellow' | 'blue' | 'cyan' | 'magenta';

/**
 * スクリプトの実行結果
 */
export interface ExecutionResult {
  success: boolean;
  message?: string;
  error?: Error;
}