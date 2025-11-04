<script>
	export let show = false;
	export let title = 'Modal';
	export let onClose = () => {};
	export let size = 'md'; // sm, md, lg, xl, full
	
	const sizeClasses = {
		sm: 'max-w-sm',
		md: 'max-w-md',
		lg: 'max-w-2xl',
		xl: 'max-w-4xl',
		full: 'max-w-full mx-4'
	};

	function handleBackdropClick(event) {
		if (event.target === event.currentTarget) {
			handleClose();
		}
	}

	function handleClose() {
		show = false;
		onClose();
	}

	function handleKeydown(event) {
		if (event.key === 'Escape') {
			handleClose();
		}
	}
</script>

{#if show}
	<div
		class="modal-backdrop fixed inset-0 bg-surface-backdrop-token z-50 flex items-center justify-center p-4"
		on:click={handleBackdropClick}
		on:keydown={handleKeydown}
		role="button"
		tabindex="-1"
	>
		<div class="card w-full {sizeClasses[size]} max-h-[90vh] overflow-hidden flex flex-col animate-fade-in">
			<!-- Header -->
			<header class="card-header flex justify-between items-center">
				<h3 class="h3">{title}</h3>
				<button
					type="button"
					class="btn-icon btn-icon-sm"
					on:click={handleClose}
				>
					✕
				</button>
			</header>

			<!-- Body con scroll -->
			<section class="p-4 overflow-y-auto flex-1">
				<slot />
			</section>

			<!-- Footer (opcional) -->
			{#if $$slots.footer}
				<footer class="card-footer">
					<slot name="footer" />
				</footer>
			{/if}
		</div>
	</div>
{/if}

<style>
	.animate-fade-in {
		animation: fadeIn 0.2s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: scale(0.95);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}
</style>
