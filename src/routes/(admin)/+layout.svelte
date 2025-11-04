<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { auth } from '$lib/stores';
	import { apiService } from '$lib/api';

	let sidebarOpen = true;
	let currentUser = null;
	let showUserMenu = false;

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

	// Menú de navegación
	const menuItems = [
		{ label: 'Dashboard', icon: '📊', href: '/' },
		{
			label: 'Operaciones',
			icon: '⚙️',
			items: [
				{ label: 'Inventario', icon: '📦', href: '/inventario' },
				{ label: 'Proveedores', icon: '🚚', href: '/proveedores' },
				{ label: 'Compras', icon: '🛒', href: '/compras' },
				{ label: 'Recetas', icon: '📖', href: '/recetas' }
			]
		},
		{
			label: 'Gestión de Ventas',
			icon: '💰',
			items: [
				{ label: 'Carta / Menú', icon: '📋', href: '/carta' }
			]
		}
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
		goto('/pos');
	}

	function isActive(href) {
		return $page.url.pathname === href;
	}
</script>

<div class="flex h-screen overflow-hidden">
	<!-- Sidebar -->
	<aside
		class="sidebar bg-surface-100-800-token border-r border-surface-300-600-token transition-all duration-300 {sidebarOpen
			? 'w-64'
			: 'w-20'} flex flex-col"
	>
		<!-- Logo -->
		<div class="p-4 border-b border-surface-300-600-token">
			{#if sidebarOpen}
				<h2 class="font-bold text-xl">🍽️ SIG Restaurant</h2>
			{:else}
				<div class="text-center text-2xl">🍽️</div>
			{/if}
		</div>

		<!-- Navigation -->
		<nav class="flex-1 overflow-y-auto p-4">
			<ul class="space-y-2">
				{#each menuItems as item}
					{#if item.items}
						<!-- Grupo con subitems -->
						<li class="mb-4">
							<div class="text-xs font-semibold text-surface-600-300-token uppercase mb-2 {!sidebarOpen && 'text-center'}">
								{sidebarOpen ? item.label : item.icon}
							</div>
							<ul class="space-y-1">
								{#each item.items as subItem}
									<li>
										<a
											href={subItem.href}
											class="flex items-center gap-3 px-3 py-2 rounded-token transition-colors {isActive(
												subItem.href
											)
												? 'variant-filled-primary'
												: 'hover:variant-soft-surface'} {!sidebarOpen && 'justify-center'}"
										>
											<span class="text-xl">{subItem.icon}</span>
											{#if sidebarOpen}
												<span>{subItem.label}</span>
											{/if}
										</a>
									</li>
								{/each}
							</ul>
						</li>
					{:else}
						<!-- Item simple -->
						<li>
							<a
								href={item.href}
								class="flex items-center gap-3 px-3 py-2 rounded-token transition-colors {isActive(
									item.href
								)
									? 'variant-filled-primary'
									: 'hover:variant-soft-surface'} {!sidebarOpen && 'justify-center'}"
							>
								<span class="text-xl">{item.icon}</span>
								{#if sidebarOpen}
									<span>{item.label}</span>
								{/if}
							</a>
						</li>
					{/if}
				{/each}
			</ul>
		</nav>

		<!-- Botón POS -->
		<div class="p-4 border-t border-surface-300-600-token">
			<button
				class="btn variant-filled-secondary w-full {!sidebarOpen && 'btn-icon'}"
				on:click={launchPOS}
			>
				<span class="text-xl">🖥️</span>
				{#if sidebarOpen}
					<span>LANZAR POS</span>
				{/if}
			</button>
		</div>
	</aside>

	<!-- Main Content -->
	<div class="flex-1 flex flex-col overflow-hidden">
		<!-- Header -->
		<header class="bg-surface-100-800-token border-b border-surface-300-600-token px-6 py-4">
			<div class="flex items-center justify-between">
				<!-- Toggle sidebar -->
				<button
					class="btn btn-sm variant-ghost-surface"
					on:click={toggleSidebar}
					title={sidebarOpen ? 'Cerrar sidebar' : 'Abrir sidebar'}
				>
					<span class="text-xl">{sidebarOpen ? '◀' : '▶'}</span>
				</button>

				<!-- User menu -->
				<div class="relative">
					<button
						class="btn variant-ghost-surface flex items-center gap-2"
						on:click={() => (showUserMenu = !showUserMenu)}
					>
						<span class="text-xl">👤</span>
						{#if currentUser}
							<span class="hidden sm:inline">{currentUser.username}</span>
						{/if}
						<span class="text-xs">▼</span>
					</button>

					{#if showUserMenu}
						<div
							class="card absolute right-0 mt-2 w-48 p-2 z-10 shadow-xl"
							on:click={() => (showUserMenu = false)}
							on:keydown={(e) => e.key === 'Escape' && (showUserMenu = false)}
							role="button"
							tabindex="-1"
						>
							<nav class="list-nav">
								<ul>
									{#if currentUser}
										<li class="px-4 py-2 text-sm border-b border-surface-300-600-token">
											<div class="font-semibold">{currentUser.username}</div>
											<div class="text-xs text-surface-600-300-token">
												{currentUser.email || ''}
											</div>
										</li>
									{/if}
									<li>
										<button class="w-full text-left px-4 py-2 hover:variant-soft-surface" on:click={handleLogout}>
											🚪 Cerrar Sesión
										</button>
									</li>
								</ul>
							</nav>
						</div>
					{/if}
				</div>
			</div>
		</header>

		<!-- Page Content -->
		<main class="flex-1 overflow-y-auto p-6 bg-surface-50-900-token">
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

<style>
	.sidebar {
		height: 100vh;
		position: sticky;
		top: 0;
	}
</style>
