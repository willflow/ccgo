/**
 * 配置验证器
 * 提供 API Key 和 URL 的验证功能
 */

/**
 * 验证 API Key 格式
 * @param apiKey API Key
 * @returns 是否有效
 */
export function validateApiKeyFormat(apiKey: string): boolean {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }
  // API Key 通常在 20-200 个字符之间
  return apiKey.length >= 20 && apiKey.length <= 200;
}

/**
 * 验证 URL 格式
 * @param url URL 地址
 * @returns 是否有效
 */
export function validateUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
