/**
 * Structured logger utility for GymControl.
 * Formats log entries with timestamps, log levels, and contextual metadata.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: Record<string, unknown>
  error?: Error | unknown
}

class Logger {
  private formatEntry(level: LogLevel, message: string, context?: Record<string, unknown>, error?: unknown): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(context && Object.keys(context).length > 0 ? { context } : {}),
      ...(error !== undefined ? { error: error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : error } : {})
    }
  }

  private write(level: LogLevel, entry: LogEntry) {
    if (process.env.NODE_ENV === 'production') {
      // En producción, emitir JSON estructurado para agregadores de logs
      console[level](JSON.stringify(entry))
    } else {
      // En desarrollo, formato legible por humanos con colores
      const colors: Record<LogLevel, string> = {
        debug: '\x1b[34m', // Azul
        info: '\x1b[32m',  // Verde
        warn: '\x1b[33m',  // Amarillo
        error: '\x1b[31m', // Rojo
      }
      const reset = '\x1b[0m'
      const contextStr = entry.context ? `\nContext: ${JSON.stringify(entry.context, null, 2)}` : ''
      const errorStr = entry.error ? `\nError: ${JSON.stringify(entry.error, null, 2)}` : ''
      
      console[level](`${colors[level]}[${entry.level.toUpperCase()}] ${entry.timestamp}${reset} ${entry.message}${contextStr}${errorStr}`)
    }
  }

  public debug(message: string, context?: Record<string, unknown>) {
    this.write('debug', this.formatEntry('debug', message, context))
  }

  public info(message: string, context?: Record<string, unknown>) {
    this.write('info', this.formatEntry('info', message, context))
  }

  public warn(message: string, context?: Record<string, unknown>, error?: unknown) {
    this.write('warn', this.formatEntry('warn', message, context, error))
  }

  public error(message: string, error?: unknown, context?: Record<string, unknown>) {
    this.write('error', this.formatEntry('error', message, context, error))
  }
}

export const logger = new Logger()
