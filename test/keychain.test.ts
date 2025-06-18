import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getCredentialsFromKeychain, convertToGitHubSecrets, displayCredentialsInfo } from '../src/keychain.js';
import type { KeychainCredentials } from '../src/types.js';
import { TEST_CONSTANTS, createMockCredentials, TOKEN_TRUNCATE_LENGTH } from './test-constants.js';

// child_processとutilsをモック
vi.mock('child_process', () => ({
  execSync: vi.fn(),
}));

vi.mock('../src/utils.js', () => ({
  isMacOS: vi.fn(),
  log: vi.fn(),
}));

describe('keychain.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCredentialsFromKeychain', () => {
    const mockCredentials = createMockCredentials();

    it('macOS以外のプラットフォームでエラーを投げる', async () => {
      const { isMacOS } = await import('../src/utils.js');
      vi.mocked(isMacOS).mockReturnValue(false);

      expect(() => getCredentialsFromKeychain()).toThrow(TEST_CONSTANTS.ERROR_MESSAGES.MACOS_ONLY);
    });

    it('キーチェーンから認証情報を正常に取得する', async () => {
      const { execSync } = await import('child_process');
      const { isMacOS } = await import('../src/utils.js');
      
      vi.mocked(isMacOS).mockReturnValue(true);
      vi.mocked(execSync).mockReturnValue(JSON.stringify(mockCredentials));

      const result = getCredentialsFromKeychain();

      expect(result).toEqual(mockCredentials);
      expect(execSync).toHaveBeenCalledWith(
        TEST_CONSTANTS.KEYCHAIN_COMMAND,
        { encoding: 'utf-8' }
      );
    });

    it('認証情報が見つからない場合にエラーを投げる', async () => {
      const { execSync } = await import('child_process');
      const { isMacOS } = await import('../src/utils.js');
      
      vi.mocked(isMacOS).mockReturnValue(true);
      vi.mocked(execSync).mockReturnValue('Not found');

      expect(() => getCredentialsFromKeychain()).toThrow(TEST_CONSTANTS.ERROR_MESSAGES.KEYCHAIN_NOT_FOUND);
    });

    it('空の結果の場合にエラーを投げる', async () => {
      const { execSync } = await import('child_process');
      const { isMacOS } = await import('../src/utils.js');
      
      vi.mocked(isMacOS).mockReturnValue(true);
      vi.mocked(execSync).mockReturnValue('');

      expect(() => getCredentialsFromKeychain()).toThrow(TEST_CONSTANTS.ERROR_MESSAGES.KEYCHAIN_NOT_FOUND);
    });

    it('securityコマンドが見つからない場合に適切なエラーを投げる', async () => {
      const { execSync } = await import('child_process');
      const { isMacOS } = await import('../src/utils.js');
      
      vi.mocked(isMacOS).mockReturnValue(true);
      const error = new Error('ENOENT: no such file or directory');
      vi.mocked(execSync).mockImplementation(() => {
        throw error;
      });

      expect(() => getCredentialsFromKeychain()).toThrow(TEST_CONSTANTS.ERROR_MESSAGES.SECURITY_COMMAND_NOT_FOUND);
    });

    it('その他のエラーを適切に処理する', async () => {
      const { execSync } = await import('child_process');
      const { isMacOS } = await import('../src/utils.js');
      
      vi.mocked(isMacOS).mockReturnValue(true);
      const error = new Error('Some other error');
      vi.mocked(execSync).mockImplementation(() => {
        throw error;
      });

      expect(() => getCredentialsFromKeychain()).toThrow('キーチェーンアクセスエラー: Some other error');
    });
  });

  describe('convertToGitHubSecrets', () => {
    it('認証情報をGitHub Secrets形式に変換する', () => {
      const credentials = createMockCredentials();

      const result = convertToGitHubSecrets(credentials);

      expect(result).toEqual({
        CLAUDE_ACCESS_TOKEN: TEST_CONSTANTS.ACCESS_TOKEN,
        CLAUDE_REFRESH_TOKEN: TEST_CONSTANTS.REFRESH_TOKEN,
        CLAUDE_EXPIRES_AT: TEST_CONSTANTS.MOCK_DATE_ISO,
      });
    });

    it('認証情報がない場合にエラーを投げる', () => {
      const credentials = {} as KeychainCredentials;

      expect(() => convertToGitHubSecrets(credentials)).toThrow(TEST_CONSTANTS.ERROR_MESSAGES.INVALID_CREDENTIALS_FORMAT);
    });
  });

  describe('displayCredentialsInfo', () => {
    it('認証情報を正しく表示する', async () => {
      const { log } = await import('../src/utils.js');
      const credentials = createMockCredentials({
        accessToken: TEST_CONSTANTS.LONG_ACCESS_TOKEN,
        refreshToken: TEST_CONSTANTS.LONG_REFRESH_TOKEN,
      });

      displayCredentialsInfo(credentials);

      expect(log).toHaveBeenCalledWith('\n📋 取得したトークン情報:', 'cyan');
      expect(log).toHaveBeenCalledWith('- Access Token: very-long-access-tok...', 'blue');
      expect(log).toHaveBeenCalledWith('- Refresh Token: very-long-refresh-to...', 'blue');
      expect(log).toHaveBeenCalledWith(`- Expires At: ${TEST_CONSTANTS.MOCK_DATE_ISO}`, 'blue');
      expect(log).toHaveBeenCalledWith('- Subscription: pro', 'blue');
    });

    it('subscriptionTypeがない場合でも正常に表示する', async () => {
      const { log } = await import('../src/utils.js');
      const credentials = createMockCredentials({
        accessToken: 'token1',
        refreshToken: 'token2',
        subscriptionType: undefined,
      });
      delete credentials.claudeAiOauth.subscriptionType;

      displayCredentialsInfo(credentials);

      expect(log).toHaveBeenCalledTimes(4); // subscriptionTypeの行がない
    });
  });
});