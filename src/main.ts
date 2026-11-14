import { FileView, Notice, Plugin } from "obsidian";
import type { WorkspaceLeaf } from "obsidian";
import type { Moment } from "moment";

import {
  getDateFromFile,
  isPeriodicNoteEnabled,
  setPeriodicNoteConfig,
} from "./lib/daily-notes";
import { VIEW_TYPE_CALENDAR } from "./constants";
import { findPeriodicNote, openOrCreatePeriodicNote } from "./io/periodicNotes";
import { migratePeriodicNotes } from "./migration";
import type { IMigrationResult, IStoredSettings } from "./migration";
import { PERIODICITIES } from "./periodicity";
import type { IPeriodicityInfo } from "./periodicity";
import { activeFile, settings } from "./ui/stores";
import { CalendarSettingsTab, defaultSettings } from "./settings";
import type { ISettings } from "./settings";
import CalendarView from "./view";

const LEGACY_SETTING_KEYS = [
  "weeklyNoteFormat",
  "weeklyNoteTemplate",
  "weeklyNoteFolder",
] as const;

export default class CalendarPlugin extends Plugin {
  public options: ISettings;

  async onload(): Promise<void> {
    this.register(
      settings.subscribe((value) => {
        this.options = value;
        setPeriodicNoteConfig({
          week: value.weekly,
          month: value.monthly,
          quarter: value.quarterly,
          year: value.yearly,
        });
      })
    );

    this.registerView(
      VIEW_TYPE_CALENDAR,
      (leaf: WorkspaceLeaf) => new CalendarView(leaf)
    );

    this.addCommand({
      id: "show-calendar-view",
      name: "Open view",
      checkCallback: (checking: boolean) => {
        if (checking) {
          return (
            this.app.workspace.getLeavesOfType(VIEW_TYPE_CALENDAR).length === 0
          );
        }
        this.initLeaf();
      },
    });

    PERIODICITIES.forEach((info) => this.addPeriodicNoteCommands(info));

    this.addCommand({
      id: "reveal-active-note",
      name: "Reveal active note",
      callback: () => {
        void this.getCalendarView().then((view) => view?.revealActiveNote());
      },
    });

    await this.loadOptions();

    this.addSettingTab(new CalendarSettingsTab(this.app, this));

    this.app.workspace.onLayoutReady(() => this.initLeaf());
  }

  private addPeriodicNoteCommands({
    periodicity,
    granularity,
    unit,
  }: IPeriodicityInfo): void {
    // `open-weekly-note` predates the other commands; keep its ID for hotkeys.
    this.addCommand({
      id: `open-${periodicity}-note`,
      name: `Open this ${unit}'s note`,
      checkCallback: (checking) => {
        if (!isPeriodicNoteEnabled(granularity)) {
          return false;
        }
        if (!checking) {
          void this.openPeriodicNote(granularity, window.moment());
        }
        return true;
      },
    });

    for (const [direction, offset] of [
      ["next", 1],
      ["previous", -1],
    ] as const) {
      this.addCommand({
        id: `open-${direction}-${periodicity}-note`,
        name: `Open ${direction} ${unit}'s note`,
        checkCallback: (checking) => {
          if (!isPeriodicNoteEnabled(granularity)) {
            return false;
          }
          const file =
            this.app.workspace.getActiveViewOfType(FileView)?.file ?? null;
          const date = file && getDateFromFile(file, granularity);
          if (!date) {
            return false;
          }
          if (!checking) {
            void this.openPeriodicNote(
              granularity,
              date.clone().add(offset, granularity)
            );
          }
          return true;
        },
      });
    }
  }

  private async openPeriodicNote(
    granularity: IPeriodicityInfo["granularity"],
    date: Moment
  ): Promise<void> {
    await openOrCreatePeriodicNote(
      granularity,
      date,
      findPeriodicNote(granularity, date),
      false,
      this.options,
      (file) => activeFile.setFile(file)
    );
  }

  /**
   * Looks up the open calendar view instead of keeping a reference to it,
   * so a closed view can be garbage-collected.
   */
  private async getCalendarView(): Promise<CalendarView | null> {
    const leaf = this.app.workspace.getLeavesOfType(VIEW_TYPE_CALENDAR)[0];
    if (!leaf) {
      return null;
    }
    await leaf.loadIfDeferred();
    return leaf.view instanceof CalendarView ? leaf.view : null;
  }

  initLeaf(): void {
    if (this.app.workspace.getLeavesOfType(VIEW_TYPE_CALENDAR).length) {
      return;
    }
    void this.app.workspace.getRightLeaf(false).setViewState({
      type: VIEW_TYPE_CALENDAR,
    });
  }

  async loadOptions(): Promise<void> {
    const stored = ((await this.loadData()) ?? {}) as IStoredSettings;

    let migration: IMigrationResult | null = null;
    if (!stored.periodicNotesMigrated) {
      migration = await migratePeriodicNotes(this.app, stored);
    }

    settings.update((old) => {
      const merged: ISettings = { ...old, ...stored };
      // Fill in fields added to a periodicity after it was saved.
      for (const { periodicity } of PERIODICITIES) {
        merged[periodicity] = {
          ...defaultSettings[periodicity],
          ...stored[periodicity],
        };
      }
      if (migration) {
        Object.assign(merged, migration.settings, {
          periodicNotesMigrated: true,
        });
      }
      for (const key of LEGACY_SETTING_KEYS) {
        delete (merged as IStoredSettings)[key];
      }
      return merged;
    });

    await this.saveData(this.options);

    if (migration?.imported.length) {
      this.notifyPeriodicNotesImported(migration);
    }
  }

  private notifyPeriodicNotesImported({
    imported,
    hadPeriodicDailyNotes,
  }: IMigrationResult): void {
    const message = [
      `Calendar Reborn imported your Periodic Notes settings (${imported.join(", ")}) and now manages these notes itself.`,
      "You can disable and uninstall the Periodic Notes plugin.",
    ];
    if (hadPeriodicDailyNotes) {
      message.push(
        "Daily notes now follow the core Daily Notes plugin settings: check that they match what you had in Periodic Notes."
      );
    }
    new Notice(message.join("\n\n"), 0);
  }

  async writeOptions(
    changeOpts: (settings: ISettings) => Partial<ISettings>
  ): Promise<void> {
    settings.update((old) => ({ ...old, ...changeOpts(old) }));
    await this.saveData(this.options);
  }
}
