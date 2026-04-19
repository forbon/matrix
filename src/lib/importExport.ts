import type { Task } from '../types';
import { isValidTask } from './storage';

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportJSON(tasks: Task[]): void {
  const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
  triggerDownload(blob, `matrix-${Date.now()}.json`);
}

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        cur += c;
      }
    } else {
      if (c === ',') {
        fields.push(cur);
        cur = '';
      } else if (c === '"') {
        inQuotes = true;
      } else {
        cur += c;
      }
    }
  }
  fields.push(cur);
  return fields;
}

function parseCSV(text: string): Task[] {
  const rows = text.replace(/\r\n/g, '\n').split('\n').filter((l) => l.length > 0);
  if (rows.length === 0) return [];
  const header = parseCSVLine(rows[0]);
  const idx = (name: string) => header.indexOf(name);
  const result: Task[] = [];
  for (let i = 1; i < rows.length; i++) {
    const cols = parseCSVLine(rows[i]);
    const candidate = {
      id: cols[idx('id')] ?? '',
      title: cols[idx('title')] ?? '',
      description: cols[idx('description')] || undefined,
      quadrant: cols[idx('quadrant')] ?? '',
      dueDate: cols[idx('dueDate')] || undefined,
      createdAt: cols[idx('createdAt')] ?? new Date().toISOString(),
      completed: cols[idx('completed')] === 'true',
    };
    if (isValidTask(candidate)) result.push(candidate);
  }
  return result;
}

export async function importFromFile(file: File): Promise<Task[]> {
  const text = await file.text();
  const isJson = file.name.toLowerCase().endsWith('.json') || text.trim().startsWith('[');
  if (isJson) {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) throw new Error('Expected array');
    return parsed.filter(isValidTask);
  }
  return parseCSV(text);
}
