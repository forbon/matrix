import type { QuadrantId, Task } from '../types';
import { QUADRANT_IDS } from '../types';
import { useI18n } from '../hooks/useI18n';
import type { TKey } from '../hooks/useI18n';

interface Props {
  tasks: Task[];
  active: QuadrantId;
  onSelect: (id: QuadrantId) => void;
}

const ROMAN: Record<QuadrantId, string> = {
  do: 'I',
  schedule: 'II',
  delegate: 'III',
  eliminate: 'IV',
};

export function QuadrantTabs({ tasks, active, onSelect }: Props) {
  const { t } = useI18n();

  return (
    <nav className="quadrant-tabs" role="tablist" aria-label={t('axis.importance')}>
      {QUADRANT_IDS.map((id) => {
        const count = tasks.filter((task) => task.quadrant === id && !task.completed).length;
        const isActive = id === active;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`quadrant-tabs__pill quadrant-tabs__pill--${id} ${
              isActive ? 'quadrant-tabs__pill--active' : ''
            }`}
            onClick={() => onSelect(id)}
          >
            <span className="quadrant-tabs__numeral" aria-hidden="true">{ROMAN[id]}</span>
            <span className="quadrant-tabs__label">{t(`quadrant.${id}` as TKey)}</span>
            {count > 0 && <span className="quadrant-tabs__count">{count}</span>}
          </button>
        );
      })}
    </nav>
  );
}
