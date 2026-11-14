import type { App, moment, TFile } from "obsidian";

import type { Moment } from "./moment-types";
import {
  createPeriodicNote,
  getAllPeriodicNotes,
  getPeriodicNote,
} from "./notes";
import {
  getDailyNoteSettings,
  getMonthlyNoteSettings,
  getPeriodicNoteSettings,
  getQuarterlyNoteSettings,
  getWeeklyNoteSettings,
  getYearlyNoteSettings,
} from "./settings";
import type {
  IGranularity,
  IPeriodicGranularity,
  IPeriodicNoteConfig,
  IPeriodicNoteSettings,
} from "./types";

declare global {
  interface Window {
    app: App;
    moment: typeof moment;
  }
}

export { appHasDailyNotesPluginLoaded } from "./plugins";
export {
  DEFAULT_DAILY_NOTE_FORMAT,
  DEFAULT_MONTHLY_NOTE_FORMAT,
  DEFAULT_QUARTERLY_NOTE_FORMAT,
  DEFAULT_WEEKLY_NOTE_FORMAT,
  DEFAULT_YEARLY_NOTE_FORMAT,
} from "./constants";
export { getDateFromFile, getDateFromPath, getDateUID } from "./parse";
export { isPeriodicNoteEnabled, setPeriodicNoteConfig } from "./settings";
export { getTemplateInfo } from "./vault";

export type {
  IGranularity,
  IPeriodicGranularity,
  IPeriodicNoteConfig,
  IPeriodicNoteSettings,
};
export {
  createPeriodicNote,
  getAllPeriodicNotes,
  getDailyNoteSettings,
  getMonthlyNoteSettings,
  getPeriodicNote,
  getPeriodicNoteSettings,
  getQuarterlyNoteSettings,
  getWeeklyNoteSettings,
  getYearlyNoteSettings,
};

export function getDailyNote(
  date: Moment,
  notes: Record<string, TFile>
): TFile | null {
  return getPeriodicNote("day", date, notes);
}

export function getWeeklyNote(
  date: Moment,
  notes: Record<string, TFile>
): TFile | null {
  return getPeriodicNote("week", date, notes);
}

export function getAllDailyNotes(): Record<string, TFile> {
  return getAllPeriodicNotes("day");
}

export function getAllWeeklyNotes(): Record<string, TFile> {
  return getAllPeriodicNotes("week");
}
