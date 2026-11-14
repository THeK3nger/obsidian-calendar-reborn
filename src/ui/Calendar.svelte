<script lang="ts">
  import type { Moment } from "moment";
  import {
    Calendar as CalendarBase,
    configureGlobalMomentLocale,
  } from "src/lib/calendar-ui";
  import type { ICalendarSource } from "src/lib/calendar-ui";
  import { onDestroy } from "svelte";

  import type { ISettings } from "src/settings";
  import { activeFile, dailyNotes, settings, weeklyNotes } from "./stores";

  interface Props {
    sources: ICalendarSource[];
    onHoverDay: (date: Moment, targetEl: EventTarget, isMetaPressed?: boolean) => void;
    onHoverWeek: (date: Moment, targetEl: EventTarget, isMetaPressed?: boolean) => void;
    onClickDay: (date: Moment, isMetaPressed: boolean) => void | Promise<void>;
    onClickWeek: (date: Moment, isMetaPressed: boolean) => void | Promise<void>;
    onClickMonth: (date: Moment, isMetaPressed: boolean) => void | Promise<void>;
    onClickYear: (date: Moment, isMetaPressed: boolean) => void | Promise<void>;
    onContextMenuDay: (date: Moment, event: MouseEvent) => void;
    onContextMenuWeek: (date: Moment, event: MouseEvent) => void;
  }

  let {
    sources,
    onHoverDay,
    onHoverWeek,
    onClickDay,
    onClickWeek,
    onClickMonth,
    onClickYear,
    onContextMenuDay,
    onContextMenuWeek
  }: Props = $props();

  function getToday(settings: ISettings) {
    configureGlobalMomentLocale(settings.localeOverride, settings.weekStart);
    dailyNotes.reindex();
    weeklyNotes.reindex();
    return window.moment();
  }

  // Re-derived whenever the settings change; `tick()` can override it in between.
  let today: Moment = $derived(getToday($settings));
  let displayedMonth: Moment = $state(window.moment());

  export function tick() {
    today = window.moment();
  }

  export function setDisplayedMonth(date: Moment) {
    displayedMonth = date;
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
  {onContextMenuDay}
  {onContextMenuWeek}
  {onClickDay}
  {onClickWeek}
  onClickMonth={$settings.monthly.enabled ? onClickMonth : undefined}
  onClickYear={$settings.yearly.enabled ? onClickYear : undefined}
  bind:displayedMonth
  localeData={today.localeData()}
  selectedId={$activeFile}
  showWeekNums={$settings.showWeeklyNote}
/>
