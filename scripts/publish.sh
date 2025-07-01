#!/bin/bash

# 跨平台发布脚本 (支持 Mac/Linux/Windows)
set -e

# 检测操作系统
detect_os() {
  case "$(uname -s)" in
    Darwin*) echo "mac" ;;
    Linux*)  echo "linux" ;;
    CYGWIN*|MINGW*|MSYS*) echo "windows" ;;
    *) echo "unknown" ;;
  esac
}

# 跨平台的空设备
get_null_device() {
  if [[ "$(detect_os)" == "windows" ]]; then
    echo "NUL"
  else
    echo "/dev/null"
  fi
}

# 跨平台的路径分隔符
get_path_separator() {
  if [[ "$(detect_os)" == "windows" ]]; then
    echo "\\"
  else
    echo "/"
  fi
}

OS=$(detect_os)
NULL_DEVICE=$(get_null_device)
PATH_SEP=$(get_path_separator)

echo "🚀 开始发布 @uni-boost/module 到 npm..."
echo "🖥️  检测到操作系统: $OS"

# 检查 Node.js 是否安装
if ! command -v node > "$NULL_DEVICE" 2>&1; then
  echo "❌ 未找到 Node.js，请先安装 Node.js"
  exit 1
fi

# 检查 npm 是否安装
if ! command -v npm > "$NULL_DEVICE" 2>&1; then
  echo "❌ 未找到 npm，请先安装 npm"
  exit 1
fi

# 检查 pnpm 是否安装
if ! command -v pnpm > "$NULL_DEVICE" 2>&1; then
  echo "❌ 未找到 pnpm，请先安装 pnpm: npm install -g pnpm"
  exit 1
fi

# 检查是否已登录 npm
if ! npm whoami > "$NULL_DEVICE" 2>&1; then
  echo "❌ 请先登录 npm: npm login"
  exit 1
fi

# 构建项目
echo "📦 构建项目..."
if ! pnpm build; then
  echo "❌ 构建失败"
  exit 1
fi

# 进入 module 包目录
MODULE_DIR="packages${PATH_SEP}module"
if [[ ! -d "$MODULE_DIR" ]]; then
  echo "❌ 未找到模块目录: $MODULE_DIR"
  exit 1
fi

cd "$MODULE_DIR"

# 检查 package.json 是否存在
if [[ ! -f "package.json" ]]; then
  echo "❌ 未找到 package.json 文件"
  exit 1
fi

# 检查包信息
PACKAGE_NAME=$(node -p "require('./package.json').name" 2>"$NULL_DEVICE")
PACKAGE_VERSION=$(node -p "require('./package.json').version" 2>"$NULL_DEVICE")

if [[ -z "$PACKAGE_NAME" || -z "$PACKAGE_VERSION" ]]; then
  echo "❌ 无法读取包名或版本号"
  exit 1
fi

echo "📋 包名: $PACKAGE_NAME"
echo "📋 版本: $PACKAGE_VERSION"

# 检查版本是否已发布
if npm view "$PACKAGE_NAME@$PACKAGE_VERSION" version > "$NULL_DEVICE" 2>&1; then
  echo "❌ 版本 $PACKAGE_VERSION 已存在，请更新版本号"
  exit 1
fi

# 运行测试
echo "🧪 运行测试..."
if ! npm test; then
  echo "❌ 测试失败"
  exit 1
fi

# 检查构建产物
if [[ ! -d "dist" ]]; then
  echo "❌ 未找到构建产物目录 dist"
  exit 1
fi

# 发布到 npm
echo "📤 发布到 npm..."
if ! npm publish; then
  echo "❌ 发布失败"
  exit 1
fi

echo "✅ 发布成功！"
echo "📦 包地址: https://www.npmjs.com/package/$PACKAGE_NAME"
echo "🔗 安装命令: npm install $PACKAGE_NAME"
echo "🎉 发布完成！"