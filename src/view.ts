import type { Moment } from "moment";
import {
  getDailyNote,
  getDailyNoteSettings,
  getDateFromFile,
  getWeeklyNote,
  getWeeklyNoteSettings,
  isPeriodicNoteEnabled,
} from "src/lib/daily-notes";
import type { IGranularity } from "src/lib/daily-notes";
import { FileView, TFile, ItemView } from "obsidian";
import type { TAbstractFile } from "obsidian";
import type { WorkspaceLeaf } from "obsidian";
import { get } from "svelte/store";

import { VIEW_TYPE_CALENDAR } from "src/constants";
import {
  findPeriodicNote,
  openOrCreatePeriodicNote,
} from "src/io/periodicNotes";
import type { ISettings } from "src/settings";

import Calendar from "./ui/Calendar.svelte";
import { showFileMenu } from "./ui/fileMenu";
import { activeFile, dailyNotes, weeklyNotes, settings } from "./ui/stores";
import {
  customTagsSource,
  streakSource,
  tasksSource,
  wordCountSource,
} from "./ui/sources";
import { mount, unmount } from "svelte";

interface CalendarHandle {
  refreshMetadata(): void;
  setDisplayedMonth(date: Moment): void;
}

export default class CalendarView extends ItemView {
  private calendar: CalendarHandle;
  private settings: ISettings;

  constructor(leaf: WorkspaceLeaf) {
    super(leaf);

    this.registerEvent(
      this.app.vault.on("create", (file) => this.onFileCreated(file))
    );
    this.registerEvent(
      this.app.vault.on("delete", (file) => this.onFileDeleted(file))
    );
    this.registerEvent(
      this.app.vault.on("modify", (file) => this.onFileModified(file))
    );
    this.registerEvent(
      this.app.workspace.on("file-open", (file) => this.onFileOpen(file))
    );

    this.settings = null;
    settings.subscribe((val) => {
      this.settings = val;

      // Refresh the calendar if settings change
      if (this.calendar) {
        this.calendar.refreshMetadata();
      }
    });
  }

  getViewType(): string {
    return VIEW_TYPE_CALENDAR;
  }

  getDisplayText(): string {
    return "Calendar";
  }

  getIcon(): string {
    return "calendar-with-checkmark";
  }

  async onClose(): Promise<void> {
    if (this.calendar) {
      await unmount(this.calendar);
    }
  }

  async onOpen(): Promise<void> {
    // Integration point: external plugins can listen for `calendar:open`
    // to feed in additional sources.
    const sources = [
      customTagsSource,
      streakSource,
      wordCountSource,
      tasksSource,
    ];
    this.app.workspace.trigger("calendar:open", sources);

    this.calendar = mount(Calendar, {
      target: this.contentEl,
      props: {
        onClickDay: (date: Moment, inNewSplit: boolean) =>
          this.openOrCreateDailyNote(date, inNewSplit),
        onClickWeek: (date: Moment, inNewSplit: boolean) =>
          this.openOrCreateWeeklyNote(date, inNewSplit),
        onClickMonth: (date: Moment, inNewSplit: boolean) =>
          this.openOrCreatePeriodicNote("month", date, inNewSplit),
        onClickYear: (date: Moment, inNewSplit: boolean) =>
          this.openOrCreatePeriodicNote("year", date, inNewSplit),
        onHoverDay: (date: Moment, targetEl: EventTarget, isMetaPressed?: boolean) =>
          this.onHoverDay(date, targetEl, isMetaPressed),
        onHoverWeek: (date: Moment, targetEl: EventTarget, isMetaPressed?: boolean) =>
          this.onHoverWeek(date, targetEl, isMetaPressed),
        onContextMenuDay: (date: Moment, event: MouseEvent) =>
          this.onContextMenuDay(date, event),
        onContextMenuWeek: (date: Moment, event: MouseEvent) =>
          this.onContextMenuWeek(date, event),
        sources,
      },
    }) as CalendarHandle;
  }

  onHoverDay(
    date: Moment,
    targetEl: EventTarget,
    isMetaPressed?: boolean
  ): void {
    if (!isMetaPressed) {
      return;
    }
    const { format } = getDailyNoteSettings();
    const note = getDailyNote(date, get(dailyNotes));
    this.app.workspace.trigger(
      "link-hover",
      this,
      targetEl,
      date.format(format),
      note?.path
    );
  }

