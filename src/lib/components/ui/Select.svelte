<script lang="ts">
	import { cn } from '$lib/utils';

	let className: string | undefined = undefined;
	export { className as class };
	export let value: string = '';
	export let placeholder: string = 'Seleccionar...';
	export let options: Array<{ value: string; label: string }> = [];
	export let disabled: boolean = false;

	let isOpen = false;
	let selectRef: HTMLDivElement;

	function toggleOpen() {
		if (!disabled) {
			isOpen = !isOpen;
		}
	}

	function selectOption(optionValue: string) {
		value = optionValue;
		isOpen = false;
	}

	function handleClickOutside(event: MouseEvent) {
		if (selectRef && !selectRef.contains(event.target as Node)) {
			isOpen = false;
		}
	}

	$: selectedLabel = options.find((opt) => opt.value === value)?.label || placeholder;
</script>

<svelte:window on:click={handleClickOutside} />

<div class="relative w-full" bind:this={selectRef}>
	<button
		type="button"
		class={cn(
			'flex h-10 w-full items-center justify-between rounded-md border border-input bg-input px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
			className
		)}
		on:click={toggleOpen}
		{disabled}
		{...$$restProps}
	>
		<span class="line-clamp-1">{selectedLabel}</span>
		<svg
			class="h-4 w-4 opacity-50 transition-transform duration-200"
			class:rotate-180={isOpen}
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<polyline points="6 9 12 15 18 9" />
		</svg>
	</button>

	{#if isOpen && !disabled}
		<div
			class="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95"
		>
			<div class="max-h-60 overflow-y-auto p-1">
				{#each options as option}
					<button
						type="button"
						class="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
						on:click={() => selectOption(option.value)}
					>
						{#if value === option.value}
							<span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
								<svg
									class="h-4 w-4"
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<polyline points="20 6 9 17 4 12" />
								</svg>
							</span>
						{/if}
						<span>{option.label}</span>
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>
