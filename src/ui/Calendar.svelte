<svelte:options immutable />

<script lang="ts">
  import type { Moment } from "moment";
  import {
    Calendar as CalendarBase,
    configureGlobalMomentLocale,
  } from "obsidian-calendar-ui";
  import type { ICalendarSource } from "obsidian-calendar-ui";
  import { onDestroy } from "svelte";

  import type { ISettings } from "src/settings";
  import { activeFile, dailyNotes, settings, weeklyNotes } from "./stores";

  let today: Moment;

  $: today = getToday($settings);

  export let displayedMonth: Moment = today;
  export let sources: ICalendarSource[];
  export let onHoverDay: (
    date: Moment,
    targetEl: EventTarget,
    isMetaPressed?: boolean
  ) => void;
  export let onHoverWeek: (
    date: Moment,
    targetEl: EventTarget,
    isMetaPressed?: boolean
  ) => void;
  export let onClickDay: (
    date: Moment,
    isMetaPressed: boolean
  ) => void | Promise<void>;
  export let onClickWeek: (
    date: Moment,
    isMetaPressed: boolean
  ) => void | Promise<void>;
  export let onContextMenuDay: (date: Moment, event: MouseEvent) => void;
  export let onContextMenuWeek: (date: Moment, event: MouseEvent) => void;

  // The library's typings declare these handlers as returning boolean, but the
  // return value is never used.
  const contextMenuDay = (date: Moment, event: MouseEvent): boolean => {
    onContextMenuDay(date, event);
    return true;
  };
  const contextMenuWeek = (date: Moment, event: MouseEvent): boolean => {
    onContextMenuWeek(date, event);
    return true;
  };

  export function tick() {
    today = window.moment();
  }

  function getToday(settings: ISettings) {
    configureGlobalMomentLocale(settings.localeOverride, settings.weekStart);
    dailyNotes.reindex();
    weeklyNotes.reindex();
    return window.moment();
  }

  // 1 minute heartbeat to keep `today` reflecting the current day
  let heartbeat = setInterval(() => {
    tick();

    const isViewingCurrentMonth = displayedMonth.isSame(today, "day");
    if (isViewingCurrentMonth) {
      // if it's midnight on the last day of the month, this will
      // update the display to show the new month.
      displayedMonth = today;
    }
  }, 1000 * 60);

  onDestroy(() => {
    clearInterval(heartbeat);
  });
</script>

<CalendarBase
  {sources}
  {today}
  {onHoverDay}
  {onHoverWeek}
  onContextMenuDay={contextMenuDay}
  onContextMenuWeek={contextMenuWeek}
  {onClickDay}
  {onClickWeek}
  bind:displayedMonth
  localeData={today.localeData()}
  selectedId={$activeFile}
  showWeekNums={$settings.showWeeklyNote}
/>
