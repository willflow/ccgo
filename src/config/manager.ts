/**
 * 配置管理器
 * 负责读取、保存、验证 API 配置信息
 */

import Conf from 'conf';
import * as path from 'path';
import * as os from 'os';
import { CONFIG_NAME } from './constants';

/**
 * API 配置接口
 */
export interface ApiConfig {
  apiKey: string;        // API Key
  baseUrl: string;       // API Base URL
  model?: string;        // 可选：模型名称（ANTHROPIC_MODEL）
  smallFastModel?: string; // 可选：小快速模型（ANTHROPIC_SMALL_FAST_MODEL）
  configuredAt?: string; // 配置时间
  version?: string;      // 配置版本
}

/**
 * 配置项（包含名称）
 */
export interface ProfileConfig extends ApiConfig {
  name: string;          // 配置名称
}

/**
 * 完整配置结构
 */
export interface FullConfig {
  profiles?: Record<string, ApiConfig>;  // 多个配置
}

/**
 * 配置管理器类
 */
export class ConfigManager {
  private config: Conf<FullConfig>;

  constructor() {
    this.config = new Conf<FullConfig>({
      projectName: CONFIG_NAME,
      cwd: path.join(os.homedir(), '.config', CONFIG_NAME)
    });

    // 迁移旧配置（如果存在）
    this.migrateOldConfig();
  }

  /**
   * 迁移旧版本的单配置到新的多配置结构
   */
  private migrateOldConfig(): void {
    const oldApi = this.config.get('api' as any);

    // 如果存在旧配置但没有 profiles，进行迁移
    if (oldApi && !this.config.has('profiles')) {
      const profileName = 'default';
      this.config.set('profiles', {
        [profileName]: {
          apiKey: oldApi.apiKey,
          baseUrl: oldApi.baseUrl,
          model: oldApi.model,
          smallFastModel: oldApi.smallFastModel,
          configuredAt: oldApi.configuredAt,
          version: oldApi.version
        }
      });
      this.config.delete('api' as any);
    }

    // 清理旧的 defaultProfile 字段
    if (this.config.has('defaultProfile' as any)) {
      this.config.delete('defaultProfile' as any);
    }
  }

  /**
   * 检查是否有任何配置
   */
  hasAnyProfile(): boolean {
    const profiles = this.config.get('profiles', {});
    return Object.keys(profiles).length > 0;
  }

  /**
   * 检查是否已配置 API Key（向后兼容）
   */
  hasApiKey(): boolean {
    return this.hasAnyProfile();
  }

  /**
   * 获取所有配置名称
   */
  getProfileNames(): string[] {
    const profiles = this.config.get('profiles', {});
    return Object.keys(profiles);
  }

  /**
   * 获取配置数量
   */
  getProfileCount(): number {
    return this.getProfileNames().length;
  }

  /**
   * 检查配置是否存在
   */
  hasProfile(name: string): boolean {
    return this.config.has(`profiles.${name}`);
  }

  /**
   * 获取指定配置
   */
  getProfile(name: string): ApiConfig | undefined {
    return this.config.get(`profiles.${name}`);
  }

  /**
   * 获取当前激活的配置（仅当只有一个配置时返回）
   */
  getCurrentProfile(): { name: string; config: ApiConfig } | undefined {
    const names = this.getProfileNames();

    if (names.length === 0) {
      return undefined;
    }

    // 只有一个配置时，直接使用
    if (names.length === 1) {
      const name = names[0];
      const config = this.getProfile(name);
      return config ? { name, config } : undefined;
    }

    // 多个配置时，返回 undefined（需要用户选择）
    return undefined;
  }

  /**
   * 获取 API Key（向后兼容）
   */
  getApiKey(): string | undefined {
    const current = this.getCurrentProfile();
    return current?.config.apiKey;
  }

  /**
   * 获取 Base URL（向后兼容）
   */
  getBaseUrl(): string | undefined {
    const current = this.getCurrentProfile();
    return current?.config.baseUrl;
  }

  /**
   * 获取模型名称（可选）
   */
  getModel(): string | undefined {
    const current = this.getCurrentProfile();
    return current?.config.model;
  }

  /**
   * 获取小快速模型（可选）
   */
  getSmallFastModel(): string | undefined {
    const current = this.getCurrentProfile();
    return current?.config.smallFastModel;
  }

  /**
   * 添加或更新配置
   */
  saveProfile(name: string, config: Omit<ApiConfig, 'configuredAt' | 'version'>): void {
    const fullConfig: ApiConfig = {
      ...config,
      configuredAt: new Date().toISOString(),
      version: '1.0.0'
    };

    const profiles = this.config.get('profiles', {});
    profiles[name] = fullConfig;
    this.config.set('profiles', profiles);
  }

  /**
   * 删除配置
   */
  removeProfile(name: string): void {
    if (!this.hasProfile(name)) {
      throw new Error(`配置 "${name}" 不存在`);
    }

    const profiles = this.config.get('profiles', {});
    delete profiles[name];
    this.config.set('profiles', profiles);
  }

  /**
   * 保存 API 配置（向后兼容，保存为 default）
   */
  saveApiConfig(config: Omit<ApiConfig, 'configuredAt' | 'version'>, name: string = 'default'): void {
    this.saveProfile(name, config);
  }

  /**
   * 获取所有配置（含配置名称）
   */
  getAllProfiles(): ProfileConfig[] {
    const profiles = this.config.get('profiles', {});
    return Object.entries(profiles).map(([name, config]) => ({
      name,
      ...config
    }));
  }

  /**
   * 重置所有配置
   */
  reset(): void {
    this.config.clear();
  }

  /**
   * 获取所有配置
   */
  getAll(): FullConfig {
    return this.config.store;
  }

  /**
   * 获取配置文件路径
   */
  getConfigPath(): string {
    return this.config.path;
  }

  /**
   * 获取安全的配置信息（隐藏 API Key）
   */
  getSafeApiConfig(name?: string): ApiConfig | undefined {
    let apiConfig: ApiConfig | undefined;

    if (name) {
      apiConfig = this.getProfile(name);
    } else {
      const current = this.getCurrentProfile();
      apiConfig = current?.config;
    }

    if (!apiConfig) return undefined;

    const safeConfig = { ...apiConfig };
    if (safeConfig.apiKey) {
      const key = safeConfig.apiKey;
      if (key.length > 12) {
        safeConfig.apiKey = `${key.substring(0, 8)}...${key.substring(key.length - 4)}`;
      } else {
        safeConfig.apiKey = '***';
      }
    }
    return safeConfig;
  }
}
