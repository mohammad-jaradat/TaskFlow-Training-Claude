import type { Task } from './types';

export function canDeleteTask(userId: number, task: Task): boolean {
  const isOwner = task.owner_id === userId;
  return isOwner;
}
