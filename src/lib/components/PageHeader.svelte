<script>
	export let title = '';
	export let subtitle = '';
	export let buttonText = '';
	export let buttonIcon = '➕';
	export let onButtonClick = null;
</script>

<header class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
	<div>
		<h1 class="h2">{title}</h1>
		{#if subtitle}
			<p class="text-muted-foreground">{subtitle}</p>
		{/if}
	</div>
	
	{#if buttonText && onButtonClick}
		<button
			class="btn variant-filled-primary"
			on:click={onButtonClick}
		>
			<span>{buttonIcon}</span>
			<span>{buttonText}</span>
		</button>
	{/if}
</header>


