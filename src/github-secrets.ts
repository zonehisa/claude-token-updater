import { execSync } from 'child_process';
import type { GitHubSecrets } from './types.js';
import { log } from './utils.js';

/**
 * シェルコマンドの値をエスケープ
 */
export function escapeShellArg(value: string): string {
  // シングルクォートで囲み、内部のシングルクォートをエスケープ
  return `'${value.replace(/'/g, "'\\''")}'`;
}

/**
 * GitHub Secretを更新
 */
export function updateSecret(name: string, value: string): boolean {
  try {
    // 値を安全にエスケープ
    const escapedValue = escapeShellArg(value);
    execSync(`gh secret set ${name} --body ${escapedValue}`, { stdio: 'inherit' });
    log(`✓ ${name} を更新しました`, 'green');
    return true;
  } catch (error) {
    log(`✗ ${name} の更新に失敗しました: ${error}`, 'red');
    return false;
  }
}

/**
 * GitHub Secretsを一括更新
 */
export async function updateGitHubSecrets(
  secrets: GitHubSecrets
): Promise<{ success: boolean; updatedCount: number }> {
  log('\n🔄 GitHub Secretsを更新中...', 'yellow');
  
  let successCount = 0;
  
  for (const [name, value] of Object.entries(secrets)) {
    if (updateSecret(name, value)) {
      successCount++;
    }
  }
  
  const totalCount = Object.keys(secrets).length;
  const success = successCount === totalCount;
  
  if (success) {
    log('\n✅ すべてのトークンが正常に更新されました！', 'green');
    log('🎉 GitHub Actionsで@claudeメンションが使用可能です', 'cyan');
  } else {
    log(`\n⚠️  ${successCount}/${totalCount} 個のトークンが更新されました`, 'yellow');
    log('失敗したトークンは手動で更新してください', 'yellow');
  }
  
  return { success, updatedCount: successCount };
}