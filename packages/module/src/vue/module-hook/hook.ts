import type { HookTap, HookInstance } from '../../types/index.js';
import { logger } from '../../utils/logger.js';

export interface HookOptions {
  enableLogging?: boolean;
  maxTaps?: number;
}

/**
 * 钩子管理类，支持同步和异步钩子
 */
export default class Hook implements HookInstance {
  private taps: HookTap[] = [];
  private options: HookOptions;

  constructor(options: HookOptions = {}) {
    this.options = {
      enableLogging: false,
      maxTaps: 100,
      ...options
    };
  }

  /**
   * 注册同步回调
   * @param name 钩子名称
   * @param callback 回调函数
   */
  tap(name: string, callback: Function): void {
    this.validateTap(name, callback);
    this.addTap({ name, callback, type: 'sync' });
  }

  /**
   * 注册异步串行回调
   * @param name 钩子名称
   * @param callback 回调函数
   */
  tapAsync(name: string, callback: Function): void {
    this.validateTap(name, callback);
    this.addTap({ name, callback, type: 'asyncSeries' });
  }

  /**
   * 注册异步并行回调
   * @param name 钩子名称
   * @param callback 回调函数
   */
  tapPromise(name: string, callback: Function): void {
    this.validateTap(name, callback);
    this.addTap({ name, callback, type: 'asyncParallel' });
  }

  /**
   * 执行同步钩子
   * @param args 参数
   */
  call(...args: any[]): void {
    const syncTaps = this.taps.filter(tap => tap.type === 'sync');
    
    if (this.options.enableLogging) {
      logger.debug(`执行 ${syncTaps.length} 个同步钩子`);
    }

    for (const { name, callback } of syncTaps) {
      try {
        callback(...args);
        
        if (this.options.enableLogging) {
          logger.debug(`同步钩子 ${name} 执行成功`);
        }
      } catch (error) {
        logger.error(`同步钩子 ${name} 执行失败`, error as Error);
      }
    }
  }

  /**
   * 执行异步串行钩子
   * @param args 参数
   */
  async callAsync(...args: any[]): Promise<void> {
    const asyncTaps = this.taps.filter(tap => tap.type === 'asyncSeries');
    
    if (this.options.enableLogging) {
      logger.debug(`执行 ${asyncTaps.length} 个异步串行钩子`);
    }

    for (const { name, callback } of asyncTaps) {
      try {
        await callback(...args);
        
        if (this.options.enableLogging) {
          logger.debug(`异步串行钩子 ${name} 执行成功`);
        }
      } catch (error) {
        logger.error(`异步串行钩子 ${name} 执行失败`, error as Error);
      }
    }
  }

  /**
   * 执行异步并行钩子
   * @param args 参数
   */
  async callParallel(...args: any[]): Promise<void> {
    const parallelTaps = this.taps.filter(tap => tap.type === 'asyncParallel');
    
    if (this.options.enableLogging) {
      logger.debug(`执行 ${parallelTaps.length} 个异步并行钩子`);
    }

    const promises = parallelTaps.map(async ({ name, callback }) => {
      try {
        await callback(...args);
        
        if (this.options.enableLogging) {
          logger.debug(`异步并行钩子 ${name} 执行成功`);
        }
      } catch (error) {
        logger.error(`异步并行钩子 ${name} 执行失败`, error as Error);
        throw error;
      }
    });

    try {
      await Promise.all(promises);
    } catch (error) {
      logger.error('异步并行钩子执行过程中出现错误', error as Error);
      throw error;
    }
  }

  /**
   * 清除所有回调
   */
  clear(): void {
    const count = this.taps.length;
    this.taps = [];
    
    if (this.options.enableLogging) {
      logger.debug(`清除了 ${count} 个钩子`);
    }
  }

  /**
   * 获取钩子数量
   */
  get tapCount(): number {
    return this.taps.length;
  }

  /**
   * 获取指定类型的钩子数量
   */
  getTapCountByType(type: HookTap['type']): number {
    return this.taps.filter(tap => tap.type === type).length;
  }

  /**
   * 验证钩子参数
   */
  private validateTap(name: string, callback: Function): void {
    if (!name || typeof name !== 'string') {
      throw new Error('钩子名称必须是非空字符串');
    }

    if (typeof callback !== 'function') {
      throw new Error('回调必须是函数');
    }

    if (this.taps.length >= (this.options.maxTaps || 100)) {
      throw new Error(`钩子数量超过限制: ${this.options.maxTaps}`);
    }
  }

  /**
   * 添加钩子
   */
  private addTap(tap: HookTap): void {
    // 检查是否已存在同名钩子
    const existingIndex = this.taps.findIndex(t => t.name === tap.name && t.type === tap.type);
    
    if (existingIndex >= 0) {
      if (this.options.enableLogging) {
        logger.warn(`替换已存在的钩子: ${tap.name} (${tap.type})`);
      }
      this.taps[existingIndex] = tap;
    } else {
      this.taps.push(tap);
      
      if (this.options.enableLogging) {
        logger.debug(`添加钩子: ${tap.name} (${tap.type})`);
      }
    }
  }
}
