<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { auth } from '$lib/stores';
	import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
	import ShoppingBag from '$lib/components/icons/ShoppingBag.svelte';
	import User from '$lib/components/icons/User.svelte';
	import LogOut from '$lib/components/icons/LogOut.svelte';

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
		window.location.href = '/';
	}

	function handleLogout() {
		auth.logout();
		goto('/login');
	}
</script>

<div class="flex flex-col h-screen overflow-hidden bg-background">
	<!-- POS Header -->
	<header class="bg-sidebar border-b border-border px-6 py-4">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-4">
				<button 
					class="flex items-center gap-2 px-3 py-2 hover:bg-muted rounded-lg transition-colors text-sm font-medium" 
					on:click={backToAdmin} 
					title="Volver al panel de administración"
				>
					<ArrowLeft class="h-4 w-4" />
					Admin
				</button>
				
				<div class="h-6 w-px bg-border"></div>
				
				<div class="flex items-center gap-3">
					<div class="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
						<ShoppingBag class="h-5 w-5 text-primary" />
					</div>
					<div>
						<h1 class="text-xl font-bold">Punto de Venta</h1>
						<p class="text-xs text-muted-foreground">Sistema POS</p>
					</div>
				</div>
			</div>

			<div class="flex items-center gap-4">
				{#if currentUser}
					<div class="flex items-center gap-2 text-sm">
						<User class="h-4 w-4 text-muted-foreground" />
						<span class="font-semibold">{currentUser.username}</span>
					</div>
				{/if}
				<button 
					class="flex items-center gap-2 px-3 py-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors text-sm font-medium" 
					on:click={handleLogout}
				>
					<LogOut class="h-4 w-4" />
					Salir
				</button>
			</div>
		</div>
	</header>

	<!-- POS Content (fullscreen) -->
	<main class="flex-1 overflow-hidden">
		<slot />
	</main>
</div>

