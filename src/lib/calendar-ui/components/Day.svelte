<svelte:options immutable />

<script lang="ts">
  import type { Moment } from "moment";
  import { getDateUID } from "src/lib/daily-notes";

  import Dot from "./Dot.svelte";
  import MetadataResolver from "./MetadataResolver.svelte";
  import type { IDayMetadata } from "../types";
  import { isMetaPressed } from "../utils";

  

  
  interface Props {
    // Properties
    date: Moment;
    metadata: Promise<IDayMetadata> | null;
    onHover: (
    date: Moment,
    targetEl: EventTarget,
    isMetaPressed: boolean
  ) => void | Promise<void>;
    onClick: (date: Moment, isMetaPressed: boolean) => void | Promise<void>;
    onContextMenu: (date: Moment, event: MouseEvent) => void | Promise<void>;
    // Global state
    today: Moment;
    displayedMonth?: Moment;
    selectedId?: string;
  }

  let {
    date,
    metadata,
    onHover,
    onClick,
    onContextMenu,
    today,
    displayedMonth = null,
    selectedId = null
  }: Props = $props();
</script>

<td>
  <MetadataResolver metadata="{metadata}" >
    {#snippet children({ metadata })}
        <div
        class="{`day ${metadata.classes.join(' ')}`}"
        class:active="{selectedId === getDateUID(date, 'day')}"
        class:adjacent-month="{!date.isSame(displayedMonth, 'month')}"
        class:today="{date.isSame(today, 'day')}"
        onclick={onClick && ((e) => onClick(date, isMetaPressed(e)))}
        oncontextmenu={onContextMenu && ((e) => onContextMenu(date, e))}
        onpointerover={onHover &&
          ((e) => onHover(date, e.target, isMetaPressed(e)))}
        {...metadata.dataAttributes || {}}
      >
        {date.format("D")}
        <div class="dot-container">
          {#each metadata.dots as dot}
            <Dot {...dot} />
          {/each}
        </div>
      </div>
          {/snippet}
    </MetadataResolver>
</td>

<style>
  .day {
    background-color: var(--color-background-day);
    border-radius: 4px;
    color: var(--color-text-day);
    cursor: pointer;
    font-size: 0.8em;
    height: 100%;
    padding: 4px;
    position: relative;
    text-align: center;
    transition: background-color 0.1s ease-in, color 0.1s ease-in;
    vertical-align: baseline;
  }
  .day:hover {
    background-color: var(--interactive-hover);
  }

  .day.active:hover {
    background-color: var(--interactive-accent-hover);
  }

  .adjacent-month {
    opacity: 0.25;
  }

  .today {
    color: var(--color-text-today);
  }

  .day:active,
  .active,
  .active.today {
    color: var(--text-on-accent);
    background-color: var(--interactive-accent);
  }

  .dot-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    line-height: 6px;
    min-height: 6px;
  }
</style>
