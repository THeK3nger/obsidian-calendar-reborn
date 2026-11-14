export function appHasDailyNotesPluginLoaded(): boolean {
  return !!window.app.internalPlugins.plugins["daily-notes"]?.enabled;
}
