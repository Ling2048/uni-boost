# getPagesJson 方法优化指南

## 概述

本次优化将原有的 `getPagesJson` 方法替换为更加模块化和类型安全的 `ConfigManager.getCompleteConfig()` 方法。

## 主要改进

### 1. 架构优化
- **统一管理**: 将配置管理逻辑集中到 `ConfigManager` 类中
- **职责分离**: 分离了配置加载、缓存管理和数据处理的职责
- **可维护性**: 提高了代码的可读性和可维护性

### 2. 性能优化
- **缓存机制**: `ConfigManager` 内置模块缓存，避免重复加载
- **异步处理**: 保持异步加载模式，不阻塞主线程
- **内存优化**: 更好的内存管理和资源释放

### 3. 类型安全
- **强类型**: 完整的 TypeScript 类型定义
- **接口一致**: 保持与原 `getPagesJson` 相同的返回结构
- **错误处理**: 更完善的错误处理机制

## 使用方式对比

### 旧方式 (已弃用)
```typescript
import { getPagesJson } from './common';

// 在插件中使用
const data = await getPagesJson({
  fileName: 'pages.json',
  src: './src/modules'
});
```

### 新方式 (推荐)
```typescript
import { ConfigManager } from './config/manager';

// 创建配置管理器实例
const configManager = new ConfigManager({
  fileName: 'pages.json',
  src: './src/modules'
});

// 获取完整配置
const data = await configManager.getCompleteConfig();
```

## 返回数据结构

两种方式返回相同的数据结构：

```typescript
interface ConfigResult {
  json: PagesJson;        // 合并后的 pages.json 配置
  files: Set<string>;     // 需要监听的文件路径集合
  modules: ModuleData[];  // 加载的模块数据数组
}
```

## 迁移指南

### 1. 更新导入
```typescript
// 移除
import { getPagesJson } from './common';

// 添加
import { ConfigManager } from './config/manager';
```

### 2. 更新调用方式
```typescript
// 旧方式
const data = await getPagesJson({ fileName, src });

// 新方式
const configManager = new ConfigManager({ fileName, src });
const data = await configManager.getCompleteConfig();
```

### 3. 利用缓存优势
```typescript
// 可以复用 ConfigManager 实例来利用缓存
const configManager = new ConfigManager(config);

// 第一次调用会加载数据
const data1 = await configManager.getCompleteConfig();

// 后续调用会使用缓存（如果数据未变更）
const data2 = await configManager.getCompleteConfig();
```

## 优势总结

1. **更好的架构**: 职责分离，代码更清晰
2. **性能提升**: 内置缓存机制，减少重复加载
3. **类型安全**: 完整的 TypeScript 支持
4. **易于测试**: 模块化设计便于单元测试
5. **向后兼容**: 保持相同的 API 接口
6. **错误处理**: 更完善的错误处理和日志记录

## 注意事项

- ✅ 原 `getPagesJson`、`getModuleJson` 和 `PageModules` 等过期方法已被完全移除
- ✅ `common.ts` 文件已被删除，相关功能已迁移到 `ConfigManager`
- 新的 `ConfigManager.getCompleteConfig()` 方法提供了更好的性能和类型安全
- 推荐使用 `createUniBoostPlugins` 作为主要入口点