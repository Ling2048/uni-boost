# uni-boost

基于 pnpm workspace 的 TypeScript Monorepo 项目，为 UniApp 提供模块化增强功能。

## 项目结构

```
.
├── packages/          # 包目录
│   └── module/       # 模块化功能包 (@uni-boost/module)
├── shared/           # 共享配置
│   └── tsconfig/     # TypeScript 配置
├── pnpm-workspace.yaml
└── vitest.config.ts  # 测试配置
```

## 功能特性

- 🚀 **模块化架构** - 支持页面模块的动态加载和管理
- 🔥 **热更新支持** - 开发时模块配置变更自动刷新
- 📦 **静态资源处理** - 自动复制和管理模块静态资源
- 🎯 **路由增强** - 模块化路由配置和管理
- 🔌 **插件系统** - 可扩展的插件架构，支持工厂模式
- 🛠️ **TypeScript** - 完整的类型支持
- ⚡ **虚拟模块** - 支持动态生成虚拟模块
- 🎨 **Vue 集成** - 提供 Vue 钩子管理和组合式 API
- 📊 **配置管理** - 统一的配置管理器，支持缓存和验证
- 🔍 **日志系统** - 可配置的日志级别和输出

## 快速开始

### 安装

```bash
# 安装依赖
pnpm install

# 构建项目
pnpm build
```

### 使用

在你的 UniApp 项目中安装并使用：

```bash
pnpm add @uni-boost/module
```

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import { createUniBoostPlugins } from '@uni-boost/module'

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

### 开发

```bash
# 运行所有测试
pnpm test

# 监听模式运行测试
pnpm -F @uni-boost/module test:watch

# 构建模块包
pnpm -F @uni-boost/module build
```

## 模块配置

### 页面模块结构

```
src/modules/
├── user/
│   ├── module.json      # 模块配置
│   ├── pages/           # 页面文件
│   └── static/          # 静态资源
└── order/
    ├── module.json
    ├── pages/
    └── static/
```

### module.json 配置示例

```json
{
  "hookPlugins": [
    "./hooks/user-hook.js"
  ],
  "setting": {
    "pages": [
      {
        "path": "pages/user/index",
        "style": {
          "navigationBarTitleText": "用户中心"
        }
      }
    ],
    "subPackages": [
      {
        "root": "user",
        "pages": ["pages/profile"],
        "asyncComponent": true
      }
    ]
  },
  "route": {
    "/user": "pages/user/index"
  },
  "static": "static"
}
```

### 钩子插件示例

```javascript
// hooks/user-hook.js
export default class UserHook {
  constructor() {
    this.name = 'UserHook'
  }
  
  beforeLoad() {
    console.log('用户模块加载前')
  }
  
  afterLoad() {
    console.log('用户模块加载后')
  }
  
  onError(error) {
    console.error('用户模块错误:', error)
  }
}
```

### pages.json 配置

在主项目的 `pages.json` 中启用模块：

```json
{
  "pageModules": {
    "user": true,
    "order": true
  }
}
```

## API 文档

### createUniBoostPlugins(config)

主要的插件函数，使用重构后的架构创建 Vite 插件数组。

**参数：**
- `config.modulePath` - 模块目录路径，默认 `'src/modules'`
- `config.fileName` - pages.json 文件名，默认 `'pages.json'`
- `config.src` - 源码目录，默认 `'src'`
- `config.pagesType?` - 页面类型，可选
- `config.enableHmr?` - 是否启用热更新，默认 `true`
- `config.logLevel?` - 日志级别，可选值：`'debug' | 'info' | 'warn' | 'error'`

**返回：**
- `Promise<Plugin[]>` - Vite 插件数组

### 配置管理

#### ConfigManager

配置管理器，负责加载和管理模块配置。

```typescript
import { ConfigManager } from '@uni-boost/module'

const configManager = new ConfigManager({
  modulePath: 'src/modules',
  fileName: 'pages.json',
  src: 'src'
})
```

#### PluginFactory

插件工厂，用于创建各种插件实例。

```typescript
import { PluginFactory } from '@uni-boost/module'

const pluginFactory = new PluginFactory(configManager)
```

### 插件列表

- **PageModule** - 核心模块处理插件，负责处理 pages.json 的生成和热更新
- **PageModuleStatic** - 静态资源复制插件，自动复制模块静态资源
- **PageModuleHook** - 模块钩子插件，支持模块级别的钩子函数
- **PageModuleRoute** - 路由管理插件，处理模块化路由配置
- **InterceptDefine** - 定义拦截插件，处理环境变量和定义

### Vue 集成

项目还提供了 Vue 相关的钩子管理功能：

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

### 虚拟模块

支持创建虚拟模块：

```typescript
import { virtualModule, createVirtualModules } from '@uni-boost/module'

// 单个虚拟模块
const plugin = virtualModule({
  moduleId: 'virtual:my-module',
  content: 'export default { message: "Hello" }',
  enableHmr: true
})

// 多个虚拟模块
const plugins = createVirtualModules({
  'my-module-1': { content: 'export default {}' },
  'my-module-2': { content: 'export const data = []' }
})
```

## 版本发布

使用 Changesets 管理版本和变更：

```bash
# 创建变更集
pnpm changeset

# 更新版本
pnpm version

# 发布包
pnpm release
```

## 架构设计

### 核心组件

- **ConfigManager** - 配置管理器，负责加载、验证和缓存模块配置
- **PluginFactory** - 插件工厂，使用工厂模式创建和管理插件实例
- **ModuleHookManager** - 钩子管理器，提供模块级别的生命周期钩子
- **VirtualModulePlugin** - 虚拟模块插件，支持动态生成模块内容

### 插件架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   ConfigManager │────│  PluginFactory  │────│   Vite Plugins  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Module Loader  │    │  Hook Manager   │    │ Virtual Modules │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 数据流

1. **配置加载** - ConfigManager 扫描并加载所有模块配置
2. **插件创建** - PluginFactory 根据配置创建相应的插件实例
3. **模块处理** - 各插件协同工作，处理页面、路由、静态资源等
4. **热更新** - 监听配置变更，自动重新加载和更新

## 贡献指南

### 开发环境

```bash
# 克隆仓库
git clone https://github.com/Ling2048/uni-boost.git
cd uni-boost

# 安装依赖
pnpm install

# 构建项目
pnpm build

# 运行测试
pnpm test
```

### 提交规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat:` 新功能
- `fix:` 修复 bug
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 构建过程或辅助工具的变动

### 贡献流程

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开 Pull Request

### 代码规范

- 使用 TypeScript 编写代码
- 遵循 ESLint 和 Prettier 配置
- 为新功能添加相应的测试
- 更新相关文档

## License

MIT