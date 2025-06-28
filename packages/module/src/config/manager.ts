import { UniBoostConfig, ModuleConfig, PagesJson, ModuleData } from '../types/index.js';
import { DEFAULT_CONFIG, FILE_PATHS } from '../constants/index.js';
import { validateModuleConfig } from '../utils/validation.js';
import { readJsonFile, writeJsonFile, fileExists, resolvePath, joinPath } from '../utils/file.js';
import { logger } from '../utils/logger.js';
import { glob } from 'glob';
import isArray from 'lodash-es/isArray.js';
import mergeWith from 'lodash-es/mergeWith.js';

// 自定义合并函数
const customizer = (objValue: string | any[], srcValue: any) => {
  if (isArray(objValue)) {
    return objValue.concat(srcValue);
  }
};

export class ConfigManager {
  private config: UniBoostConfig;
  private moduleCache: Map<string, ModuleData> = new Map();

  constructor(userConfig: Partial<UniBoostConfig> = {}) {
    this.config = {
      modulePath: userConfig.modulePath || DEFAULT_CONFIG.MODULE_PATH,
      pagesType: userConfig.pagesType || DEFAULT_CONFIG.PAGES_TYPE,
      enableHmr: userConfig.enableHmr ?? DEFAULT_CONFIG.ENABLE_HMR,
      logLevel: userConfig.logLevel || DEFAULT_CONFIG.LOG_LEVEL,
      fileName: userConfig.fileName || 'pages.json',
      src: userConfig.src || 'src'
    };

    // 设置日志级别
    logger.setLevel(this.config.logLevel || 'info');
    logger.info('ConfigManager 初始化完成', this.config);
  }

  getConfig(): UniBoostConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<UniBoostConfig>): void {
    this.config = { ...this.config, ...updates };
    if (updates.logLevel) {
      logger.setLevel(updates.logLevel);
    }
    logger.info('配置已更新', updates);
  }

  /**
   * 初始化配置管理器
   */
  async initialize(): Promise<void> {
    logger.debug('ConfigManager 初始化开始');
    // 这里可以添加初始化逻辑，比如验证路径等
    logger.debug('ConfigManager 初始化完成');
  }

  /**
   * 扫描并加载所有模块配置
   */
  async loadModules(): Promise<ModuleData[]> {
    logger.time('加载模块配置');
    
    try {
      const pattern = joinPath(this.config.modulePath, '**', FILE_PATHS.MODULE_JSON);
      const moduleFiles = await glob(pattern);
      
      logger.debug(`找到 ${moduleFiles.length} 个模块配置文件`);
      
      const modules: ModuleData[] = [];
      
      for (const filePath of moduleFiles) {
        const moduleData = this.loadSingleModule(filePath);
        if (moduleData) {
          modules.push(moduleData);
          this.moduleCache.set(moduleData.key, moduleData);
        }
      }
      
      logger.info(`成功加载 ${modules.length} 个模块`);
      return modules;
    } catch (error) {
      logger.error('加载模块配置失败', error as Error);
      return [];
    } finally {
      logger.timeEnd('加载模块配置');
    }
  }

  /**
   * 加载单个模块配置
   */
  private loadSingleModule(filePath: string): ModuleData | null {
    try {
      const config = readJsonFile<ModuleConfig>(filePath);
      if (!config) {
        return null;
      }

      validateModuleConfig(config);
      
      const key = this.generateModuleKey(filePath);
      
      logger.debug(`加载模块: ${key}`);
      
      return {
        json: config,
        key,
        filePath: resolvePath(filePath)
      };
    } catch (error) {
      logger.error(`加载模块失败: ${filePath}`, error as Error);
      return null;
    }
  }

  /**
   * 生成模块唯一标识
   */
  private generateModuleKey(filePath: string): string {
    const relativePath = filePath.replace(this.config.modulePath, '');
    return relativePath
      .replace(/[\\/]/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-module\.json$/, '');
  }

  /**
   * 读取 pages.json 配置
   */
  loadPagesJson(): PagesJson | null {
    const pagesJsonPath = resolvePath(FILE_PATHS.PAGES_JSON);
    
    if (!fileExists(pagesJsonPath)) {
      logger.warn('pages.json 文件不存在');
      return null;
    }

    try {
      const pagesJson = readJsonFile<PagesJson>(pagesJsonPath);
      logger.debug('pages.json 加载成功');
      return pagesJson;
    } catch (error) {
      logger.error('读取 pages.json 失败', error as Error);
      return null;
    }
  }

  /**
   * 保存 pages.json 配置
   */
  savePagesJson(pagesJson: PagesJson): boolean {
    const pagesJsonPath = resolvePath(FILE_PATHS.PAGES_JSON);
    
    try {
      const success = writeJsonFile(pagesJsonPath, pagesJson);
      if (success) {
        logger.info('pages.json 保存成功');
      }
      return success;
    } catch (error) {
      logger.error('保存 pages.json 失败', error as Error);
      return false;
    }
  }

  /**
   * 获取缓存的模块数据
   */
  getCachedModule(key: string): ModuleData | undefined {
    return this.moduleCache.get(key);
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.moduleCache.clear();
    logger.debug('模块缓存已清除');
  }

  /**
   * 加载所有必要的数据
   */
  async loadData(): Promise<{
    fileName: string;
    src: string;
    modules: ModuleData[];
  }> {
    const modules = await this.loadModules();
    return {
      fileName: this.config.fileName,
      src: this.config.src,
      modules
    };
  }

  /**
   * 获取所有缓存的模块
   */
  getAllCachedModules(): ModuleData[] {
    return Array.from(this.moduleCache.values());
  }

  /**
   * 获取完整的 pages.json 配置和模块数据
   * 替代原有的 getPagesJson 方法
   */
  async getCompleteConfig(): Promise<{
    json: PagesJson;
    files: Set<string>;
    modules: ModuleData[];
  }> {
    logger.time('获取完整配置');
    
    const files = new Set<string>();
    let pagesJson: PagesJson = {};
    
    try {
      // 加载 pages.json
      const loadedPagesJson = this.loadPagesJson();
      if (loadedPagesJson) {
        pagesJson = loadedPagesJson;
        files.add(resolvePath(FILE_PATHS.PAGES_JSON));
      }
      
      // 加载所有模块
      const modules = await this.loadModules();
      
      // 添加模块文件路径到监听列表
      modules.forEach(module => {
        files.add(module.filePath);
      });
      
      // 合并模块配置到 pages.json
      if (pagesJson.pageModules && modules.length > 0) {
        modules.forEach(moduleData => {
          if (moduleData.json.setting) {
            pagesJson = mergeWith(pagesJson, moduleData.json.setting, customizer);
            
            // 处理异步组件包名
            pagesJson.asyncPackageNames = pagesJson.asyncPackageNames || [];
            
            if (moduleData.json.setting.subPackages) {
              moduleData.json.setting.subPackages.forEach((pack) => {
                if (pack.asyncComponent && pack.root) {
                  pagesJson.asyncPackageNames?.push(pack.root);
                }
              });
            }
          }
        });
      }
      
      logger.info(`成功处理 ${modules.length} 个模块`);
      
      return {
        json: pagesJson,
        files,
        modules
      };
    } catch (error) {
      logger.error('获取完整配置失败', error as Error);
      return {
        json: {},
        files,
        modules: []
      };
    } finally {
      logger.timeEnd('获取完整配置');
    }
  }
}