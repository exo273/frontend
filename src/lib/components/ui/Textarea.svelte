<script lang="ts">
	import { cn } from '$lib/utils';

	let className: string | undefined = undefined;
	export { className as class };
	export let value: string = '';
	export let placeholder: string = '';
	export let disabled: boolean = false;
	export let rows: number = 4;
</script>

<textarea
	class={cn(
		'flex min-h-[80px] w-full rounded-md border border-input bg-input px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
		className
	)}
	bind:value
	{placeholder}
	{disabled}
	{rows}
	{...$$restProps}
/>
