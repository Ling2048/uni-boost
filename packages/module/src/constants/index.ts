// 文件路径常量
export const FILE_PATHS = {
  MODULE_JSON: 'module.json',
  PAGES_JSON: 'src/pages.json',
  VIRTUAL_MODULE_ID: 'virtual:uni-boost-modules',
  VIRTUAL_MODULE_RESOLVED_ID: '\0virtual:uni-boost-modules'
} as const;

// 默认配置
export const DEFAULT_CONFIG = {
  MODULE_PATH: 'src/modules',
  PAGES_TYPE: 'pages',
  ENABLE_HMR: true,
  LOG_LEVEL: 'info'
} as const;

// 错误消息
export const ERROR_MESSAGES = {
  MODULE_JSON_NOT_FOUND: 'module.json 文件未找到',
  INVALID_MODULE_CONFIG: '无效的模块配置',
  PAGES_JSON_NOT_FOUND: 'pages.json 文件未找到',
  FILE_READ_ERROR: '文件读取失败',
  FILE_WRITE_ERROR: '文件写入失败'
} as const;

// 日志级别
export const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
} as const;

export type LogLevel = keyof typeof LOG_LEVELS;