export type QuadrantId = 'do' | 'schedule' | 'delegate' | 'eliminate';

export const QUADRANT_IDS: QuadrantId[] = ['do', 'schedule', 'delegate', 'eliminate'];

export type TaskState = 'active' | 'backlog' | 'archived';

export interface TaskLink {
  url: string;
  label?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  quadrant?: QuadrantId;
  state?: TaskState;
  dueDate?: string;
  createdAt: string;
  completed?: boolean;
  archivedAt?: string;
  links?: TaskLink[];
}

export function taskState(t: Task): TaskState {
  return t.state ?? 'active';
}

export type Lang = 'de' | 'en';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';
