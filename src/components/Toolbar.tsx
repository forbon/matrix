import { useRef } from 'react';
import type { Task } from '../types';
import { useI18n } from '../hooks/useI18n';
import { LanguageSwitcher } from './LanguageSwitcher';
import { exportCSV, exportJSON, importFromFile } from '../lib/importExport';
import type { NotificationState } from '../lib/notifications';

interface Props {
  tasks: Task[];
  onAdd: () => void;
  onImport: (incoming: Task[]) => void;
  notificationState: NotificationState;
  onEnableReminders: () => void;
}

export function Toolbar({ tasks, onAdd, onImport, notificationState, onEnableReminders }: Props) {
  const { t } = useI18n();
  const fileInput = useRef<HTMLInputElement>(null);

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

  return (
    <div className="toolbar">
      <button type="button" className="btn btn--primary" onClick={onAdd}>
        + {t('action.add')}
      </button>
      <button type="button" className="btn" onClick={() => exportJSON(tasks)}>
        {t('action.export.json')}
      </button>
      <button type="button" className="btn" onClick={() => exportCSV(tasks)}>
        {t('action.export.csv')}
      </button>
      <button type="button" className="btn" onClick={() => fileInput.current?.click()}>
        {t('action.import')}
      </button>
      <input
        ref={fileInput}
        type="file"
        accept=".json,.csv,application/json,text/csv"
        style={{ display: 'none' }}
        onChange={handleFile}
      />
      <button
        type="button"
        className="btn"
        onClick={onEnableReminders}
        disabled={notificationState === 'granted' || notificationState === 'denied' || notificationState === 'unsupported'}
      >
        {reminderLabel}
      </button>
      <span className="toolbar__spacer" />
      <LanguageSwitcher />
    </div>
  );
}
