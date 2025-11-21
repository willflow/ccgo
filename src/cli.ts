#!/usr/bin/env node

/**
 * CLI 主入口
 * CCGO - Claude Code Go 启动器
 */

import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import { ConfigManager } from './config/manager';
import { ClaudeLauncher } from './launcher';
import {
  showConfigPrompts,
  confirmReconfigure,
  selectProfile,
  showWelcome,
  showConfigSuccess,
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
 * 处理 config 命令
 */
async function handleConfigCommand(subArgs: string[]): Promise<void> {
  const config = new ConfigManager();

  // --list: 列出所有配置
  if (subArgs.includes('--list')) {
    const profiles = config.getAllProfiles();
    if (profiles.length === 0) {
      console.log('');
      console.log(chalk.yellow('暂无配置'));
      console.log('');
      console.log(chalk.gray('运行以下命令添加配置:'));
      console.log(chalk.cyan('  ccgo config'));
      console.log('');
      return;
    }

    console.log('');
    console.log(chalk.cyan.bold('📋 配置列表:'));
    console.log('');
    profiles.forEach(profile => {
      const safeConfig = config.getSafeApiConfig(profile.name);
      if (safeConfig) {
        console.log(chalk.white.bold(`  ${profile.name}`));
        console.log(chalk.gray(`    Base URL: ${safeConfig.baseUrl}`));
        console.log(chalk.gray(`    API Key:  ${safeConfig.apiKey}`));
        if (safeConfig.model) {
          console.log(chalk.gray(`    Model:    ${safeConfig.model}`));
        }
        if (safeConfig.smallFastModel) {
          console.log(chalk.gray(`    Small Fast Model: ${safeConfig.smallFastModel}`));
        }
        console.log('');
      }
    });
    return;
  }

  // --add: 添加新配置
  if (subArgs.includes('--add')) {
    const configData = await showConfigPrompts();
    config.saveProfile(configData.name, {
      apiKey: configData.apiKey,
      baseUrl: configData.baseUrl,
      model: configData.model,
      smallFastModel: configData.smallFastModel
    });
    showConfigSuccess(configData.name);
    return;
  }

  // --remove: 删除配置
  if (subArgs.includes('--remove')) {
    const profiles = config.getAllProfiles();
    if (profiles.length === 0) {
      console.log('');
      console.log(chalk.yellow('暂无配置可删除'));
      console.log('');
      return;
    }

    const profileName = await selectProfile(
      profiles.map(p => ({ name: p.name, config: p }))
    );

    config.removeProfile(profileName);
    console.log('');
    console.log(chalk.green(`✓ 配置 "${profileName}" 已删除`));
    console.log('');
    return;
  }

  // 默认：配置或重新配置
  if (!config.hasAnyProfile()) {
    // 首次配置
    const configData = await showConfigPrompts();
    config.saveProfile(configData.name, {
      apiKey: configData.apiKey,
      baseUrl: configData.baseUrl,
      model: configData.model,
      smallFastModel: configData.smallFastModel
    });
    showConfigSuccess(configData.name);
  } else {
    // 重新配置
    const confirmed = await confirmReconfigure();
    if (confirmed) {
      const configData = await showConfigPrompts();
      config.saveProfile(configData.name, {
        apiKey: configData.apiKey,
        baseUrl: configData.baseUrl,
        model: configData.model,
        smallFastModel: configData.smallFastModel
      });
      showConfigSuccess(configData.name);
    }
  }
}

/**
 * 启动器模式
 */
async function runAsLauncher(launchArgs: string[]): Promise<void> {
  const config = new ConfigManager();

  // 检查是否已配置
  if (!config.hasAnyProfile()) {
    console.log('');
    console.log(chalk.yellow('⚠ 尚未配置 API Key'));
    console.log('');
    console.log(chalk.gray('请先运行配置命令:'));
    console.log(chalk.cyan('  ccgo config'));
    console.log('');
    return;
  }

  // 检查 Claude Code 是否已安装
  if (!checkClaudeInstallation()) {
    return;
  }

  // 选择配置（如果有多个）
  let profileName: string | undefined;
  const profiles = config.getAllProfiles();

  if (profiles.length === 1) {
    profileName = profiles[0].name;
  } else {
    profileName = await selectProfile(
      profiles.map(p => ({ name: p.name, config: p }))
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
