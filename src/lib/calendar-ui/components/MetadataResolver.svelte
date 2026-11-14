<script lang="ts">
  import type { Snippet } from "svelte";
  import type { IDayMetadata } from "../types";

  interface Props {
    metadata: Promise<IDayMetadata> | null;
    children?: Snippet<[{ metadata: IDayMetadata | null }]>;
  }

  let { metadata, children }: Props = $props();
</script>

{#if metadata}
  {#await metadata then resolvedMeta}
    {@render children?.({ metadata: resolvedMeta })}
  {/await}
{:else}
  {@render children?.({ metadata: null })}
{/if}
