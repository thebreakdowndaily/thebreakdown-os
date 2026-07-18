// audit/utils/logger.ts

export class Logger {
  /** Simple console logger with timestamp */
  private static format(message: string): string {
    return `[${new Date().toISOString()}] ${message}`;
  }

  info(message: string): void {
    console.info(Logger.format(`INFO: ${message}`));
  }
  warn(message: string): void {
    console.warn(Logger.format(`WARN: ${message}`));
  }
  error(message: string): void {
    console.error(Logger.format(`ERROR: ${message}`));
  }
  debug(message: string): void {
    console.debug(Logger.format(`DEBUG: ${message}`));
  }
}
