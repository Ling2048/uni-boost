import type { Plugin } from 'vite';
import { ConfigManager } from '../config/manager.js';
import { logger } from '../utils/logger.js';
import { PageModule } from '../plugins/module.js';
import { PageModuleRoute } from '../plugins/route.js';
import { PageModuleStatic } from '../plugins/static.js';
import { PageModuleHook } from '../plugins/hook.js';
import { InterceptDefine } from '../plugins/intercept-define.js';

// 插件类型定义
type PluginType = 'module' | 'route' | 'static' | 'hook' | 'intercept-define';

interface PluginConfig {
  type: PluginType;
  options?: any;
}

export class PluginFactory {
  private configManager: ConfigManager;
  private pluginCache: Map<string, Plugin | Plugin[]> = new Map();

  constructor(configManager: ConfigManager) {
    this.configManager = configManager;
    logger.debug('PluginFactory 初始化完成');
  }

  /**
   * 创建插件实例
   */
  async createPlugin(config: PluginConfig): Promise<Plugin | Plugin[] | null> {
    const cacheKey = this.generateCacheKey(config);
    
    // 检查缓存
    if (this.pluginCache.has(cacheKey)) {
      logger.debug(`使用缓存的插件: ${config.type}`);
      return this.pluginCache.get(cacheKey)!;
    }

    let plugin: Plugin | Plugin[] | null = null;

    try {
      switch (config.type) {
        case 'module':
          plugin = this.createModulePlugin(config.options);
          break;
        case 'route':
          plugin = this.createRoutePlugin(config.options);
          break;
        case 'static':
          plugin = await this.createStaticPlugin(config.options);
          break;
        case 'hook':
          plugin = this.createHookPlugin(config.options);
          break;
        case 'intercept-define':
          plugin = this.createInterceptDefinePlugin(config.options);
          break;
        default:
          logger.warn(`未知的插件类型: ${config.type}`);
          return null;
      }

      if (plugin) {
        this.pluginCache.set(cacheKey, plugin);
        logger.info(`插件创建成功: ${config.type}`);
      }

      return plugin;
    } catch (error) {
      logger.error(`创建插件失败: ${config.type}`, error as Error);
      return null;
    }
  }

  /**
   * 批量创建插件
   */
  async createPlugins(configs: PluginConfig[]): Promise<Plugin[]> {
    const plugins: Plugin[] = [];
    
    for (const config of configs) {
      const plugin = await this.createPlugin(config);
      if (plugin) {
        if (Array.isArray(plugin)) {
          plugins.push(...plugin);
        } else {
          plugins.push(plugin);
        }
      }
    }
    
    logger.info(`批量创建插件完成，成功创建 ${plugins.length}/${configs.length} 个插件`);
    return plugins;
  }

  /**
   * 创建模块插件
   */
  private createModulePlugin(options: { fileName: string; src: string }): Plugin {
    logger.debug('创建模块插件', options);
    return PageModule(options);
  }

  /**
   * 创建路由插件
   */
  private createRoutePlugin(options: { modules: any[] }): Plugin {
    logger.debug('创建路由插件', { moduleCount: options.modules?.length || 0 });
    return PageModuleRoute(options.modules);
  }

  /**
   * 创建静态资源插件
   */
  private async createStaticPlugin(options: { modules: any[] }): Promise<Plugin | Plugin[] | null> {
    logger.debug('创建静态资源插件', { moduleCount: options.modules?.length || 0 });
    return await PageModuleStatic(options.modules);
  }

  /**
   * 创建Hook插件
   */
  private createHookPlugin(options: { modules: any[]; src: string }): Plugin {
    logger.debug('创建Hook插件', { moduleCount: options.modules?.length || 0 });
    return PageModuleHook(options);
  }

  /**
   * 创建拦截定义插件
   */
  private createInterceptDefinePlugin(options?: any): Plugin {
    logger.debug('创建拦截定义插件');
    return InterceptDefine();
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(config: PluginConfig): string {
    return `${config.type}-${JSON.stringify(config.options || {})}`;
  }

  /**
   * 清除插件缓存
   */
  clearCache(): void {
    this.pluginCache.clear();
    logger.debug('插件缓存已清除');
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.pluginCache.size,
      keys: Array.from(this.pluginCache.keys())
    };
  }

  /**
   * 创建标准的 uni-boost 插件集合
   */
  async createStandardPlugins(options: {
    fileName: string;
    src: string;
    modules: any[];
  }): Promise<Plugin[]> {
    const configs: PluginConfig[] = [
      { type: 'module', options: { fileName: options.fileName, src: options.src } },
      { type: 'route', options: { modules: options.modules } },
      { type: 'static', options: { modules: options.modules } },
      { type: 'hook', options: { modules: options.modules, src: options.src } },
      { type: 'intercept-define' }
    ];

    return await this.createPlugins(configs);
  }
}