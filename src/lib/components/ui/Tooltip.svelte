<script lang="ts">
	import { cn } from '$lib/utils';

	let className: string | undefined = undefined;
	export { className as class };
	export let text: string;
	export let position: 'top' | 'bottom' | 'left' | 'right' = 'top';

	let showTooltip = false;
	let timeoutId: ReturnType<typeof setTimeout>;

	function handleMouseEnter() {
		timeoutId = setTimeout(() => {
			showTooltip = true;
		}, 300);
	}

	function handleMouseLeave() {
		clearTimeout(timeoutId);
		showTooltip = false;
	}

	$: positionClasses = {
		top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
		bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
		left: 'right-full top-1/2 -translate-y-1/2 mr-2',
		right: 'left-full top-1/2 -translate-y-1/2 ml-2'
	};
</script>

<div class={cn('relative inline-block', className)} {...$$restProps}>
	<div on:mouseenter={handleMouseEnter} on:mouseleave={handleMouseLeave}>
		<slot />
	</div>

	{#if showTooltip}
		<div
			class={cn(
				'absolute z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95',
				positionClasses[position]
			)}
			role="tooltip"
		>
			{text}
		</div>
	{/if}
</div>
