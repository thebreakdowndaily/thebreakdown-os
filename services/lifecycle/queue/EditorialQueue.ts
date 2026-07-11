import { EditorialTask } from '@/types/canonical';

export class EditorialQueue {
  private tasks: Map<string, EditorialTask> = new Map();

  enqueue(task: EditorialTask) {
    this.tasks.set(task.id, task);
  }

  getTask(id: string): EditorialTask | undefined {
    return this.tasks.get(id);
  }

  getAllTasks(): EditorialTask[] {
    return Array.from(this.tasks.values()).sort((a, b) => {
      // Sort by priority implicitly (critical > high > medium > low)
      const pMap = { critical: 4, high: 3, medium: 2, low: 1 };
      return pMap[b.priority] - pMap[a.priority];
    });
  }

  getPendingTasks(): EditorialTask[] {
    return this.getAllTasks().filter(t => t.status === 'pending' || t.status === 'assigned' || t.status === 'in_review');
  }

  updateTaskStatus(taskId: string, status: EditorialTask['status'], resolution?: string) {
    const task = this.tasks.get(taskId);
    if (task) {
      task.status = status;
      if (resolution) task.resolution = resolution;
      task.updatedAt = new Date().toISOString();
    }
  }
}
