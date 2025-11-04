<script lang="ts">
	import { cn } from '$lib/utils';
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';

	let className: string | undefined = undefined;
	export { className as class };
	export let value: string = '';

	const activeTab = writable(value);
	setContext('tabs', activeTab);

	$: activeTab.set(value);
</script>

<div class={cn('w-full', className)} {...$$restProps}>
	<slot />
</div>
