// audit/shared/logger.ts
export class Logger {
  /** Log info messages */
  info(message: string): void {
    console.log(`[INFO] ${message}`);
  }

  /** Log warning messages */
  warn(message: string): void {
    console.warn(`[WARN] ${message}`);
  }

  /** Log error messages */
  error(message: string): void {
    console.error(`[ERROR] ${message}`);
  }
}
