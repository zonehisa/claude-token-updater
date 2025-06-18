import { createInterface } from 'readline';
import { getCredentialsFromKeychain, convertToGitHubSecrets, displayCredentialsInfo } from './keychain.js';
import { updateGitHubSecrets } from './github-secrets.js';
import { log } from './utils.js';

/**
 * ユーザーに確認を求める
 */
async function confirmUpdate(): Promise<boolean> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('\n以下の内容でGitHub Secretsを更新します。よろしいですか？ (y/n): ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

/**
 * キーチェーンから自動更新を実行
 */
export async function runAutoUpdate(): Promise<void> {
  try {
    // キーチェーンから認証情報を取得
    const credentials = getCredentialsFromKeychain();
    log('✓ キーチェーンから認証情報を取得しました', 'green');
    
    // 情報を表示
    displayCredentialsInfo(credentials);
    
    // GitHub Secrets形式に変換
    const secrets = convertToGitHubSecrets(credentials);
    
    // 確認プロンプト
    const confirmed = await confirmUpdate();
    
    if (!confirmed) {
      log('\nキャンセルしました', 'yellow');
      return;
    }
    
    // シークレットを更新
    const result = await updateGitHubSecrets(secrets);
    
    if (!result.success) {
      throw new Error('一部のトークンの更新に失敗しました');
    }
    
  } catch (error) {
    log(`\n✗ エラー: ${error}`, 'red');
    
    if (error instanceof Error && error.message.includes('キーチェーン')) {
      log('\n💡 ヒント:', 'yellow');
      log('1. Claude Codeにログインしていることを確認', 'yellow');
      log('2. キーチェーンアクセスでパスワードの要求が表示された場合は許可', 'yellow');
      log('3. それでも失敗する場合は手動更新スクリプトを使用:', 'yellow');
      log('   npx claude-token-updater --manual', 'cyan');
    }
    
    throw error;
  }
}