export function appHasDailyNotesPluginLoaded(): boolean {
  const { app } = window;
  const dailyNotesPlugin = app.internalPlugins.plugins["daily-notes"];
  if (dailyNotesPlugin && dailyNotesPlugin.enabled) {
    return true;
  }

  const periodicNotes = app.plugins.getPlugin("periodic-notes");
  return !!periodicNotes?.settings?.daily?.enabled;
}

export function appHasMonthlyNotesPluginLoaded(): boolean {
  const { app } = window;
  const periodicNotes = app.plugins.getPlugin("periodic-notes");
  return !!periodicNotes?.settings?.monthly?.enabled;
}

export function appHasQuarterlyNotesPluginLoaded(): boolean {
  const { app } = window;
  const periodicNotes = app.plugins.getPlugin("periodic-notes");
  return !!periodicNotes?.settings?.quarterly?.enabled;
}

export function appHasYearlyNotesPluginLoaded(): boolean {
  const { app } = window;
  const periodicNotes = app.plugins.getPlugin("periodic-notes");
  return !!periodicNotes?.settings?.yearly?.enabled;
}
