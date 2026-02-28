#!/usr/bin/env node

/**
 * CLI 主入口
 * CCGO - Claude Code Go 启动器
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import chalk from 'chalk';
import { ConfigManager } from './config/manager';
import { ClaudeLauncher } from './launcher';
import {
  selectProfile,
  showHelp
} from './utils/prompts';
import { checkClaudeInstallation } from './utils/installer';

// 读取 package.json 获取版本号
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

// 解析命令行参数
const args = process.argv.slice(2);
const command = args[0];

/**
 * 主函数
 */
async function main(): Promise<void> {
  try {
    // ========== 版本和帮助 ==========
    if (args.includes('-v') || args.includes('--version')) {
      console.log('CCGO v' + packageJson.version);
      return;
    }

    if (command === 'help' || command === '--help' || command === '-h') {
      showHelp();
      return;
    }

    // ========== 初始化命令 ==========
    if (command === 'init') {
      initializeClaudeOnboardingConfig();
      return;
    }

    // ========== 配置命令 ==========
    if (command === 'config') {
      await handleConfigCommand(args.slice(1));
      return;
    }

    // ========== 默认：启动器模式 ==========
    await runAsLauncher(args);

  } catch (error: any) {
    console.log('');
    console.log(chalk.red('✗ 程序执行失败: ' + error.message));
    console.log('');
    if (process.env.DEBUG) {
      console.error(error);
    }
    process.exit(1);
  }
}

/**
 * 初始化 Claude Code onboarding 配置
 */
function initializeClaudeOnboardingConfig(): void {
  const homeDir = os.homedir();
  const filePath = path.join(homeDir, '.claude.json');
  let nextContent: Record<string, unknown> = { hasCompletedOnboarding: true };

  if (fs.existsSync(filePath)) {
    const rawContent = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(rawContent);

    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      nextContent = {
        ...(parsed as Record<string, unknown>),
        hasCompletedOnboarding: true
      };
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(nextContent, null, 2), 'utf-8');

  console.log('');
  console.log(chalk.green('✓ Claude Code 初始化配置已完成'));
  console.log(chalk.gray(`配置文件: ${filePath}`));
  console.log('');
}

/**
 * 处理 config 命令
 */
async function handleConfigCommand(subArgs: string[]): Promise<void> {
  const config = new ConfigManager();
  const configPath = config.getConfigPath();

  if (subArgs.length > 0) {
    console.log('');
    console.log(chalk.yellow('⚠ config 子命令已精简，不再支持额外参数'));
    console.log('');
  }

  // 默认：展示配置文件方案（不再逐项交互输入）
  console.log('');
  console.log(chalk.cyan.bold('🔧 配置说明'));
  console.log(chalk.gray('请直接编辑配置文件，按 profile 维护环境变量键值对。'));
  console.log('');
  console.log(chalk.white('配置文件:'));
  console.log(chalk.cyan(`  ${configPath}`));
  console.log('');
  console.log(chalk.white('示例结构:'));
  console.log(chalk.gray(`{
  "profiles": {
    "kimi": {
      "ANTHROPIC_BASE_URL": "https://api.moonshot.cn/anthropic",
      "ANTHROPIC_AUTH_TOKEN": "your_api_key",
      "ANTHROPIC_MODEL": "kimi-k2.5",
      "ANTHROPIC_DEFAULT_OPUS_MODEL": "kimi-k2.5",
      "ANTHROPIC_DEFAULT_SONNET_MODEL": "kimi-k2.5",
      "ANTHROPIC_DEFAULT_HAIKU_MODEL": "kimi-k2.5",
      "CLAUDE_CODE_SUBAGENT_MODEL": "kimi-k2.5"
    }
  }
}`));
  console.log('');
}

/**
 * 根据命令行参数判断是否无头 prompt 模式
 */
function isHeadlessPromptMode(inputArgs: string[]): boolean {
  return inputArgs.includes('-p')
    || inputArgs.includes('--prompt')
    || inputArgs.some(arg => arg.startsWith('--prompt='));
}

/**
 * 启动器模式
 */
async function runAsLauncher(launchArgs: string[]): Promise<void> {
  const config = new ConfigManager();

  // 检查是否已配置
  if (!config.hasAnyProfile()) {
    console.log('');
    console.log(chalk.yellow('⚠ 尚未配置任何 profile'));
    console.log('');
    console.log(chalk.gray('请先编辑配置文件:'));
    console.log(chalk.cyan(`  ${config.getConfigPath()}`));
    console.log('');
    return;
  }

  // 检查 Claude Code 是否已安装
  if (!checkClaudeInstallation()) {
    return;
  }

  const profiles = config.getAllProfiles();
  if (profiles.length === 0) {
    console.log('');
    console.log(chalk.red('✗ 配置文件中未找到可用 profile'));
    console.log('');
    return;
  }

  // 选择配置：无头模式时默认第一个，交互模式保持原逻辑
  const headlessPrompt = isHeadlessPromptMode(launchArgs);
  let profileName: string;

  if (headlessPrompt) {
    profileName = profiles[0].name;
    if (profiles.length > 1) {
      console.log(chalk.gray(`已进入无头模式，默认使用第一个配置: ${profileName}`));
    }
  } else if (profiles.length === 1) {
    profileName = profiles[0].name;
  } else {
    profileName = await selectProfile(
      profiles.map(p => ({ name: p.name, config: p.config }))
    );
  }

  // 启动 Claude Code
  const launcher = new ClaudeLauncher(config, profileName);
  await launcher.launch({
    args: launchArgs,
    skipPermissions: true
  });
}

// 运行主函数
main().catch(error => {
  console.error(chalk.red('发生错误:'), error);
  process.exit(1);
});
