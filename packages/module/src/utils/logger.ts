import { LOG_LEVELS, LogLevel } from '../constants/index.js';

export class Logger {
  private level: LogLevel;
  private prefix: string;

  constructor(level: LogLevel = 'debug', prefix = '[uni-boost]') {
    this.level = level;
    this.prefix = prefix;
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.level];
  }

  private formatMessage(level: LogLevel, message: string, ...args: any[]): string {
    const timestamp = new Date().toISOString();
    const levelStr = level.toUpperCase().padEnd(5);
    return `${timestamp} ${this.prefix} ${levelStr} ${message}`;
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message), ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message), ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message), ...args);
    }
  }

  error(message: string, error?: Error, ...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message), error || '', ...args);
    }
  }

  group(label: string): void {
    if (this.shouldLog('debug')) {
      console.group(this.formatMessage('debug', label));
    }
  }

  groupEnd(): void {
    if (this.shouldLog('debug')) {
      console.groupEnd();
    }
  }

  time(label: string): void {
    if (this.shouldLog('debug')) {
      console.time(`${this.prefix} ${label}`);
    }
  }

  timeEnd(label: string): void {
    if (this.shouldLog('debug')) {
      console.timeEnd(`${this.prefix} ${label}`);
    }
  }
}

// 默认日志实例
export const logger = new Logger();