  onHoverWeek(
    date: Moment,
    targetEl: EventTarget,
    isMetaPressed?: boolean
  ): void {
    if (!isMetaPressed) {
      return;
    }
    const note = getWeeklyNote(date, get(weeklyNotes));
    const { format } = getWeeklyNoteSettings();
    this.app.workspace.trigger(
      "link-hover",
      this,
      targetEl,
      date.format(format),
      note?.path
    );
  }

  private onContextMenuDay(date: Moment, event: MouseEvent): void {
    const note = getDailyNote(date, get(dailyNotes));
    if (!note) {
      // If no file exists for a given day, show nothing.
      return;
    }
    showFileMenu(this.app, note, {
      x: event.pageX,
      y: event.pageY,
    });
  }

  private onContextMenuWeek(date: Moment, event: MouseEvent): void {
    const note = getWeeklyNote(date, get(weeklyNotes));
    if (!note) {
      // If no file exists for a given day, show nothing.
      return;
    }
    showFileMenu(this.app, note, {
      x: event.pageX,
      y: event.pageY,
    });
  }

  private async onFileDeleted(file: TAbstractFile): Promise<void> {
    if (!(file instanceof TFile)) {
      return;
    }
    let shouldRefresh = false;
    if (getDateFromFile(file, "day")) {
      dailyNotes.reindex();
      shouldRefresh = true;
    }
    if (getDateFromFile(file, "week")) {
      weeklyNotes.reindex();
      shouldRefresh = true;
    }
    if (shouldRefresh) {
      this.updateActiveFile();
      this.calendar?.refreshMetadata();
    }
  }

  private async onFileModified(file: TAbstractFile): Promise<void> {
    if (!(file instanceof TFile)) {
      return;
    }
    const date = getDateFromFile(file, "day") || getDateFromFile(file, "week");
    if (date && this.calendar) {
      this.calendar.refreshMetadata();
    }
  }

  private onFileCreated(file: TAbstractFile): void {
    if (!(file instanceof TFile)) {
      return;
    }
    if (this.app.workspace.layoutReady && this.calendar) {
      let shouldRefresh = false;
      if (getDateFromFile(file, "day")) {
        dailyNotes.reindex();
        shouldRefresh = true;
      }
      if (getDateFromFile(file, "week")) {
        weeklyNotes.reindex();
        shouldRefresh = true;
      }
      if (shouldRefresh) {
        this.calendar.refreshMetadata();
      }
    }
  }

  public onFileOpen(_file: TFile | null): void {
    if (this.app.workspace.layoutReady) {
      this.updateActiveFile();
    }
  }

  private updateActiveFile(): void {
    const view = this.app.workspace.getActiveViewOfType(FileView);
    activeFile.setFile(view?.file ?? null);
  }

  public revealActiveNote(): void {
    const file = this.app.workspace.getActiveViewOfType(FileView)?.file;
    if (!file) {
      return;
    }
    const granularities: IGranularity[] = [
      "day",
      "week",
      "month",
      "quarter",
      "year",
    ];
    for (const granularity of granularities) {
      const date = getDateFromFile(file, granularity);
      if (date) {
        this.calendar.setDisplayedMonth(date);
        return;
      }
    }
  }

  async openOrCreateWeeklyNote(
    date: Moment,
    inNewSplit: boolean
  ): Promise<void> {
    if (!isPeriodicNoteEnabled("week")) {
      return;
    }
    await openOrCreatePeriodicNote(
      "week",
      date,
      getWeeklyNote(date, get(weeklyNotes)),
      inNewSplit,
      this.settings,
      (file) => activeFile.setFile(file)
    );
  }

  async openOrCreateDailyNote(
    date: Moment,
    inNewSplit: boolean
  ): Promise<void> {
    await openOrCreatePeriodicNote(
      "day",
      date,
      getDailyNote(date, get(dailyNotes)),
      inNewSplit,
      this.settings,
      (file) => activeFile.setFile(file)
    );
  }

  /** For periodicities without a cached index (month, quarter, year). */
  async openOrCreatePeriodicNote(
    granularity: IGranularity,
    date: Moment,
    inNewSplit: boolean
  ): Promise<void> {
    await openOrCreatePeriodicNote(
      granularity,
      date,
      findPeriodicNote(granularity, date),
      inNewSplit,
      this.settings,
      (file) => activeFile.setFile(file)
    );
  }
}
