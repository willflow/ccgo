/**
 * 安装检查工具
 * 检查 Claude Code 是否已安装
 */

import { execSync } from 'child_process';
import chalk from 'chalk';

/**
 * 获取 Claude 命令名称（跨平台）
 * @returns Claude 命令名称
 */
export function getClaudeCommand(): string {
  const isWindows = process.platform === 'win32';
  return isWindows ? 'claude.cmd' : 'claude';
}

/**
 * 检查 Claude Code 是否已安装
 * @returns 是否已安装
 */
export function checkClaudeInstallation(): boolean {
  try {
    const isWindows = process.platform === 'win32';
    const checkCommand = isWindows ? 'where claude' : 'which claude';

    execSync(checkCommand, {
      stdio: 'pipe',
      encoding: 'utf8'
    });
    return true;
  } catch {
    console.log('');
    console.log(chalk.red('✗ 未找到 Claude Code'));
    console.log('');
    console.log(chalk.white('请先安装 Claude Code:'));
    console.log(chalk.cyan('  npm install -g @anthropic-ai/claude-code'));
    console.log('');
    console.log(chalk.gray('或访问官方文档:'));
    console.log(chalk.gray('  https://docs.claude.com/code'));
    console.log('');
    return false;
  }
}

/**
 * 获取 Claude Code 版本
 * @returns 版本号或 undefined
 */
export function getClaudeVersion(): string | undefined {
  try {
    const claudeCmd = getClaudeCommand();
    const output = execSync(`${claudeCmd} --version`, {
      stdio: 'pipe',
      encoding: 'utf8'
    });
    return output.trim();
  } catch {
    return undefined;
  }
}
