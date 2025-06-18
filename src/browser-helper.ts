import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { log, isMacOS } from './utils.js';

/**
 * ブラウザで実行するスクリプト
 */
const browserScript = `
// Claude Codeのトークンを取得するスクリプト
(function() {
  console.log('🔍 Claude Codeのトークンを検索中...');
  
  // LocalStorageから取得を試みる
  const storage = window.localStorage;
  const keys = Object.keys(storage);
  
  // 可能性のあるキーを探す
  const tokenKeys = keys.filter(key => 
    key.includes('token') || 
    key.includes('auth') || 
    key.includes('claude') ||
    key.includes('oauth')
  );
  
  if (tokenKeys.length > 0) {
    console.log('📦 見つかったキー:', tokenKeys);
    
    const tokens = {};
    tokenKeys.forEach(key => {
      try {
        const value = storage.getItem(key);
        const parsed = JSON.parse(value);
        if (parsed.accessToken || parsed.refreshToken || parsed.claudeAiOauth) {
          tokens[key] = parsed;
        }
      } catch (e) {
        // JSON解析エラーは無視
      }
    });
    
    if (Object.keys(tokens).length > 0) {
      console.log('✅ トークン情報が見つかりました！');
      console.log('📋 以下のJSONをコピーしてください:');
      console.log(JSON.stringify(tokens, null, 2));
      
      // クリップボードにコピー
      try {
        const tokenData = tokens[Object.keys(tokens)[0]];
        navigator.clipboard.writeText(JSON.stringify(tokenData, null, 2));
        console.log('✨ クリップボードにコピーしました！');
      } catch (e) {
        console.log('⚠️  クリップボードへのコピーに失敗しました。手動でコピーしてください。');
      }
      
      return tokens;
    }
  }
  
  console.log('❌ トークンが見つかりませんでした。');
  console.log('💡 ヒント: Claude Codeにログインしていることを確認してください。');
  
  return null;
})();
`;

/**
 * ブラウザヘルパーを表示
 */
export function showBrowserHelper(): void {
  log('\n📋 手順:', 'cyan');
  log('1. ブラウザでClaude Code (https://claude.ai/code) を開く', 'yellow');
  log('2. ログインしていることを確認', 'yellow');
  log('3. 開発者ツールを開く:', 'yellow');
  log('   - Chrome/Edge: F12 または Cmd+Option+I (Mac) / Ctrl+Shift+I (Windows)', 'yellow');
  log('   - Firefox: F12 または Cmd+Option+I (Mac) / Ctrl+Shift+I (Windows)', 'yellow');
  log('4. コンソールタブを選択', 'yellow');
  log('5. 以下のスクリプトをコンソールに貼り付けて実行:\n', 'yellow');
  
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  console.log(browserScript);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  
  log('\n6. 表示されたJSONがクリップボードにコピーされます', 'yellow');
  log('7. npx claude-token-updater --manual を実行してJSONを貼り付ける', 'yellow');
  
  // スクリプトをファイルに保存
  const scriptPath = join(tmpdir(), 'get-claude-tokens.js');
  writeFileSync(scriptPath, browserScript);
  log(`\n💾 スクリプトを保存しました: ${scriptPath}`, 'green');
  
  // クリップボードにコピー（macOSの場合）
  if (isMacOS()) {
    try {
      execSync(`echo '${browserScript.replace(/'/g, "'\\''")}' | pbcopy`);
      log('✨ スクリプトをクリップボードにコピーしました！', 'green');
      log('   ブラウザのコンソールに貼り付けて実行してください', 'green');
    } catch (e) {
      // エラーは無視
    }
  }
}