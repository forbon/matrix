import { useEffect, useRef, useState } from 'react';
import type { QuadrantId, Task, TaskLink } from '../types';
import { QUADRANT_IDS } from '../types';
import { useI18n } from '../hooks/useI18n';
import type { TKey } from '../hooks/useI18n';
import { isSafeUrl } from '../lib/urls';

export interface TaskFormValues {
  title: string;
  description?: string;
  quadrant: QuadrantId;
  dueDate?: string;
  links?: TaskLink[];
}

interface Props {
  open: boolean;
  initial?: Task;
  defaultQuadrant?: QuadrantId;
  onSubmit: (values: TaskFormValues, id?: string) => void;
  onCancel: () => void;
}

type LinkRow = { url: string; label: string };

function toDateInput(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function fromDateInput(value: string): string | undefined {
  if (!value) return undefined;
  const d = new Date(`${value}T12:00:00`);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

export function TaskForm({ open, initial, defaultQuadrant, onSubmit, onCancel }: Props) {
  const { t } = useI18n();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [quadrant, setQuadrant] = useState<QuadrantId>('do');
  const [dueDate, setDueDate] = useState('');
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!open) return;
    setTitle(initial?.title ?? '');
    setDescription(initial?.description ?? '');
    setQuadrant(initial?.quadrant ?? defaultQuadrant ?? 'do');
    setDueDate(toDateInput(initial?.dueDate));
    setLinks(initial?.links?.map((l) => ({ url: l.url, label: l.label ?? '' })) ?? []);
    setError(null);
  }, [open, initial, defaultQuadrant]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;
    const focusable = () =>
      Array.from(
        panel.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute('disabled'));

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
        return;
      }
      if (e.key !== 'Tab') return;
      const els = focusable();
      if (els.length === 0) return;
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  const addLink = () => setLinks((prev) => [...prev, { url: '', label: '' }]);

  const updateLink = (i: number, field: keyof LinkRow, value: string) =>
    setLinks((prev) => prev.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));

  const removeLink = (i: number) => setLinks((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError(t('form.titleRequired'));
      return;
    }
    const validLinks = links
      .filter((l) => l.url.trim() && isSafeUrl(l.url.trim()))
      .map((l) => ({ url: l.url.trim(), label: l.label.trim() || undefined }));
    onSubmit(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        quadrant,
        dueDate: fromDateInput(dueDate),
        links: validLinks.length > 0 ? validLinks : undefined,
      },
      initial?.id,
    );
  };

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="task-form-title" onClick={onCancel}>
      <form className="modal__panel" ref={panelRef} onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}>
        <span className="modal__handle" aria-hidden="true" />
        <h2 id="task-form-title" className="modal__title">{initial ? t('form.editTitle') : t('form.new')}</h2>

        <label className="field">
          <span className="field__label">{t('form.title')}</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            required
          />
        </label>

        <label className="field">
          <span className="field__label">{t('form.description')}</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </label>

        <label className="field">
          <span className="field__label">{t('form.quadrant')}</span>
          <select value={quadrant} onChange={(e) => setQuadrant(e.target.value as QuadrantId)}>
            {QUADRANT_IDS.map((id) => (
              <option key={id} value={id}>
                {t(`quadrant.${id}` as TKey)}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field__label">{t('form.dueDate')}</span>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </label>

        <div className="field">
          <span className="field__label">{t('form.links')}</span>
          {links.map((row, i) => (
            <div key={i} className="link-row">
              <input
                type="url"
                className="link-row__url"
                placeholder={t('form.linkUrl')}
                value={row.url}
                onChange={(e) => updateLink(i, 'url', e.target.value)}
              />
              <input
                type="text"
                className="link-row__label"
                placeholder={t('form.linkLabel')}
                value={row.label}
                onChange={(e) => updateLink(i, 'label', e.target.value)}
              />
              <button
                type="button"
                className="link-row__remove"
                onClick={() => removeLink(i)}
                aria-label={t('action.delete')}
              >
                ×
              </button>
            </div>
          ))}
          <button type="button" className="btn btn--add-link" onClick={addLink}>
            {t('form.addLink')}
          </button>
        </div>

        {error && <div className="form-error">{error}</div>}

        <div className="modal__actions">
          <button type="button" onClick={onCancel} className="btn btn--ghost">
            {t('action.cancel')}
          </button>
          <button type="submit" className="btn btn--primary">
            {t('action.save')}
          </button>
        </div>
      </form>
    </div>
  );
}
