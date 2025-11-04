<script>
	/**
	 * @typedef {'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'} ButtonVariant
	 * @typedef {'default' | 'sm' | 'lg' | 'icon'} ButtonSize
	 */

	/** @type {ButtonVariant} */
	export let variant = 'default';
	/** @type {ButtonSize} */
	export let size = 'default';
	/** @type {string} */
	export let type = 'button';
	/** @type {boolean} */
	export let disabled = false;
	/** @type {boolean} */
	export let isLoading = false;
	/** @type {string} */
	let className = '';
	export { className as class };

	$: variantClasses = {
		default: 'bg-primary text-primary-foreground hover:bg-primary/90',
		destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/70',
		outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
		secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
		ghost: 'hover:bg-accent hover:text-accent-foreground',
		link: 'text-primary underline-offset-4 hover:underline'
	};

	$: sizeClasses = {
		default: 'h-10 px-4 py-2',
		sm: 'h-9 rounded-md px-3',
		lg: 'h-11 rounded-md px-8',
		icon: 'h-10 w-10'
	};

	$: classes = [
		'inline-flex items-center justify-center gap-2 whitespace-nowrap select-none rounded-lg',
		'transition-all will-change-transform active:hover:scale-[0.98] active:hover:transform',
		'text-sm font-medium ring-offset-background',
		'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
		'disabled:pointer-events-none disabled:opacity-50',
		variantClasses[variant],
		sizeClasses[size],
		className
	]
		.filter(Boolean)
		.join(' ');
</script>

<button {type} {disabled} disabled={isLoading || disabled} class={classes} on:click {...$$restProps}>
	{#if isLoading}
		<svg
			class="animate-spin h-4 w-4"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
		>
			<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
			<path
				class="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
			/>
		</svg>
	{/if}
	<slot />
</button>
