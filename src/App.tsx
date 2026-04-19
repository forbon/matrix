import { useEffect, useState } from 'react';
import type { QuadrantId, Task } from './types';
import { useTasks } from './hooks/useTasks';
import { useReminders } from './hooks/useReminders';
import { useI18n } from './hooks/useI18n';
import { Matrix } from './components/Matrix';
import { Toolbar } from './components/Toolbar';
import { TaskForm } from './components/TaskForm';
import type { TaskFormValues } from './components/TaskForm';

function weekOfYear(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

export function App() {
  const { t, lang } = useI18n();
  const { tasks, add, update, remove, move, toggleComplete, replaceAll, mergeMany } = useTasks();
  const { state: notificationState, enable: enableReminders } = useReminders(tasks);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | undefined>();
  const [defaultQuadrant, setDefaultQuadrant] = useState<QuadrantId>('do');

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  const mastheadDate = now.toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const weekNo = String(weekOfYear(now)).padStart(2, '0');
  const [majorStr, minorStr] = __APP_VERSION__.split('.');
  const major = Number(majorStr);
  const minor = Number(minorStr);

  const openNew = (quadrant: QuadrantId = 'do') => {
    setEditing(undefined);
    setDefaultQuadrant(quadrant);
    setFormOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditing(task);
    setFormOpen(true);
  };

  const handleSubmit = (values: TaskFormValues, id?: string) => {
    if (id) update(id, values);
    else add(values);
    setFormOpen(false);
    setEditing(undefined);
  };

  const handleImport = (incoming: Task[]) => {
    if (tasks.length === 0) {
      replaceAll(incoming);
      return;
    }
    const replace = confirm(`${t('import.prompt')}\n\n[OK] ${t('import.replace')}\n[Cancel] ${t('import.merge')}`);
    if (replace) replaceAll(incoming);
    else mergeMany(incoming);
  };

  const title = t('app.title');
  const titleParts = title.split(' ');

  return (
    <div className="app">
      <header className="masthead">
        <h1 className="masthead__title">
          {titleParts.length > 1 ? (
            <>
              {titleParts.slice(0, -1).join(' ')} <em>{titleParts[titleParts.length - 1]}</em>
            </>
          ) : (
            title
          )}
        </h1>
        <div className="masthead__meta">
          <span>{t('app.volume')} {major} <span className="masthead__rule-glyph">§</span> {t('app.issue')} {minor}</span>
          <br />
          <strong>{t('app.week')} {weekNo} <span className="masthead__rule-glyph">§</span> {mastheadDate}</strong>
        </div>
      </header>

      <Toolbar
        tasks={tasks}
        onAdd={() => openNew('do')}
        onImport={handleImport}
        notificationState={notificationState}
        onEnableReminders={() => void enableReminders()}
      />

      <div className="matrix-frame">
        <div className="axis axis--x" aria-hidden="true">
          <span className="axis__pole axis__pole--start">{t('axis.urgency.high')}</span>
          <span className="axis__label">{t('axis.urgency')}</span>
          <span className="axis__pole axis__pole--end">{t('axis.urgency.low')}</span>
        </div>
        <div className="axis axis--y" aria-hidden="true">
          <span className="axis__pole axis__pole--start">{t('axis.importance.high')}</span>
          <span className="axis__label">{t('axis.importance')}</span>
          <span className="axis__pole axis__pole--end">{t('axis.importance.low')}</span>
        </div>
        <Matrix
          tasks={tasks}
          onDropTask={move}
          onAdd={openNew}
          onEdit={openEdit}
          onDelete={remove}
          onToggleComplete={toggleComplete}
        />
      </div>

      <TaskForm
        open={formOpen}
        initial={editing}
        defaultQuadrant={defaultQuadrant}
        onSubmit={handleSubmit}
        onCancel={() => {
          setFormOpen(false);
          setEditing(undefined);
        }}
      />

      <footer className="colophon">
        <span>© {now.getFullYear()} Fabian Wessel</span>
        <span className="colophon__sep">§</span>
        <span>{t('colophon.licensedUnder')}</span>
        <span className="colophon__sep">§</span>
        <a className="colophon__link" href="/licenses.txt" target="_blank" rel="noopener noreferrer">
          {t('colophon.thirdParty')}
        </a>
      </footer>
    </div>
  );
}
