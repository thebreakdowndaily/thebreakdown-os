export const performanceMonitor = {
  start: (label: string) => console.time(label),
  end: (label: string) => console.timeEnd(label),
};
