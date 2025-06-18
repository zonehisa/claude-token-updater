import { describe, it, expect, beforeEach, vi } from 'vitest';
import { showHelp, parseOptions } from '../src/cli.js';
import { BANNER_VERSION } from './test-constants.js';

vi.mock('../src/utils.js', () => ({
  log: vi.fn(),
  showBanner: vi.fn(),
}));

describe('cli.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('parseOptions', () => {
    it('引数なしの場合、空のオプションを返す', () => {
      const options = parseOptions([]);
      expect(options).toEqual({});
    });

    it('--helpフラグを正しく解析する', () => {
      const options = parseOptions(['--help']);
      expect(options).toEqual({ help: true });
    });

    it('-hフラグを正しく解析する', () => {
      const options = parseOptions(['-h']);
      expect(options).toEqual({ help: true });
    });

    it('--verboseフラグを正しく解析する', () => {
      const options = parseOptions(['--verbose']);
      expect(options).toEqual({ verbose: true });
    });

    it('-vフラグを正しく解析する', () => {
      const options = parseOptions(['-v']);
      expect(options).toEqual({ verbose: true });
    });

    it('複数のフラグを正しく解析する', () => {
      const options = parseOptions(['--help', '--verbose']);
      expect(options).toEqual({ help: true, verbose: true });
    });

    it('無効なフラグは無視する', () => {
      const options = parseOptions(['--invalid', '--help', '--unknown']);
      expect(options).toEqual({ help: true });
    });

    it('引数の順序に関係なく正しく解析する', () => {
      const options1 = parseOptions(['--verbose', '--help']);
      const options2 = parseOptions(['--help', '--verbose']);
      expect(options1).toEqual(options2);
    });
  });

  describe('showHelp', () => {
    it('ヘルプメッセージを正しく表示する', async () => {
      const { log, showBanner } = await import('../src/utils.js');
      
      showHelp();

      expect(showBanner).toHaveBeenCalledTimes(1);
      
      // ヘルプの各セクションが表示されることを確認
      expect(log).toHaveBeenCalledWith('使用方法:', 'yellow');
      expect(log).toHaveBeenCalledWith('  npx claude-token-updater      # キーチェーンから自動更新');
      expect(log).toHaveBeenCalledWith('  npx claude-token-updater -h   # このヘルプを表示\n');
      
      expect(log).toHaveBeenCalledWith('説明:', 'yellow');
      expect(log).toHaveBeenCalledWith('  macOSのキーチェーンからClaude Codeの認証情報を取得し、');
      
      expect(log).toHaveBeenCalledWith('必要な環境:', 'yellow');
      expect(log).toHaveBeenCalledWith('  • macOS');
      expect(log).toHaveBeenCalledWith('  • GitHub CLI (gh)');
      
      expect(log).toHaveBeenCalledWith('更新されるシークレット:', 'yellow');
      expect(log).toHaveBeenCalledWith('  • CLAUDE_ACCESS_TOKEN');
      expect(log).toHaveBeenCalledWith('  • CLAUDE_REFRESH_TOKEN');
      expect(log).toHaveBeenCalledWith('  • CLAUDE_EXPIRES_AT\n');
      
      expect(log).toHaveBeenCalledWith('詳細:', 'yellow');
      expect(log).toHaveBeenCalledWith('  https://github.com/zonehisa/claude-token-updater\n', 'cyan');
    });

    it('すべての必要な情報が含まれていることを確認', async () => {
      const { log } = await import('../src/utils.js');
      
      showHelp();

      // 重要な情報が含まれていることを確認
      const allCalls = vi.mocked(log).mock.calls;
      const allText = allCalls.map(call => call[0]).join(' ');
      
      // 必須要素の確認
      expect(allText).toContain('npx claude-token-updater');
      expect(allText).toContain('macOS');
      expect(allText).toContain('GitHub CLI');
      expect(allText).toContain('CLAUDE_ACCESS_TOKEN');
      expect(allText).toContain('CLAUDE_REFRESH_TOKEN');
      expect(allText).toContain('CLAUDE_EXPIRES_AT');
    });
  });
});