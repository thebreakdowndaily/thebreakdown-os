// audit/utils/performanceMonitor.ts

export class PerformanceMonitor {
  private startTimes: Map<string, number> = new Map();
  private durations: Map<string, number> = new Map();

  start(label: string): void {
    this.startTimes.set(label, Date.now());
  }

  stop(label: string): void {
    const start = this.startTimes.get(label);
    if (start !== undefined) {
      const duration = Date.now() - start;
      this.durations.set(label, duration);
      this.startTimes.delete(label);
    }
  }

  getDuration(label: string): number | undefined {
    return this.durations.get(label);
  }

  getAll(): Record<string, number> {
    const obj: Record<string, number> = {};
    this.durations.forEach((v, k) => (obj[k] = v));
    return obj;
  }
}
