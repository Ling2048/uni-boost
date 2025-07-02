import type { Plugin } from 'vite';
import { ConfigManager } from './config/manager.js';
import { PluginFactory } from './factories/plugin-factory.js';
import type { UniBoostConfig } from './types/index.js';
import { logger } from './utils/logger.js';

// 导入原有插件（保持向后兼容）
import { PageModule } from './plugins/module.js';
import { PageModuleStatic } from './plugins/static.js';
import { PageModuleHook } from './plugins/hook.js';
import { PageModuleRoute } from './plugins/route.js';
import { InterceptDefine } from './plugins/intercept-define.js';

/**
 * 新的主入口函数，使用重构后的架构
 */
export const createUniBoostPlugins = async (config: Partial<UniBoostConfig> = {}): Promise<Plugin[]> => {
  const configManager = new ConfigManager(config);
  const pluginFactory = new PluginFactory(configManager);
  
  // 初始化配置
  await configManager.initialize();
  
  // 加载数据
  const data = await configManager.loadData();
  
  // 使用 PluginFactory 创建所有标准插件
  return await pluginFactory.createStandardPlugins({
    fileName: data.fileName,
    src: data.src,
    modules: data.modules
  });
};

// 注意：原有的 PageModules 函数已被移除
// 请使用 createUniBoostPlugins 替代

// 主要导出
export { ConfigManager } from './config/manager.js';
export { PluginFactory } from './factories/plugin-factory.js';
export { logger } from './utils/logger.js';
export { ValidationError } from './utils/validation.js';

// Vue 相关导出
export * from './vue/index.js';

// Vite 相关导出
export { default as virtualModule, createVirtualModules, VirtualModuleContentBuilder } from './vite/virtual-module-plugin.js';
export type { VirtualModulePluginOptions, VirtualModuleStats } from './vite/virtual-module-plugin.js';

// 插件导出
export { InterceptDefine } from './plugins/intercept-define.js';
export { PageModuleStatic } from './plugins/static.js';
export { PageModuleRoute } from './plugins/route.js';
export { PageModuleHook } from './plugins/hook.js';
export { PageModule } from './plugins/module.js';

// 类型导出
export type {
  UniBoostConfig,
  VirtualModuleOptions,
  ModuleData,
  PagesJson,
  SubPackageConfig,
  PageConfig,
  PluginConfig,
  RouteConfig,
  StaticTarget,
  HookTap,
  HookInstance,
  DefineReplacements
} from './types/index.js';
