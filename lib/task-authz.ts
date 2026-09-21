import type { Task } from './types';

export function canDeleteTask(userId: number, task: Task): boolean {
  return task.owner_id === userId;
}
