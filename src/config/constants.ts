/**
 * 配置常量
 * 定义项目名称和 API 提供商预设配置
 */

// 使用与 cc-code-status 相同的配置名称，确保兼容性
// 两个包可以共享同一份配置
export const CONFIG_NAME = 'cc-code-status';

/**
 * API 提供商配置
 */
export interface ApiProvider {
  name: string;
  baseUrl: string;
  description: string;
}

/**
 * 预设的 API 提供商列表
 */
export const API_PROVIDERS: Record<string, ApiProvider> = {
  anthropic: {
    name: 'Anthropic 官方',
    baseUrl: 'https://api.anthropic.com',
    description: '官方 Claude API（需要国际网络）'
  },
  glm: {
    name: '智谱 GLM',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    description: '智谱 AI GLM 模型（国内可用）'
  },
  qwen: {
    name: '通义千问',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    description: '阿里云通义千问模型（国内可用）'
  },
  deepseek: {
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com',
    description: 'DeepSeek AI 模型（国内可用）'
  },
  custom: {
    name: '自定义 API',
    baseUrl: '',
    description: '自定义 Anthropic 兼容 API 地址'
  }
};
