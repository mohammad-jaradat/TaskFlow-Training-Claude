'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

interface AddTaskFormProps {
  projectId: number;
}

export function AddTaskForm({ projectId }: AddTaskFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Title is required.');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          title: trimmedTitle,
          due_date: dueDate || null,
        }),
      });
      if (!res.ok) {
        throw new Error('Failed to add task');
      }
      setTitle('');
      setDueDate('');
      router.refresh();
    } catch {
      setError('Failed to add task. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <input
        type="text"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Task title"
        aria-label="Task title"
        className="rounded border border-gray-300 px-3 py-1.5"
      />
      <input
        type="date"
        value={dueDate}
        onChange={(event) => setDueDate(event.target.value)}
        aria-label="Due date"
        className="rounded border border-gray-300 px-3 py-1.5"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="rounded bg-blue-600 px-3 py-1.5 text-white disabled:opacity-50"
      >
        Add Task
      </button>
    </form>
  );
}
