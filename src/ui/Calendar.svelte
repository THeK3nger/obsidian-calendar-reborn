<svelte:options immutable />

<script lang="ts">
  import { run } from 'svelte/legacy';

  import type { Moment } from "moment";
  import {
    Calendar as CalendarBase,
    configureGlobalMomentLocale,
  } from "src/lib/calendar-ui";
  import type { ICalendarSource } from "src/lib/calendar-ui";
  import { onDestroy } from "svelte";

  import type { ISettings } from "src/settings";
  import { activeFile, dailyNotes, settings, weeklyNotes } from "./stores";

  let today: Moment = $state();


  interface Props {
    displayedMonth?: Moment;
    sources: ICalendarSource[];
    onHoverDay: (
    date: Moment,
    targetEl: EventTarget,
    isMetaPressed?: boolean
  ) => void;
    onHoverWeek: (
    date: Moment,
    targetEl: EventTarget,
    isMetaPressed?: boolean
  ) => void;
    onClickDay: (
    date: Moment,
    isMetaPressed: boolean
  ) => void | Promise<void>;
    onClickWeek: (
    date: Moment,
    isMetaPressed: boolean
  ) => void | Promise<void>;
    onContextMenuDay: (date: Moment, event: MouseEvent) => void;
    onContextMenuWeek: (date: Moment, event: MouseEvent) => void;
  }

  let {
    displayedMonth = $bindable(today),
    sources,
    onHoverDay,
    onHoverWeek,
    onClickDay,
    onClickWeek,
    onContextMenuDay,
    onContextMenuWeek
  }: Props = $props();

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
  run(() => {
    today = getToday($settings);
  });
</script>

<CalendarBase
  {sources}
  {today}
  {onHoverDay}
  {onHoverWeek}
  {onContextMenuDay}
  {onContextMenuWeek}
  {onClickDay}
  {onClickWeek}
  bind:displayedMonth
  localeData={today.localeData()}
  selectedId={$activeFile}
  showWeekNums={$settings.showWeeklyNote}
/>
