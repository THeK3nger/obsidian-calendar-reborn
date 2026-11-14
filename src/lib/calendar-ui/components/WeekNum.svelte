<script lang="ts">
  import type { Moment } from "moment";
  import { getDateUID } from "src/lib/daily-notes";

  import Dot from "./Dot.svelte";
  import MetadataResolver from "./MetadataResolver.svelte";
  import type { IDayMetadata } from "../types";
  import { getStartOfWeek, isMetaPressed } from "../utils";

  interface Props {
    // Properties
    weekNum: number;
    days: Moment[];
    metadata: Promise<IDayMetadata> | null;
    // Event handlers
    onHover: (date: Moment, targetEl: EventTarget, isMetaPressed: boolean) => void | Promise<void>;
    onClick: (date: Moment, isMetaPressed: boolean) => void | Promise<void>;
    onContextMenu: (date: Moment, event: MouseEvent) => void | Promise<void>;
    // Global state;
    selectedId?: string;
  }

  let {
    weekNum,
    days,
    metadata,
    onHover,
    onClick,
    onContextMenu,
    selectedId = null
  }: Props = $props();

  let startOfWeek: Moment = $derived(getStartOfWeek(days));
  
</script>

<td>
  <MetadataResolver metadata={metadata} >
    {#snippet children({ metadata })}
        <div
        class="{`week-num ${metadata.classes.join(' ')}`}"
        class:active={selectedId === getDateUID(days[0], 'week')}
        onclick={onClick && ((e) => onClick(startOfWeek, isMetaPressed(e)))}
        oncontextmenu={onContextMenu && ((e) => onContextMenu(days[0], e))}
        onpointerover={onHover &&
          ((e) => onHover(startOfWeek, e.target, isMetaPressed(e)))}
      >
        {weekNum}
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
  td {
    border-right: 1px solid var(--background-modifier-border);
  }

  .week-num {
    background-color: var(--color-background-weeknum);
    border-radius: 4px;
    color: var(--color-text-weeknum);
    cursor: pointer;
    font-size: 0.65em;
    height: 100%;
    padding: 4px;
    text-align: center;
    transition: background-color 0.1s ease-in, color 0.1s ease-in;
    vertical-align: baseline;
  }

  .week-num:hover {
    background-color: var(--interactive-hover);
  }

  .week-num.active:hover {
    background-color: var(--interactive-accent-hover);
  }

  .active {
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
