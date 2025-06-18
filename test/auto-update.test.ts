import { describe, it, expect, beforeEach, vi } from 'vitest';
import { runAutoUpdate } from '../src/auto-update.js';
import type { KeychainCredentials, GitHubSecrets } from '../src/types.js';
import { TEST_CONSTANTS, createMockCredentials, createMockSecrets } from './test-constants.js';

vi.mock('readline', () => ({
  createInterface: vi.fn(),
}));

vi.mock('../src/keychain.js', () => ({
  getCredentialsFromKeychain: vi.fn(),
  convertToGitHubSecrets: vi.fn(),
  displayCredentialsInfo: vi.fn(),
}));

vi.mock('../src/github-secrets.js', () => ({
  updateGitHubSecrets: vi.fn(),
}));

vi.mock('../src/utils.js', () => ({
  log: vi.fn(),
}));

describe('auto-update.ts', () => {
  const mockCredentials = createMockCredentials();
  const mockSecrets = createMockSecrets();

  let mockReadline: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockReadline = {
      question: vi.fn(),
      close: vi.fn(),
    };
  });

  describe('runAutoUpdate', () => {
    // 共通のモックセットアップを行うヘルパー関数
    async function setupMocks(options: {
      userAnswer?: string;
      updateSuccess?: boolean;
      updateCount?: number;
      throwError?: Error;
    } = {}) {
      const { createInterface } = await import('readline');
      vi.mocked(createInterface).mockReturnValue(mockReadline as any);

      const { getCredentialsFromKeychain, convertToGitHubSecrets, displayCredentialsInfo } = await import('../src/keychain.js');
      
      if (options.throwError) {
        vi.mocked(getCredentialsFromKeychain).mockImplementation(() => {
          throw options.throwError;
        });
      } else {
        vi.mocked(getCredentialsFromKeychain).mockReturnValue(mockCredentials);
        vi.mocked(convertToGitHubSecrets).mockReturnValue(mockSecrets);
      }

      const { updateGitHubSecrets } = await import('../src/github-secrets.js');
      vi.mocked(updateGitHubSecrets).mockResolvedValue({ 
        success: options.updateSuccess ?? true, 
        updatedCount: options.updateCount ?? TEST_CONSTANTS.TOTAL_SECRETS 
      });

      if (options.userAnswer !== undefined) {
        mockReadline.question.mockImplementation((_question: string, callback: (answer: string) => void) => {
          callback(options.userAnswer);
        });
      }

      return { getCredentialsFromKeychain, convertToGitHubSecrets, displayCredentialsInfo, updateGitHubSecrets };
    }

    it('ユーザーが確認した場合、正常に更新する', async () => {
      const { getCredentialsFromKeychain, displayCredentialsInfo, convertToGitHubSecrets, updateGitHubSecrets } = 
        await setupMocks({ userAnswer: 'y' });

      await runAutoUpdate();

      expect(getCredentialsFromKeychain).toHaveBeenCalled();
      expect(displayCredentialsInfo).toHaveBeenCalledWith(mockCredentials);
      expect(convertToGitHubSecrets).toHaveBeenCalledWith(mockCredentials);
      expect(updateGitHubSecrets).toHaveBeenCalledWith(mockSecrets);
      
      const { log } = await import('../src/utils.js');
      expect(log).toHaveBeenCalledWith(TEST_CONSTANTS.SUCCESS_MESSAGES.KEYCHAIN_SUCCESS, 'green');
    });

    it('ユーザーが "yes" と入力した場合も確認として扱う', async () => {
      const { updateGitHubSecrets } = await setupMocks({ userAnswer: 'yes' });

      await runAutoUpdate();

      expect(updateGitHubSecrets).toHaveBeenCalled();
    });

    it('ユーザーがキャンセルした場合、更新しない', async () => {
      const { updateGitHubSecrets } = await setupMocks({ userAnswer: 'n' });

      await runAutoUpdate();

      expect(updateGitHubSecrets).not.toHaveBeenCalled();
      
      const { log } = await import('../src/utils.js');
      expect(log).toHaveBeenCalledWith(TEST_CONSTANTS.WARNING_MESSAGES.CANCELLED, 'yellow');
    });

    it('一部の更新が失敗した場合にエラーを投げる', async () => {
      await setupMocks({ 
        userAnswer: 'y', 
        updateSuccess: false, 
        updateCount: TEST_CONSTANTS.PARTIAL_SUCCESS_COUNT 
      });

      await expect(runAutoUpdate()).rejects.toThrow(TEST_CONSTANTS.ERROR_MESSAGES.PARTIAL_UPDATE_FAILED);
    });

    it('キーチェーンエラーの場合に適切なヒントを表示する', async () => {
      const keychainError = new Error('キーチェーンアクセスエラー');
      await setupMocks({ throwError: keychainError });

      await expect(runAutoUpdate()).rejects.toThrow(keychainError);

      const { log } = await import('../src/utils.js');
      expect(log).toHaveBeenCalledWith('\n✗ エラー: Error: キーチェーンアクセスエラー', 'red');
      expect(log).toHaveBeenCalledWith('\n💡 ヒント:', 'yellow');
      expect(log).toHaveBeenCalledWith('1. Claude Codeにログインしていることを確認', 'yellow');
      expect(log).toHaveBeenCalledWith('2. キーチェーンアクセスでパスワードの要求が表示された場合は許可', 'yellow');
      expect(log).toHaveBeenCalledWith('3. それでも失敗する場合は手動更新スクリプトを使用:', 'yellow');
      expect(log).toHaveBeenCalledWith('   npx claude-token-updater --manual', 'cyan');
    });

    it('その他のエラーの場合にエラーメッセージのみ表示する', async () => {
      const otherError = new Error('その他のエラー');
      await setupMocks({ throwError: otherError });

      await expect(runAutoUpdate()).rejects.toThrow(otherError);

      const { log } = await import('../src/utils.js');
      expect(log).toHaveBeenCalledWith('\n✗ エラー: Error: その他のエラー', 'red');
      // ヒントは表示されない
      expect(log).not.toHaveBeenCalledWith('\n💡 ヒント:', 'yellow');
    });
  });
});