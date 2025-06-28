export interface ModuleConfig {
  hookPlugins?: string[];
  setting: {
    pages: PageConfig[];
    subPackages?: SubPackageConfig[];
  };
  route?: Record<string, string>;
  static?: string;
}

export interface PageConfig {
  path: string;
  style?: Record<string, any>;
}

export interface SubPackageConfig {
  root: string;
  pages: string[];
  asyncComponent?: boolean;
}

export interface PagesJson {
  pageModules?: Record<string, boolean>;
  asyncPackageNames?: string[];
  pages?: PageConfig[];
  subPackages?: SubPackageConfig[];
}

export interface ModuleData {
  json: ModuleConfig;
  key: string;
  filePath: string;
}

export interface VirtualModuleOptions {
  content?: string;
  enableHmr?: boolean;
  moduleId?: string;
}

export interface UniBoostConfig {
  modulePath: string;
  pagesType?: string;
  enableHmr?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  fileName: string;
  src: string;
}

// 新增类型定义
export interface PluginConfig {
  fileName: string;
  src: string;
}

export interface RouteConfig {
  [key: string]: string;
}

export interface StaticTarget {
  src: string;
  dest: string;
  rename: string;
}

export interface HookTap {
  name: string;
  callback: Function;
  type: 'sync' | 'asyncSeries' | 'asyncParallel';
}

export interface HookInstance {
  tap(name: string, callback: Function): void;
  tapAsync(name: string, callback: Function): void;
  tapPromise(name: string, callback: Function): void;
  call(...args: any[]): void;
  callAsync(...args: any[]): Promise<void>;
  callParallel(...args: any[]): Promise<void>;
  clear(): void;
  readonly tapCount: number;
  getTapCountByType(type: HookTap['type']): number;
}

export interface DefineReplacements {
  [key: string]: boolean | string | number;
}