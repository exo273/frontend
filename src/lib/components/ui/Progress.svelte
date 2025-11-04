<script lang="ts">
	import { cn } from '$lib/utils';

	let className: string | undefined = undefined;
	export { className as class };
	export let value: number = 0;
	export let max: number = 100;

	$: percentage = Math.min(Math.max((value / max) * 100, 0), 100);
</script>

<div
	class={cn('relative h-4 w-full overflow-hidden rounded-full bg-secondary', className)}
	role="progressbar"
	aria-valuenow={value}
	aria-valuemin={0}
	aria-valuemax={max}
	{...$$restProps}
>
	<div
		class="h-full w-full flex-1 bg-primary transition-all duration-300 ease-in-out"
		style="transform: translateX(-{100 - percentage}%)"
	/>
</div>
