# Quadranten-Balance-Leiste Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eine schmale, immer sichtbare Leiste über der Matrix, die die Verteilung der offenen (aktiven) Aufgaben auf die vier Quadranten als proportionalen Balken mit Zahlen zeigt.

**Architecture:** Neue präsentationelle Komponente `QuadrantBalance` zählt aus der bereits in `App.tsx` memoized berechneten `activeTasks`-Liste pro `QUADRANT_IDS`. Sie wird in einen neuen Flex-Column-Wrapper `.matrix-col` über `.matrix-frame` gehängt (Option A aus dem Spec). Farben kommen aus dem bestehenden `--spot`-Mapping, i18n aus dem bestehenden Dict-Muster.

**Tech Stack:** React 18 + TypeScript, Vite, plain CSS (keine Libs). Kein Test-Framework im Repo.

## Global Constraints

- **Kein Test-Framework vorhanden.** Verifikation ausschließlich über `npx tsc -b` (Typecheck) und Browser-Check via `dev-browser` gegen `npm run dev`. Keine Test-Runner/Dateien anlegen.
- **Keine neuen Dependencies.** `package.json` bleibt bei `react`/`react-dom`.
- **Farben wiederverwenden:** `do→--pink`, `schedule→--blue`, `delegate→--yellow`, `eliminate→--ink` (bestehendes `--spot`-Muster in `src/styles.css`). Keine neuen Farbwerte.
- **Quadranten-Labels:** bestehende Keys `quadrant.<id>` nutzen (Muster `` `quadrant.${id}` as TKey `` wie in `Quadrant.tsx:47`).
- **Zweisprachig:** jeder neue i18n-Key in `de.ts` UND `en.ts`.

---

### Task 1: i18n-Keys + QuadrantBalance-Komponente

**Files:**
- Modify: `src/i18n/de.ts`
- Modify: `src/i18n/en.ts`
- Create: `src/components/QuadrantBalance.tsx`

**Interfaces:**
- Consumes: `Task`, `QuadrantId`, `QUADRANT_IDS` aus `../types`; `useI18n`, `TKey` aus `../hooks/useI18n`.
- Produces: `export function QuadrantBalance({ tasks }: { tasks: Task[] })` — für Task 2.

- [ ] **Step 1: i18n-Keys ergänzen**

In `src/i18n/de.ts` (im selben Objekt, z.B. nach den `quadrant.*`-Keys) hinzufügen:

```ts
  'balance.title': 'Balance',
  'balance.empty': 'Keine offenen Aufgaben',
```

In `src/i18n/en.ts` an gleicher Stelle:

```ts
  'balance.title': 'Balance',
  'balance.empty': 'No open tasks',
```

- [ ] **Step 2: Komponente anlegen**

Create `src/components/QuadrantBalance.tsx`:

```tsx
import type { Task } from '../types';
import { QUADRANT_IDS } from '../types';
import { useI18n } from '../hooks/useI18n';
import type { TKey } from '../hooks/useI18n';

export function QuadrantBalance({ tasks }: { tasks: Task[] }) {
  const { t } = useI18n();
  const counts = QUADRANT_IDS.map((id) => ({
    id,
    label: t(`quadrant.${id}` as TKey),
    count: tasks.filter((task) => task.quadrant === id).length,
  }));
  const total = counts.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="balance">
      <span className="balance__title">{t('balance.title')}</span>
      {total === 0 ? (
        <span className="balance__empty">{t('balance.empty')}</span>
      ) : (
        <>
          <div className="balance__bar" role="img" aria-label={counts.map((c) => `${c.label}: ${c.count}`).join(', ')}>
            {counts
              .filter((c) => c.count > 0)
              .map((c) => (
                <div
                  key={c.id}
                  className={`balance__seg balance__seg--${c.id}`}
                  style={{ flexGrow: c.count }}
                  title={`${c.label}: ${c.count}`}
                >
                  <span className="balance__seg-num">{c.count}</span>
                </div>
              ))}
          </div>
          <div className="balance__legend">
            {counts.map((c) => (
              <span key={c.id} className={`balance__legend-item balance__legend-item--${c.id}`}>
                <span className="balance__dot" aria-hidden="true" />
                {c.label} {c.count}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc -b`
Expected: Exit 0, keine Fehler. (Komponente ist noch ungenutzt — das ist ok, `tsc -b` meldet keine unused-Exports.)

- [ ] **Step 4: Commit**

```bash
git add src/i18n/de.ts src/i18n/en.ts src/components/QuadrantBalance.tsx
git commit -m "feat: QuadrantBalance-Komponente + i18n-Keys"
```

---

### Task 2: In App einbinden + CSS

**Files:**
- Modify: `src/App.tsx` (Import + `.matrix-col`-Wrapper um `.matrix-frame`)
- Modify: `src/styles.css` (Balance-Styles)

