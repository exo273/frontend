<script lang="ts">
	import { cn } from '$lib/utils';
	import { createEventDispatcher } from 'svelte';

	let className: string | undefined = undefined;
	export { className as class };
	export let open: boolean = false;
	export let title: string = '';
	export let description: string = '';

	const dispatch = createEventDispatcher();

	function handleClose() {
		open = false;
		dispatch('close');
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			handleClose();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && open) {
			handleClose();
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

{#if open}
	<!-- Backdrop -->
	<div
		class="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
		data-state="open"
		on:click={handleBackdropClick}
		role="presentation"
	>
		<!-- Dialog Content -->
		<div class="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] w-full max-w-lg">
			<div
				class={cn(
					'grid w-full gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg',
					className
				)}
				data-state="open"
				role="dialog"
				aria-modal="true"
				aria-labelledby="dialog-title"
				aria-describedby="dialog-description"
				{...$$restProps}
			>
				<!-- Close Button -->
				<button
					type="button"
					class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
					on:click={handleClose}
					aria-label="Close"
				>
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
						<line x1="18" y1="6" x2="6" y2="18" />
						<line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				</button>

				<!-- Header -->
				{#if title || description}
					<div class="flex flex-col space-y-1.5 text-center sm:text-left">
						{#if title}
							<h2 id="dialog-title" class="text-lg font-semibold leading-none tracking-tight">
								{title}
							</h2>
						{/if}
						{#if description}
							<p id="dialog-description" class="text-sm text-muted-foreground">
								{description}
							</p>
						{/if}
					{/if}
				{/if}

				<!-- Content Slot -->
				<slot />

				<!-- Footer Slot -->
				{#if $$slots.footer}
					<div class="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4">
						<slot name="footer" />
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
