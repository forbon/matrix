import { useEffect, useRef, useState } from 'react';
import type { Task, Theme } from '../types';
import { useI18n } from '../hooks/useI18n';
import { useTheme } from '../hooks/useTheme';
import { LanguageSwitcher } from './LanguageSwitcher';
import { exportJSON, importFromFile } from '../lib/importExport';
import type { NotificationState } from '../lib/notifications';

const THEME_GLYPH: Record<Theme, string> = {
  light: '☀',
  dark: '☾',
  system: '◐',
};

export type ViewId = 'matrix' | 'archive';

interface Props {
  tasks: Task[];
  view: ViewId;
  onViewChange: (view: ViewId) => void;
  archiveCount: number;
  onAdd: () => void;
  onImport: (incoming: Task[]) => void;
  notificationState: NotificationState;
  onEnableReminders: () => void;
}

export function Toolbar({
  tasks,
  view,
  onViewChange,
  archiveCount,
  onAdd,
  onImport,
  notificationState,
  onEnableReminders,
}: Props) {
  const { t } = useI18n();
  const { theme, cycleTheme } = useTheme();
  const fileInput = useRef<HTMLInputElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const themeLabel =
    theme === 'light' ? t('action.theme.light') : theme === 'dark' ? t('action.theme.dark') : t('action.theme.system');
  const themeTitle = `${t('action.theme.toggle')}: ${themeLabel}`;

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

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const incoming = await importFromFile(file);
      if (incoming.length === 0) {
        alert(t('import.noTasks'));
        return;
      }
      onImport(incoming);
    } catch {
      alert(t('import.failed'));
    }
  };

  const reminderLabel =
    notificationState === 'granted'
      ? t('action.remindersOn')
      : notificationState === 'denied'
      ? t('action.remindersDenied')
      : t('action.enableReminders');
  const reminderDisabled =
    notificationState === 'granted' ||
    notificationState === 'denied' ||
    notificationState === 'unsupported';

  const viewTabs: { id: ViewId; labelKey: 'view.matrix' | 'view.archive'; count?: number }[] = [
    { id: 'matrix', labelKey: 'view.matrix' },
    { id: 'archive', labelKey: 'view.archive', count: archiveCount },
  ];

  return (
    <>
      <nav className="view-tabs" role="tablist" aria-label={t('view.matrix')}>
        {viewTabs.map((tab) => {
          const isActive = tab.id === view;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`view-tabs__tab ${isActive ? 'view-tabs__tab--active' : ''}`}
              onClick={() => onViewChange(tab.id)}
            >
              <span className="view-tabs__label">{t(tab.labelKey)}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="view-tabs__count">{tab.count}</span>
              )}
            </button>
          );
        })}
      </nav>
      <div className="toolbar">
        <button type="button" className="btn btn--primary toolbar__add" onClick={onAdd}>
          + {t('action.add')}
        </button>
        <div className="toolbar__desktop-items">
          <button type="button" className="btn" onClick={() => exportJSON(tasks)}>
            {t('action.export.json')}
          </button>
          <button type="button" className="btn" onClick={() => fileInput.current?.click()}>
            {t('action.import')}
          </button>
          <button
            type="button"
            className="btn"
            onClick={onEnableReminders}
            disabled={reminderDisabled}
          >
            {reminderLabel}
          </button>
          <button
            type="button"
            className="btn toolbar__theme"
            onClick={cycleTheme}
            aria-label={themeTitle}
            title={themeTitle}
          >
            <span className="toolbar__theme-glyph" aria-hidden="true">{THEME_GLYPH[theme]}</span>
            <span className="toolbar__theme-label">{themeLabel}</span>
          </button>
        </div>
        <input
          ref={fileInput}
          type="file"
          accept=".json,.csv,application/json,text/csv"
          className="toolbar__file-input"
          onChange={handleFile}
        />
        <span className="toolbar__spacer" />
        <div className="toolbar__desktop-lang">
          <LanguageSwitcher />
        </div>
        <div className="toolbar__mobile-actions" ref={menuRef}>
          <button
            type="button"
            className="btn toolbar__overflow"
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label={t('action.more')}
            title={t('action.more')}
          >
            ⋯
          </button>
          {menuOpen && (
            <div className="toolbar__menu" role="menu">
              <button
                type="button"
                role="menuitem"
                className="toolbar__menu-item"
                onClick={() => {
                  setMenuOpen(false);
                  exportJSON(tasks);
                }}
              >
                {t('action.export.json')}
              </button>
              <button
                type="button"
                role="menuitem"
                className="toolbar__menu-item"
                onClick={() => {
                  setMenuOpen(false);
                  fileInput.current?.click();
                }}
              >
                {t('action.import')}
              </button>
              <button
                type="button"
                role="menuitem"
                className="toolbar__menu-item"
                onClick={() => {
                  if (reminderDisabled) return;
                  setMenuOpen(false);
                  onEnableReminders();
                }}
                disabled={reminderDisabled}
              >
                {reminderLabel}
              </button>
              <button
                type="button"
                role="menuitem"
                className="toolbar__menu-item"
                onClick={() => {
                  cycleTheme();
                }}
              >
                <span className="toolbar__theme-glyph" aria-hidden="true">{THEME_GLYPH[theme]}</span>
                {' '}{t('action.theme.toggle')}: {themeLabel}
              </button>
              <div
                className="toolbar__menu-lang"
                onClick={(e) => e.stopPropagation()}
              >
                <LanguageSwitcher />
              </div>
            </div>
          )}
        </div>
      </div>
      <button
        type="button"
        className="toolbar__fab"
        onClick={onAdd}
        aria-label={t('action.add')}
        title={t('action.add')}
      >
        +
      </button>
    </>
  );
}
