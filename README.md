# Matrix

Eine browserbasierte Matrix-Anwendung zur Priorisierung von Aufgaben nach **Wichtigkeit** und **Dringlichkeit**. Alle Daten bleiben lokal im Browser (LocalStorage) — kein Backend, keine Anmeldung.

## Features

- **Vier Quadranten** mit Drag & Drop zwischen ihnen
  - *Tun* (wichtig + dringend)
  - *Planen* (wichtig, nicht dringend)
  - *Delegieren* (nicht wichtig, dringend)
  - *Eliminieren* (weder noch)
- **Aufgaben** anlegen, bearbeiten, abhaken, löschen
- **Fälligkeitsdatum** mit visuellen Markern (überfällig / heute / morgen)
- **Browser-Benachrichtigungen** bei fälligen Aufgaben (optional)
- **Import/Export** als JSON oder CSV
- **Zweisprachig** (Deutsch / Englisch), persistent

## Entwicklung

Vorausgesetzt: Node.js ≥ 18.

```bash
npm install
npm run dev       # Dev-Server (Vite)
npm run build     # Produktions-Build
npm run preview   # Build lokal prüfen
```

## Bedienung

- Neue Aufgabe: Klick auf **+ Neue Aufgabe** in der Toolbar oder auf das **+**-Symbol in einem Quadranten.
- Verschieben: Aufgabenkarte mit der Maus in einen anderen Quadranten ziehen.
- Bearbeiten: auf eine Aufgabe klicken (nicht auf Checkbox/Löschen).
- Export: **Export JSON** oder **Export CSV** lädt eine Datei herunter.
- Import: **Importieren** → Datei wählen. Bei vorhandenen Aufgaben wird gefragt, ob sie ersetzt oder zusammengeführt werden sollen.
- Sprache: oben rechts umschaltbar.

## Erinnerungen — Limitation

Browser-Benachrichtigungen funktionieren **nur bei geöffnetem Tab**. Da bewusst kein Service Worker verwendet wird (einfacher Aufbau, keine Registrierung), gibt es kein Background-Push. Für eine einfache tägliche Nutzung reicht das: überfällige und heute fällige Aufgaben werden beim Öffnen ohnehin visuell hervorgehoben.

## Stack

React 18 · TypeScript · Vite · LocalStorage · native HTML5 Drag & Drop · Notification API. Bewusst ohne zusätzliche Libraries für DnD, i18n oder UI.

## Datenstruktur

```ts
interface Task {
  id: string;
  title: string;
  description?: string;
  quadrant: 'do' | 'schedule' | 'delegate' | 'eliminate';
  dueDate?: string;    // ISO 8601
  createdAt: string;   // ISO 8601
  completed?: boolean;
}
```

Gespeichert unter den LocalStorage-Schlüsseln:

- `matrix.tasks` — Aufgabenliste (JSON)
- `matrix.lang` — `de` | `en`
- `matrix.firedReminders` — bereits ausgelöste Erinnerungs-IDs
