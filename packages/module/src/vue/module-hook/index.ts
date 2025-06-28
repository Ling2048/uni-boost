import Hook, { type HookOptions } from './hook.js';
import type { HookInstance } from '../../types/index.js';
import { logger } from '../../utils/logger.js';

export interface ModuleHookManager {
  beforeLoad: HookInstance;
  afterLoad: HookInstance;
  beforeUnload: HookInstance;
  afterUnload: HookInstance;
  onError: HookInstance;
  clearAll(): void;
  getStats(): ModuleHookStats;
  enableLogging(enabled: boolean): void;
}

export interface ModuleHookStats {
  beforeLoad: number;
  afterLoad: number;
  beforeUnload: number;
  afterUnload: number;
  onError: number;
  total: number;
}

export interface ModuleHookManagerOptions {
  enableLogging?: boolean;
  maxTapsPerHook?: number;
}

class ModuleHookManagerImpl implements ModuleHookManager {
  beforeLoad: HookInstance;
  afterLoad: HookInstance;
  beforeUnload: HookInstance;
  afterUnload: HookInstance;
  onError: HookInstance;
  
  private options: Required<ModuleHookManagerOptions>;

  constructor(options: ModuleHookManagerOptions = {}) {
    this.options = {
      enableLogging: false,
      maxTapsPerHook: 50,
      ...options
    };

    const hookOptions: HookOptions = {
      enableLogging: this.options.enableLogging,
      maxTaps: this.options.maxTapsPerHook
    };

    this.beforeLoad = new Hook(hookOptions);
    this.afterLoad = new Hook(hookOptions);
    this.beforeUnload = new Hook(hookOptions);
    this.afterUnload = new Hook(hookOptions);
    this.onError = new Hook(hookOptions);

    if (this.options.enableLogging) {
      logger.debug('模块钩子管理器已初始化');
    }
  }

  /**
   * 清除所有钩子
   */
  clearAll(): void {
    const stats = this.getStats();
    
    this.beforeLoad.clear();
    this.afterLoad.clear();
    this.beforeUnload.clear();
    this.afterUnload.clear();
    this.onError.clear();

    if (this.options.enableLogging) {
      logger.debug(`清除了所有钩子，总计: ${stats.total} 个`);
    }
  }

  /**
   * 获取钩子统计信息
   */
  getStats(): ModuleHookStats {
    const beforeLoad = this.beforeLoad.tapCount;
    const afterLoad = this.afterLoad.tapCount;
    const beforeUnload = this.beforeUnload.tapCount;
    const afterUnload = this.afterUnload.tapCount;
    const onError = this.onError.tapCount;
    
    return {
      beforeLoad,
      afterLoad,
      beforeUnload,
      afterUnload,
      onError,
      total: beforeLoad + afterLoad + beforeUnload + afterUnload + onError
    };
  }

  /**
   * 启用或禁用日志记录
   */
  enableLogging(enabled: boolean): void {
    this.options.enableLogging = enabled;
    
    // 更新所有钩子的日志设置
    const hooks = [this.beforeLoad, this.afterLoad, this.beforeUnload, this.afterUnload, this.onError];
    hooks.forEach(hook => {
      if (hook instanceof Hook) {
        (hook as any).options.enableLogging = enabled;
      }
    });

    if (enabled) {
      logger.debug('模块钩子管理器日志记录已启用');
    }
  }

  /**
   * 获取详细的钩子信息
   */
  getDetailedStats(): Record<string, { sync: number; asyncSeries: number; asyncParallel: number }> {
    const hooks = {
      beforeLoad: this.beforeLoad,
      afterLoad: this.afterLoad,
      beforeUnload: this.beforeUnload,
      afterUnload: this.afterUnload,
      onError: this.onError
    };

    const result: Record<string, { sync: number; asyncSeries: number; asyncParallel: number }> = {};
    
    Object.entries(hooks).forEach(([name, hook]) => {
      result[name] = {
        sync: hook.getTapCountByType('sync'),
        asyncSeries: hook.getTapCountByType('asyncSeries'),
        asyncParallel: hook.getTapCountByType('asyncParallel')
      };
    });

    return result;
  }
}

// 创建默认实例
const moduleHookManager = new ModuleHookManagerImpl();

export { ModuleHookManagerImpl };
export default moduleHookManager;
