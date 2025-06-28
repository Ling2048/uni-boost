import { ModuleConfig, PageConfig, SubPackageConfig } from '../types/index.js';
import { ERROR_MESSAGES } from '../constants/index.js';

export class ValidationError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateModuleConfig(config: any): config is ModuleConfig {
  if (!config || typeof config !== 'object') {
    throw new ValidationError(ERROR_MESSAGES.INVALID_MODULE_CONFIG);
  }

  if (!config.setting || typeof config.setting !== 'object') {
    throw new ValidationError('模块配置缺少 setting 字段');
  }

  if (!Array.isArray(config.setting.pages)) {
    throw new ValidationError('setting.pages 必须是数组');
  }

  // 验证页面配置
  config.setting.pages.forEach((page: any, index: number) => {
    if (!validatePageConfig(page)) {
      throw new ValidationError(`页面配置 [${index}] 无效`);
    }
  });

  // 验证子包配置（如果存在）
  if (config.setting.subPackages) {
    if (!Array.isArray(config.setting.subPackages)) {
      throw new ValidationError('setting.subPackages 必须是数组');
    }
    
    config.setting.subPackages.forEach((subPackage: any, index: number) => {
      if (!validateSubPackageConfig(subPackage)) {
        throw new ValidationError(`子包配置 [${index}] 无效`);
      }
    });
  }

  return true;
}

export function validatePageConfig(page: any): page is PageConfig {
  return page && 
         typeof page === 'object' && 
         typeof page.path === 'string' && 
         page.path.length > 0;
}

export function validateSubPackageConfig(subPackage: any): subPackage is SubPackageConfig {
  return subPackage && 
         typeof subPackage === 'object' && 
         typeof subPackage.root === 'string' && 
         subPackage.root.length > 0 && 
         Array.isArray(subPackage.pages);
}

export function validateFilePath(filePath: string): boolean {
  return typeof filePath === 'string' && filePath.length > 0;
}

export function safeJsonParse<T>(jsonString: string): T | null {
  try {
    return JSON.parse(jsonString);
  } catch {
    return null;
  }
}