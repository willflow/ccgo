/**
 * 交互式提示
 * 提供向导式配置体验
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import boxen from 'boxen';
import { validateApiKeyFormat, validateUrl } from '../config/validator';

/**
 * 显示配置引导
 */
export function showConfigGuide(): void {
  console.log('\n' + boxen(
    chalk.cyan.bold('🔑 配置说明') + '\n\n' +
    chalk.yellow.bold('必填项：') + '\n' +
    chalk.gray('  • API Base URL: API 服务地址（如 https://api.anthropic.com）\n') +
    chalk.gray('  • API Key: 你的 API 密钥\n\n') +
    chalk.yellow.bold('可选项：') + '\n' +
    chalk.gray('  • Model: 主要使用的模型名称（对应环境变量 ANTHROPIC_MODEL）\n') +
    chalk.gray('  • Small Fast Model: 快速小模型（对应环境变量 ANTHROPIC_SMALL_FAST_MODEL）\n\n') +
    chalk.cyan.bold('常见 API 服务：') + '\n' +
    chalk.white('  智谱 GLM:      ') + chalk.gray('https://open.bigmodel.cn/api/anthropic\n') +
    chalk.white('  Kimi:          ') + chalk.gray('https://api.moonshot.cn/anthropic\n') +
    chalk.white('  通义千问:       ') + chalk.gray('https://dashscope.aliyuncs.com/compatible-mode/v1\n') +
    chalk.white('  DeepSeek:      ') + chalk.gray('https://api.deepseek.com'),
    {
      padding: 1,
      borderColor: 'cyan',
      borderStyle: 'round'
    }
  ));

  console.log('');
}

/**
 * 首次配置提示
 */
export async function showConfigPrompts(defaultName?: string): Promise<{
  name: string;
  baseUrl: string;
  apiKey: string;
  model?: string;
  smallFastModel?: string;
}> {
  console.log(chalk.cyan('\n🔧 配置 Claude Code API\n'));

  // 显示配置引导
  showConfigGuide();

  // 输入配置名称
  const { name } = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: '配置名称:',
      default: defaultName || 'default',
      validate: (input: string) => {
        if (!input || !input.trim()) {
          return '❌ 配置名称不能为空';
        }
        if (!/^[a-zA-Z0-9_-]+$/.test(input)) {
          return '❌ 配置名称只能包含字母、数字、下划线和短横线';
        }
        return true;
      }
    }
  ]);

  // 输入 Base URL
  const { baseUrl } = await inquirer.prompt([
    {
      type: 'input',
      name: 'baseUrl',
      message: 'API Base URL:',
      validate: (input: string) => {
        if (!input) {
          return '❌ Base URL 不能为空';
        }
        if (!validateUrl(input)) {
          return '❌ 请输入有效的 HTTP/HTTPS URL';
        }
        return true;
      }
    }
  ]);

  // 获取 API Key
  const { apiKey } = await inquirer.prompt([
    {
      type: 'password',
      name: 'apiKey',
      message: 'API Key:',
      mask: '*',
      validate: (input: string) => {
        if (!input) {
          return '❌ API Key 不能为空';
        }
        if (!validateApiKeyFormat(input)) {
          return '❌ API Key 格式不正确（长度应在 20-200 个字符之间）';
        }
        return true;
      }
    }
  ]);

  // 询问是否配置可选参数
  const { configOptional } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'configOptional',
      message: '是否配置可选参数（模型名称）？',
      default: false
    }
  ]);

  let model: string | undefined;
  let smallFastModel: string | undefined;

  if (configOptional) {
    // 输入模型名称
    const modelAnswer = await inquirer.prompt([
      {
        type: 'input',
        name: 'model',
        message: 'Model (可选，直接回车跳过):',
        default: ''
      }
    ]);
    model = modelAnswer.model.trim() || undefined;

    // 输入小快速模型
    const smallModelAnswer = await inquirer.prompt([
      {
        type: 'input',
        name: 'smallFastModel',
        message: 'Small Fast Model (可选，直接回车跳过):',
        default: ''
      }
    ]);
    smallFastModel = smallModelAnswer.smallFastModel.trim() || undefined;
  }

  return {
    name: name.trim(),
    baseUrl: baseUrl.trim(),
    apiKey: apiKey.trim(),
    model,
    smallFastModel
  };
}

/**
 * 选择配置
 */
export async function selectProfile(profiles: { name: string; config: any }[]): Promise<string> {
  const { selected } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selected',
      message: '选择要使用的配置:',
      choices: profiles.map(p => {
        // 优先显示 ANTHROPIC_BASE_URL 的域名，避免配置缺失时崩溃
        const baseUrl = typeof p.config?.ANTHROPIC_BASE_URL === 'string'
          ? p.config.ANTHROPIC_BASE_URL
          : '';

        let domain = 'no-base-url';
        if (baseUrl) {
          try {
            domain = new URL(baseUrl).hostname;
          } catch {
            domain = baseUrl;
          }
        }

        return {
          name: `${p.name} (${domain})`,
          value: p.name
        };
      })
    }
  ]);

  return selected;
}

/**
 * 重新配置确认
 */
export async function confirmReconfigure(): Promise<boolean> {
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: chalk.yellow('这将覆盖现有配置，确定要继续吗?'),
      default: false
    }
  ]);

  return confirm;
}

/**
 * 确认启动 Claude Code
 */
export async function confirmLaunch(): Promise<boolean> {
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: '是否立即启动 Claude Code?',
      default: true
    }
  ]);

  return confirm;
}

/**
 * 显示欢迎信息
 */
export function showWelcome(): void {
  console.log('\n' + boxen(
    chalk.cyan.bold('🚀 CCGO') + '\n' +
    chalk.gray('Claude Code Go - 简单易用的启动器'),
    {
      padding: 1,
      borderColor: 'cyan',
      borderStyle: 'round',
      textAlignment: 'center'
    }
  ));
}

/**
 * 显示配置成功信息
 */
export function showConfigSuccess(profileName: string): void {
  console.log('');
  console.log(chalk.green('✓ 配置保存成功！'));
  console.log(chalk.gray(`配置名称: ${profileName}`));
  console.log('');
}

/**
 * 显示帮助信息
 */
export function showHelp(): void {
  console.log('');
  console.log(chalk.cyan.bold('CCGO - Claude Code Go 启动器'));
  console.log('');
  console.log(chalk.white('用法:'));
  console.log(chalk.gray('  ccgo [命令] [选项]'));
  console.log('');
  console.log(chalk.white('命令:'));
  console.log(chalk.cyan('  init') + chalk.gray('           初始化 Claude Code 配置，跳过 onboarding 认证'));
  console.log(chalk.cyan('  config') + chalk.gray('         显示配置文件位置和示例'));
  console.log(chalk.cyan('  help') + chalk.gray('           显示帮助信息'));
  console.log('');
  console.log(chalk.white('选项:'));
  console.log(chalk.cyan('  -v, --version') + chalk.gray('  显示版本号'));
  console.log('');
  console.log(chalk.white('示例:'));
  console.log(chalk.gray('  # 首次配置'));
  console.log(chalk.yellow('  ccgo config'));
  console.log('');
  console.log(chalk.gray('  # 初始化 Claude Code onboarding 状态'));
  console.log(chalk.yellow('  ccgo init'));
  console.log('');
  console.log(chalk.gray('  # 启动 Claude Code'));
  console.log(chalk.yellow('  ccgo'));
  console.log('');
  console.log(chalk.gray('  # 无头模式启动并直接执行任务'));
  console.log(chalk.yellow('  ccgo -p "执行xxx任务"'));
  console.log('');
}
