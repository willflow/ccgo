/**
 * 配置管理器
 * 负责读取、保存、验证 API 配置信息
 */

import Conf from 'conf';
import * as path from 'path';
import * as os from 'os';
import { CONFIG_NAME } from './constants';

/**
 * Profile 配置接口（环境变量键值对）
 */
export interface ApiConfig {
  [envName: string]: string;
}

/**
 * 配置项（包含名称）
 */
export interface ProfileConfig {
  name: string;           // 配置名称
  config: ApiConfig;      // 环境变量配置
}

/**
 * 完整配置结构
 */
export interface FullConfig {
  profiles?: Record<string, ApiConfig>;   // 多个配置
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

    this.ensureProfilesContainer();
  }

  /**
   * 确保 profiles 容器存在
   */
  private ensureProfilesContainer(): void {
    const profiles = this.config.get('profiles');
    if (!profiles || typeof profiles !== 'object' || Array.isArray(profiles)) {
      this.config.set('profiles', {});
    }
  }

  /**
   * 规范化 profile 数据
   */
  private normalizeProfile(raw: unknown): ApiConfig {
    const normalized: ApiConfig = {};
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      return normalized;
    }

    for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
      if (typeof value === 'string' && value.trim() !== '') {
        normalized[key] = value;
      }
    }

    return normalized;
  }

  /**
   * 获取所有 profile（并做运行时校验）
   */
  private getProfilesRecord(): Record<string, ApiConfig> {
    const rawProfiles = this.config.get('profiles') as unknown;
    if (!rawProfiles || typeof rawProfiles !== 'object' || Array.isArray(rawProfiles)) {
      return {};
    }

    const profiles: Record<string, ApiConfig> = {};
    for (const [name, rawProfile] of Object.entries(rawProfiles)) {
      profiles[name] = this.normalizeProfile(rawProfile);
    }
    return profiles;
  }

  /**
   * 检查是否有任何 profile
   */
  hasAnyProfile(): boolean {
    return this.getProfileNames().length > 0;
  }

  /**
   * 检查是否有 profile（向后兼容）
   */
  hasApiKey(): boolean {
    return this.hasAnyProfile();
  }

  /**
   * 获取所有配置名称
   */
  getProfileNames(): string[] {
    return Object.keys(this.getProfilesRecord());
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
    return this.getProfileNames().includes(name);
  }

  /**
   * 获取指定配置
   */
  getProfile(name: string): ApiConfig | undefined {
    return this.getProfilesRecord()[name];
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
   * 添加或更新配置
   */
  saveProfile(name: string, config: ApiConfig): void {
    if (!name || !name.trim()) {
      throw new Error('配置名称不能为空');
    }

    const profiles = this.getProfilesRecord();
    profiles[name] = this.normalizeProfile(config);
    this.config.set('profiles', profiles);
  }

  /**
   * 删除配置
   */
  removeProfile(name: string): void {
    if (!this.hasProfile(name)) {
      throw new Error(`配置 "${name}" 不存在`);
    }

    const profiles = this.getProfilesRecord();
    delete profiles[name];
    this.config.set('profiles', profiles);
  }

  /**
   * 保存配置（向后兼容方法名）
   */
  saveApiConfig(config: ApiConfig, name: string = 'default'): void {
    this.saveProfile(name, config);
  }

  /**
   * 获取所有配置（含配置名称）
   */
  getAllProfiles(): ProfileConfig[] {
    const profiles = this.getProfilesRecord();
    return Object.entries(profiles).map(([name, config]) => ({
      name,
      config
    }));
  }

  /**
   * 重置所有配置
   */
  reset(): void {
    this.config.clear();
    this.ensureProfilesContainer();
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

    const safeConfig: ApiConfig = {};
    for (const [key, value] of Object.entries(apiConfig)) {
      if (value.length > 12) {
        safeConfig[key] = `${value.substring(0, 6)}...${value.substring(value.length - 4)}`;
      } else {
        safeConfig[key] = '***';
      }
    }
    return safeConfig;
  }
}
