import type { Task, Lang, QuadrantId } from '../types';
import { QUADRANT_IDS } from '../types';

const TASKS_KEY = 'matrix.tasks';
const LANG_KEY = 'matrix.lang';

function isQuadrant(v: unknown): v is QuadrantId {
  return typeof v === 'string' && (QUADRANT_IDS as string[]).includes(v);
}

export function isValidTask(v: unknown): v is Task {
  if (!v || typeof v !== 'object') return false;
  const t = v as Record<string, unknown>;
  return (
    typeof t.id === 'string' &&
    typeof t.title === 'string' &&
    isQuadrant(t.quadrant) &&
    typeof t.createdAt === 'string'
  );
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
