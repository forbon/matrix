import type { Task } from '../types';
import { useI18n } from '../hooks/useI18n';
import { dueStatus, formatDue } from '../lib/dates';
import { isSafeUrl } from '../lib/urls';

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

function getHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function getFaviconUrl(url: string): string {
  const hostname = getHostname(url);
  if (!hostname) return '';
  if (hostname.includes('jira')) return 'https://icons.duckduckgo.com/ip3/jira.atlassian.com.ico';
  if (hostname.includes('confluence')) return 'https://icons.duckduckgo.com/ip3/confluence.atlassian.com.ico';
  return `https://icons.duckduckgo.com/ip3/${hostname}.ico`;
}

function linkDisplay(url: string, label?: string): string {
  return label || getHostname(url) || '↗';
}

export function TaskCard({ task, onEdit, onDelete, onToggleComplete }: Props) {
  const { t, lang } = useI18n();
  const status = dueStatus(task.dueDate);

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

  return (
    <div
      className={`task-card due-${status} ${task.completed ? 'completed' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button, input, a')) return;
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
        <button
          type="button"
          className="task-card__delete"
          onClick={() => onDelete(task.id)}
          aria-label={t('action.delete')}
          title={t('action.delete')}
        >
          ×
        </button>
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
                  {getHostname(link.url) ? (
                    <img
                      src={getFaviconUrl(link.url)}
                      width={13}
                      height={13}
                      alt=""
                      className="task-link__favicon"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const arrow = e.currentTarget.nextElementSibling as HTMLElement | null;
                        if (arrow) arrow.style.display = 'inline';
                      }}
                    />
                  ) : null}
                  <span
                    className="task-link__arrow"
                    style={{ display: getHostname(link.url) ? 'none' : 'inline' }}
                  >↗</span>
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
