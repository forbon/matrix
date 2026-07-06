import type { Task } from '../types';
import { QUADRANT_IDS } from '../types';
import { useI18n } from '../hooks/useI18n';
import type { TKey } from '../hooks/useI18n';

export function QuadrantBalance({ tasks }: { tasks: Task[] }) {
  const { t } = useI18n();
  const counts = QUADRANT_IDS.map((id) => ({
    id,
    label: t(`quadrant.${id}` as TKey),
    count: tasks.filter((task) => task.quadrant === id).length,
  }));
  const total = counts.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="balance">
      <span className="balance__title">{t('balance.title')}</span>
      {total === 0 ? (
        <span className="balance__empty">{t('balance.empty')}</span>
      ) : (
        <>
          <div className="balance__bar" role="img" aria-label={counts.map((c) => `${c.label}: ${c.count}`).join(', ')}>
            {counts
              .filter((c) => c.count > 0)
              .map((c) => (
                <div
                  key={c.id}
                  className={`balance__seg balance__seg--${c.id}`}
                  style={{ flexGrow: c.count }}
                  title={`${c.label}: ${c.count}`}
                >
                  <span className="balance__seg-num">{c.count}</span>
                </div>
              ))}
          </div>
          <div className="balance__legend">
            {counts.map((c) => (
              <span key={c.id} className={`balance__legend-item balance__legend-item--${c.id}`}>
                <span className="balance__dot" aria-hidden="true" />
                {c.label} {c.count}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
