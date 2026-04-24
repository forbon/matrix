import type { Task, Lang, QuadrantId, TaskState, Theme } from '../types';
import { QUADRANT_IDS } from '../types';

const TASKS_KEY = 'matrix.tasks';
const LANG_KEY = 'matrix.lang';
const THEME_KEY = 'matrix.theme';
const BACKLOG_COLLAPSED_KEY = 'matrix.backlogCollapsed';

const TASK_STATES: TaskState[] = ['active', 'backlog', 'archived'];

function isQuadrant(v: unknown): v is QuadrantId {
  return typeof v === 'string' && (QUADRANT_IDS as string[]).includes(v);
}

function isTaskState(v: unknown): v is TaskState {
  return typeof v === 'string' && (TASK_STATES as string[]).includes(v);
}

export function isValidTask(v: unknown): v is Task {
  if (!v || typeof v !== 'object') return false;
  const t = v as Record<string, unknown>;
  if (typeof t.id !== 'string' || typeof t.title !== 'string' || typeof t.createdAt !== 'string') {
    return false;
  }
  if (t.quadrant !== undefined && !isQuadrant(t.quadrant)) return false;
  if (t.state !== undefined && !isTaskState(t.state)) return false;
  return true;
}

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidTask);
  } catch {
    return [];
  }
}

export function saveTasks(tasks: Task[]): void {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export function loadLang(): Lang {
  const raw = localStorage.getItem(LANG_KEY);
  return raw === 'en' ? 'en' : 'de';
}

export function saveLang(lang: Lang): void {
  localStorage.setItem(LANG_KEY, lang);
}

export function loadTheme(): Theme {
  const raw = localStorage.getItem(THEME_KEY);
  if (raw === 'light' || raw === 'dark' || raw === 'system') return raw;
  return 'system';
}

export function saveTheme(theme: Theme): void {
  localStorage.setItem(THEME_KEY, theme);
}

export function loadBacklogCollapsed(): boolean {
  return localStorage.getItem(BACKLOG_COLLAPSED_KEY) === '1';
}

export function saveBacklogCollapsed(collapsed: boolean): void {
  localStorage.setItem(BACKLOG_COLLAPSED_KEY, collapsed ? '1' : '0');
}
