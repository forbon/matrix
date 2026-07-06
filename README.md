# Matrix

Eine browserbasierte Matrix-Anwendung zur Priorisierung von Aufgaben nach **Wichtigkeit** und **Dringlichkeit**. Alle Daten bleiben lokal im Browser (LocalStorage) — kein Backend, keine Anmeldung.

## Features

- **Vier Quadranten** mit Drag & Drop zwischen ihnen
  - *Tun* (wichtig + dringend)
  - *Planen* (wichtig, nicht dringend)
  - *Delegieren* (nicht wichtig, dringend)
  - *Eliminieren* (weder noch)
- **Aufgaben** anlegen, bearbeiten, abhaken, löschen
- **Links** pro Aufgabe
- **Fälligkeitsdatum** mit visuellen Markern (überfällig / heute / morgen)
- **Import/Export** als JSON
- **Zweisprachig** (Deutsch / Englisch), persistent
- **Hell / Dunkel / System**-Theme, persistent
- **Zwei Design-Stile**: *Klassisch* (Risograph-Zine) und *Atlas* (editorial-modernistisch), persistent

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

Im Container wird `config.js` als Read-only-Volume gemountet. Optional lassen sich auch eigene Impressums- und Datenschutz-Seiten mit demselben Pattern als statische HTML-Dateien servieren — `config.js` zeigt dann auf relative Pfade (`/impressum.html`, `/datenschutz.html`):

```yaml
services:
  matrix:
    image: ghcr.io/forbon/matrix:latest
    volumes:
      - ./config.js:/usr/share/nginx/html/config.js:ro
      # Optional: eigene Legal-Seiten unter derselben Domain ausliefern
      - ./impressum.html:/usr/share/nginx/html/impressum.html:ro
      - ./datenschutz.html:/usr/share/nginx/html/datenschutz.html:ro
    environment:
      - VIRTUAL_HOST=matrix.example.de
```

`config.js` liegt neben der `docker-compose.yml` auf dem Server und benötigt Standardrechte (`644`). Wenn du keine Legal-Mounts setzt, kannst du in `config.js` weiterhin auf extern gehostete Seiten verweisen — beide Wege werden unterstützt.

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
- Export: **Export JSON** lädt eine Datei herunter.
- Import: **Importieren** → Datei wählen. Bei vorhandenen Aufgaben wird gefragt, ob sie ersetzt oder zusammengeführt werden sollen.
- Sprache: oben rechts umschaltbar.
- Theme: Toggle in der Toolbar zykelt **Hell → Dunkel → System**. Beim ersten Start folgt das Theme der System-Einstellung (`prefers-color-scheme`).
- Stil: Toggle in der Toolbar wechselt zwischen **Klassisch** (Risograph-Zine, Default) und **Atlas** (editorial-modernistisch — gedämpfte Farben, Newsreader & IBM Plex, ohne Halftone). Funktioniert orthogonal zu Hell/Dunkel.

## Stack

React 18 · TypeScript · Vite · LocalStorage · native HTML5 Drag & Drop. Bewusst ohne zusätzliche Libraries für DnD, i18n oder UI.

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
- `matrix.style` — `classic` | `atlas`

## Lizenz

MIT — siehe [LICENSE](./LICENSE).

Lizenzen der verwendeten Drittanbieter-Bibliotheken: [THIRD_PARTY_LICENSES.md](./THIRD_PARTY_LICENSES.md).
