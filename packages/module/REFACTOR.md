# UniBoost Module 重构说明

## 重构概述

本次重构旨在提高代码质量、可维护性和扩展性，采用了现代化的架构设计模式。

## 新的目录结构

```
src/
├── types/           # 类型定义
│   └── index.ts     # 统一的类型定义
├── constants/       # 常量管理
│   └── index.ts     # 应用常量
├── utils/           # 工具函数
│   ├── validation.ts # 验证和错误处理
│   ├── logger.ts    # 日志系统
│   └── file.ts      # 文件操作工具
├── config/          # 配置管理
│   └── manager.ts   # 配置管理器
├── factories/       # 工厂模式
│   └── plugin-factory.ts # 插件工厂
├── plugins/         # 插件实现（保持原有）
│   ├── module.ts
│   ├── static.ts
│   ├── hook.ts
│   ├── route.ts
│   └── intercept-define.ts
├── index.ts         # 主入口文件
└── common.ts        # 兼容性函数（已重构）
```

## 主要改进

### 1. 类型安全
- 统一的 TypeScript 类型定义
- 严格的类型检查
- 完整的接口定义

### 2. 错误处理
- 自定义 `ValidationError` 类
- 完善的数据验证函数
- 安全的 JSON 解析

### 3. 日志系统
- 分级日志记录（debug, info, warn, error）
- 可配置的日志级别
- 性能计时功能

### 4. 配置管理
- `ConfigManager` 类统一管理配置
- 模块缓存机制
- 配置验证和默认值

### 5. 插件工厂
- 工厂模式创建插件
- 插件缓存优化
- 批量插件创建

## 新的使用方式

### 推荐用法（新接口）

```typescript
import { createUniBoostPlugins } from '@uni-boost/module';

// Vite 配置
export default {
  plugins: [
    ...await createUniBoostPlugins({
      modulePath: 'src/modules',
      enableHmr: true,
      logLevel: 'info'
    })
  ]
};
```

### 兼容用法（原接口）

```typescript
import { PageModules } from '@uni-boost/module';

// 保持向后兼容
export default {
  plugins: [
    ...await PageModules({ modulePath: 'src/modules' })
  ]
};
```

## 配置选项

```typescript
interface UniBoostConfig {
  modulePath: string;        // 模块路径，默认 'src/modules'
  pagesType?: string;        // 页面类型，默认 'pages'
  enableHmr?: boolean;       // 启用热更新，默认 true
  logLevel?: 'debug' | 'info' | 'warn' | 'error'; // 日志级别，默认 'info'
}
```

## 高级用法

### 自定义配置管理

```typescript
import { ConfigManager } from '@uni-boost/module';

const configManager = new ConfigManager({
  modulePath: 'src/modules',
  logLevel: 'debug'
});

// 加载模块
const modules = await configManager.loadModules();

// 读取 pages.json
const pagesJson = configManager.loadPagesJson();
```

### 自定义插件工厂

```typescript
import { PluginFactory, ConfigManager } from '@uni-boost/module';

const configManager = new ConfigManager();
const pluginFactory = new PluginFactory(configManager);

// 创建特定插件
const modulePlugin = pluginFactory.createPlugin({
  type: 'module',
  options: { /* 自定义选项 */ }
});
```

## 迁移指南

### 从旧版本迁移

1. **更新导入**：
   ```typescript
   // 旧版本
   import { PageModules } from '@uni-boost/module';
   
   // 新版本（推荐）
   import { createUniBoostPlugins } from '@uni-boost/module';
   ```

2. **更新配置**：
   ```typescript
   // 旧版本
   PageModules({ modulePath: 'src/modules' })
   
   // 新版本
   createUniBoostPlugins({
     modulePath: 'src/modules',
     logLevel: 'info'
   })
   ```

3. **类型支持**：
   ```typescript
   import type { UniBoostConfig, ModuleConfig } from '@uni-boost/module';
   ```

## 性能优化

- **模块缓存**：避免重复加载相同模块
- **插件缓存**：复用已创建的插件实例
- **懒加载**：按需加载模块配置
- **批量处理**：优化文件 I/O 操作

## 调试和监控

### 启用调试日志

```typescript
createUniBoostPlugins({
  logLevel: 'debug'
});
```

### 性能监控

```typescript
import { logger } from '@uni-boost/module';

// 自定义计时
logger.time('自定义操作');
// ... 执行操作
logger.timeEnd('自定义操作');
```

## 错误处理

### 捕获验证错误

```typescript
import { ValidationError } from '@uni-boost/module';

try {
  await createUniBoostPlugins(config);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('配置验证失败:', error.message);
  }
}
```

## 贡献指南

1. 遵循现有的代码结构和命名约定
2. 添加适当的类型定义
3. 包含错误处理和日志记录
4. 编写单元测试
5. 更新文档

## 后续计划

- [ ] 完善单元测试覆盖率
- [ ] 添加集成测试
- [ ] 性能基准测试
- [ ] 插件热重载支持
- [ ] 配置文件监听
- [ ] 更多插件类型支持