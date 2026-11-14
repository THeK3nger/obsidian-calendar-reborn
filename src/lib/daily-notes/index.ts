import type { App, moment, TFile } from "obsidian";

import type { Moment } from "./moment-types";

declare global {
  interface Window {
    app: App;
    moment: typeof moment;
  }
}

export { appHasDailyNotesPluginLoaded } from "./plugins";

export {
  DEFAULT_DAILY_NOTE_FORMAT,
  DEFAULT_WEEKLY_NOTE_FORMAT,
  DEFAULT_MONTHLY_NOTE_FORMAT,
  DEFAULT_QUARTERLY_NOTE_FORMAT,
  DEFAULT_YEARLY_NOTE_FORMAT,
} from "./constants";

export { DailyNotesFolderMissingError } from "./daily";
export { WeeklyNotesFolderMissingError } from "./weekly";
export { MonthlyNotesFolderMissingError } from "./monthly";
export { QuarterlyNotesFolderMissingError } from "./quarterly";
export { YearlyNotesFolderMissingError } from "./yearly";
export { isPeriodicNoteEnabled, setPeriodicNoteConfig } from "./settings";

import type {
  IGranularity,
  IPeriodicGranularity,
  IPeriodicNoteConfig,
  IPeriodicNoteSettings,
} from "./types";
import {
  getDailyNoteSettings,
  getWeeklyNoteSettings,
  getMonthlyNoteSettings,
  getQuarterlyNoteSettings,
  getYearlyNoteSettings,
} from "./settings";
import { createDailyNote, getDailyNote, getAllDailyNotes } from "./daily";
import { createWeeklyNote, getAllWeeklyNotes, getWeeklyNote } from "./weekly";
import {
  createMonthlyNote,
  getAllMonthlyNotes,
  getMonthlyNote,
} from "./monthly";
import {
  createQuarterlyNote,
  getAllQuarterlyNotes,
  getQuarterlyNote,
} from "./quarterly";
import { createYearlyNote, getAllYearlyNotes, getYearlyNote } from "./yearly";

import { getDateUID } from "./parse";

export { getDateUID, getDateFromFile, getDateFromPath } from "./parse";
export { getTemplateInfo } from "./vault";

function getPeriodicNoteSettings(
  granularity: IGranularity
): IPeriodicNoteSettings {
  const getSettings = {
    day: getDailyNoteSettings,
    week: getWeeklyNoteSettings,
    month: getMonthlyNoteSettings,
    quarter: getQuarterlyNoteSettings,
    year: getYearlyNoteSettings,
  }[granularity];

  return getSettings();
}

function createPeriodicNote(
  granularity: IGranularity,
  date: Moment
): Promise<TFile> {
  const createFn: Record<IGranularity, (date: Moment) => Promise<TFile>> = {
    day: createDailyNote,
    week: createWeeklyNote,
    month: createMonthlyNote,
    quarter: createQuarterlyNote,
    year: createYearlyNote,
  };
  return createFn[granularity](date);
}

/**
 * Find every note of the given granularity. Throws if the notes folder is
 * missing, like the per-granularity functions.
 */
function getAllPeriodicNotes(granularity: IGranularity): Record<string, TFile> {
  const getAllFn: Record<IGranularity, () => Record<string, TFile>> = {
    day: getAllDailyNotes,
    week: getAllWeeklyNotes,
    month: getAllMonthlyNotes,
    quarter: getAllQuarterlyNotes,
    year: getAllYearlyNotes,
  };
  return getAllFn[granularity]();
}

function getPeriodicNote(
  granularity: IGranularity,
  date: Moment,
  notes: Record<string, TFile>
): TFile | null {
  return notes[getDateUID(date, granularity)] ?? null;
}

export type {
  IGranularity,
  IPeriodicGranularity,
  IPeriodicNoteConfig,
  IPeriodicNoteSettings,
};
export {
  createDailyNote,
  createMonthlyNote,
  createWeeklyNote,
  createQuarterlyNote,
  createYearlyNote,
  createPeriodicNote,
  getAllDailyNotes,
  getAllMonthlyNotes,
  getAllWeeklyNotes,
  getAllQuarterlyNotes,
  getAllYearlyNotes,
  getAllPeriodicNotes,
  getDailyNote,
  getDailyNoteSettings,
  getMonthlyNote,
  getMonthlyNoteSettings,
  getPeriodicNote,
  getPeriodicNoteSettings,
  getWeeklyNote,
  getWeeklyNoteSettings,
  getQuarterlyNote,
  getQuarterlyNoteSettings,
  getYearlyNote,
  getYearlyNoteSettings,
};
