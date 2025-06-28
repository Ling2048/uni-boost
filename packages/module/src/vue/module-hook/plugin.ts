import type { App, Plugin } from 'vue';
import type { ModuleHookManager, ModuleHookManagerOptions } from './index.js';
import { ModuleHookManagerImpl } from './index.js';
import { logger } from '../../utils/logger.js';

export interface VueModuleHookPluginOptions extends ModuleHookManagerOptions {
  globalPropertyName?: string;
  autoRegisterGlobalHooks?: boolean;
  devtools?: boolean;
}

/**
 * Vue 模块钩子插件
 * 将模块钩子管理器集成到 Vue 应用中
 */
export function createVueModuleHookPlugin(
  options: VueModuleHookPluginOptions = {}
): Plugin {
  const {
    globalPropertyName = '$moduleHooks',
    autoRegisterGlobalHooks = true,
    devtools = false,
    ...hookManagerOptions
  } = options;

  return {
    install(app: App) {
      // 创建钩子管理器实例
      const hookManager = new ModuleHookManagerImpl(hookManagerOptions);

      // 注册为全局属性
      app.config.globalProperties[globalPropertyName] = hookManager;

      // 提供依赖注入
      app.provide('moduleHooks', hookManager);

      if (options.enableLogging) {
        logger.debug(`Vue 模块钩子插件已安装，全局属性名: ${globalPropertyName}`);
      }

      // 自动注册全局钩子
      if (autoRegisterGlobalHooks) {
        registerGlobalHooks(app, hookManager);
      }

      // 开发工具集成
      if (devtools) {
        setupDevtools(app, hookManager);
      }

      // 应用卸载时清理
      const originalUnmount = app.unmount;
      app.unmount = function() {
        hookManager.clearAll();
        if (options.enableLogging) {
          logger.debug('Vue 应用卸载，已清理所有模块钩子');
        }
        return originalUnmount.call(this);
      };
    }
  };
}

/**
 * 注册全局钩子
 */
function registerGlobalHooks(app: App, hookManager: ModuleHookManager): void {
  // 应用挂载前钩子
  hookManager.beforeLoad.tap('vue-app-before-mount', () => {
    logger.debug('Vue 应用即将挂载');
  });

  // 应用挂载后钩子
  hookManager.afterLoad.tap('vue-app-after-mount', () => {
    logger.debug('Vue 应用已挂载');
  });

  // 错误处理钩子
  hookManager.onError.tap('vue-app-error-handler', (error: Error) => {
    logger.error('Vue 应用模块错误', error);
  });

  // 注册 Vue 全局错误处理器
  app.config.errorHandler = (error: unknown, instance, info) => {
    hookManager.onError.call(error as Error, { instance, info });
  };
}

/**
 * 设置开发工具
 */
function setupDevtools(app: App, hookManager: ModuleHookManager): void {
  // 添加开发工具信息
  if (typeof window !== 'undefined' && (window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__) {
    const devtools = (window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__;
    
    // 注册模块钩子信息
    devtools.emit('app:init', app, {
      moduleHooks: {
        stats: hookManager.getStats(),
        manager: hookManager
      }
    });
  }
}

/**
 * Vue 组合式 API 钩子
 */
export function useModuleHooks(): ModuleHookManager {
  // 动态导入 Vue 的 inject 函数
  let inject: any;
  try {
    inject = require('vue').inject;
  } catch {
    throw new Error('Vue 未找到，请确保已安装 Vue');
  }
  
  const hookManager = inject('moduleHooks') as ModuleHookManager;
  
  if (!hookManager) {
    throw new Error('模块钩子管理器未找到，请确保已安装 Vue 模块钩子插件');
  }
  
  return hookManager;
}

/**
 * 创建模块钩子装饰器
 */
export function createModuleHookDecorator(hookManager: ModuleHookManager) {
  return {
    /**
     * 方法执行前钩子装饰器
     */
    beforeMethod(hookName: string) {
      return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        
        descriptor.value = async function(...args: any[]) {
          await hookManager.beforeLoad.callAsync({
            target: this,
            method: propertyKey,
            args,
            hookName
          });
          
          return originalMethod.apply(this, args);
        };
        
        return descriptor;
      };
    },

    /**
     * 方法执行后钩子装饰器
     */
    afterMethod(hookName: string) {
      return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        
        descriptor.value = async function(...args: any[]) {
          const result = await originalMethod.apply(this, args);
          
          await hookManager.afterLoad.callAsync({
            target: this,
            method: propertyKey,
            args,
            result,
            hookName
          });
          
          return result;
        };
        
        return descriptor;
      };
    },

    /**
     * 错误处理钩子装饰器
     */
    catchError(hookName: string) {
      return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        
        descriptor.value = async function(...args: any[]) {
          try {
            return await originalMethod.apply(this, args);
          } catch (error) {
            await hookManager.onError.callAsync({
              target: this,
              method: propertyKey,
              args,
              error: error as Error,
              hookName
            });
            
            throw error;
          }
        };
        
        return descriptor;
      };
    }
  };
}

// 默认导出
export default createVueModuleHookPlugin;