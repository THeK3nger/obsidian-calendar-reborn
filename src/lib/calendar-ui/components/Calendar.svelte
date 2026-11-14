<script lang="ts">
  import type { Locale, Moment } from "moment";

  import Day from "./Day.svelte";
  import Nav from "./Nav.svelte";
  import WeekNum from "./WeekNum.svelte";
  import { getDailyMetadata, getWeeklyMetadata } from "../metadata";
  import type { ICalendarSource, IMonth } from "../types";
  import { getDaysOfWeek, getMonth, isWeekend } from "../utils";

  interface Props {
    // Localization
    localeData: Locale;
    // Settings
    showWeekNums?: boolean;
    // Event Handlers
    onHoverDay: (date: Moment, targetEl: EventTarget, isMetaPressed: boolean) => void | Promise<void>;
    onHoverWeek: (date: Moment, targetEl: EventTarget, isMetaPressed: boolean) => void | Promise<void>;
    onContextMenuDay: (date: Moment, event: MouseEvent) => void | Promise<void>;
    onContextMenuWeek: (date: Moment, event: MouseEvent) => void | Promise<void>;
    onClickDay: (date: Moment, isMetaPressed: boolean) => void | Promise<void>;
    onClickWeek: (date: Moment, isMetaPressed: boolean) => void | Promise<void>;
    // Optional: when set, the month/year in the title open that period's note.
    onClickMonth?: (date: Moment, isMetaPressed: boolean) => void | Promise<void>;
    onClickYear?: (date: Moment, isMetaPressed: boolean) => void | Promise<void>;
    // External sources (All optional)
    sources?: ICalendarSource[];
    selectedId: string;
    // Override-able local state
    today?: Moment;
    displayedMonth?: Moment;
  }

  let {
    localeData,
    showWeekNums = false,
    onHoverDay,
    onHoverWeek,
    onContextMenuDay,
    onContextMenuWeek,
    onClickDay,
    onClickWeek,
    onClickMonth,
    onClickYear,
    sources = [],
    selectedId,
    today = window.moment(),
    displayedMonth = $bindable(today)
  }: Props = $props();

  let month: IMonth = $derived(getMonth(displayedMonth, localeData));
  let daysOfWeek: string[] = $derived(getDaysOfWeek(today, localeData));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let isMobile = (window.app as any).isMobile;

  // Exports
  export function incrementDisplayedMonth() {
    displayedMonth = displayedMonth.clone().add(1, "month");
  }

  export function decrementDisplayedMonth() {
    displayedMonth = displayedMonth.clone().subtract(1, "month");
  }

  export function resetDisplayedMonth() {
    displayedMonth = today.clone();
  }
</script>

<div id="calendar-container" class="container" class:is-mobile={isMobile}>
  <Nav
    today={today}
    displayedMonth={displayedMonth}
    incrementDisplayedMonth={incrementDisplayedMonth}
    decrementDisplayedMonth={decrementDisplayedMonth}
    resetDisplayedMonth={resetDisplayedMonth}
    {onClickMonth}
    {onClickYear}
  />
  <table class="calendar">
    <colgroup>
      {#if showWeekNums}
        <col />
      {/if}
      {#each month[1].days as date}
        <col class:weekend={isWeekend(date)} />
      {/each}
    </colgroup>
    <thead>
      <tr>
        {#if showWeekNums}
          <th>W</th>
        {/if}
        {#each daysOfWeek as dayOfWeek}
          <th>{dayOfWeek}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each month as week (week.weekNum)}
        <tr>
          {#if showWeekNums}
            <WeekNum
              {...week}
              metadata={getWeeklyMetadata(sources, week.days[0], today)}
              onClick={onClickWeek}
              onContextMenu={onContextMenuWeek}
              onHover={onHoverWeek}
              selectedId={selectedId}
            />
          {/if}
          {#each week.days as day (day.format())}
            <Day
              date={day}
              today={today}
              displayedMonth={displayedMonth}
              onClick={onClickDay}
              onContextMenu={onContextMenuDay}
              onHover={onHoverDay}
              metadata={getDailyMetadata(sources, day, today)}
              selectedId={selectedId}
            />
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .container {
    --color-background-heading: transparent;
    --color-background-day: transparent;
    --color-background-weeknum: transparent;
    --color-background-weekend: transparent;

    --color-dot: var(--text-muted);
    --color-arrow: var(--text-muted);
    --color-button: var(--text-muted);

    --color-text-title: var(--text-normal);
    --color-text-heading: var(--text-muted);
    --color-text-day: var(--text-normal);
    --color-text-today: var(--interactive-accent);
    --color-text-weeknum: var(--text-muted);
  }

  .container {
    padding: 0 8px;
  }

  .container.is-mobile {
    padding: 0;
  }

  th {
    text-align: center;
  }

  .weekend {
    background-color: var(--color-background-weekend);
  }

  .calendar {
    border-collapse: collapse;
    width: 100%;
  }

  th {
    background-color: var(--color-background-heading);
    color: var(--color-text-heading);
    font-size: 0.6em;
    letter-spacing: 1px;
    padding: 4px;
    text-transform: uppercase;
  }
</style>
