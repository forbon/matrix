import { useState } from 'react';
import type { QuadrantId, Task } from '../types';
import { useI18n } from '../hooks/useI18n';
import { TaskCard } from './TaskCard';

interface Props {
  tasks: Task[];
  collapsed: boolean;
  onToggleCollapsed: () => void;
  allowDragDrop?: boolean;
  onAdd: () => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onPromote: (id: string, target: QuadrantId) => void;
  onDropFromMatrix: (id: string) => void;
}

export function BacklogPanel({
  tasks,
  collapsed,
  onToggleCollapsed,
  allowDragDrop = true,
  onAdd,
  onEdit,
  onDelete,
  onArchive,
  onPromote,
  onDropFromMatrix,
}: Props) {
  const { t } = useI18n();
  const [over, setOver] = useState(false);

  const sorted = [...tasks].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const dndEnabled = allowDragDrop && !collapsed;
  const dndProps = dndEnabled
    ? {
        onDragOver: (e: React.DragEvent) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          if (!over) setOver(true);
        },
        onDragLeave: () => setOver(false),
        onDrop: (e: React.DragEvent) => {
          e.preventDefault();
          setOver(false);
          const taskId = e.dataTransfer.getData('text/plain');
          if (taskId) onDropFromMatrix(taskId);
        },
      }
    : {};

  const toggleLabel = collapsed ? t('action.expandBacklog') : t('action.collapseBacklog');

  return (
    <aside
      className={`backlog-panel ${collapsed ? 'backlog-panel--collapsed' : ''} ${over ? 'backlog-panel--over' : ''}`}
      aria-label={t('view.backlog')}
      {...dndProps}
    >
      <button
        type="button"
        className="backlog-panel__rail"
        onClick={onToggleCollapsed}
        aria-label={toggleLabel}
        title={toggleLabel}
      >
        <span className="backlog-panel__rail-toggle" aria-hidden="true">››</span>
        {tasks.length > 0 && (
          <span className="backlog-panel__rail-count">{tasks.length}</span>
        )}
        <span className="backlog-panel__rail-label">{t('view.backlog')}</span>
      </button>
      <header className="backlog-panel__header">
        <div className="backlog-panel__heading">
          <p className="backlog-panel__eyebrow">{t('backlog.hint')}</p>
          <h2 className="backlog-panel__title">
            {t('view.backlog')}
            {tasks.length > 0 && (
              <span className="backlog-panel__count">{tasks.length}</span>
            )}
          </h2>
        </div>
        <div className="backlog-panel__header-actions">
          <button
            type="button"
            className="backlog-panel__add"
            onClick={onAdd}
            aria-label={t('action.add')}
            title={t('action.add')}
          >
            +
          </button>
          <button
            type="button"
            className="backlog-panel__toggle"
            onClick={onToggleCollapsed}
            aria-label={toggleLabel}
            title={toggleLabel}
          >
            ››
          </button>
        </div>
      </header>
      <div className="backlog-panel__list">
        {sorted.length === 0 ? (
          <div className="backlog-panel__empty">{t('backlog.empty')}</div>
        ) : (
          sorted.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              variant="backlog"
              draggable={allowDragDrop}
              onEdit={onEdit}
              onDelete={onDelete}
              onPromote={onPromote}
              onArchive={onArchive}
            />
          ))
        )}
      </div>
    </aside>
  );
}
