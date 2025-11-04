<script>
	import '../app.postcss';
	import { initializeStores, Toast, Modal } from '@skeletonlabs/skeleton';
	import { toast } from '$lib/stores';
	import { onMount } from 'svelte';

	// Inicializar stores de Skeleton
	initializeStores();

	let toasts = [];
	toast.subscribe(value => {
		toasts = value;
	});
</script>

<!-- Slot para el contenido de las páginas -->
<slot />

<!-- Sistema de notificaciones (Toasts) -->
<div class="toast-container fixed top-4 right-4 z-50 space-y-2">
	{#each toasts as toastItem (toastItem.id)}
		<div
			class="alert animate-slide-in"
			class:variant-filled-success={toastItem.type === 'success'}
			class:variant-filled-error={toastItem.type === 'error'}
			class:variant-filled-warning={toastItem.type === 'warning'}
		>
			<div class="alert-message">
				<span class="text-lg">
					{#if toastItem.type === 'success'}
						✅
					{:else if toastItem.type === 'error'}
						❌
					{:else if toastItem.type === 'warning'}
						⚠️
					{/if}
				</span>
				<span>{toastItem.message}</span>
			</div>
			<button
				class="btn-icon btn-icon-sm"
				on:click={() => toast.dismiss(toastItem.id)}
			>
				✕
			</button>
		</div>
	{/each}
</div>

<!-- Modal container de Skeleton -->
<Modal />
<Toast />

<style>
	.animate-slide-in {
		animation: slideIn 0.3s ease-out;
	}

	@keyframes slideIn {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	.toast-container {
		max-width: 400px;
	}
</style>

