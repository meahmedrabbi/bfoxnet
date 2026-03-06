/**
 * Logger utility that sends logs to server for Vercel logging
 */

type LogLevel = 'log' | 'info' | 'warn' | 'error';

interface LogData {
  [key: string]: unknown;
}

class Logger {
  private static instance: Logger;
  
  private constructor() {}
  
  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private async sendToServer(level: LogLevel, message: string, data?: LogData) {
    // Only send logs from browser, not during SSR/build
    if (typeof window === 'undefined') {
      return;
    }
    
    try {
      // Send to server-side logging endpoint
      await fetch('/api/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          level,
          message,
          data,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      // Use native console.error to avoid infinite loop
      // Don't use logger.error() here!
      if (typeof console !== 'undefined' && console.error) {
        console.error('[Logger] Failed to send log to server:', error);
      }
    }
  }

  log(message: string, data?: LogData) {
    console.log(message, data);
    if (data) {
      this.sendToServer('log', message, data);
    } else {
      this.sendToServer('log', message);
    }
  }

  info(message: string, data?: LogData) {
    console.info(message, data);
    if (data) {
      this.sendToServer('info', message, data);
    } else {
      this.sendToServer('info', message);
    }
  }

  warn(message: string, data?: LogData) {
    console.warn(message, data);
    if (data) {
      this.sendToServer('warn', message, data);
    } else {
      this.sendToServer('warn', message);
    }
  }

  error(message: string, data?: LogData) {
    console.error(message, data);
    if (data) {
      this.sendToServer('error', message, data);
    } else {
      this.sendToServer('error', message);
    }
  }
}

export const logger = Logger.getInstance();
