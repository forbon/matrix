import { useEffect, useRef, useState } from 'react';
import type { Task } from '../types';
import { taskState } from '../types';
import { getNotificationState, notify, requestPermission } from '../lib/notifications';
import type { NotificationState } from '../lib/notifications';
import { useI18n } from './useI18n';

const MAX_TIMEOUT_MS = 2_147_483_000;
const FIRED_KEY = 'matrix.firedReminders';

function loadFired(): Set<string> {
  try {
    const raw = localStorage.getItem(FIRED_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function saveFired(fired: Set<string>) {
  localStorage.setItem(FIRED_KEY, JSON.stringify([...fired]));
}

export function useReminders(tasks: Task[]) {
  const { t } = useI18n();
  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  }, [t]);

  const [state, setState] = useState<NotificationState>(() => getNotificationState());

  useEffect(() => {
    if (state !== 'granted') return;
    const fired = loadFired();
    const timers: number[] = [];
    const now = Date.now();

    for (const task of tasks) {
      if (taskState(task) !== 'active') continue;
      if (!task.dueDate || task.completed) continue;
      if (fired.has(task.id)) continue;
      const due = new Date(task.dueDate).getTime();
      if (Number.isNaN(due)) continue;
      const delay = due - now;

      const fire = () => {
        notify(tRef.current('notify.title'), task.title);
        fired.add(task.id);
        saveFired(fired);
      };

      if (delay <= 0) {
        fire();
      } else if (delay < MAX_TIMEOUT_MS) {
        const id = window.setTimeout(fire, delay);
        timers.push(id);
      }
    }

    return () => {
      for (const id of timers) clearTimeout(id);
    };
  }, [tasks, state]);

  const enable = async () => {
    const result = await requestPermission();
    setState(result);
    return result;
  };

  return { state, enable };
}
