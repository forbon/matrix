const de = {
  'app.title': 'Die Matrix',
  'app.subtitle': 'Aufgaben nach Wichtigkeit und Dringlichkeit ordnen',
  'app.issue': 'Ausgabe',
  'app.volume': 'Band',
  'app.week': 'KW',

  'axis.importance': 'Wichtigkeit',
  'axis.urgency': 'Dringlichkeit',
  'axis.high': 'hoch',
  'axis.low': 'gering',
  'axis.urgency.high': 'dringend',
  'axis.urgency.low': 'nicht dringend',
  'axis.importance.high': 'wichtig',
  'axis.importance.low': 'nicht wichtig',

  'quadrant.do': 'Tun',
  'quadrant.do.hint': 'Wichtig & dringend',
  'quadrant.schedule': 'Planen',
  'quadrant.schedule.hint': 'Wichtig, nicht dringend',
  'quadrant.delegate': 'Delegieren',
  'quadrant.delegate.hint': 'Dringend, nicht wichtig',
  'quadrant.eliminate': 'Eliminieren',
  'quadrant.eliminate.hint': 'Weder wichtig noch dringend',

  'action.add': 'Neue Aufgabe',
  'action.edit': 'Bearbeiten',
  'action.delete': 'Löschen',
  'action.save': 'Speichern',
  'action.cancel': 'Abbrechen',
  'action.export.json': 'Export JSON',
  'action.export.csv': 'Export CSV',
  'action.import': 'Importieren',
  'action.enableReminders': 'Erinnerungen aktivieren',
  'action.remindersOn': 'Erinnerungen aktiv',
  'action.remindersDenied': 'Erinnerungen blockiert',
  'action.more': 'Mehr',
  'action.moveTo': 'Verschieben',
  'action.close': 'Schließen',

  'form.title': 'Titel',
  'form.description': 'Beschreibung',
  'form.quadrant': 'Quadrant',
  'form.dueDate': 'Fällig am',
  'form.links': 'Links',
  'form.addLink': '+ Link hinzufügen',
  'form.linkUrl': 'URL',
  'form.linkLabel': 'Bezeichnung (optional)',
  'form.new': 'Neue Aufgabe',
  'form.editTitle': 'Aufgabe bearbeiten',
  'form.titleRequired': 'Titel ist erforderlich',

  'task.completed': 'Erledigt',
  'task.markComplete': 'Als erledigt markieren',
  'task.markIncomplete': 'Als offen markieren',
  'task.empty': 'Keine Aufgaben hier',

  'due.overdue': 'Überfällig',
  'due.today': 'Heute fällig',
  'due.tomorrow': 'Morgen fällig',

  'import.prompt': 'Import: Vorhandene ersetzen oder zusammenführen?',
  'import.replace': 'Ersetzen',
  'import.merge': 'Zusammenführen',
  'import.failed': 'Import fehlgeschlagen',
  'import.noTasks': 'Keine gültigen Aufgaben in der Datei',

  'lang.label': 'Sprache',
  'lang.de': 'Deutsch',
  'lang.en': 'English',

  'notify.title': 'Aufgabe fällig',

  'colophon.licensedUnder': 'MIT-Lizenz',
  'colophon.thirdParty': 'Drittanbieter-Lizenzen',
};

export default de;
export type Dict = typeof de;
