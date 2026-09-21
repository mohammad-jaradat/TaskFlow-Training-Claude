'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Task } from '@/lib/types';

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const router = useRouter();
  const [completed, setCompleted] = useState(task.completed === 1);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: completed ? 1 : 0 }),
    }).then(() => router.refresh());
  }, [completed]);

  return (
    <li className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={completed}
        onChange={() => setCompleted((prev) => !prev)}
        aria-label={`Mark "${task.title}" complete`}
      />
      <span className={completed ? 'text-gray-400 line-through' : ''}>{task.title}</span>
    </li>
  );
}
