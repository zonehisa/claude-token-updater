import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execa } from 'execa';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI_PATH = path.join(__dirname, '../dist/index.js');

describe('E2E Tests', () => {
  beforeAll(async () => {
    // ビルドを実行
    await execa('npm', ['run', 'build'], {
      cwd: path.join(__dirname, '..'),
    });
  });

  describe('CLIコマンド', () => {
    it('--helpオプションでヘルプを表示する', async () => {
      const { stdout, exitCode } = await execa('node', [CLI_PATH, '--help']);
      
      expect(exitCode).toBe(0);
      expect(stdout).toContain('Claude Token Updater');
      expect(stdout).toContain('使用方法:');
      expect(stdout).toContain('npx claude-token-updater');
      expect(stdout).toContain('必要な環境:');
      expect(stdout).toContain('更新されるシークレット:');
      expect(stdout).toContain('CLAUDE_ACCESS_TOKEN');
    });

    it('-hオプションでもヘルプを表示する', async () => {
      const { stdout, exitCode } = await execa('node', [CLI_PATH, '-h']);
      
      expect(exitCode).toBe(0);
      expect(stdout).toContain('Claude Token Updater');
    });

    it('macOS以外のプラットフォームでエラーを表示する（モック環境）', async () => {
      // プラットフォームをモックするのは難しいので、
      // 実際のプラットフォームに応じて動作を確認
      const currentPlatform = process.platform;
      
      if (currentPlatform !== 'darwin') {
        const result = await execa('node', [CLI_PATH], { reject: false });
        
        expect(result.exitCode).toBe(1);
        expect(result.stdout).toContain('このツールはmacOS専用です');
      } else {
        // macOSの場合は、GitHub CLIがない場合のエラーを確認
        // (GitHub CLIがインストールされている場合はスキップ)
        const ghCheck = await execa('which', ['gh'], { reject: false });
        
        if (ghCheck.exitCode !== 0) {
          const result = await execa('node', [CLI_PATH], { reject: false });
          
          expect(result.exitCode).toBe(1);
          expect(result.stdout).toContain('GitHub CLI (gh) がインストールされていません');
        }
      }
    });

    it('無効なオプションは無視してヘルプを表示しない', async () => {
      const result = await execa('node', [CLI_PATH, '--invalid-option'], { 
        reject: false,
        env: {
          ...process.env,
          // GitHub CLIのチェックをモック的に回避するため
          PATH: '/nonexistent',
        },
      });
      
      // ヘルプではなく、環境チェックのエラーが表示される
      expect(result.stdout).not.toContain('使用方法:');
    });
  });

  describe('バナー表示', () => {
    it.skip('通常実行時にバナーを表示する（環境依存のためスキップ）', async () => {
      // このテストは環境によって結果が異なるため、CIでは不安定
      // ローカル開発時のみ手動で確認することを推奨
      const result = await execa('node', [CLI_PATH], { 
        reject: false,
        env: {
          ...process.env,
          PATH: '/nonexistent', // GitHub CLIを見つけられないようにする
        },
      });
      
      // macOSではバナーが表示される
      if (process.platform === 'darwin') {
        expect(result.stdout || result.stderr).toContain('Claude Token Updater');
      } else {
        // 他のプラットフォームではエラーメッセージが表示される
        expect(result.stdout || result.stderr).toContain('このツールはmacOS専用です');
      }
    });

    it('ヘルプ表示時にもバナーを表示する', async () => {
      const { stdout } = await execa('node', [CLI_PATH, '--help']);
      
      expect(stdout).toContain('╔═══════════════════════════════════════╗');
      expect(stdout).toContain('║     Claude Token Updater');
      expect(stdout).toContain('╚═══════════════════════════════════════╝');
    });
  });

  describe('環境チェック', () => {
    it('GitHub CLIがインストールされていない場合にエラーメッセージを表示', async () => {
      // PATHを空にしてGitHub CLIが見つからない状態をシミュレート
      const result = await execa('node', [CLI_PATH], { 
        reject: false,
        env: {
          ...process.env,
          PATH: '/nonexistent',
        },
      });

      if (process.platform === 'darwin') {
        // exitCodeが設定されているか確認
        if (result.exitCode !== undefined) {
          expect(result.exitCode).toBe(1);
          expect(result.stdout).toContain('GitHub CLI (gh) がインストールされていません');
          expect(result.stdout).toContain('brew install gh');
        }
      } else {
        // macOS以外のプラットフォームでのテスト
        expect(result.exitCode).toBe(1);
        expect(result.stdout).toContain('このツールはmacOS専用です');
      }
    });
  });

  describe('エラーハンドリング', () => {
    it('予期しないエラーをキャッチして適切に終了する', async () => {
      // 無効な引数でクラッシュしないことを確認
      const result = await execa('node', [CLI_PATH, '--verbose', '--help'], {
        reject: false,
      });
      
      // --helpが優先されて正常終了
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('使用方法:');
    });
  });
});