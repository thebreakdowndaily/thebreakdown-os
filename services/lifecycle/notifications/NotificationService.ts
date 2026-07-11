import { EditorialTask } from '@/types/canonical';

export interface NotificationService {
  notify(task: EditorialTask): Promise<void>;
  alert(message: string, severity: 'critical' | 'warning' | 'info'): Promise<void>;
}

export class MockNotificationService implements NotificationService {
  async notify(task: EditorialTask) {
    console.log(`[Notification] Task Assigned: ${task.title} to ${task.owner || 'Unassigned'}`);
  }

  async alert(message: string, severity: 'critical' | 'warning' | 'info') {
    console.log(`[Alert - ${severity.toUpperCase()}] ${message}`);
  }
}
