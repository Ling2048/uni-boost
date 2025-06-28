import type { Plugin } from 'vite';
import type { DefineReplacements } from '../types/index.js';
import { logger } from '../utils/logger.js';

export interface InterceptDefineOptions {
  replacements?: DefineReplacements;
  enableLogging?: boolean;
}

/**
 * 拦截并替换代码中的定义
 * @param options 配置选项
 * @returns Vite 插件
 */
export const InterceptDefine = (options: InterceptDefineOptions = {}): Plugin => {
  const {
    replacements = { __UNI_FEATURE_PAGES__: true },
    enableLogging = false
  } = options;

  return {
    name: 'uni-boost:intercept-define',
    transform(code: string, id: string) {
      if (!code || Object.keys(replacements).length === 0) {
        return null;
      }

      let newCode = code;
      let hasChanges = false;

      Object.entries(replacements).forEach(([key, value]) => {
        const regex = new RegExp(key, 'g');
        const stringValue = String(value);
        
        if (regex.test(newCode)) {
          newCode = newCode.replace(regex, stringValue);
          hasChanges = true;
          
          if (enableLogging) {
            logger.debug(`替换 ${key} -> ${stringValue} in ${id}`);
          }
        }
      });

      return hasChanges ? newCode : null;
    }
  };
};
