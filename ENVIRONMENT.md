# 环境配置指南

本文档说明如何配置 `uni-boost` 项目的开发和发布环境。

## NPM 发布配置

### 方法一：使用 NPM Token（推荐用于 CI/CD）

1. **获取 NPM Token**
   - 登录 [npmjs.com](https://www.npmjs.com/)
   - 访问 [Access Tokens](https://www.npmjs.com/settings/tokens)
   - 点击 "Generate New Token"
   - 选择 "Automation" 类型（用于 CI/CD）或 "Publish" 类型
   - 复制生成的 token

2. **设置环境变量**
   ```bash
   # 临时设置（当前会话有效）
   export NPM_TOKEN=your_actual_token_here
   
   # 永久设置（添加到 ~/.bashrc 或 ~/.zshrc）
   echo 'export NPM_TOKEN=your_actual_token_here' >> ~/.bashrc
   source ~/.bashrc
   ```

3. **配置 .npmrc**
   - 取消注释 `.npmrc` 文件中的认证行：
   ```
   registry=https://registry.npmjs.org/
   //registry.npmjs.org/:_authToken=${NPM_TOKEN}
   access=public
   ```

### 方法二：使用 npm login（推荐用于本地开发）

1. **登录 NPM**
   ```bash
   npm login
   ```
   
2. **验证登录状态**
   ```bash
   npm whoami
   ```

## CI/CD 环境配置

### GitHub Actions

在 GitHub 仓库设置中添加 Secret：
- Name: `NPM_TOKEN`
- Value: 你的 NPM token

### 其他 CI 平台

类似地，在相应平台的环境变量或密钥管理中设置 `NPM_TOKEN`。

## 发布脚本使用

项目提供了多种发布方式：

```bash
# 跨平台 Node.js 脚本（推荐）
npm run publish:cross-platform

# macOS/Linux Bash 脚本
npm run publish:bash

# Windows 批处理脚本
npm run publish:windows
```

## 故障排除

### 常见错误

1. **NPM_TOKEN 未设置**
   ```
   ⚠ 未检测到 NPM_TOKEN 环境变量
   ```
   **解决方案**：按照上述方法设置 NPM_TOKEN 或使用 `npm login`

2. **权限错误**
   ```
   npm ERR! 403 Forbidden
   ```
   **解决方案**：检查包名是否已被占用，或确认你有发布权限

3. **网络错误**
   ```
   npm ERR! network
   ```
   **解决方案**：检查网络连接，或尝试使用代理

### 验证配置

运行以下命令验证配置：

```bash
# 检查 npm 配置
npm config list

# 检查登录状态
npm whoami

# 检查环境变量
echo $NPM_TOKEN
```

## 安全注意事项

1. **不要将 NPM_TOKEN 提交到代码仓库**
2. **定期轮换 NPM Token**
3. **使用最小权限原则**
4. **在 CI/CD 中使用 Automation 类型的 token**

## 相关文件

- `.npmrc` - NPM 配置文件
- `.env.example` - 环境变量示例
- `PUBLISH.md` - 发布指南
- `scripts/publish.js` - 跨平台发布脚本
- `scripts/publish.sh` - Bash 发布脚本
- `scripts/publish.bat` - Windows 发布脚本