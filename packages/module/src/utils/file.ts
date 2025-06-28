import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { ValidationError, safeJsonParse } from './validation.js';
import { ERROR_MESSAGES } from '../constants/index.js';
import { logger } from './logger.js';

/**
 * 安全读取文件内容
 */
export function safeReadFile(filePath: string): string | null {
  try {
    if (!existsSync(filePath)) {
      logger.warn(`文件不存在: ${filePath}`);
      return null;
    }
    return readFileSync(filePath, 'utf-8');
  } catch (error) {
    logger.error(`读取文件失败: ${filePath}`, error as Error);
    return null;
  }
}

/**
 * 安全写入文件内容
 */
export function safeWriteFile(filePath: string, content: string): boolean {
  try {
    writeFileSync(filePath, content, 'utf-8');
    logger.debug(`文件写入成功: ${filePath}`);
    return true;
  } catch (error) {
    logger.error(`写入文件失败: ${filePath}`, error as Error);
    return false;
  }
}

/**
 * 读取并解析 JSON 文件
 */
export function readJsonFile<T>(filePath: string): T | null {
  const content = safeReadFile(filePath);
  if (!content) {
    return null;
  }

  const parsed = safeJsonParse<T>(content);
  if (!parsed) {
    logger.error(`JSON 解析失败: ${filePath}`);
    throw new ValidationError(`无效的 JSON 文件: ${filePath}`);
  }

  return parsed;
}

/**
 * 写入 JSON 文件
 */
export function writeJsonFile(filePath: string, data: any): boolean {
  try {
    const content = JSON.stringify(data, null, 2);
    return safeWriteFile(filePath, content);
  } catch (error) {
    logger.error(`JSON 序列化失败: ${filePath}`, error as Error);
    return false;
  }
}

/**
 * 检查文件是否存在
 */
export function fileExists(filePath: string): boolean {
  return existsSync(filePath);
}

/**
 * 解析绝对路径
 */
export function resolvePath(...paths: string[]): string {
  return resolve(...paths);
}

/**
 * 获取文件目录
 */
export function getDirectory(filePath: string): string {
  return dirname(filePath);
}

/**
 * 连接路径
 */
export function joinPath(...paths: string[]): string {
  return join(...paths);
}

/**
 * 规范化路径分隔符
 */
export function normalizePath(path: string): string {
  return path.replace(/\\/g, '/');
}