<script lang="ts">
	import { cn } from '$lib/utils';

	let className: string | undefined = undefined;
	export { className as class };
	export let checked: boolean = false;
	export let disabled: boolean = false;
</script>

<button
	type="button"
	role="checkbox"
	aria-checked={checked}
	class={cn(
		'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
		checked && 'bg-primary text-primary-foreground',
		className
	)}
	on:click={() => {
		if (!disabled) checked = !checked;
	}}
	{disabled}
	{...$$restProps}
>
	{#if checked}
		<svg
			class="h-4 w-4"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="3"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<polyline points="20 6 9 17 4 12" />
		</svg>
	{/if}
</button>