**Interfaces:**
- Consumes: `QuadrantBalance` aus `./components/QuadrantBalance`; die bestehende `activeTasks`-Variable in `App.tsx`.

- [ ] **Step 1: Komponente importieren**

In `src/App.tsx` bei den übrigen Component-Imports ergänzen:

```tsx
import { QuadrantBalance } from './components/QuadrantBalance';
```

- [ ] **Step 2: Wrapper einfügen**

In `src/App.tsx` den bestehenden Block

```tsx
            <div className="matrix-frame">
```

ersetzen durch (öffnendes `matrix-col` + Balance davor):

```tsx
            <div className="matrix-col">
            <QuadrantBalance tasks={activeTasks} />
            <div className="matrix-frame">
```

und das zugehörige schließende `</div>` der `matrix-frame` (direkt vor `<BacklogPanel`) um ein weiteres `</div>` für `matrix-col` ergänzen:

```tsx
            </div>
            </div>
            <BacklogPanel
```

- [ ] **Step 3: CSS ergänzen**

Am Ende von `src/styles.css` (vor evtl. abschließenden Media-/Theme-Blöcken ist unnötig — ans Dateiende reicht, da farbneutrale Regeln über `--spot`/Palette-Vars laufen) anfügen:

```css
/* ─── quadrant balance strip ─────────────────────────────────── */
.matrix-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.balance {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 14px;
  font-size: 0.8rem;
}

.balance__title {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
  color: var(--ink-soft);
}

.balance__empty {
  color: var(--ink-soft);
  font-style: italic;
}

.balance__bar {
  display: flex;
  flex: 1 1 200px;
  min-width: 160px;
  height: 14px;
  border: 2px solid var(--ink);
  overflow: hidden;
}

.balance__seg {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  background: var(--spot, var(--pink));
  color: var(--paper);
  font-size: 0.65rem;
  font-weight: 700;
  line-height: 1;
}

.balance__seg + .balance__seg { border-left: 2px solid var(--ink); }

.balance__seg-num { padding: 0 3px; }

.balance__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  color: var(--ink-soft);
}

.balance__legend-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.balance__dot {
  width: 9px;
  height: 9px;
  background: var(--spot, var(--pink));
  border: 1px solid var(--ink);
}

.balance__seg--do,       .balance__legend-item--do       { --spot: var(--pink); }
.balance__seg--schedule, .balance__legend-item--schedule { --spot: var(--blue); }
.balance__seg--delegate, .balance__legend-item--delegate { --spot: var(--yellow); }
.balance__seg--eliminate,.balance__legend-item--eliminate{ --spot: var(--ink); }
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc -b`
Expected: Exit 0.

- [ ] **Step 5: Browser-Verifikation**

```bash
npm run dev -- --port 5199 &   # Hintergrund
```

Dann via dev-browser: App auf `http://localhost:5199/` laden, mehrere Aufgaben in verschiedene Quadranten anlegen (oder JSON importieren), prüfen:
1. Balken erscheint über der Matrix, Segmentbreiten proportional zu den Zahlen.
2. Segment-/Legenden-Farben = Quadranten-Farben.
3. Theme-Toggle (☀/☾/◐) und Stil-Toggle (Klassisch/Atlas) → Farben passen sich an.
4. Alle aktiven Aufgaben löschen/verschieben → Leerzustand-Text statt Balken.

Screenshot ansehen (`saveScreenshot` → Read), auf leere/kaputte Darstellung prüfen. Dev-Server danach beenden.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/styles.css
git commit -m "feat: Quadranten-Balance-Leiste über der Matrix"
```

---

## Self-Review

**Spec coverage:**
- Zweck (Verteilung offene Aufgaben, Balken+Zahlen, wertfrei) → Task 1 Komponente. ✓
- Datenquelle `activeTasks`, kein neues Feld → Task 2 Step 2. ✓
- Komponente mit Segmenten/Proportion/Zahlen/Legende/Leerzustand → Task 1. ✓
- Farben via `--spot`, theme-/stil-aware → Task 2 CSS. ✓
- Platzierung Option A (`.matrix-col`-Wrapper) → Task 2 Step 2. ✓
- i18n de+en → Task 1 Step 1. ✓
- Verifikation tsc + Browser → Task 2 Steps 4–5. ✓

**Placeholder scan:** Kein TBD/TODO; alle Code- und CSS-Blöcke vollständig. ✓

**Type consistency:** `QuadrantBalance({ tasks }: { tasks: Task[] })` in Task 1 = Aufruf `<QuadrantBalance tasks={activeTasks} />` in Task 2. Keys `balance.title`/`balance.empty` in beiden Dicts angelegt und in der Komponente verwendet. Klassennamen `balance__seg--<id>` / `balance__legend-item--<id>` in Komponente und CSS identisch. ✓
