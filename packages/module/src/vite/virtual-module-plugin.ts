import type { Plugin } from 'vite';
import type { VirtualModuleOptions } from '../types/index.js';
import { logger } from '../utils/logger.js';

export interface VirtualModulePluginOptions extends VirtualModuleOptions {
  enableLogging?: boolean;
  hmrCallback?: string;
  validateContent?: (content: string) => boolean;
  transformContent?: (content: string) => string;
  onModuleCreated?: (moduleId: string) => void;
  onModuleLoaded?: (moduleId: string, content: string) => void;
}

export interface VirtualModuleStats {
  moduleId: string;
  resolveCount: number;
  loadCount: number;
  lastLoaded: Date | null;
  contentLength: number;
}

/**
 * 虚拟模块插件
 * @param options 配置选项
 * @returns Vite 插件
 */
export default function virtualModule(
  options: VirtualModulePluginOptions = {}
): Plugin {
  const {
    content = 'export default {};',
    enableHmr = false,
    moduleId = 'virtual:my-module',
    enableLogging = false,
    hmrCallback = 'console.log("Virtual module updated:", newModule.default)',
    validateContent,
    transformContent,
    onModuleCreated,
    onModuleLoaded
  } = options;

  const virtualModuleId = moduleId;
  const resolvedVirtualModuleId = `\0${virtualModuleId}`;
  
  // 统计信息
  const stats: VirtualModuleStats = {
    moduleId,
    resolveCount: 0,
    loadCount: 0,
    lastLoaded: null,
    contentLength: content.length
  };

  // 验证模块ID格式
  if (!moduleId.startsWith('virtual:')) {
    logger.warn(`虚拟模块ID建议以 'virtual:' 开头: ${moduleId}`);
  }

  if (enableLogging) {
    logger.debug(`创建虚拟模块: ${moduleId}`);
  }

  // 触发模块创建回调
  onModuleCreated?.(moduleId);

  return {
    name: 'uni-boost:virtual-module',

    // 解析模块ID
    resolveId(id: string) {
      if (id === virtualModuleId) {
        stats.resolveCount++;
        
        if (enableLogging) {
          logger.debug(`解析虚拟模块ID: ${id} (第 ${stats.resolveCount} 次)`);
        }
        
        return resolvedVirtualModuleId;
      }
      return null;
    },

    // 加载模块内容
    load(id: string) {
      if (id === resolvedVirtualModuleId) {
        stats.loadCount++;
        stats.lastLoaded = new Date();
        
        if (enableLogging) {
          logger.debug(`加载虚拟模块内容: ${id} (第 ${stats.loadCount} 次)`);
        }

        try {
          // 验证内容
          if (!content || typeof content !== 'string') {
            const errorMsg = `虚拟模块 ${moduleId} 的内容无效`;
            logger.error(errorMsg);
            return 'export default {};';
          }

          // 自定义内容验证
          if (validateContent && !validateContent(content)) {
            const errorMsg = `虚拟模块 ${moduleId} 内容验证失败`;
            logger.error(errorMsg);
            return 'export default {};';
          }

          // 内容转换
          let finalContent = content;
          if (transformContent) {
            try {
              finalContent = transformContent(content);
              if (enableLogging) {
                logger.debug(`虚拟模块 ${moduleId} 内容已转换`);
              }
            } catch (error) {
              logger.error(`虚拟模块 ${moduleId} 内容转换失败`, error as Error);
              finalContent = content; // 回退到原始内容
            }
          }

          // 更新统计信息
          stats.contentLength = finalContent.length;

          // 支持热更新
          if (enableHmr) {
            const hmrCode = `

if (import.meta.hot) {
  import.meta.hot.accept(newModule => {
    try {
      ${hmrCallback}
    } catch (error) {
      console.error('虚拟模块热更新回调执行失败:', error);
    }
  });
}`;
            finalContent += hmrCode;
          }

          // 触发模块加载回调
          onModuleLoaded?.(moduleId, finalContent);

          return finalContent;
        } catch (error) {
          logger.error(`虚拟模块 ${moduleId} 加载失败`, error as Error);
          return 'export default {};';
        }
      }
      return null;
    },

    // 开发服务器配置
    configureServer(server) {
      if (enableLogging) {
        // 添加中间件显示虚拟模块统计信息
        server.middlewares.use('/__virtual-module-stats', (req, res) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(stats, null, 2));
        });
      }
    },

    // 构建钩子
    buildStart() {
      if (enableLogging) {
        logger.debug(`虚拟模块 ${moduleId} 构建开始`);
      }
    },

    buildEnd() {
      if (enableLogging) {
        logger.debug(`虚拟模块 ${moduleId} 构建结束，统计信息:`, {
          resolveCount: stats.resolveCount,
          loadCount: stats.loadCount,
          contentLength: stats.contentLength
        });
      }
    }
  };
}

/**
 * 创建多个虚拟模块的便捷函数
 */
export function createVirtualModules(
  modules: Record<string, VirtualModulePluginOptions>
): Plugin[] {
  return Object.entries(modules).map(([id, options]) => {
    return virtualModule({
      moduleId: id.startsWith('virtual:') ? id : `virtual:${id}`,
      ...options
    });
  });
}

/**
 * 虚拟模块内容生成器
 */
export class VirtualModuleContentBuilder {
  private imports: string[] = [];
  private exports: string[] = [];
  private content: string[] = [];

  addImport(importStatement: string): this {
    this.imports.push(importStatement);
    return this;
  }

  addExport(exportStatement: string): this {
    this.exports.push(exportStatement);
    return this;
  }

  addContent(content: string): this {
    this.content.push(content);
    return this;
  }

  build(): string {
    const parts = [
      ...this.imports,
      '',
      ...this.content,
      '',
      ...this.exports
    ];
    
    return parts.filter(part => part !== undefined).join('\n');
  }

  clear(): this {
    this.imports = [];
    this.exports = [];
    this.content = [];
    return this;
  }
}
