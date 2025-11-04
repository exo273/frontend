<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { auth } from '$lib/stores';

	let currentUser = null;

	// Verificar autenticación
	onMount(() => {
		const unsubscribe = auth.subscribe((state) => {
			if (!state.isAuthenticated) {
				goto('/login');
			} else {
				currentUser = state.user;
			}
		});

		return unsubscribe;
	});

	function backToAdmin() {
		goto('/');
	}

	function handleLogout() {
		auth.logout();
		goto('/login');
	}
</script>

<div class="flex flex-col h-screen overflow-hidden bg-surface-50-900-token">
	<!-- POS Header (slim) -->
	<header class="bg-surface-100-800-token border-b border-surface-300-600-token px-4 py-2">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-4">
				<button class="btn btn-sm variant-ghost-surface" on:click={backToAdmin} title="Volver al panel de administración">
					◀ Admin
				</button>
				<h2 class="font-bold text-lg">🍽️ PUNTO DE VENTA</h2>
			</div>

			<div class="flex items-center gap-4">
				{#if currentUser}
					<span class="text-sm">
						👤 <span class="font-semibold">{currentUser.username}</span>
					</span>
				{/if}
				<button class="btn btn-sm variant-ghost-error" on:click={handleLogout}>
					🚪 Salir
				</button>
			</div>
		</div>
	</header>

	<!-- POS Content (fullscreen) -->
	<main class="flex-1 overflow-hidden">
		<slot />
	</main>
</div>
