@echo off
setlocal enabledelayedexpansion

REM 跨平台发布脚本 - Windows 批处理版本
echo 🚀 开始发布 @uni-boost/module 到 npm...
echo 🖥️  检测到操作系统: Windows

REM 检查 Node.js 是否安装
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 未找到 Node.js，请先安装 Node.js
    exit /b 1
)

REM 检查 npm 是否安装
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 未找到 npm，请先安装 npm
    exit /b 1
)

REM 检查 pnpm 是否安装
pnpm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 未找到 pnpm，请先安装 pnpm: npm install -g pnpm
    exit /b 1
)

REM 检查是否已登录 npm
npm whoami >nul 2>&1
if errorlevel 1 (
    echo ❌ 请先登录 npm: npm login
    exit /b 1
)

REM 构建项目
echo 📦 构建项目...
pnpm build
if errorlevel 1 (
    echo ❌ 构建失败
    exit /b 1
)

REM 进入 module 包目录
set MODULE_DIR=packages\module
if not exist "%MODULE_DIR%" (
    echo ❌ 未找到模块目录: %MODULE_DIR%
    exit /b 1
)

cd "%MODULE_DIR%"

REM 检查 package.json 是否存在
if not exist "package.json" (
    echo ❌ 未找到 package.json 文件
    exit /b 1
)

REM 获取包信息
for /f "delims=" %%i in ('node -p "require('./package.json').name"') do set PACKAGE_NAME=%%i
for /f "delims=" %%i in ('node -p "require('./package.json').version"') do set PACKAGE_VERSION=%%i

if "%PACKAGE_NAME%"=="" (
    echo ❌ 无法读取包名
    exit /b 1
)

if "%PACKAGE_VERSION%"=="" (
    echo ❌ 无法读取版本号
    exit /b 1
)

echo 📋 包名: %PACKAGE_NAME%
echo 📋 版本: %PACKAGE_VERSION%

REM 检查版本是否已发布
npm view "%PACKAGE_NAME%@%PACKAGE_VERSION%" version >nul 2>&1
if not errorlevel 1 (
    echo ❌ 版本 %PACKAGE_VERSION% 已存在，请更新版本号
    exit /b 1
)

REM 运行测试
echo 🧪 运行测试...
npm test
if errorlevel 1 (
    echo ❌ 测试失败
    exit /b 1
)

REM 检查构建产物
if not exist "dist" (
    echo ❌ 未找到构建产物目录 dist
    exit /b 1
)

REM 发布到 npm
echo 📤 发布到 npm...
npm publish
if errorlevel 1 (
    echo ❌ 发布失败
    exit /b 1
)

echo ✅ 发布成功！
echo 📦 包地址: https://www.npmjs.com/package/%PACKAGE_NAME%
echo 🔗 安装命令: npm install %PACKAGE_NAME%
echo 🎉 发布完成！

pause