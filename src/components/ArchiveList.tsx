import type { Task } from '../types';
import { useI18n } from '../hooks/useI18n';
import { TaskCard } from './TaskCard';

interface Props {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
}

export function ArchiveList({ tasks, onEdit, onDelete, onRestore }: Props) {
  const { t } = useI18n();
  const sorted = [...tasks].sort((a, b) => {
    const aKey = a.archivedAt ?? a.createdAt;
    const bKey = b.archivedAt ?? b.createdAt;
    return bKey.localeCompare(aKey);
  });

  return (
    <section className="stack stack--archive" aria-label={t('view.archive')}>
      <header className="stack__header">
        <div>
          <p className="stack__eyebrow">{t('archive.hint')}</p>
          <h2 className="stack__title">{t('view.archive')}</h2>
        </div>
      </header>
      <div className="stack-list">
        {sorted.length === 0 ? (
          <div className="quadrant__empty">{t('archive.empty')}</div>
        ) : (
          sorted.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              variant="archive"
              draggable={false}
              onEdit={onEdit}
              onDelete={onDelete}
              onRestore={onRestore}
            />
          ))
        )}
      </div>
    </section>
  );
}
