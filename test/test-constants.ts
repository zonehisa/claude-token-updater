// テスト用の共通定数
export const TEST_CONSTANTS = {
  // タイムスタンプ
  MOCK_TIMESTAMP: 1234567890000,
  MOCK_DATE_ISO: '2009-02-13T23:31:30.000Z',
  
  // トークン
  ACCESS_TOKEN: 'test-access-token',
  REFRESH_TOKEN: 'test-refresh-token',
  LONG_ACCESS_TOKEN: 'very-long-access-token-that-should-be-truncated',
  LONG_REFRESH_TOKEN: 'very-long-refresh-token-that-should-be-truncated',
  
  // 更新カウント
  TOTAL_SECRETS: 3,
  PARTIAL_SUCCESS_COUNT: 2,
  
  // コマンド
  KEYCHAIN_COMMAND: 'security find-generic-password -s "Claude Code-credentials" -w 2>/dev/null',
  GH_VERSION_COMMAND: 'gh --version',
  GH_AUTH_COMMAND: 'gh auth status',
  
  // ANSIカラーコード
  ANSI_COLORS: {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m',
  },
  
  // エラーメッセージ
  ERROR_MESSAGES: {
    MACOS_ONLY: 'このスクリプトはmacOSでのみ動作します',
    KEYCHAIN_NOT_FOUND: 'キーチェーンに認証情報が見つかりません',
    SECURITY_COMMAND_NOT_FOUND: 'securityコマンドが見つかりません（macOS以外では動作しません）',
    INVALID_CREDENTIALS_FORMAT: '認証情報の形式が想定と異なります',
    PARTIAL_UPDATE_FAILED: '一部のトークンの更新に失敗しました',
  },
  
  // 成功メッセージ
  SUCCESS_MESSAGES: {
    KEYCHAIN_SUCCESS: '✓ キーチェーンから認証情報を取得しました',
    SECRET_UPDATED: (name: string) => `✓ ${name} を更新しました`,
    ALL_UPDATED: '\n✅ すべてのトークンが正常に更新されました！',
    CLAUDE_MENTION_READY: '🎉 GitHub Actionsで@claudeメンションが使用可能です',
  },
  
  // 警告メッセージ
  WARNING_MESSAGES: {
    CANCELLED: '\nキャンセルしました',
    PARTIAL_UPDATE: (success: number, total: number) => `\n⚠️  ${success}/${total} 個のトークンが更新されました`,
    MANUAL_UPDATE_REQUIRED: '失敗したトークンは手動で更新してください',
  },
};

// バナーのバージョン
export const BANNER_VERSION = 'v1.0.1';

// トークンの切り詰め長さ
export const TOKEN_TRUNCATE_LENGTH = 20;

// テスト用のモック認証情報を生成
export function createMockCredentials(overrides = {}) {
  return {
    claudeAiOauth: {
      accessToken: TEST_CONSTANTS.ACCESS_TOKEN,
      refreshToken: TEST_CONSTANTS.REFRESH_TOKEN,
      expiresAt: TEST_CONSTANTS.MOCK_TIMESTAMP,
      subscriptionType: 'pro',
      ...overrides,
    },
  };
}

// テスト用のGitHub Secrets形式を生成
export function createMockSecrets(overrides = {}) {
  return {
    CLAUDE_ACCESS_TOKEN: TEST_CONSTANTS.ACCESS_TOKEN,
    CLAUDE_REFRESH_TOKEN: TEST_CONSTANTS.REFRESH_TOKEN,
    CLAUDE_EXPIRES_AT: TEST_CONSTANTS.MOCK_DATE_ISO,
    ...overrides,
  };
}