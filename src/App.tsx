import { useEffect, useMemo, useState } from 'react';
import type { QuadrantId, Task, TaskState } from './types';
import { taskState } from './types';
import { useTasks } from './hooks/useTasks';
import { useI18n } from './hooks/useI18n';
import { Matrix } from './components/Matrix';
import { BacklogPanel } from './components/BacklogPanel';
import { ArchiveList } from './components/ArchiveList';
import { Toolbar } from './components/Toolbar';
import type { ViewId } from './components/Toolbar';
import { TaskForm } from './components/TaskForm';
import type { TaskFormValues } from './components/TaskForm';
import { isSafeUrl } from './lib/urls';
import { loadBacklogCollapsed, saveBacklogCollapsed } from './lib/storage';

function weekOfYear(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

export function App() {
  const { t, lang } = useI18n();
  const {
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
    replaceAll,
    mergeMany,
  } = useTasks();

  const [view, setView] = useState<ViewId>('matrix');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | undefined>();
  const [defaultQuadrant, setDefaultQuadrant] = useState<QuadrantId>('do');
  const [defaultState, setDefaultState] = useState<TaskState>('active');
  const [backlogCollapsed, setBacklogCollapsed] = useState<boolean>(() => loadBacklogCollapsed());
  const [archiveDropOver, setArchiveDropOver] = useState(false);

  useEffect(() => {
    saveBacklogCollapsed(backlogCollapsed);
  }, [backlogCollapsed]);

  const { activeTasks, backlogTasks, archiveTasks } = useMemo(() => {
    const a: Task[] = [];
    const b: Task[] = [];
    const z: Task[] = [];
    for (const t of tasks) {
      const s = taskState(t);
      if (s === 'backlog') b.push(t);
      else if (s === 'archived') z.push(t);
      else a.push(t);
    }
    return { activeTasks: a, backlogTasks: b, archiveTasks: z };
  }, [tasks]);

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
    setDefaultState('active');
    setFormOpen(true);
  };

  const openNewInBacklog = () => {
    setEditing(undefined);
    setDefaultState('backlog');
    setFormOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditing(task);
    setFormOpen(true);
  };

  const handleSubmit = (values: TaskFormValues, id?: string) => {
    if (id) {
      update(id, {
        title: values.title,
        description: values.description,
        quadrant: values.quadrant,
        state: values.state,
        dueDate: values.dueDate,
        links: values.links,
      });
    } else {
      add(values);
    }
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
          <span>{t('app.volume')} {major} <span className="masthead__rule-glyph">·</span> {t('app.issue')} {minor}</span>
          <br />
          <strong>{t('app.week')} {weekNo} <span className="masthead__rule-glyph">·</span> {mastheadDate}</strong>
        </div>
      </header>

      <nav className="view-nav" role="tablist" aria-label={t('nav.views')}>
        <span className="view-nav__prefix" aria-hidden="true">▸</span>
        <button
          type="button"
          role="tab"
          aria-selected={view === 'matrix'}
          className={`view-nav__link ${view === 'matrix' ? 'view-nav__link--active' : ''}`}
          onClick={() => setView('matrix')}
        >
          {t('view.matrix')}
        </button>
        <span className="view-nav__sep" aria-hidden="true">·</span>
        <button
          type="button"
          role="tab"
          aria-selected={view === 'archive'}
          className={`view-nav__link ${view === 'archive' ? 'view-nav__link--active' : ''} ${archiveDropOver ? 'view-nav__link--drop-over' : ''}`}
          onClick={() => setView('archive')}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            if (!archiveDropOver) setArchiveDropOver(true);
          }}
          onDragLeave={() => setArchiveDropOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setArchiveDropOver(false);
            const taskId = e.dataTransfer.getData('text/plain');
            if (taskId) toArchive(taskId);
          }}
        >
          {t('view.archive')}
          {archiveTasks.length > 0 && (
            <span className="view-nav__count">{archiveTasks.length}</span>
          )}
        </button>
      </nav>

      <Toolbar
        tasks={tasks}
        onAdd={() => openNew()}
        onImport={handleImport}
      />

      <main className="app__main" aria-label={t('app.title')}>
        {view === 'matrix' && (
          <div className={`workspace ${backlogCollapsed ? 'workspace--backlog-collapsed' : ''}`}>
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
                tasks={activeTasks}
                onDropTask={move}
                onAdd={openNew}
                onEdit={openEdit}
                onDelete={remove}
                onToggleComplete={toggleComplete}
                onToBacklog={toBacklog}
                onArchive={toArchive}
              />
            </div>
            <BacklogPanel
              tasks={backlogTasks}
              collapsed={backlogCollapsed}
              onToggleCollapsed={() => setBacklogCollapsed((v) => !v)}
              onAdd={openNewInBacklog}
              onEdit={openEdit}
              onDelete={remove}
              onArchive={toArchive}
              onPromote={promoteFromBacklog}
              onDropFromMatrix={toBacklog}
            />
          </div>
        )}

        {view === 'archive' && (
          <div className="stack-frame">
            <ArchiveList
              tasks={archiveTasks}
              onEdit={openEdit}
              onDelete={remove}
              onRestore={restore}
            />
          </div>
        )}
      </main>

      <TaskForm
        open={formOpen}
        initial={editing}
        defaultQuadrant={defaultQuadrant}
        defaultState={defaultState}
        onSubmit={handleSubmit}
        onCancel={() => {
          setFormOpen(false);
          setEditing(undefined);
        }}
      />

      <footer className="colophon">
        <span>© {now.getFullYear()} Fabian Wessel</span>
        <span className="colophon__sep">·</span>
        <a className="colophon__link" href="/licenses.txt" target="_blank" rel="noopener noreferrer">
          {t('colophon.thirdParty')}
        </a>
        <span className="colophon__sep">·</span>
        <a className="colophon__link" href="https://github.com/forbon/matrix" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        {window.__MATRIX_CONFIG__?.impressumUrl && isSafeUrl(window.__MATRIX_CONFIG__.impressumUrl) && <>
          <span className="colophon__sep">·</span>
          <a className="colophon__link" href={window.__MATRIX_CONFIG__.impressumUrl} target="_blank" rel="noopener noreferrer">
            {t('legal.impressum')}
          </a>
        </>}
        {window.__MATRIX_CONFIG__?.privacyUrl && isSafeUrl(window.__MATRIX_CONFIG__.privacyUrl) && <>
          <span className="colophon__sep">·</span>
          <a className="colophon__link" href={window.__MATRIX_CONFIG__.privacyUrl} target="_blank" rel="noopener noreferrer">
            {t('legal.privacy')}
          </a>
        </>}
      </footer>
    </div>
  );
}
