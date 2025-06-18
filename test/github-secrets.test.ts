import { describe, it, expect, beforeEach, vi } from 'vitest';
import { updateSecret, updateGitHubSecrets, escapeShellArg } from '../src/github-secrets.js';
import type { GitHubSecrets } from '../src/types.js';
import { TEST_CONSTANTS, createMockSecrets } from './test-constants.js';

vi.mock('child_process', () => ({
  execSync: vi.fn(),
}));

vi.mock('../src/utils.js', () => ({
  log: vi.fn(),
}));

describe('github-secrets.ts', () => {
  describe('escapeShellArg', () => {
    it('シングルクォートを正しくエスケープする', () => {
      expect(escapeShellArg("test'value")).toBe("'test'\\''value'");
    });

    it('特殊文字を含む値を安全にエスケープする', () => {
      expect(escapeShellArg('test"value')).toBe("'test\"value'");
      expect(escapeShellArg('test$value')).toBe("'test$value'");
      expect(escapeShellArg('test`value')).toBe("'test`value'");
      expect(escapeShellArg('test\\value')).toBe("'test\\value'");
    });

    it('空文字列をエスケープする', () => {
      expect(escapeShellArg('')).toBe("''");
    });

    it('複数のシングルクォートを含む値をエスケープする', () => {
      expect(escapeShellArg("it's a 'test'")).toBe("'it'\\''s a '\\''test'\\'''");
    });

    it('コマンドインジェクションの試みを防ぐ', () => {
      expect(escapeShellArg('test; rm -rf /')).toBe("'test; rm -rf /'");
      expect(escapeShellArg('test && echo hacked')).toBe("'test && echo hacked'");
      expect(escapeShellArg('test | cat /etc/passwd')).toBe("'test | cat /etc/passwd'");
    });
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('updateSecret', () => {
    const SECRET_NAME = 'TEST_SECRET';
    const SECRET_VALUE = 'test-value';

    it('シークレットを正常に更新する', async () => {
      const { execSync } = await import('child_process');
      vi.mocked(execSync).mockImplementation(() => '' as any);

      const result = updateSecret(SECRET_NAME, SECRET_VALUE);

      expect(result).toBe(true);
      expect(execSync).toHaveBeenCalledWith(
        `gh secret set ${SECRET_NAME} --body '${SECRET_VALUE}'`,
        { stdio: 'inherit' }
      );
      
      const { log } = await import('../src/utils.js');
      expect(log).toHaveBeenCalledWith(TEST_CONSTANTS.SUCCESS_MESSAGES.SECRET_UPDATED(SECRET_NAME), 'green');
    });

    it('更新失敗時にfalseを返す', async () => {
      const error = new Error('Command failed');
      const { execSync } = await import('child_process');
      vi.mocked(execSync).mockImplementation(() => {
        throw error;
      });

      const result = updateSecret(SECRET_NAME, SECRET_VALUE);

      expect(result).toBe(false);
      const { log } = await import('../src/utils.js');
      expect(log).toHaveBeenCalledWith(`✗ ${SECRET_NAME} の更新に失敗しました: Error: Command failed`, 'red');
    });

    it('特殊文字を含む値を正しくエスケープして処理する', async () => {
      const { execSync } = await import('child_process');
      vi.mocked(execSync).mockImplementation(() => '' as any);

      const valueWithQuotes = 'value-with-"quotes"';
      const result = updateSecret(SECRET_NAME, valueWithQuotes);

      expect(result).toBe(true);
      // エスケープされた値が使用されることを確認
      expect(execSync).toHaveBeenCalledWith(
        `gh secret set ${SECRET_NAME} --body 'value-with-"quotes"'`,
        { stdio: 'inherit' }
      );
    });

    it('シングルクォートを含む値を正しくエスケープして処理する', async () => {
      const { execSync } = await import('child_process');
      vi.mocked(execSync).mockImplementation(() => '' as any);

      const valueWithSingleQuote = "value with 'quote'";
      const result = updateSecret(SECRET_NAME, valueWithSingleQuote);

      expect(result).toBe(true);
      expect(execSync).toHaveBeenCalledWith(
        `gh secret set ${SECRET_NAME} --body 'value with '\\''quote'\\'''`,
        { stdio: 'inherit' }
      );
    });
  });

  describe('updateGitHubSecrets', () => {
    it('すべてのシークレットを正常に更新する', async () => {
      const { execSync } = await import('child_process');
      vi.mocked(execSync).mockImplementation(() => '' as any);

      const secrets = createMockSecrets();

      const result = await updateGitHubSecrets(secrets);

      expect(result).toEqual({ 
        success: true, 
        updatedCount: TEST_CONSTANTS.TOTAL_SECRETS 
      });
      expect(execSync).toHaveBeenCalledTimes(TEST_CONSTANTS.TOTAL_SECRETS);
      
      const { log } = await import('../src/utils.js');
      expect(log).toHaveBeenCalledWith('\n🔄 GitHub Secretsを更新中...', 'yellow');
      expect(log).toHaveBeenCalledWith(TEST_CONSTANTS.SUCCESS_MESSAGES.ALL_UPDATED, 'green');
      expect(log).toHaveBeenCalledWith(TEST_CONSTANTS.SUCCESS_MESSAGES.CLAUDE_MENTION_READY, 'cyan');
    });

    it('一部のシークレットの更新に失敗した場合', async () => {
      const { execSync } = await import('child_process');
      let callCount = 0;
      vi.mocked(execSync).mockImplementation(() => {
        callCount++;
        if (callCount === 2) {
          throw new Error('Update failed');
        }
        return '' as any;
      });

      const secrets = createMockSecrets();

      const result = await updateGitHubSecrets(secrets);

      expect(result).toEqual({ 
        success: false, 
        updatedCount: TEST_CONSTANTS.PARTIAL_SUCCESS_COUNT 
      });
      
      const { log } = await import('../src/utils.js');
      expect(log).toHaveBeenCalledWith(
        TEST_CONSTANTS.WARNING_MESSAGES.PARTIAL_UPDATE(TEST_CONSTANTS.PARTIAL_SUCCESS_COUNT, TEST_CONSTANTS.TOTAL_SECRETS), 
        'yellow'
      );
      expect(log).toHaveBeenCalledWith(TEST_CONSTANTS.WARNING_MESSAGES.MANUAL_UPDATE_REQUIRED, 'yellow');
    });

    it('空のシークレットオブジェクトを処理する', async () => {
      const secrets: GitHubSecrets = {} as GitHubSecrets;

      const result = await updateGitHubSecrets(secrets);

      expect(result).toEqual({ success: true, updatedCount: 0 });
      const { execSync } = await import('child_process');
      expect(execSync).not.toHaveBeenCalled();
    });
  });
});