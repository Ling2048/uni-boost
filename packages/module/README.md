# uni-boost-module

一个强大的 UniApp 模块系统，具有插件架构、虚拟模块和 Vue 集成功能。

## 安装

```bash
npm install uni-boost-module
# 或
pnpm add uni-boost-module
# 或
yarn add uni-boost-module
```

## 快速开始

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import { createUniBoostPlugins } from 'uni-boost-module';

export default defineConfig({
  plugins: [
    // 其他插件...
    ...(await createUniBoostPlugins({
      modulePath: 'src/modules',
      fileName: 'pages.json',
      src: 'src'
    }))
  ]
})
```

## 主要功能

- 🚀 **模块化架构** - 支持模块化的页面和组件管理
- 🔌 **插件系统** - 灵活的插件架构，支持自定义插件
- 🎯 **虚拟模块** - 动态生成虚拟模块，提高开发效率
- 🔧 **Vue 集成** - 深度集成 Vue 3，支持组合式 API
- 📝 **TypeScript 支持** - 完整的 TypeScript 类型定义
- 🔥 **热更新** - 支持开发时热更新
- 📊 **日志系统** - 完善的日志记录和调试功能

## API 文档

### createUniBoostPlugins

创建 UniBoost 插件集合的主要函数。

```typescript
interface UniBoostConfig {
  modulePath?: string;     // 模块路径，默认 'src/modules'
  pagesType?: 'json' | 'ts'; // 页面配置类型，默认 'json'
  enableHmr?: boolean;     // 是否启用热更新，默认 true
  logLevel?: 'debug' | 'info' | 'warn' | 'error'; // 日志级别，默认 'info'
  fileName?: string;       // 配置文件名，默认 'pages.json'
  src?: string;           // 源码目录，默认 'src'
}
```

### Vue 集成

```typescript
import { createVueModuleHookPlugin, useModuleHooks } from '@uni-boost/module'

// Vue 插件
app.use(createVueModuleHookPlugin({
  enableLogging: true,
  autoRegisterGlobalHooks: true
}))

// 组合式 API
const moduleHooks = useModuleHooks()
```

## 许可证

MIT License - 详见 [LICENSE](../../LICENSE) 文件。

## 贡献

欢迎提交 Issue 和 Pull Request！

## 更多信息

更多详细文档请查看 [项目主页](https://github.com/your-username/uni-boost)。