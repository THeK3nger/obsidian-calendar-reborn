import { normalizePath, Notice, TFile, TFolder, Vault } from "obsidian";

import type { DurationConstructor, Moment } from "./moment-types";
import { getDateFromFile, getDateUID } from "./parse";
import {
  getPeriodicNoteSettings,
  isPeriodicNoteEnabled,
} from "./settings";
import type { IGranularity } from "./types";
import { getNotePath, getTemplateInfo } from "./vault";

function replaceDateTokens(
  contents: string,
  date: Moment,
  format: string
): string {
  return contents.replace(
    /{{\s*(date|time)\s*(([+-]\d+)([yqmwdhs]))?\s*(:.+?)?}}/gi,
    (
      _: string,
      _timeOrDate: string,
      calc: string,
      timeDelta: string,
      unit: DurationConstructor,
      momentFormat: string
    ) => {
      const now = window.moment();
      const currentDate = date.clone().set({
        hour: now.get("hour"),
        minute: now.get("minute"),
        second: now.get("second"),
      });
      if (calc) {
        currentDate.add(parseInt(timeDelta, 10), unit);
      }

      return currentDate.format(
        momentFormat ? momentFormat.substring(1).trim() : format
      );
    }
  );
}

function getDayOfWeekNumericalValue(dayOfWeekName: string): number {
  const { moment } = window;
  let weekStart = moment.localeData().firstDayOfWeek();
  const daysOfWeek = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  while (weekStart) {
    daysOfWeek.push(daysOfWeek.shift());
    weekStart--;
  }
  return daysOfWeek.indexOf(dayOfWeekName.toLowerCase());
}

function renderTemplate(
  contents: string,
  granularity: IGranularity,
  date: Moment,
  format: string,
  filename: string
): string {
  if (granularity === "day") {
    return replaceDateTokens(
      contents
        .replace(/{{\s*date\s*}}/gi, filename)
        .replace(/{{\s*time\s*}}/gi, window.moment().format("HH:mm"))
        .replace(/{{\s*title\s*}}/gi, filename),
      date,
      format
    )
      .replace(
        /{{\s*yesterday\s*}}/gi,
        date.clone().subtract(1, "day").format(format)
      )
      .replace(
        /{{\s*tomorrow\s*}}/gi,
        date.clone().add(1, "day").format(format)
      );
  }

  let rendered = replaceDateTokens(contents, date, format)
    .replace(/{{\s*date\s*}}/gi, filename)
    .replace(/{{\s*time\s*}}/gi, window.moment().format("HH:mm"))
    .replace(/{{\s*title\s*}}/gi, filename);

  if (granularity === "week") {
    rendered = rendered.replace(
      /{{\s*(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\s*:(.*?)}}/gi,
      (_: string, dayOfWeek: string, momentFormat: string) =>
        date
          .weekday(getDayOfWeekNumericalValue(dayOfWeek))
          .format(momentFormat.trim())
    );
  }

  return rendered;
}

export async function createPeriodicNote(
  granularity: IGranularity,
  date: Moment
): Promise<TFile | undefined> {
  const { app } = window;
  const { folder = "", format = "", template = "" } =
    getPeriodicNoteSettings(granularity) ?? {};
  const [templateContents, foldInfo] = await getTemplateInfo(template);
  const filename = date.format(format);
  const normalizedPath = await getNotePath(folder, filename);

  try {
    const createdFile = await app.vault.create(
      normalizedPath,
      renderTemplate(templateContents, granularity, date, format, filename)
    );
    void app.foldManager.save(createdFile, foldInfo);
    return createdFile;
  } catch (err) {
    console.error(`Failed to create file: '${normalizedPath}'`, err);
    new Notice("Unable to create new file.");
  }
}

export function getAllPeriodicNotes(
  granularity: IGranularity
): Record<string, TFile> {
  const notes: Record<string, TFile> = {};
  if (granularity !== "day" && !isPeriodicNoteEnabled(granularity)) {
    return notes;
  }

  const { folder = "" } = getPeriodicNoteSettings(granularity) ?? {};
  const notesFolder = window.app.vault.getAbstractFileByPath(
    normalizePath(folder)
  );
  if (!(notesFolder instanceof TFolder)) {
    throw new Error(`Failed to find ${granularity} notes folder`);
  }

  Vault.recurseChildren(notesFolder, (note) => {
    if (!(note instanceof TFile)) {
      return;
    }
    const date = getDateFromFile(note, granularity);
    if (date) {
      notes[getDateUID(date, granularity)] = note;
    }
  });

  return notes;
}

export function getPeriodicNote(
  granularity: IGranularity,
  date: Moment,
  notes: Record<string, TFile>
): TFile | null {
  return notes[getDateUID(date, granularity)] ?? null;
}
