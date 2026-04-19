import { useEffect, useRef, useState } from 'react';
import type { QuadrantId, Task } from '../types';
import { QUADRANT_IDS } from '../types';
import { useI18n } from '../hooks/useI18n';
import type { TKey } from '../hooks/useI18n';
import { dueStatus, formatDue } from '../lib/dates';
import { isSafeUrl } from '../lib/urls';

interface Props {
  task: Task;
  draggable?: boolean;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onMove: (id: string, target: QuadrantId) => void;
}

function getHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function linkDisplay(url: string, label?: string): string {
  return label || getHostname(url) || '↗';
}

export function TaskCard({ task, draggable = true, onEdit, onDelete, onToggleComplete, onMove }: Props) {
  const { t, lang } = useI18n();
  const status = dueStatus(task.dueDate);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuUp, setMenuUp] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const moveBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleAway = (e: MouseEvent | TouchEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleAway);
    document.addEventListener('touchstart', handleAway);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleAway);
      document.removeEventListener('touchstart', handleAway);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [menuOpen]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const dueBadge =
    status === 'overdue'
      ? t('due.overdue')
      : status === 'today'
      ? t('due.today')
      : status === 'tomorrow'
      ? t('due.tomorrow')
      : null;

  const safeLinks = task.links?.filter((l) => isSafeUrl(l.url)) ?? [];
  const hasLinks = safeLinks.length > 0;

  const targets = QUADRANT_IDS.filter((q) => q !== task.quadrant);

  return (
    <div
      className={`task-card due-${status} ${task.completed ? 'completed' : ''}`}
      draggable={draggable}
      onDragStart={draggable ? handleDragStart : undefined}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button, input, a, .task-card__menu')) return;
        onEdit(task);
      }}
    >
      <div className="task-card__header">
        <input
          type="checkbox"
          checked={!!task.completed}
          onChange={() => onToggleComplete(task.id)}
          aria-label={task.completed ? t('task.markIncomplete') : t('task.markComplete')}
        />
        <span className="task-card__title">{task.title}</span>
        <div className="task-card__actions" ref={menuRef}>
          <button
            ref={moveBtnRef}
            type="button"
            className="task-card__move"
            onClick={(e) => {
              e.stopPropagation();
              if (!menuOpen && moveBtnRef.current) {
                const MENU_HEIGHT = 160;
                const btnRect = moveBtnRef.current.getBoundingClientRect();
                const listEl = moveBtnRef.current.closest('.quadrant__list');
                const listRect = listEl?.getBoundingClientRect();
                const bottomBoundary = listRect ? listRect.bottom : window.innerHeight;
                const topBoundary = listRect ? listRect.top : 0;
                const spaceBelow = bottomBoundary - btnRect.bottom;
                const spaceAbove = btnRect.top - topBoundary;
                setMenuUp(spaceBelow < MENU_HEIGHT && spaceAbove > spaceBelow);
              }
              setMenuOpen((v) => !v);
            }}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label={t('action.moveTo')}
            title={t('action.moveTo')}
          >
            ⇆
          </button>
          {menuOpen && (
            <div className={`task-card__menu ${menuUp ? 'task-card__menu--up' : ''}`} role="menu">
              <div className="task-card__menu-label">{t('action.moveTo')}</div>
              {targets.map((q) => (
                <button
                  key={q}
                  type="button"
                  role="menuitem"
                  className={`task-card__menu-item task-card__menu-item--${q}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onMove(task.id, q);
                    setMenuOpen(false);
                  }}
                >
                  {t(`quadrant.${q}` as TKey)}
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            className="task-card__delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            aria-label={t('action.delete')}
            title={t('action.delete')}
          >
            ×
          </button>
        </div>
      </div>
      {task.description && <div className="task-card__desc">{task.description}</div>}
      {(task.dueDate || hasLinks) && (
        <div className="task-card__meta">
          {task.dueDate && (
            <>
              <span className={`due-badge due-${status}`}>
                {dueBadge ?? formatDue(task.dueDate, lang)}
              </span>
              {dueBadge && <span className="due-date">{formatDue(task.dueDate, lang)}</span>}
            </>
          )}
          {hasLinks && (
            <div className="task-card__links">
              {safeLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="task-link"
                  title={link.url}
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="task-link__arrow">↗</span>
                  <span className="task-link__label">{linkDisplay(link.url, link.label)}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
