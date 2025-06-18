import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  log,
  showBanner,
  isMacOS,
  checkGitHubCLI,
  checkGitHubAuth,
  executeCommand,
  formatError,
} from '../src/utils.js';
import { TEST_CONSTANTS, BANNER_VERSION } from './test-constants.js';

vi.mock('child_process', () => ({
  execSync: vi.fn(),
}));

describe('utils.ts', () => {
  const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

  beforeEach(() => {
    vi.clearAllMocks();
    consoleSpy.mockClear();
  });
  
  afterEach(() => {
    vi.clearAllMocks();
    consoleSpy.mockClear();
  });

  describe('log', () => {
    it('デフォルトカラーでメッセージを出力する', () => {
      log('test message');
      expect(consoleSpy).toHaveBeenCalledWith(`${TEST_CONSTANTS.ANSI_COLORS.reset}test message${TEST_CONSTANTS.ANSI_COLORS.reset}`);
    });

    it('指定した色でメッセージを出力する', () => {
      log('green message', 'green');
      expect(consoleSpy).toHaveBeenCalledWith(`${TEST_CONSTANTS.ANSI_COLORS.green}green message${TEST_CONSTANTS.ANSI_COLORS.reset}`);

      log('red message', 'red');
      expect(consoleSpy).toHaveBeenCalledWith(`${TEST_CONSTANTS.ANSI_COLORS.red}red message${TEST_CONSTANTS.ANSI_COLORS.reset}`);

      log('yellow message', 'yellow');
      expect(consoleSpy).toHaveBeenCalledWith(`${TEST_CONSTANTS.ANSI_COLORS.yellow}yellow message${TEST_CONSTANTS.ANSI_COLORS.reset}`);

      log('blue message', 'blue');
      expect(consoleSpy).toHaveBeenCalledWith(`${TEST_CONSTANTS.ANSI_COLORS.blue}blue message${TEST_CONSTANTS.ANSI_COLORS.reset}`);

      log('cyan message', 'cyan');
      expect(consoleSpy).toHaveBeenCalledWith(`${TEST_CONSTANTS.ANSI_COLORS.cyan}cyan message${TEST_CONSTANTS.ANSI_COLORS.reset}`);

      log('magenta message', 'magenta');
      expect(consoleSpy).toHaveBeenCalledWith(`${TEST_CONSTANTS.ANSI_COLORS.magenta}magenta message${TEST_CONSTANTS.ANSI_COLORS.reset}`);
    });
  });

  describe('showBanner', () => {
    it('バナーを正しく表示する', () => {
      showBanner();

      expect(consoleSpy).toHaveBeenCalledTimes(4);
      
      // より柔軟なアサーション：重要な要素が含まれていることを確認
      const calls = consoleSpy.mock.calls.map(call => call[0]);
      
      // バナーの枠線
      expect(calls[0]).toMatch(/╔═+╗/);
      expect(calls[3]).toMatch(/╚═+╝/);
      
      // タイトルとバージョン
      expect(calls[1]).toContain('Claude Token Updater');
      expect(calls[1]).toContain(BANNER_VERSION);
      
      // サブタイトル
      expect(calls[2]).toContain('Update GitHub Secrets for Claude Code');
      
      // 色付きであることを確認（ANSIコードの存在）
      calls.forEach(call => {
        expect(call).toMatch(/\x1b\[\d+m/); // ANSIカラーコードのパターン
      });
    });
  });

  describe('isMacOS', () => {
    const originalPlatform = process.platform;

    afterEach(() => {
      Object.defineProperty(process, 'platform', {
        value: originalPlatform,
      });
    });

    it('macOSの場合にtrueを返す', () => {
      Object.defineProperty(process, 'platform', {
        value: 'darwin',
      });

      expect(isMacOS()).toBe(true);
    });

    it('macOS以外の場合にfalseを返す', () => {
      Object.defineProperty(process, 'platform', {
        value: 'linux',
      });

      expect(isMacOS()).toBe(false);

      Object.defineProperty(process, 'platform', {
        value: 'win32',
      });

      expect(isMacOS()).toBe(false);
    });
  });

  describe('checkGitHubCLI', () => {
    it('GitHub CLIがインストールされている場合にtrueを返す', async () => {
      const { execSync } = await import('child_process');
      vi.mocked(execSync).mockReturnValue('gh version 2.0.0' as any);

      expect(checkGitHubCLI()).toBe(true);
      expect(execSync).toHaveBeenCalledWith(TEST_CONSTANTS.GH_VERSION_COMMAND, { stdio: 'ignore' });
    });

    it('GitHub CLIがインストールされていない場合にfalseを返す', async () => {
      const { execSync } = await import('child_process');
      vi.mocked(execSync).mockImplementation(() => {
        throw new Error('Command not found');
      });

      expect(checkGitHubCLI()).toBe(false);
    });
  });

  describe('checkGitHubAuth', () => {
    it('GitHub CLIが認証済みの場合にtrueを返す', async () => {
      const { execSync } = await import('child_process');
      vi.mocked(execSync).mockReturnValue('Logged in' as any);

      expect(checkGitHubAuth()).toBe(true);
      expect(execSync).toHaveBeenCalledWith(TEST_CONSTANTS.GH_AUTH_COMMAND, { stdio: 'ignore' });
    });

    it('GitHub CLIが未認証の場合にfalseを返す', async () => {
      const { execSync } = await import('child_process');
      vi.mocked(execSync).mockImplementation(() => {
        throw new Error('Not authenticated');
      });

      expect(checkGitHubAuth()).toBe(false);
    });
  });

  describe('executeCommand', () => {
    const TEST_COMMAND = 'test command';
    const COMMAND_OUTPUT = 'command output';
    const SILENT_OUTPUT = 'silent output';

    it('コマンドを正常に実行する', async () => {
      const { execSync } = await import('child_process');
      vi.mocked(execSync).mockReturnValue(COMMAND_OUTPUT);

      const result = executeCommand(TEST_COMMAND);

      expect(result).toEqual({
        success: true,
        message: COMMAND_OUTPUT,
      });
      expect(execSync).toHaveBeenCalledWith(TEST_COMMAND, {
        encoding: 'utf-8',
        stdio: 'inherit',
      });
    });

    it('silentオプションでコマンドを実行する', async () => {
      const { execSync } = await import('child_process');
      vi.mocked(execSync).mockReturnValue(SILENT_OUTPUT);

      const result = executeCommand(TEST_COMMAND, { silent: true });

      expect(result).toEqual({
        success: true,
        message: SILENT_OUTPUT,
      });
      expect(execSync).toHaveBeenCalledWith(TEST_COMMAND, {
        encoding: 'utf-8',
        stdio: 'pipe',
      });
    });

    it('コマンド実行失敗時にエラーを返す', async () => {
      const error = new Error('Command failed');
      const { execSync } = await import('child_process');
      vi.mocked(execSync).mockImplementation(() => {
        throw error;
      });

      const result = executeCommand('failing command');

      expect(result).toEqual({
        success: false,
        error: error,
      });
    });
  });

  describe('formatError', () => {
    it('Errorオブジェクトのメッセージを返す', () => {
      const error = new Error('Test error message');
      expect(formatError(error)).toBe('Test error message');
    });

    it('非Errorオブジェクトを文字列に変換する', () => {
      expect(formatError('string error')).toBe('string error');
      expect(formatError(123)).toBe('123');
      expect(formatError({ message: 'object error' })).toBe('[object Object]');
      expect(formatError(null)).toBe('null');
      expect(formatError(undefined)).toBe('undefined');
    });
  });
});