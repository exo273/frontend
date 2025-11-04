<script lang="ts">
	import { cn } from '$lib/utils';

	let className: string | undefined = undefined;
	export { className as class };
	export let src: string | undefined = undefined;
	export let alt: string = 'Avatar';
	export let fallback: string = 'U';
	export let size: 'sm' | 'md' | 'lg' = 'md';

	let imageError = false;

	$: sizeClasses = {
		sm: 'h-8 w-8 text-xs',
		md: 'h-10 w-10 text-sm',
		lg: 'h-12 w-12 text-base'
	};

	function handleImageError() {
		imageError = true;
	}
</script>

<div
	class={cn(
		'relative flex shrink-0 overflow-hidden rounded-full',
		sizeClasses[size],
		className
	)}
	{...$$restProps}
>
	{#if src && !imageError}
		<img class="aspect-square h-full w-full object-cover" {src} {alt} on:error={handleImageError} />
	{:else}
		<span
			class="flex h-full w-full items-center justify-center rounded-full bg-muted font-medium text-muted-foreground"
		>
			{fallback}
		</span>
	{/if}
</div>
