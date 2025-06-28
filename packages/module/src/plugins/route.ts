import path from 'node:path';
import fs from 'node:fs';
import type { Plugin } from 'vite';
import type { ModuleData, RouteConfig } from '../types/index.js';
import { logger } from '../utils/logger.js';
import virtualModule from '../vite/virtual-module-plugin.js';

export interface RoutePluginOptions {
  configPath?: string;
  enableLogging?: boolean;
  moduleId?: string;
}

/**
 * 处理模块路由配置的插件
 * @param modules 模块数据数组
 * @param options 配置选项
 * @returns Vite 插件
 */
export const PageModuleRoute = (
  modules: ModuleData[],
  options: RoutePluginOptions = {}
): Plugin => {
  const {
    configPath = 'src/route.config.json',
    enableLogging = false,
    moduleId = 'virtual:PageModuleRoute/route'
  } = options;

  let route: RouteConfig = {};

  try {
    // 读取全局路由配置
    const globalConfigPath = path.resolve(process.cwd(), configPath);
    if (fs.existsSync(globalConfigPath)) {
      const configContent = fs.readFileSync(globalConfigPath, { encoding: 'utf-8' });
      const routeConfig = JSON.parse(configContent || '{}') as RouteConfig;
      route = { ...route, ...routeConfig };
      
      if (enableLogging) {
        logger.debug(`加载全局路由配置: ${globalConfigPath}`);
      }
    }

    // 合并模块路由配置
    modules.forEach(({ json, key }) => {
      if (json.route) {
        route = { ...route, ...json.route };
        
        if (enableLogging) {
          logger.debug(`合并模块 ${key} 的路由配置`);
        }
      }
    });

    if (enableLogging) {
      logger.info(`生成路由配置，包含 ${Object.keys(route).length} 个路由`);
    }
  } catch (error) {
    logger.error('路由配置处理失败', error as Error);
  }

  return virtualModule({
    moduleId,
    content: `export default ${JSON.stringify(route, null, 2)};`,
    enableHmr: true,
  });
};
