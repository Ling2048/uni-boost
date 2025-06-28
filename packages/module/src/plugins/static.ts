import path from 'node:path';
import { normalizePath } from 'vite';
import type { Plugin } from 'vite';
import type { ModuleData, StaticTarget } from '../types/index.js';
import { logger } from '../utils/logger.js';

export interface StaticPluginOptions {
  enableLogging?: boolean;
  staticPrefix?: string;
}

/**
 * 处理模块静态资源的插件
 * @param modules 模块数据数组
 * @param options 配置选项
 * @returns Vite 插件或 null
 */
export const PageModuleStatic = async (
  modules: ModuleData[],
  options: StaticPluginOptions = {}
): Promise<Plugin | Plugin[] | null> => {
  const { enableLogging = false, staticPrefix = 'static' } = options;
  
  try {
    const targets: StaticTarget[] = [];
    
    modules.forEach(({ json, key, filePath }) => {
      if (json.static) {
        const srcPath = normalizePath(path.resolve(filePath, `../${json.static}`));
        const target: StaticTarget = {
          src: srcPath,
          dest: '',
          rename: `${staticPrefix}/${key}`,
        };
        
        targets.push(target);
        
        if (enableLogging) {
          logger.debug(`添加静态资源: ${srcPath} -> ${target.rename}`);
        }
      }
    });

    if (targets.length === 0) {
      if (enableLogging) {
        logger.debug('未找到静态资源配置');
      }
      return null;
    }

    const { viteStaticCopy } = await import('vite-plugin-static-copy');
    
    if (enableLogging) {
      logger.info(`配置 ${targets.length} 个静态资源目标`);
    }
    
    return viteStaticCopy({ targets });
  } catch (error) {
    logger.error('静态资源插件配置失败', error as Error);
    return null;
  }
};
