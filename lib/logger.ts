// lib/logger.ts
// Centralized logging utility

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, any>
  stack?: string
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  /**
   * Log debug message
   */
  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context)
  }

  /**
   * Log info message
   */
  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context)
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context)
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | unknown, context?: Record<string, any>): void {
    const errorContext = {
      ...context,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    }
    this.log(LogLevel.ERROR, message, errorContext)
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    }

    if (this.isDevelopment) {
      this.logToConsole(entry)
    } else {
      this.logToService(entry)
    }
  }

  /**
   * Log to console in development
   */
  private logToConsole(entry: LogEntry): void {
    const style = this.getConsoleStyle(entry.level)
    console.log(
      `%c[${entry.level}]%c ${entry.timestamp} - ${entry.message}`,
      style,
      'color: inherit'
    )

    if (entry.context) {
      console.log('Context:', entry.context)
    }
  }

  /**
   * Log to external service in production
   */
  private logToService(entry: LogEntry): void {
    // Send to service like Sentry, LogRocket, etc.
    // For now, just log to console
    if (entry.level === LogLevel.ERROR) {
      console.error(entry.message, entry.context)
    }
  }

  /**
   * Get console style for log level
   */
  private getConsoleStyle(level: LogLevel): string {
    const styles = {
      [LogLevel.DEBUG]: 'color: gray; font-weight: bold',
      [LogLevel.INFO]: 'color: blue; font-weight: bold',
      [LogLevel.WARN]: 'color: orange; font-weight: bold',
      [LogLevel.ERROR]: 'color: red; font-weight: bold',
    }
    return styles[level] || ''
  }
}

export const logger = new Logger()
