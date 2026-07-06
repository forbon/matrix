# Quadranten-Balance-Leiste

## Zweck

Auf einen Blick zeigen, wie sich die **offenen** (aktiven) Aufgaben auf die vier
Eisenhower-Quadranten verteilen — als proportionaler Balken mit Zahlen. Macht
sichtbar, ob die Verteilung kippt (z.B. zu viel im „Tun"-Quadranten), ohne
wertenden Hinweistext.

## Scope

- **In scope:** Verteilung der aktuell aktiven Aufgaben (`state === 'active'`)
  pro Quadrant, als Balken + Zahlen, immer sichtbar in der Matrix-Ansicht.
- **Out of scope:** Erledigungs-Statistik über Zeit, Verhaltens-Auswertung,
  methodische Hinweistexte, Backlog/Archiv-Aufgaben. (Bewusst später, kein
  Erledigungs-Zeitstempel nötig.)

## Datenquelle

Kein neues Datenfeld. `App.tsx` berechnet bereits `activeTasks` (memoized aus
`tasks`). Die Leiste erhält diese Liste und zählt pro `QUADRANT_IDS` — vier
Zahlen, rein abgeleitet, reaktiv über den bestehenden State. Aufgaben ohne
`quadrant` (theoretisch möglich bei `active`) werden nicht gezählt.

## Komponente

`src/components/QuadrantBalance.tsx`, Props `{ tasks: Task[] }`:

- Zählt pro Quadrant über `QUADRANT_IDS`.
- Rendert einen horizontalen Balken, in bis zu vier Segmente geteilt;
  Segmentbreite proportional zur Anzahl (`flex-grow: count`). Quadranten mit
  Anzahl 0 erzeugen kein Segment.
- Pro Segment die Zahl, sichtbar ab ausreichender Breite (sonst via `title`).
- Kompakte Legende: Quadranten-Glyph/Kürzel + Zahl je Quadrant.
- **Leerzustand:** keine aktiven Aufgaben → dezenter Platzhaltertext
  (`t('balance.empty')`), kein leerer Balken.

## Farben

Wiederverwendung des bestehenden `--spot`-Mappings aus `styles.css`
(`do→--pink`, `schedule→--blue`, `delegate→--yellow`, `eliminate→--ink`).
Damit automatisch theme- und stil-aware (classic/atlas, hell/dunkel), keine
neuen Farbwerte. Segment- und Legenden-Klassen setzen `--spot` je Quadrant
analog zu den vorhandenen `.quadrant--<id>`-Regeln.

## Platzierung (Option A)

In `App.tsx` wird `.matrix-frame` in einen `<div class="matrix-col">`
(Flex-Column) gewrappt; die Balance-Leiste ist dessen erstes Kind, direkt über
der Matrix. Robust gegen den `.workspace`-/`.matrix-frame`-Grid-Autoflow; die
Leiste ist exakt so breit wie die Matrix-Spalte (nicht über das Backlog).
Ein zusätzliches DIV, minimaler Diff.

## i18n

Neue Keys in `src/i18n/de.ts` und `src/i18n/en.ts`:
`balance.title`, `balance.empty`. Quadranten-Kürzel wiederverwenden, falls
vorhanden; sonst als weitere Keys ergänzen.

## Verifikation

- Typecheck grün (`tsc -b`).
- Im Browser (dev-browser): Aufgaben in mehrere Quadranten legen → Balken zeigt
  korrekte Proportionen und Zahlen; alle aktiven Aufgaben löschen → Leerzustand;
  Theme- und Stil-Toggle → Segmentfarben passen sich an.
