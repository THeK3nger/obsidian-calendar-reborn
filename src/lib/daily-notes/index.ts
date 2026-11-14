import type { App, moment, TFile } from "obsidian";

import type { Moment } from "./moment-types";

declare global {
  interface Window {
    app: App;
    moment: typeof moment;
  }
}

export {
  appHasDailyNotesPluginLoaded,
  appHasMonthlyNotesPluginLoaded,
  appHasQuarterlyNotesPluginLoaded,
  appHasYearlyNotesPluginLoaded,
} from "./plugins";

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
export { setCalendarWeeklyNoteSettings } from "./settings";

import type { IGranularity, IPeriodicNoteSettings } from "./types";
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

export type { IGranularity, IPeriodicNoteSettings };
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
  getDailyNote,
  getDailyNoteSettings,
  getMonthlyNote,
  getMonthlyNoteSettings,
  getPeriodicNoteSettings,
  getWeeklyNote,
  getWeeklyNoteSettings,
  getQuarterlyNote,
  getQuarterlyNoteSettings,
  getYearlyNote,
  getYearlyNoteSettings,
};
