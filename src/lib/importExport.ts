import type { Task } from '../types';
import { isValidTask } from './storage';

export function exportJSON(tasks: Task[]): void {
  const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `matrix-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importFromFile(file: File): Promise<Task[]> {
  const text = await file.text();
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed)) throw new Error('Expected array');
  return parsed.filter(isValidTask);
}
