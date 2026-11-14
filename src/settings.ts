import { PluginSettingTab } from "obsidian";
import type { App, SettingDefinitionItem } from "obsidian";
import { appHasDailyNotesPluginLoaded } from "src/lib/daily-notes";
import type { IPeriodicNoteConfig } from "src/lib/daily-notes";
import type { ILocaleOverride, IWeekStartOption } from "src/lib/calendar-ui";

import { DEFAULT_WORDS_PER_DOT } from "src/constants";
import { PERIODICITIES } from "src/periodicity";
import type { IPeriodicityInfo, Periodicity } from "src/periodicity";

import type CalendarPlugin from "./main";

export interface ISettings {
  wordsPerDot: number;
  weekStart: IWeekStartOption;
  shouldConfirmBeforeCreate: boolean;

  /** Show the week-number column. */
  showWeeklyNote: boolean;

  weekly: IPeriodicNoteConfig;
  monthly: IPeriodicNoteConfig;
  quarterly: IPeriodicNoteConfig;
  yearly: IPeriodicNoteConfig;

  /** Set once settings were imported from Periodic Notes and legacy fields. */
  periodicNotesMigrated: boolean;

  localeOverride: ILocaleOverride;
}

type PeriodicSettingKey = `${Periodicity}.${keyof IPeriodicNoteConfig}`;
type SettingKey = keyof ISettings | PeriodicSettingKey;

const weekdays = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

function defaultPeriodicConfig(): IPeriodicNoteConfig {
  return { enabled: false, format: "", folder: "", template: "" };
}

export const defaultSettings: Readonly<ISettings> = Object.freeze({
  shouldConfirmBeforeCreate: true,
  weekStart: "locale",

  wordsPerDot: DEFAULT_WORDS_PER_DOT,

  showWeeklyNote: false,

  weekly: defaultPeriodicConfig(),
  monthly: defaultPeriodicConfig(),
  quarterly: defaultPeriodicConfig(),
  yearly: defaultPeriodicConfig(),

  periodicNotesMigrated: false,

  localeOverride: "system-default",
});

/** True while the community Periodic Notes plugin is still enabled. */
export function isPeriodicNotesPluginEnabled(): boolean {
  return window.app.plugins.enabledPlugins.has("periodic-notes");
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
    const [settingKey, field] = key.split(".") as [
      keyof ISettings,
      keyof IPeriodicNoteConfig | undefined,
    ];
    const value = this.plugin.options[settingKey];
    return field ? (value as IPeriodicNoteConfig)[field] : value;
  }

  async setControlValue(key: string, value: unknown): Promise<void> {
    const [settingKey, field] = key.split(".") as [
      keyof ISettings,
      keyof IPeriodicNoteConfig | undefined,
    ];
    await this.plugin.writeOptions((old) => ({
      [settingKey]: field
        ? { ...(old[settingKey] as IPeriodicNoteConfig), [field]: value }
        : value,
    }));
    // Other settings' `visible` predicates depend on these values.
    this.refreshDomState();
  }

  private periodicNoteGroup({
    periodicity,
    label,
    unit,
    defaultFormat,
  }: IPeriodicityInfo): SettingDefinitionItem<SettingKey> {
    const lower = label.toLowerCase();
    return {
      type: "group",
      heading: `${label} notes`,
      items: [
        {
          name: `Enable ${lower} notes`,
          desc: `Create and open a note for each ${unit}.`,
          control: {
            type: "toggle",
            key: `${periodicity}.enabled`,
            defaultValue: false,
          },
        },
        {
          name: "Format",
          desc: "Moment.js date format used for the note's file name.",
          visible: () => this.plugin.options[periodicity].enabled,
          control: {
            type: "text",
            key: `${periodicity}.format`,
            placeholder: defaultFormat,
          },
        },
        {
          name: "Template",
          desc: `The file used as the template for new ${lower} notes.`,
          visible: () => this.plugin.options[periodicity].enabled,
          control: {
            type: "file",
            key: `${periodicity}.template`,
          },
        },
        {
          name: "Folder",
          desc: `New ${lower} notes will be placed here.`,
          visible: () => this.plugin.options[periodicity].enabled,
          control: {
            type: "folder",
            key: `${periodicity}.folder`,
            includeRoot: true,
          },
        },
      ],
    };
  }

  getSettingDefinitions(): SettingDefinitionItem<SettingKey>[] {
    return [
      {
        type: "group",
        visible: () => !appHasDailyNotesPluginLoaded(),
        items: [
          {
            name: "⚠️ Daily Notes plugin not enabled",
            desc: "Daily notes use the settings of the core Daily Notes plugin. Enable it to create daily notes from the calendar.",
          },
        ],
      },
      {
        type: "group",
        visible: () => isPeriodicNotesPluginEnabled(),
        items: [
          {
            name: "Periodic Notes plugin is no longer needed",
            desc: "Calendar Reborn now manages weekly, monthly, quarterly and yearly notes itself, and has imported your Periodic Notes settings. You can disable and uninstall the Periodic Notes plugin.",
            searchable: false,
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
            desc: "Add a column with the week number. Clicking it opens the weekly note when weekly notes are enabled.",
            control: {
              type: "toggle",
              key: "showWeeklyNote",
              defaultValue: defaultSettings.showWeeklyNote,
            },
          },
        ],
      },
      ...PERIODICITIES.map((info) => this.periodicNoteGroup(info)),
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
