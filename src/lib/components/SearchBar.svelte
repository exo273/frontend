<script>
	export let value = '';
	export let placeholder = '';
	export let onSearch = null;
	export let debounce = 300;

	let timeout;

	function handleInput(event) {
		clearTimeout(timeout);
		timeout = setTimeout(() => {
			if (onSearch) {
				onSearch(value);
			}
		}, debounce);
	}
</script>

<div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
	<div class="input-group-shim">🔍</div>
	<input
		type="search"
		bind:value
		{placeholder}
		on:input={handleInput}
		class="input"
	/>
	{#if value}
		<button
			type="button"
			class="btn variant-ghost-surface"
			on:click={() => {
				value = '';
				if (onSearch) onSearch('');
			}}
		>
			✕
		</button>
	{/if}
</div>
