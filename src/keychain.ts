import { execSync } from 'child_process';
import type { KeychainCredentials, GitHubSecrets } from './types.js';
import { log, isMacOS } from './utils.js';

/**
 * キーチェーンからClaude Codeの認証情報を取得
 */
export function getCredentialsFromKeychain(): KeychainCredentials {
  if (!isMacOS()) {
    throw new Error('このスクリプトはmacOSでのみ動作します');
  }

  try {
    log('🔑 キーチェーンからClaude Codeの認証情報を取得中...', 'cyan');
    
    const result = execSync(
      'security find-generic-password -s "Claude Code-credentials" -w 2>/dev/null',
      { encoding: 'utf-8' }
    ).trim();
    
    if (!result || result === 'Not found') {
      throw new Error('キーチェーンに認証情報が見つかりません');
    }
    
    return JSON.parse(result) as KeychainCredentials;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('ENOENT')) {
        throw new Error('securityコマンドが見つかりません（macOS以外では動作しません）');
      }
      throw new Error(`キーチェーンアクセスエラー: ${error.message}`);
    }
    throw error;
  }
}

/**
 * キーチェーンの認証情報をGitHub Secrets形式に変換
 */
export function convertToGitHubSecrets(credentials: KeychainCredentials): GitHubSecrets {
  const oauth = credentials.claudeAiOauth;
  
  if (!oauth) {
    throw new Error('認証情報の形式が想定と異なります');
  }
  
  return {
    CLAUDE_ACCESS_TOKEN: oauth.accessToken,
    CLAUDE_REFRESH_TOKEN: oauth.refreshToken,
    CLAUDE_EXPIRES_AT: new Date(oauth.expiresAt).toISOString()
  };
}

/**
 * 認証情報の表示
 */
export function displayCredentialsInfo(credentials: KeychainCredentials): void {
  const oauth = credentials.claudeAiOauth;
  
  log('\n📋 取得したトークン情報:', 'cyan');
  log(`- Access Token: ${oauth.accessToken.substring(0, 20)}...`, 'blue');
  log(`- Refresh Token: ${oauth.refreshToken.substring(0, 20)}...`, 'blue');
  log(`- Expires At: ${new Date(oauth.expiresAt).toISOString()}`, 'blue');
  
  if (oauth.subscriptionType) {
    log(`- Subscription: ${oauth.subscriptionType}`, 'blue');
  }
}