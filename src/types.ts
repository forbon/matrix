export type QuadrantId = 'do' | 'schedule' | 'delegate' | 'eliminate';

export const QUADRANT_IDS: QuadrantId[] = ['do', 'schedule', 'delegate', 'eliminate'];

export interface TaskLink {
  url: string;
  label?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  quadrant: QuadrantId;
  dueDate?: string;
  createdAt: string;
  completed?: boolean;
  links?: TaskLink[];
}

export type Lang = 'de' | 'en';
