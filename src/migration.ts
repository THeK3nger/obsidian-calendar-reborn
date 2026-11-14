import { normalizePath } from "obsidian";
import type { App } from "obsidian";

import type { IPeriodicNoteConfig } from "src/lib/daily-notes";
import { PERIODICITIES } from "src/periodicity";
import type { Periodicity } from "src/periodicity";

import type { ISettings } from "./settings";

const PERIODIC_NOTES_ID = "periodic-notes";

/** Calendar settings stored before weekly notes moved into `weekly`. */
interface ILegacyWeeklySettings {
  weeklyNoteFormat?: unknown;
  weeklyNoteTemplate?: unknown;
  weeklyNoteFolder?: unknown;
}

export type IStoredSettings = Partial<ISettings> & ILegacyWeeklySettings;

/**
 * One periodicity as Periodic Notes stores it: `template` in 0.0.x,
 * `templatePath` in the 1.0 betas.
 */
interface IPeriodicNotesEntry {
  enabled?: unknown;
  format?: unknown;
  folder?: unknown;
  template?: unknown;
  templatePath?: unknown;
}

type IPeriodicNotesEntries = Partial<
  Record<"daily" | Periodicity, IPeriodicNotesEntry>
>;

interface IPeriodicNotesData extends IPeriodicNotesEntries {
  // 1.0 betas group the entries in "calendar sets" keyed by granularity.
  calendarSets?: (Partial<
    Record<"day" | "week" | "month" | "quarter" | "year", IPeriodicNotesEntry>
  > & { id?: string })[];
  activeCalendarSet?: string;
}

export interface IMigrationResult {
  settings: Partial<ISettings>;
  /** Periodic note types imported from the Periodic Notes plugin. */
  imported: Periodicity[];
  /** Periodic Notes managed daily notes, which now follow the core plugin. */
  hadPeriodicDailyNotes: boolean;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function toConfig(entry: IPeriodicNotesEntry): IPeriodicNoteConfig {
  return {
    enabled: entry.enabled === true,
    format: asString(entry.format),
    folder: asString(entry.folder),
    template: asString(entry.template) || asString(entry.templatePath),
  };
}

/** Flatten either Periodic Notes data format into per-periodicity entries. */
function getPeriodicNotesEntries(
  data: IPeriodicNotesData
): IPeriodicNotesEntries {
  if (!Array.isArray(data.calendarSets)) {
    return data;
  }
  const set =
    data.calendarSets.find((s) => s.id === data.activeCalendarSet) ??
    data.calendarSets[0];
  if (!set) {
    return {};
  }
  return {
    daily: set.day,
    weekly: set.week,
    monthly: set.month,
    quarterly: set.quarter,
    yearly: set.year,
  };
}

/**
 * Read the settings of the Periodic Notes plugin from disk, so it works
 * regardless of plugin load order. Only an enabled plugin is considered:
 * the calendar ignored a disabled one before, too.
 */
async function readPeriodicNotesData(
  app: App
): Promise<IPeriodicNotesData | null> {
  if (!app.plugins.enabledPlugins.has(PERIODIC_NOTES_ID)) {
    return null;
  }
  const path = normalizePath(
    `${app.vault.configDir}/plugins/${PERIODIC_NOTES_ID}/data.json`
  );
  try {
    if (!(await app.vault.adapter.exists(path))) {
      return null;
    }
    const data: unknown = JSON.parse(await app.vault.adapter.read(path));
    return data && typeof data === "object" ? data : null;
  } catch (err) {
    console.warn("[Calendar Reborn] Failed to read Periodic Notes settings", err);
    return null;
  }
}

/**
 * Build the periodic note settings from the legacy weekly fields and from
 * the Periodic Notes plugin. Where Periodic Notes had a periodicity
 * enabled it was the source of truth, so its settings win.
 */
export async function migratePeriodicNotes(
  app: App,
  stored: IStoredSettings
): Promise<IMigrationResult> {
  const settings: Partial<ISettings> = {
    weekly: {
      // Clicking a week number used to open weekly notes.
      enabled: stored.showWeeklyNote === true,
      format: asString(stored.weeklyNoteFormat),
      folder: asString(stored.weeklyNoteFolder),
      template: asString(stored.weeklyNoteTemplate),
    },
  };
  const imported: Periodicity[] = [];
  let hadPeriodicDailyNotes = false;

  const data = await readPeriodicNotesData(app);
  if (data) {
    const entries = getPeriodicNotesEntries(data);
    hadPeriodicDailyNotes = entries.daily?.enabled === true;
    for (const { periodicity } of PERIODICITIES) {
      const entry = entries[periodicity];
      if (entry?.enabled === true) {
        settings[periodicity] = toConfig(entry);
        imported.push(periodicity);
      }
    }
  }

  return { settings, imported, hadPeriodicDailyNotes };
}
