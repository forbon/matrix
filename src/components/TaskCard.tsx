import { useEffect, useRef, useState } from 'react';
import type { QuadrantId, Task } from '../types';
import { QUADRANT_IDS } from '../types';
import { useI18n } from '../hooks/useI18n';
import type { TKey } from '../hooks/useI18n';
import { dueStatus, formatDue } from '../lib/dates';
import { isSafeUrl } from '../lib/urls';

export type TaskCardVariant = 'matrix' | 'backlog' | 'archive';

interface Props {
  task: Task;
  variant?: TaskCardVariant;
  draggable?: boolean;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleComplete?: (id: string) => void;
  onMove?: (id: string, target: QuadrantId) => void;
  onToBacklog?: (id: string) => void;
  onArchive?: (id: string) => void;
  onRestore?: (id: string) => void;
  onPromote?: (id: string, target: QuadrantId) => void;
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

export function TaskCard({
  task,
  variant = 'matrix',
  draggable = true,
  onEdit,
  onDelete,
  onToggleComplete,
  onMove,
  onToBacklog,
  onArchive,
  onRestore,
  onPromote,
}: Props) {
  const { t, lang } = useI18n();
  const status = dueStatus(task.dueDate);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuUp, setMenuUp] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const moveBtnRef = useRef<HTMLButtonElement>(null);
  const confirmTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (confirmTimerRef.current !== null) {
        window.clearTimeout(confirmTimerRef.current);
      }
    };
  }, []);

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

  const moveTargets = QUADRANT_IDS.filter((q) => q !== task.quadrant);
  const promoteTargets = QUADRANT_IDS;

  const showMoveMenu =
    (variant === 'matrix' && (onMove || onToBacklog)) ||
    (variant === 'backlog' && !!onPromote) ||
    (variant === 'archive' && !!onRestore);

  const toggleMenu = () => {
    if (!menuOpen && moveBtnRef.current) {
      const MENU_HEIGHT = 200;
      const btnRect = moveBtnRef.current.getBoundingClientRect();
      const listEl =
        moveBtnRef.current.closest('.quadrant__list') ||
        moveBtnRef.current.closest('.stack-list');
      const listRect = listEl?.getBoundingClientRect();
      const bottomBoundary = listRect ? listRect.bottom : window.innerHeight;
      const topBoundary = listRect ? listRect.top : 0;
      const spaceBelow = bottomBoundary - btnRect.bottom;
      const spaceAbove = btnRect.top - topBoundary;
      setMenuUp(spaceBelow < MENU_HEIGHT && spaceAbove > spaceBelow);
    }
    setMenuOpen((v) => !v);
  };

  const menuBtnLabel =
    variant === 'archive'
      ? t('action.restore')
      : variant === 'backlog'
      ? t('action.promote')
      : t('action.moveTo');

  const dismissesToArchive = variant !== 'archive' && !!onArchive;
  const baseDismissLabel = dismissesToArchive
    ? t('action.archive')
    : variant === 'archive'
    ? t('action.deletePermanent')
    : t('action.delete');
  const dismissLabel = confirmingDelete ? t('action.confirmDelete') : baseDismissLabel;

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (dismissesToArchive && onArchive) {
      onArchive(task.id);
      return;
    }
    if (variant === 'archive' && !confirmingDelete) {
      setConfirmingDelete(true);
      if (confirmTimerRef.current !== null) {
        window.clearTimeout(confirmTimerRef.current);
      }
      confirmTimerRef.current = window.setTimeout(() => {
        setConfirmingDelete(false);
        confirmTimerRef.current = null;
      }, 3000);
      return;
    }
    if (confirmTimerRef.current !== null) {
      window.clearTimeout(confirmTimerRef.current);
      confirmTimerRef.current = null;
    }
    setConfirmingDelete(false);
    onDelete(task.id);
  };

  return (
    <div
      className={`task-card task-card--${variant} due-${status} ${task.completed ? 'completed' : ''}`}
      draggable={draggable}
      onDragStart={draggable ? handleDragStart : undefined}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button, input, a, .task-card__menu')) return;
        onEdit(task);
      }}
    >
      <div className="task-card__header">
        {onToggleComplete ? (
          <input
            type="checkbox"
            checked={!!task.completed}
            onChange={() => onToggleComplete(task.id)}
            aria-label={task.completed ? t('task.markIncomplete') : t('task.markComplete')}
          />
        ) : (
          <span className="task-card__checkbox-spacer" aria-hidden="true" />
        )}
        <span className="task-card__title">{task.title}</span>
        <div className="task-card__actions" ref={menuRef}>
          {showMoveMenu && (
            <>
              <button
                ref={moveBtnRef}
                type="button"
                className="task-card__move"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMenu();
                }}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label={menuBtnLabel}
                title={menuBtnLabel}
              >
                {variant === 'archive' ? '↺' : '⇆'}
              </button>
              {menuOpen && (
                <div className={`task-card__menu ${menuUp ? 'task-card__menu--up' : ''}`} role="menu">
                  {variant === 'matrix' && onMove && moveTargets.length > 0 && (
                    <>
                      <div className="task-card__menu-label">{t('action.moveTo')}</div>
                      {moveTargets.map((q) => (
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
                    </>
                  )}
                  {variant === 'backlog' && onPromote && (
                    <>
                      <div className="task-card__menu-label">{t('action.promote')}</div>
                      {promoteTargets.map((q) => (
                        <button
                          key={q}
                          type="button"
                          role="menuitem"
                          className={`task-card__menu-item task-card__menu-item--${q}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onPromote(task.id, q);
                            setMenuOpen(false);
                          }}
                        >
                          {t(`quadrant.${q}` as TKey)}
                        </button>
                      ))}
                    </>
                  )}
                  {variant === 'matrix' && onToBacklog && (
                    <>
                      <div className="task-card__menu-sep" aria-hidden="true" />
                      <button
                        type="button"
                        role="menuitem"
                        className="task-card__menu-item"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToBacklog(task.id);
                          setMenuOpen(false);
                        }}
                      >
                        {t('action.toBacklog')}
                      </button>
                    </>
                  )}
                  {variant === 'archive' && onRestore && (
                    <button
                      type="button"
                      role="menuitem"
                      className="task-card__menu-item"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRestore(task.id);
                        setMenuOpen(false);
                      }}
                    >
                      {t('action.restore')}
                    </button>
                  )}
                </div>
              )}
            </>
          )}
          <button
            type="button"
            className={`task-card__delete ${confirmingDelete ? 'task-card__delete--confirming' : ''}`}
            onClick={handleDismiss}
            aria-label={dismissLabel}
            title={dismissLabel}
          >
            {confirmingDelete ? '?' : '×'}
          </button>
        </div>
      </div>
      {task.description && <div className="task-card__desc">{task.description}</div>}
      {((variant === 'archive' ? task.archivedAt : task.dueDate) || hasLinks) && (
        <div className="task-card__meta">
          {variant === 'archive' && task.archivedAt && (
            <span className="archive-date">
              {t('archive.dateLabel')} {formatDue(task.archivedAt, lang)}
            </span>
          )}
          {variant !== 'archive' && task.dueDate && (
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
