import { createInterface } from 'readline';
import type { GitHubSecrets } from './types.js';
import { updateGitHubSecrets } from './github-secrets.js';
import { log } from './utils.js';

/**
 * 標準入力からJSONを読み取る
 */
async function readJsonInput(): Promise<string> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    log('\nClaude CodeのトークンJSONを貼り付けてください (Enterを2回押して完了):', 'blue');
    
    let input = '';
    let emptyLineCount = 0;
    
    rl.on('line', (line) => {
      if (line === '') {
        emptyLineCount++;
        if (emptyLineCount >= 2) {
          rl.close();
          resolve(input.trim());
        }
      } else {
        emptyLineCount = 0;
        input += line + '\n';
      }
    });
  });
}

/**
 * JSONを解析してトークンを抽出
 */
function parseTokens(jsonString: string): GitHubSecrets {
  try {
    const data = JSON.parse(jsonString);
    
    // claudeAiOauthキーがある場合はその中身を使用
    const tokenData = data.claudeAiOauth || data;
    
    // 必要なフィールドを確認
    const required = ['accessToken', 'refreshToken', 'expiresAt'];
    const missing = required.filter(field => !tokenData[field]);
    
    if (missing.length > 0) {
      throw new Error(`必須フィールドが不足しています: ${missing.join(', ')}`);
    }
    
    // created_atをexpires_atに変換（24時間後）
    const expiresAt = new Date(tokenData.expiresAt);
    const newExpiresAt = new Date(expiresAt.getTime() + 24 * 60 * 60 * 1000);
    
    return {
      CLAUDE_ACCESS_TOKEN: tokenData.accessToken,
      CLAUDE_REFRESH_TOKEN: tokenData.refreshToken,
      CLAUDE_EXPIRES_AT: newExpiresAt.toISOString()
    };
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('無効なJSON形式です');
    }
    throw error;
  }
}

/**
 * 手動更新を実行
 */
export async function runManualUpdate(): Promise<void> {
  try {
    // JSONを読み取る
    const jsonInput = await readJsonInput();
    
    if (!jsonInput) {
      log('入力がありません', 'red');
      return;
    }
    
    // トークンを解析
    log('\nトークンを解析中...', 'yellow');
    const tokens = parseTokens(jsonInput);
    
    // 確認表示
    log('\n以下の内容で更新します:', 'blue');
    log(`- CLAUDE_ACCESS_TOKEN: ${tokens.CLAUDE_ACCESS_TOKEN.substring(0, 20)}...`, 'blue');
    log(`- CLAUDE_REFRESH_TOKEN: ${tokens.CLAUDE_REFRESH_TOKEN.substring(0, 20)}...`, 'blue');
    log(`- CLAUDE_EXPIRES_AT: ${tokens.CLAUDE_EXPIRES_AT}`, 'blue');
    
    // シークレットを更新
    const result = await updateGitHubSecrets(tokens);
    
    if (!result.success) {
      throw new Error('一部のトークンの更新に失敗しました');
    }
    
  } catch (error) {
    log(`\nエラー: ${error}`, 'red');
    throw error;
  }
}