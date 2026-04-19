# Matrix

Eine browserbasierte Matrix-Anwendung zur Priorisierung von Aufgaben nach **Wichtigkeit** und **Dringlichkeit**. Alle Daten bleiben lokal im Browser (LocalStorage) — kein Backend, keine Anmeldung.

## Features

- **Vier Quadranten** mit Drag & Drop zwischen ihnen
  - *Tun* (wichtig + dringend)
  - *Planen* (wichtig, nicht dringend)
  - *Delegieren* (nicht wichtig, dringend)
  - *Eliminieren* (weder noch)
- **Aufgaben** anlegen, bearbeiten, abhaken, löschen
- **Links** pro Aufgabe (mit automatischem Favicon)
- **Fälligkeitsdatum** mit visuellen Markern (überfällig / heute / morgen)
- **Browser-Benachrichtigungen** bei fälligen Aufgaben (optional)
- **Import/Export** als JSON oder CSV
- **Zweisprachig** (Deutsch / Englisch), persistent
- **Hell / Dunkel / System**-Theme, persistent

## Deployment-Konfiguration

Die App liest zur Laufzeit eine optionale Datei `public/config.js`, die **nicht ins Repository gehört** (gitignored). Damit lassen sich deployer-spezifische Daten wie Impressum- und Datenschutz-URLs setzen, ohne sie in den Quellcode zu schreiben.

**Vorlage kopieren und befüllen:**

```bash
cp public/config.example.js public/config.js
# Datei mit eigenen URLs befüllen
```

```js
// public/config.js
window.__MATRIX_CONFIG__ = {
  impressumUrl: 'https://example.de/impressum',
  privacyUrl:   'https://example.de/datenschutz',
};
```

Sind die URLs gesetzt, erscheinen die Links im Footer der App. Fehlt die Datei oder sind die Felder leer, werden die Links schlicht nicht angezeigt — die App läuft in jedem Fall fehlerfrei.

### Docker

Im Container wird `config.js` als Read-only-Volume gemountet:

```yaml
services:
  matrix:
    image: ghcr.io/forbon/matrix:latest
    volumes:
      - ./config.js:/usr/share/nginx/html/config.js:ro
    environment:
      - VIRTUAL_HOST=matrix.example.de
```

Die `config.js` liegt neben der `docker-compose.yml` auf dem Server und benötigt Standardrechte (`644`).

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
- Theme: Toggle in der Toolbar zykelt **Hell → Dunkel → System**. Beim ersten Start folgt das Theme der System-Einstellung (`prefers-color-scheme`).

## Erinnerungen — Limitation

Browser-Benachrichtigungen funktionieren **nur bei geöffnetem Tab**. Da bewusst kein Service Worker verwendet wird (einfacher Aufbau, keine Registrierung), gibt es kein Background-Push. Für eine einfache tägliche Nutzung reicht das: überfällige und heute fällige Aufgaben werden beim Öffnen ohnehin visuell hervorgehoben.

## Stack

React 18 · TypeScript · Vite · LocalStorage · native HTML5 Drag & Drop · Notification API. Bewusst ohne zusätzliche Libraries für DnD, i18n oder UI.

## Datenstruktur

```ts
interface TaskLink {
  url: string;
  label?: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  quadrant: 'do' | 'schedule' | 'delegate' | 'eliminate';
  dueDate?: string;    // ISO 8601
  createdAt: string;   // ISO 8601
  completed?: boolean;
  links?: TaskLink[];
}
```

Gespeichert unter den LocalStorage-Schlüsseln:

- `matrix.tasks` — Aufgabenliste (JSON)
- `matrix.lang` — `de` | `en`
- `matrix.theme` — `light` | `dark` | `system`
- `matrix.firedReminders` — bereits ausgelöste Erinnerungs-IDs

## Lizenz

MIT — siehe [LICENSE](./LICENSE).

Lizenzen der verwendeten Drittanbieter-Bibliotheken: [THIRD_PARTY_LICENSES.md](./THIRD_PARTY_LICENSES.md).
