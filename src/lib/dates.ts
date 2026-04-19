export type DueStatus = 'overdue' | 'today' | 'tomorrow' | 'upcoming' | 'none';

export function dueStatus(iso: string | undefined, now: Date = new Date()): DueStatus {
  if (!iso) return 'none';
  const due = new Date(iso);
  if (Number.isNaN(due.getTime())) return 'none';

  const startOfDay = (d: Date) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  };

  const today0 = startOfDay(now).getTime();
  const due0 = startOfDay(due).getTime();
  const dayMs = 24 * 60 * 60 * 1000;

  if (due0 < today0) return 'overdue';
  if (due0 === today0) return 'today';
  if (due0 === today0 + dayMs) return 'tomorrow';
  return 'upcoming';
}

export function formatDue(iso: string | undefined, lang: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}
