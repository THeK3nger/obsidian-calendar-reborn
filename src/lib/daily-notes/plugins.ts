export function appHasDailyNotesPluginLoaded(): boolean {
  const { app } = window;
  const dailyNotesPlugin = app.internalPlugins.plugins["daily-notes"];
  if (dailyNotesPlugin && dailyNotesPlugin.enabled) {
    return true;
  }

  const periodicNotes = app.plugins.getPlugin("periodic-notes");
  return !!periodicNotes?.settings?.daily?.enabled;
}

/**
 * XXX: "Weekly Notes" live in either the Calendar plugin or the periodic-notes plugin.
 * Check both until the weekly notes feature is removed from the Calendar plugin.
 */
export function appHasWeeklyNotesPluginLoaded(): boolean {
  const { app } = window;

  if (app.plugins.getPlugin("calendar")) {
    return true;
  }

  const periodicNotes = app.plugins.getPlugin("periodic-notes");
  return !!periodicNotes?.settings?.weekly?.enabled;
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
