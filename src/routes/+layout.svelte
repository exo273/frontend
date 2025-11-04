<script>
	import '../app.postcss';
	import { toast } from '$lib/stores';
	import { onMount } from 'svelte';
	import CheckCircle2 from '$lib/components/icons/CheckCircle2.svelte';
	import XCircle from '$lib/components/icons/XCircle.svelte';
	import AlertCircle from '$lib/components/icons/AlertCircle.svelte';
	import AlertTriangle from '$lib/components/icons/AlertTriangle.svelte';
	import X from '$lib/components/icons/X.svelte';

	let toasts = [];
	toast.subscribe(value => {
		toasts = value;
	});
</script>

<!-- Slot para el contenido de las páginas -->
<slot />

<!-- Sistema de notificaciones (Toasts) estilo Dockploy -->
<div class="fixed top-4 right-4 z-50 w-full max-w-sm space-y-2 pointer-events-none">
	{#each toasts as toastItem (toastItem.id)}
		<div
			class="pointer-events-auto bg-background border rounded-lg shadow-lg p-4 flex items-start gap-3 animate-in slide-in-from-top-2 duration-300"
			class:border-green-500={toastItem.type === 'success'}
			class:border-red-500={toastItem.type === 'error'}
			class:border-yellow-500={toastItem.type === 'warning'}
		>
			<!-- Icono -->
			<div class="flex-shrink-0 mt-0.5">
				{#if toastItem.type === 'success'}
					<CheckCircle2 class="h-5 w-5 text-green-500" />
				{:else if toastItem.type === 'error'}
					<XCircle class="h-5 w-5 text-red-500" />
				{:else if toastItem.type === 'warning'}
					<AlertTriangle class="h-5 w-5 text-yellow-500" />
				{:else}
					<AlertCircle class="h-5 w-5 text-blue-500" />
				{/if}
			</div>

			<!-- Mensaje -->
			<div class="flex-1 min-w-0">
				<p class="text-sm font-medium text-foreground">
					{toastItem.message}
				</p>
			</div>

			<!-- Botón cerrar -->
			<button
				class="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
				on:click={() => toast.dismiss(toastItem.id)}
				aria-label="Cerrar"
			>
				<X class="h-4 w-4" />
			</button>
		</div>
	{/each}
</div>