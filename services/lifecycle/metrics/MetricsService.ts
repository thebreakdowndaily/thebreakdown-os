import { EditorialQueue } from '../queue/EditorialQueue';

export interface DashboardMetrics {
  pendingReviews: number;
  criticalAlerts: number;
  sourceUpdatesToday: number;
  activeEditors: number;
}

export class MetricsService {
  constructor(private queue: EditorialQueue) {}

  buildMissionControlMetrics(): DashboardMetrics {
    const pendingTasks = this.queue.getPendingTasks();
    const criticalTasks = pendingTasks.filter(t => t.priority === 'critical');
    
    return {
      pendingReviews: pendingTasks.length,
      criticalAlerts: criticalTasks.length,
      sourceUpdatesToday: 12, // Mocked for now
      activeEditors: 4 // Mocked for now
    };
  }
}
