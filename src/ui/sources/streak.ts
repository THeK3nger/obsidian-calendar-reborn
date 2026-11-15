import type { Moment } from "moment";
import type { TFile } from "obsidian";
import type { ICalendarSource, IDayMetadata } from "src/lib/calendar-ui";
import { getDailyNote, getWeeklyNote } from "src/lib/daily-notes";
import { get } from "svelte/store";

import { dailyNotes, weeklyNotes } from "../stores";

const getStreakClasses = (file: TFile): string[] => {
  return file ? ["has-note"] : [];
};

export const streakSource: ICalendarSource = {
  getDailyMetadata: async (date: Moment): Promise<IDayMetadata> => {
    const file = getDailyNote(date, get(dailyNotes));
    return {
      classes: getStreakClasses(file),
      dots: [],
    };
  },

  getWeeklyMetadata: async (date: Moment): Promise<IDayMetadata> => {
    const file = getWeeklyNote(date, get(weeklyNotes));
    return {
      classes: getStreakClasses(file),
      dots: [],
    };
  },
};
