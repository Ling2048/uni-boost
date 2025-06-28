import path from 'node:path';
import { normalizePath } from 'vite';
import type { Plugin } from 'vite';
import type { ModuleData, PluginConfig } from '../types/index.js';
import { logger } from '../utils/logger.js';
import virtualModule from '../vite/virtual-module-plugin.js';

export interface HookPluginOptions {
  enableLogging?: boolean;
  moduleId?: string;
}

/**
 * 处理模块钩子插件的插件
 * @param config 插件配置
 * @param options 配置选项
 * @returns Vite 插件
 */
export const PageModuleHook = (
  { modules, src }: { modules: ModuleData[]; src: string },
  options: HookPluginOptions = {}
): Plugin => {
  const {
    enableLogging = false,
    moduleId = 'virtual:PageModuleHook/plugins'
  } = options;

  let importCode = '';
  let exportCode = '';
  let hookIndex = 0;
  const processedHooks: string[] = [];

  try {
    modules.forEach(({ json, key }) => {
      if (json.hookPlugins && Array.isArray(json.hookPlugins)) {
        json.hookPlugins.forEach((plugin: string) => {
          if (!plugin || typeof plugin !== 'string') {
            logger.warn(`模块 ${key} 中的钩子插件配置无效: ${plugin}`);
            return;
          }

          hookIndex++;
          const hookPath = normalizePath(path.resolve(
            path.resolve(process.cwd(), `${src}/${key}`),
            plugin
          ));
          
          importCode += `import Hook${hookIndex} from '${hookPath}';\n`;
          exportCode += `new Hook${hookIndex}(),`;
          processedHooks.push(`${key}:${plugin}`);
          
          if (enableLogging) {
            logger.debug(`添加钩子插件: ${key}:${plugin}`);
          }
        });
      }
    });

    if (enableLogging) {
      logger.info(`生成 ${processedHooks.length} 个钩子插件`);
    }
  } catch (error) {
    logger.error('钩子插件处理失败', error as Error);
  }

  const content = `${importCode}
export default [${exportCode}];`;

  return virtualModule({
    moduleId,
    content,
    enableHmr: true,
  });
};
