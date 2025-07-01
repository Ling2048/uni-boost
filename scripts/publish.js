#!/usr/bin/env node

/**
 * 跨平台发布脚本 - Node.js 版本
 * 支持 Windows, macOS, Linux
 */

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function log(message) {
  console.log(message);
}

function error(message) {
  colorLog('red', `❌ ${message}`);
}

function success(message) {
  colorLog('green', `✅ ${message}`);
}

function info(message) {
  colorLog('blue', `ℹ️  ${message}`);
}

function warning(message) {
  colorLog('yellow', `⚠️  ${message}`);
}

// 检测操作系统
function detectOS() {
  const platform = os.platform();
  switch (platform) {
    case 'darwin': return 'macOS';
    case 'win32': return 'Windows';
    case 'linux': return 'Linux';
    default: return platform;
  }
}

// 检查命令是否存在
function commandExists(command) {
  try {
    execSync(`${command} --version`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// 执行命令
function runCommand(command, options = {}) {
  try {
    const result = execSync(command, { 
      stdio: 'inherit', 
      encoding: 'utf8',
      ...options 
    });
    return { success: true, result };
  } catch (error) {
    return { success: false, error };
  }
}

// 静默执行命令
function runCommandSilent(command) {
  try {
    const result = execSync(command, { 
      stdio: 'pipe', 
      encoding: 'utf8' 
    });
    return { success: true, result: result.trim() };
  } catch (error) {
    return { success: false, error };
  }
}

// 主发布流程
async function publish() {
  const osName = detectOS();
  
  log('🚀 开始发布 @uni-boost/module 到 npm...');
  info(`检测到操作系统: ${osName}`);
  
  // 检查必要的工具
  if (!commandExists('node')) {
    error('未找到 Node.js，请先安装 Node.js');
    process.exit(1);
  }
  
  if (!commandExists('npm')) {
    error('未找到 npm，请先安装 npm');
    process.exit(1);
  }
  
  if (!commandExists('pnpm')) {
    error('未找到 pnpm，请先安装 pnpm: npm install -g pnpm');
    process.exit(1);
  }
  
  // 检查环境变量
  function checkEnvironment() {
    const npmToken = process.env.NPM_TOKEN;
    if (npmToken) {
      success('检测到 NPM_TOKEN 环境变量');
      return true;
    } else {
      warning('未检测到 NPM_TOKEN 环境变量');
      warning('如需使用令牌认证，请设置 NPM_TOKEN 环境变量');
      return false;
    }
  }
  
  // 检查 npm 登录状态
  const hasToken = checkEnvironment();
  const whoamiResult = runCommandSilent('npm whoami');
  if (!whoamiResult.success && !hasToken) {
    error('请先登录 npm: npm login');
    error('或者设置 NPM_TOKEN 环境变量并取消注释 .npmrc 中的认证配置');
    process.exit(1);
  }
  
  if (whoamiResult.success) {
    info(`当前 npm 用户: ${whoamiResult.result}`);
  }
  
  // 构建项目
  log('📦 构建项目...');
  const buildResult = runCommand('pnpm build');
  if (!buildResult.success) {
    error('构建失败');
    process.exit(1);
  }
  
  // 进入 module 包目录
  const moduleDir = path.join(process.cwd(), 'packages', 'module');
  if (!fs.existsSync(moduleDir)) {
    error(`未找到模块目录: ${moduleDir}`);
    process.exit(1);
  }
  
  process.chdir(moduleDir);
  
  // 检查 package.json
  const packageJsonPath = path.join(moduleDir, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    error('未找到 package.json 文件');
    process.exit(1);
  }
  
  // 读取包信息
  let packageInfo;
  try {
    packageInfo = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  } catch (err) {
    error('无法解析 package.json 文件');
    process.exit(1);
  }
  
  const packageName = packageInfo.name;
  const packageVersion = packageInfo.version;
  
  if (!packageName || !packageVersion) {
    error('无法读取包名或版本号');
    process.exit(1);
  }
  
  log(`📋 包名: ${packageName}`);
  log(`📋 版本: ${packageVersion}`);
  
  // 检查版本是否已发布
  const versionCheckResult = runCommandSilent(`npm view "${packageName}@${packageVersion}" version`);
  if (versionCheckResult.success) {
    error(`版本 ${packageVersion} 已存在，请更新版本号`);
    process.exit(1);
  }
  
  // 运行测试
  log('🧪 运行测试...');
  const testResult = runCommand('npm test');
  if (!testResult.success) {
    error('测试失败');
    process.exit(1);
  }
  
  // 检查构建产物
  const distDir = path.join(moduleDir, 'dist');
  if (!fs.existsSync(distDir)) {
    error('未找到构建产物目录 dist');
    process.exit(1);
  }
  
  // 发布到 npm
  info('发布到 npm...');

  // 检查是否需要创建作用域
  info('检查 npm 作用域...');
  const scopeCheckResult = runCommandSilent('npm access ls-packages @uni-boost');
  if (!scopeCheckResult.success) {
    warning('作用域 @uni-boost 可能不存在或您没有访问权限');
    warning('您可能需要先创建作用域或使用其他作用域名称');
    warning('请访问 https://www.npmjs.com/org/create 创建作用域');
    
    // 自动尝试使用 --access=public 参数发布
    info('自动尝试使用 --access=public 参数发布...');
    const publishResult = runCommand('npm publish --access=public');
    if (!publishResult.success) {
      error('发布失败');
      error('可能的解决方案：');
      error('1. 创建 @uni-boost 作用域: https://www.npmjs.com/org/create');
      error('2. 修改包名为不使用作用域的名称');
      error('3. 使用已有的作用域名称');
      process.exit(1);
    }
  } else {
    // 正常发布
    const publishResult = runCommand('npm publish');
    if (!publishResult.success) {
      error('发布失败');
      process.exit(1);
    }
  }
  
  success('发布成功！');
  log(`📦 包地址: https://www.npmjs.com/package/${packageName}`);
  log(`🔗 安装命令: npm install ${packageName}`);
  log('🎉 发布完成！');
}

// 错误处理
process.on('uncaughtException', (error) => {
  error(`未捕获的异常: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  error(`未处理的 Promise 拒绝: ${reason}`);
  process.exit(1);
});

// 运行发布流程
publish().catch((err) => {
  error(`发布过程中出现错误: ${err.message}`);
  process.exit(1);
});