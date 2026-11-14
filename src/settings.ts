import { PluginSettingTab } from "obsidian";
import type { App, SettingDefinitionItem } from "obsidian";
import { appHasDailyNotesPluginLoaded } from "src/lib/daily-notes";
import type { ILocaleOverride, IWeekStartOption } from "src/lib/calendar-ui";

import { DEFAULT_WEEK_FORMAT, DEFAULT_WORDS_PER_DOT } from "src/constants";

import type CalendarPlugin from "./main";

export interface ISettings {
  wordsPerDot: number;
  weekStart: IWeekStartOption;
  shouldConfirmBeforeCreate: boolean;

  // Weekly Note settings
  showWeeklyNote: boolean;
  weeklyNoteFormat: string;
  weeklyNoteTemplate: string;
  weeklyNoteFolder: string;

  localeOverride: ILocaleOverride;
}

type SettingKey = keyof ISettings;

const weekdays = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export const defaultSettings = Object.freeze({
  shouldConfirmBeforeCreate: true,
  weekStart: "locale",

  wordsPerDot: DEFAULT_WORDS_PER_DOT,

  showWeeklyNote: false,
  weeklyNoteFormat: "",
  weeklyNoteTemplate: "",
  weeklyNoteFolder: "",

  localeOverride: "system-default",
});

export function appHasPeriodicNotesPluginLoaded(): boolean {
  const periodicNotes = window.app.plugins.getPlugin("periodic-notes");
  return !!periodicNotes?.settings?.weekly?.enabled;
}

function weekStartOptions(): Record<string, string> {
  const { moment } = window;
  const localizedWeekdays = moment.weekdays();
  // The bundled week spec is only captured once the calendar view has
  // mounted; fall back to the current locale before that.
  const localeWeekStartNum =
    window._bundledLocaleWeekSpec?.dow ?? moment.localeData().firstDayOfWeek();

  const options: Record<string, string> = {
    locale: `Locale default (${localizedWeekdays[localeWeekStartNum]})`,
  };
  localizedWeekdays.forEach((day, i) => {
    options[weekdays[i]] = day;
  });
  return options;
}

function localeOptions(): Record<string, string> {
  const sysLocale = navigator.language?.toLowerCase();
  const options: Record<string, string> = {
    "system-default": `Same as system (${sysLocale})`,
  };
  window.moment.locales().forEach((locale) => {
    options[locale] = locale;
  });
  return options;
}

export class CalendarSettingsTab extends PluginSettingTab {
  private plugin: CalendarPlugin;

  constructor(app: App, plugin: CalendarPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  getControlValue(key: string): unknown {
    return this.plugin.options[key as SettingKey];
  }

  async setControlValue(key: string, value: unknown): Promise<void> {
    await this.plugin.writeOptions(() => ({ [key as SettingKey]: value }));
    // Other settings' `visible` predicates depend on these values.
    this.refreshDomState();
  }

  getSettingDefinitions(): SettingDefinitionItem<SettingKey>[] {
    return [
      {
        type: "group",
        visible: () => !appHasDailyNotesPluginLoaded(),
        items: [
          {
            name: "⚠️ Daily Notes plugin not enabled",
            desc: "The calendar is best used in conjunction with either the Daily Notes plugin or the Periodic Notes plugin (available in the Community Plugins catalog).",
          },
        ],
      },
      {
        type: "group",
        items: [
          {
            name: "Words per dot",
            desc: "How many words should be represented by a single dot? Set to 0 to hide word-count dots.",
            control: {
              type: "number",
              key: "wordsPerDot",
              defaultValue: DEFAULT_WORDS_PER_DOT,
              placeholder: String(DEFAULT_WORDS_PER_DOT),
              min: 0,
              step: 1,
            },
          },
          {
            name: "Start week on",
            desc: "Choose what day of the week to start. Select 'Locale default' to use the default specified by moment.js.",
            control: {
              type: "dropdown",
              key: "weekStart",
              defaultValue: defaultSettings.weekStart,
              options: weekStartOptions(),
            },
          },
          {
            name: "Confirm before creating new note",
            desc: "Show a confirmation modal before creating a new note.",
            control: {
              type: "toggle",
              key: "shouldConfirmBeforeCreate",
              defaultValue: defaultSettings.shouldConfirmBeforeCreate,
            },
          },
          {
            name: "Show week number",
            desc: "Enable this to add a column with the week number.",
            control: {
              type: "toggle",
              key: "showWeeklyNote",
              defaultValue: defaultSettings.showWeeklyNote,
            },
          },
        ],
      },
      {
        type: "group",
        heading: "Weekly notes",
        visible: () =>
          this.plugin.options.showWeeklyNote &&
          !appHasPeriodicNotesPluginLoaded(),
        items: [
          {
            name: "Weekly note settings are moving",
            desc: "You are encouraged to install the 'Periodic Notes' plugin to keep the functionality in the future.",
            searchable: false,
          },
          {
            name: "Weekly note format",
            desc: "For more syntax help, refer to format reference.",
            control: {
              type: "text",
              key: "weeklyNoteFormat",
              placeholder: DEFAULT_WEEK_FORMAT,
            },
          },
          {
            name: "Weekly note template",
            desc: "Choose the file you want to use as the template for your weekly notes.",
            control: {
              type: "file",
              key: "weeklyNoteTemplate",
            },
          },
          {
            name: "Weekly note folder",
            desc: "New weekly notes will be placed here.",
            control: {
              type: "folder",
              key: "weeklyNoteFolder",
              includeRoot: true,
            },
          },
        ],
      },
      {
        type: "group",
        heading: "Advanced",
        items: [
          {
            name: "Override locale",
            desc: "Set this if you want to use a locale different from the default.",
            control: {
              type: "dropdown",
              key: "localeOverride",
              defaultValue: defaultSettings.localeOverride,
              options: localeOptions(),
            },
          },
        ],
      },
    ];
  }
}
