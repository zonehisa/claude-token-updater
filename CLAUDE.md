# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a macOS-specific CLI tool that retrieves Claude Code OAuth credentials from the macOS Keychain and updates GitHub Actions secrets automatically. The tool is published as an npm package and can be run with `npx ctup`.

## Key Commands

### Development
- `npm run build` - Compile TypeScript to JavaScript and set executable permissions
- `npm run dev` - Run TypeScript compiler in watch mode
- `npm start` - Run the compiled tool locally
- `npm run clean` - Remove dist directory

### Publishing
- `npm publish` - Publish to npm (automatically runs build via prepublishOnly)
- Binary command: `ctup` (users run with `npx ctup`)

### Testing Locally
```bash
npm link  # Create global symlink
ctup --help  # Test the command
```

## Architecture

The codebase follows a modular TypeScript architecture:

- **Entry Point**: `src/index.ts` - CLI argument parsing and main workflow
- **Core Logic**: `src/auto-update.ts` - Orchestrates the token update process
- **Platform Integration**:
  - `src/keychain.ts` - macOS Keychain access via `security` command
  - `src/github-secrets.ts` - GitHub CLI integration for secrets management
- **Utilities**: `src/utils.ts` - Logging, banners, and platform checks
- **Types**: `src/types.ts` - TypeScript interfaces and type definitions

## Important Constraints

1. **macOS Only**: Uses native `security` command for Keychain access
2. **No Runtime Dependencies**: Uses only Node.js built-ins
3. **ES Modules**: Configured as `"type": "module"` 
4. **GitHub CLI Required**: Uses `gh` command for GitHub operations

## Critical Implementation Details

- Keychain item name: `"Claude Code-credentials"`
- GitHub secrets created: `CLAUDE_ACCESS_TOKEN`, `CLAUDE_REFRESH_TOKEN`, `CLAUDE_EXPIRES_AT`
- Requires user confirmation before updating secrets
- Executable permissions must be set on `dist/index.js` during build

## Common Issues

1. **Permission Denied with npx**: Ensure build script includes `chmod +x dist/index.js`
2. **Platform Check**: Tool exits early if not on macOS
3. **GitHub CLI Auth**: Must run `gh auth login` before using the tool