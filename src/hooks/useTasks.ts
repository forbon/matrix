import { useCallback, useEffect, useState } from 'react';
import type { QuadrantId, Task, TaskState } from '../types';
import { taskState } from '../types';
import { loadTasks, saveTasks } from '../lib/storage';

function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `t_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export interface NewTaskInput {
  title: string;
  description?: string;
  quadrant?: QuadrantId;
  state?: TaskState;
  dueDate?: string;
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const add = useCallback((input: NewTaskInput) => {
    const state: TaskState = input.state ?? 'active';
    const task: Task = {
      id: uid(),
      title: input.title.trim(),
      description: input.description?.trim() || undefined,
      quadrant: input.quadrant,
      state,
      dueDate: input.dueDate || undefined,
      createdAt: new Date().toISOString(),
      completed: false,
    };
    setTasks((prev) => [...prev, task]);
    return task;
  }, []);

  const update = useCallback((id: string, patch: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);

  const remove = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const move = useCallback((id: string, quadrant: QuadrantId) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, quadrant, state: 'active', archivedAt: undefined } : t,
      ),
    );
  }, []);

  const toggleComplete = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  }, []);

  const toBacklog = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, state: 'backlog', archivedAt: undefined } : t)),
    );
  }, []);

  const toArchive = useCallback((id: string) => {
    const now = new Date().toISOString();
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, state: 'archived', archivedAt: now } : t)),
    );
  }, []);

  const restore = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const quadrant = t.quadrant ?? 'do';
        return { ...t, state: 'active', quadrant, archivedAt: undefined };
      }),
    );
  }, []);

  const promoteFromBacklog = useCallback((id: string, quadrant: QuadrantId) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, state: 'active', quadrant, archivedAt: undefined } : t,
      ),
    );
  }, []);

  const archiveAllCompleted = useCallback(() => {
    const now = new Date().toISOString();
    setTasks((prev) =>
      prev.map((t) =>
        t.completed && taskState(t) === 'active'
          ? { ...t, state: 'archived', archivedAt: now }
          : t,
      ),
    );
  }, []);

  const replaceAll = useCallback((next: Task[]) => {
    setTasks(next);
  }, []);

  const mergeMany = useCallback((incoming: Task[]) => {
    setTasks((prev) => {
      const byId = new Map(prev.map((t) => [t.id, t]));
      for (const t of incoming) byId.set(t.id, t);
      return Array.from(byId.values());
    });
  }, []);

  return {
    tasks,
    add,
    update,
    remove,
    move,
    toggleComplete,
    toBacklog,
    toArchive,
    restore,
    promoteFromBacklog,
    archiveAllCompleted,
    replaceAll,
    mergeMany,
  };
}
