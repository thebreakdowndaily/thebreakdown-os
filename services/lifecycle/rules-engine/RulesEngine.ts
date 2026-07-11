import { EditorialTask } from '@/types/canonical';

export class RulesEngine {
  applyRules(task: EditorialTask): EditorialTask {
    // Determine Priority & Severity
    if (task.affectedContent.stories.length > 5) {
      task.priority = 'critical';
      task.severity = 'blocker';
    } else if (task.affectedContent.stories.length > 0) {
      task.priority = 'high';
      task.severity = 'major';
    }

    // Determine Ownership routing
    if (task.affectedContent.topics.includes('economy')) {
      task.owner = 'editor-finance';
    } else if (task.affectedContent.topics.includes('health')) {
      task.owner = 'editor-health';
    }

    // Set deadline (e.g. 24h for high, 72h for low)
    const deadline = new Date();
    if (task.priority === 'critical' || task.priority === 'high') {
      deadline.setHours(deadline.getHours() + 24);
    } else {
      deadline.setHours(deadline.getHours() + 72);
    }
    task.deadline = deadline.toISOString();

    return task;
  }
}
