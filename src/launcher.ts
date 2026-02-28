/**
 * Claude Code 启动器
 * 核心功能：启动 Claude Code 并注入环境变量
 */

import { spawn } from 'child_process';
import chalk from 'chalk';
import { ConfigManager } from './config/manager';
import { getClaudeCommand } from './utils/installer';

/**
 * 启动选项
 */
export interface LaunchOptions {
  args?: string[];              // 传递给 Claude 的参数
  skipPermissions?: boolean;    // 是否跳过权限检查
}

/**
 * Claude 启动器类
 */
export class ClaudeLauncher {
  constructor(
    private config: ConfigManager,
    private profileName?: string
  ) {}

  /**
   * 启动 Claude Code
   */
  async launch(options: LaunchOptions = {}): Promise<{ exitCode: number; hasApiError: boolean }> {
    const { args = [], skipPermissions = true } = options;

    // 如果指定了 profileName，使用指定的配置；否则使用当前配置
    const profile = this.profileName
      ? this.config.getProfile(this.profileName)
      : this.config.getCurrentProfile()?.config;

    if (!profile) {
      console.log('');
      console.log(chalk.red('✗ 未找到可用配置'));
      console.log('');
      console.log(chalk.gray('请先运行配置命令:'));
      console.log(chalk.cyan('  ccgo config'));
      console.log('');
      return { exitCode: 1, hasApiError: true };
    }

    const envEntries = Object.entries(profile).filter(([, value]) => value && value.trim() !== '');
    if (envEntries.length === 0) {
      console.log('');
      console.log(chalk.red('✗ 当前配置为空，未找到可注入的环境变量'));
      console.log('');
      console.log(chalk.gray('请编辑配置文件后重试:'));
      console.log(chalk.cyan(`  ${this.config.getConfigPath()}`));
      console.log('');
      return { exitCode: 1, hasApiError: true };
    }

    // 显示启动信息
    console.log('');
    console.log(chalk.green('✓ 正在启动 Claude Code...'));
    console.log(chalk.gray(`  已注入环境变量: ${envEntries.map(([key]) => key).join(', ')}`));
    console.log('');

    // 按配置文件中的键值对注入环境变量
    const env: NodeJS.ProcessEnv = { ...process.env };
    for (const [key, value] of envEntries) {
      env[key] = value;
    }

    // 构建 Claude 参数
    const claudeArgs = [...args];
    if (skipPermissions && !claudeArgs.includes('--dangerously-skip-permissions')) {
      claudeArgs.unshift('--dangerously-skip-permissions');
    }

    return new Promise((resolve, reject) => {
      // 启动 Claude Code（跨平台支持）
      const claudeCmd = getClaudeCommand();
      const isWindows = process.platform === 'win32';

      const claude = spawn(claudeCmd, claudeArgs, {
        stdio: 'inherit',
        env,
        shell: isWindows // Windows 需要 shell: true 以支持 .cmd 文件和 Git Bash
      });

      claude.on('error', (error) => {
        console.log('');
        console.log(chalk.red('✗ 启动 Claude Code 失败'));
        console.error(chalk.red(error.message));
        console.log('');
        reject(error);
      });

      claude.on('exit', (code) => {
        const exitCode = code || 0;
        const hasApiError = exitCode === 1;

        // 如果检测到可能的 API 错误，显示友好提示
        if (hasApiError) {
          console.log('\n' + chalk.yellow('─'.repeat(70)));
          console.log(chalk.yellow.bold('💡 提示：') + chalk.white('如果遇到 API 认证问题，可以运行以下命令重新配置：'));
          console.log(chalk.green.bold('   ccgo config'));
          console.log(chalk.yellow('─'.repeat(70) + '\n'));
        }

        resolve({ exitCode, hasApiError });
      });
    });
  }
}
