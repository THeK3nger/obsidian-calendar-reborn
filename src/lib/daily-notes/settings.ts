import {
  DEFAULT_DAILY_NOTE_FORMAT,
  DEFAULT_MONTHLY_NOTE_FORMAT,
  DEFAULT_WEEKLY_NOTE_FORMAT,
  DEFAULT_QUARTERLY_NOTE_FORMAT,
  DEFAULT_YEARLY_NOTE_FORMAT,
} from "./constants";
import type {
  IPeriodicGranularity,
  IPeriodicNoteConfig,
  IPeriodicNoteSettings,
} from "./types";

function validateString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/**
 * Daily notes follow Obsidian's core Daily Notes plugin settings.
 */
export function getDailyNoteSettings(): IPeriodicNoteSettings {
  try {
    const { folder, format, template } =
      window.app.internalPlugins.getPluginById("daily-notes")?.instance
        ?.options || {};
    return {
      format: format || DEFAULT_DAILY_NOTE_FORMAT,
      folder: validateString(folder).trim(),
      template: validateString(template).trim(),
    };
  } catch {
    // Settings are read from the core plugin; fall through on unexpected shapes.
  }
}

/**
 * Weekly, monthly, quarterly and yearly notes are configured by the plugin
 * itself and pushed in here whenever its settings change.
 */
let periodicNoteConfig: Partial<
  Record<IPeriodicGranularity, IPeriodicNoteConfig>
> = {};

export function setPeriodicNoteConfig(
  config: Partial<Record<IPeriodicGranularity, IPeriodicNoteConfig>>
): void {
  periodicNoteConfig = config;
}

export function isPeriodicNoteEnabled(
  granularity: IPeriodicGranularity
): boolean {
  return !!periodicNoteConfig[granularity]?.enabled;
}

const DEFAULT_FORMATS: Record<IPeriodicGranularity, string> = {
  week: DEFAULT_WEEKLY_NOTE_FORMAT,
  month: DEFAULT_MONTHLY_NOTE_FORMAT,
  quarter: DEFAULT_QUARTERLY_NOTE_FORMAT,
  year: DEFAULT_YEARLY_NOTE_FORMAT,
};

function getConfiguredNoteSettings(
  granularity: IPeriodicGranularity
): IPeriodicNoteSettings {
  const config = periodicNoteConfig[granularity];
  return {
    format: config?.format || DEFAULT_FORMATS[granularity],
    folder: validateString(config?.folder).trim(),
    template: validateString(config?.template).trim(),
  };
}

export function getWeeklyNoteSettings(): IPeriodicNoteSettings {
  return getConfiguredNoteSettings("week");
}

export function getMonthlyNoteSettings(): IPeriodicNoteSettings {
  return getConfiguredNoteSettings("month");
}

export function getQuarterlyNoteSettings(): IPeriodicNoteSettings {
  return getConfiguredNoteSettings("quarter");
}

export function getYearlyNoteSettings(): IPeriodicNoteSettings {
  return getConfiguredNoteSettings("year");
}
