<script lang="ts">
	import { cn } from '$lib/utils';
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';

	let className: string | undefined = undefined;
	export { className as class };
	export let value: string;

	const activeTab = getContext<Writable<string>>('tabs');

	$: isActive = $activeTab === value;
</script>

{#if isActive}
	<div
		class={cn(
			'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
			className
		)}
		role="tabpanel"
		{...$$restProps}
	>
		<slot />
	</div>
{/if}
