import type { Plugin } from 'vite';
import { createHandleHotUpdate } from '@dcloudio/uni-h5-vite/dist/plugin/handleHotUpdate/index';
import type { PluginConfig } from '../types/index.js';
import { ConfigManager } from '../config/manager.js';
import { logger } from '../utils/logger.js';

export interface ModulePluginOptions {
  enableLogging?: boolean;
  enableHotUpdate?: boolean;
}

/**
 * 页面模块插件
 * @param config 插件配置
 * @param options 配置选项
 * @returns Vite 插件
 */
export const PageModule = (
  config: PluginConfig,
  options: ModulePluginOptions = {}
): Plugin => {
  const { fileName, src } = config;
  const { enableLogging = false, enableHotUpdate = true } = options;
  
  if (enableLogging) {
    logger.info(`初始化页面模块插件: ${fileName}, ${src}`);
  }
  
  // 创建 ConfigManager 实例
  const configManager = new ConfigManager({ fileName, src });
  
  const plugin: Plugin = {
    name: 'uni-boost:page-modules',
    transform: {
      order: 'pre',
      async handler(code: string, id: string) {
        if (id.endsWith('pages-json-js')) {
          try {
            const data = await configManager.getCompleteConfig();
            
            // 添加文件监听
            data.files.forEach(filePath => {
              this.addWatchFile(filePath);
              if (enableLogging) {
                logger.debug(`添加文件监听: ${filePath}`);
              }
            });

            if (enableLogging) {
              logger.debug(`生成 pages.json 配置，包含 ${data.modules.length} 个模块`);
            }

            return JSON.stringify(data.json);
          } catch (error) {
            logger.error('生成 pages.json 配置失败', error as Error);
            return JSON.stringify({});
          }
        }
        return null;
      },
    },
  };

  // 配置热更新
  if (enableHotUpdate && process.env.UNI_PLATFORM === 'h5') {
    try {
      const hotUpdate = createHandleHotUpdate() as (option: { file: string; server: any }) => void;
      plugin.handleHotUpdate = ({ file, server }) => {
        if (file.endsWith(fileName) || file.endsWith('module.json')) {
          if (enableLogging) {
            logger.debug(`触发热更新: ${file}`);
          }
          hotUpdate({ file: 'pages.json', server });
        }
      };
    } catch (error) {
      logger.warn('热更新配置失败', error as Error);
    }
  }

  return plugin;
};
