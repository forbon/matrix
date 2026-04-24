import { useState } from 'react';
import type { QuadrantId, Task } from '../types';
import { useI18n } from '../hooks/useI18n';
import type { TKey } from '../hooks/useI18n';
import { TaskCard } from './TaskCard';
import { densityClass } from '../lib/density';

const ROMAN: Record<QuadrantId, string> = {
  do: 'I',
  schedule: 'II',
  delegate: 'III',
  eliminate: 'IV',
};

interface Props {
  id: QuadrantId;
  tasks: Task[];
  hidden?: boolean;
  allowDragDrop?: boolean;
  onDropTask: (id: string, target: QuadrantId) => void;
  onAdd: (quadrant: QuadrantId) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onMove: (id: string, target: QuadrantId) => void;
  onToBacklog: (id: string) => void;
  onArchive: (id: string) => void;
}

export function Quadrant({
  id,
  tasks,
  hidden = false,
  allowDragDrop = true,
  onDropTask,
  onAdd,
  onEdit,
  onDelete,
  onToggleComplete,
  onMove,
  onToBacklog,
  onArchive,
}: Props) {
  const { t } = useI18n();
  const [over, setOver] = useState(false);

  const titleKey = `quadrant.${id}` as TKey;
  const hintKey = `quadrant.${id}.hint` as TKey;

  const dndProps = allowDragDrop
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
          if (taskId) onDropTask(taskId, id);
        },
      }
    : {};

  return (
    <section
      className={`quadrant quadrant--${id} ${over ? 'quadrant--over' : ''} ${hidden ? 'quadrant--hidden' : ''}`}
      aria-hidden={hidden || undefined}
      {...dndProps}
    >
      <span className="quadrant__numeral" aria-hidden="true">{ROMAN[id]}</span>
      <header className="quadrant__header">
        <div>
          <p className="quadrant__eyebrow">№ {ROMAN[id]} · {t(hintKey)}</p>
          <h2 className="quadrant__title">{t(titleKey)}</h2>
        </div>
        <button
          type="button"
          className="quadrant__add"
          onClick={() => onAdd(id)}
          aria-label={t('action.add')}
          title={t('action.add')}
        >
          +
        </button>
      </header>
      <div className={`quadrant__list ${densityClass(tasks.length)}`.trim()}>
        {tasks.length === 0 ? (
          <div className="quadrant__empty">{t('task.empty')}</div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              variant="matrix"
              draggable={allowDragDrop}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleComplete={onToggleComplete}
              onMove={onMove}
              onToBacklog={onToBacklog}
              onArchive={onArchive}
            />
          ))
        )}
      </div>
    </section>
  );
}
