# 发布指南

本文档说明如何将 `uni-boost-module` 包发布到 npm。

## 准备工作

### 1. 注册 npm 账号

如果还没有 npm 账号，请先注册：
- 访问 [npmjs.com](https://www.npmjs.com/)
- 点击 "Sign Up" 注册账号
- 验证邮箱

### 2. 登录 npm

```bash
npm login
```

输入用户名、密码和邮箱完成登录。

### 3. 验证登录状态

```bash
npm whoami
```

应该显示你的用户名。

## 发布步骤

### 方法一：使用跨平台发布脚本（推荐）

#### Node.js 版本（所有平台通用）
```bash
# 使用 Node.js 脚本（推荐）
pnpm run publish:cross-platform
# 或
node scripts/publish.js
```

#### 平台特定脚本

**macOS/Linux:**
```bash
# 使用 Bash 脚本
pnpm run publish:bash
# 或
./scripts/publish.sh
```

**Windows:**
```cmd
REM 使用批处理脚本
npm run publish:windows
REM 或
scripts\publish.bat
```

所有脚本都会自动：
- 检测操作系统
- 检查必要工具（Node.js, npm, pnpm）
- 检查 npm 登录状态
- 构建项目
- 运行测试
- 检查版本冲突
- 发布到 npm

### 方法二：手动发布

1. **构建项目**
   ```bash
   pnpm build
   ```

2. **进入包目录**
   ```bash
   cd packages/module
   ```

3. **运行测试**
   ```bash
   npm test
   ```

4. **发布包**
   ```bash
   npm publish
   ```

### 方法三：使用 Changesets（推荐用于版本管理）

```bash
# 创建变更集
pnpm changeset

# 更新版本
pnpm version

# 发布包
pnpm release
```

## 版本管理

### 更新版本号

在发布前，确保更新 `packages/module/package.json` 中的版本号：

```json
{
  "version": "0.1.1"  // 更新这里
}
```

### 版本规范

遵循 [语义化版本](https://semver.org/lang/zh-CN/) 规范：

- **主版本号**：不兼容的 API 修改
- **次版本号**：向下兼容的功能性新增
- **修订号**：向下兼容的问题修正

例如：
- `0.1.0` → `0.1.1`（修复 bug）
- `0.1.0` → `0.2.0`（新增功能）
- `0.1.0` → `1.0.0`（重大更新）

## 发布前检查清单

- [ ] 代码已提交到 Git
- [ ] 所有测试通过
- [ ] 版本号已更新
- [ ] README.md 已更新
- [ ] CHANGELOG.md 已更新（如果有）
- [ ] 已登录 npm
- [ ] 构建成功

## 发布后验证

1. **检查包页面**
   ```
   https://www.npmjs.com/package/uni-boost-module
   ```

2. **测试安装**
   ```bash
   npm install @uni-boost/module
   ```

3. **检查版本**
   ```bash
   npm view @uni-boost/module version
   ```

## 常见问题

### 1. 权限错误

如果遇到权限错误，确保：
- 已正确登录 npm
- 有发布权限（对于 scoped 包）

### 2. 版本冲突

如果版本已存在：
- 更新 `package.json` 中的版本号
- 重新发布

### 3. 网络问题

如果发布失败：
- 检查网络连接
- 尝试使用 npm 官方源：
  ```bash
  npm config set registry https://registry.npmjs.org/
  ```

## 环境变量配置

对于 CI/CD 自动发布，可以设置环境变量：

```bash
# 设置 npm token
export NPM_TOKEN=your_npm_token
```

## 撤销发布

如果需要撤销发布（仅限发布后 72 小时内）：

```bash
npm unpublish @uni-boost/module@版本号
```

**注意**：撤销发布会影响依赖该包的用户，请谨慎操作。