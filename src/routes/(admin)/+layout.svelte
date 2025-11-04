<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { auth } from '$lib/stores';
	import { apiService } from '$lib/api';
	import LayoutDashboard from '$lib/components/icons/LayoutDashboard.svelte';
	import Package from '$lib/components/icons/Package.svelte';
	import Users from '$lib/components/icons/Users.svelte';
	import ShoppingCart from '$lib/components/icons/ShoppingCart.svelte';
	import Book from '$lib/components/icons/Book.svelte';
	import FileText from '$lib/components/icons/FileText.svelte';
	import LayoutGrid from '$lib/components/icons/LayoutGrid.svelte';

	let currentUser = null;
	let showUserMenu = false;

	// Verificar autenticación
	onMount(() => {
		const unsubscribe = auth.subscribe((state) => {		JWT_SECRET_KEY=KQhzCHBjftXcBfJAjjU6c6cPtSjU5XpM
			if (!state.isAuthenticated) {
				goto('/login');
			} else {
				currentUser = state.user;
			}
		});

		return unsubscribe;
	});

	// Menú de navegación simplificado
	const menuItems = [
		{ label: 'Dashboard', icon: LayoutDashboard, href: '/' },
		{ label: 'Inventario', icon: Package, href: '/inventario' },
		{ label: 'Proveedores', icon: Users, href: '/proveedores' },
		{ label: 'Compras', icon: ShoppingCart, href: '/compras' },
		{ label: 'Recetas', icon: Book, href: '/recetas' },
		{ label: 'Carta / Menú', icon: FileText, href: '/carta' }
	];

	function toggleSidebar() {
		sidebarOpen = !sidebarOpen;
	}

	async function handleLogout() {
		try {
			// Obtener el refresh token del store
			let refreshToken = null;
			auth.subscribe((state) => {
				refreshToken = state.refreshToken;
			})();

			// Llamar al servicio de identidad para revocar el token
			if (refreshToken) {
				await apiService.logout(refreshToken);
			}
		} catch (error) {
			console.error('Error al cerrar sesión:', error);
			// Continuar con el logout local incluso si falla el backend
		} finally {
			// Limpiar el estado local siempre
			auth.logout();
			goto('/login');
		}
	}

	function launchPOS() {
		window.location.href = '/pos';
	}

	function isActive(href) {
		// Si es la ruta raíz, solo activar si estamos exactamente en "/"
		if (href === '/') {
			return $page.url.pathname === '/';
		}
		// Para otras rutas, activar si la ruta actual comienza con el href
		return $page.url.pathname.startsWith(href);
	}
</script>

<div class="flex h-screen overflow-hidden">
	<!-- Sidebar -->
	<aside class="w-64 bg-sidebar border-r border-border flex flex-col">
		<!-- Logo -->
		<div class="p-6 border-b border-border">
			<h2 class="font-bold text-xl">SIGR</h2>
		</div>

		<!-- Navigation -->
		<nav class="flex-1 overflow-y-auto p-4">
			<ul class="space-y-1">
				{#each menuItems as item}
					<li>
						<a
							href={item.href}
							class="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors {isActive(
								item.href
							)
								? 'bg-accent text-accent-foreground'
								: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}"
						>
							<svelte:component this={item.icon} class="h-4 w-4" />
							<span class="text-sm font-medium">{item.label}</span>
						</a>
					</li>
				{/each}
			</ul>
		</nav>

		<!-- Botón POS -->
		<div class="p-4 border-t border-border">
			<button
				class="flex items-center justify-center gap-2 w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
				on:click={launchPOS}
			>
				<svelte:component this={LayoutGrid} class="h-4 w-4" />
				<span>LANZAR POS</span>
			</button>
		</div>
	</aside>

	<!-- Main Content -->
	<div class="flex-1 flex flex-col overflow-hidden">
		<!-- Header -->
		<header class="bg-sidebar border-b border-border px-6 py-4">
			<div class="flex items-center justify-end">
				<!-- User menu -->
				<div class="relative">
					<button
						class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm font-medium"
						on:click={() => (showUserMenu = !showUserMenu)}
					>
						<div class="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
							{#if currentUser}
								{currentUser.username?.charAt(0).toUpperCase() || 'U'}
							{:else}
								U
							{/if}
						</div>
						{#if currentUser}
							<span class="hidden sm:inline">{currentUser.username}</span>
						{/if}
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
						</svg>
					</button>

					{#if showUserMenu}
						<div
							class="absolute right-0 mt-2 w-56 bg-popover border border-border rounded-lg shadow-lg z-10 overflow-hidden"
							on:click={() => (showUserMenu = false)}
							on:keydown={(e) => e.key === 'Escape' && (showUserMenu = false)}
							role="button"
							tabindex="-1"
						>
							{#if currentUser}
								<div class="px-4 py-3 border-b border-border">
									<div class="font-semibold text-sm">{currentUser.username}</div>
									<div class="text-xs text-muted-foreground">
										{currentUser.email || ''}
									</div>
								</div>
							{/if}
							<button 
								class="w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors flex items-center gap-2" 
								on:click={handleLogout}
							>
								<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
								</svg>
								Cerrar Sesión
							</button>
						</div>
					{/if}
				</div>
			</div>
		</header>

		<!-- Page Content -->
		<main class="flex-1 overflow-y-auto p-6 bg-background">
			<slot />
		</main>
	</div>
</div>

<svelte:window
	on:click={(e) => {
		if (showUserMenu && !e.target.closest('.relative')) {
			showUserMenu = false;
		}
	}}
/>

