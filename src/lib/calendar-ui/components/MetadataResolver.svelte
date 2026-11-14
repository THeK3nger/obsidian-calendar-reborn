<svelte:options immutable />

<script lang="ts">
  import type { IDayMetadata } from "../types";

  interface Props {
    metadata: Promise<IDayMetadata> | null;
    children?: import('svelte').Snippet<[any]>;
  }

  let { metadata, children }: Props = $props();
</script>

{#if metadata}
  {#await metadata then resolvedMeta}
    {@render children?.({ metadata: resolvedMeta, })}
  {/await}
{:else}
  {@render children?.({ metadata: null, })}
{/if}
