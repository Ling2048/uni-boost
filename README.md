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
- 🔌 **插件系统** - 可扩展的插件架构
- 🛠️ **TypeScript** - 完整的类型支持

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
import { PageModules } from '@uni-boost/module'

export default defineConfig({
  plugins: [
    // 其他插件...
    ...(await PageModules({ modulePath: 'src/modules' }))
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

### PageModules(options)

主要的插件函数，返回 Vite 插件数组。

**参数：**
- `options.modulePath` - 模块目录路径，相对于项目根目录

**返回：**
- `Promise<Plugin[]>` - Vite 插件数组

### 插件列表

- **PageModule** - 核心模块处理插件
- **PageModuleStatic** - 静态资源复制插件
- **PageModuleHook** - 模块钩子插件
- **PageModuleRoute** - 路由管理插件
- **InterceptDefine** - 定义拦截插件

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

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开 Pull Request

## License

MIT