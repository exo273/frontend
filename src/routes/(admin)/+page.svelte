<script>
	import { onMount } from 'svelte';
	import { apiService } from '$lib/api';
	import { toast } from '$lib/stores';

	let loading = true;
	let stats = {
		productos_totales: 0,
		productos_stock_bajo: 0,
		proveedores_activos: 0,
		items_menu: 0,
		ordenes_hoy: 0,
		ventas_hoy: 0
	};

	let recentOrders = [];
	let lowStockProducts = [];

	onMount(async () => {
		await loadDashboardData();
	});

	async function loadDashboardData() {
		loading = true;
		try {
			// Cargar estadísticas básicas
			const [productos, proveedores, menuItems] = await Promise.all([
				apiService.getProductos({ page_size: 1000 }),
				apiService.getSuppliers({ activo: true }),
				apiService.getMenuItems()
			]);

			stats.productos_totales = productos.count || productos.length;
			stats.productos_stock_bajo = productos.results
				? productos.results.filter((p) => p.cantidad_actual <= (p.stock_minimo || 0)).length
				: 0;
			stats.proveedores_activos = proveedores.count || proveedores.length;
			stats.items_menu = menuItems.count || menuItems.length;

			// Productos con stock bajo
			lowStockProducts = productos.results
				? productos.results
						.filter((p) => p.cantidad_actual <= (p.stock_minimo || 0))
						.slice(0, 5)
				: [];

			// Órdenes recientes (simulado - en producción vendría del backend)
			// stats.ordenes_hoy = ...
			// stats.ventas_hoy = ...
			// recentOrders = ...
		} catch (error) {
			toast.error('Error al cargar datos del dashboard');
			console.error(error);
		} finally {
			loading = false;
		}
	}

	function formatCurrency(value) {
		return new Intl.NumberFormat('es-PE', {
			style: 'currency',
			currency: 'PEN'
		}).format(value);
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div>
		<h1 class="h1">Dashboard</h1>
		<p class="text-surface-600-300-token">Resumen general del sistema</p>
	</div>

	{#if loading}
		<div class="flex justify-center items-center p-12">
			<span class="text-6xl animate-spin">⏳</span>
		</div>
	{:else}
		<!-- Stats Cards -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			<!-- Productos -->
			<div class="card p-6">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-surface-600-300-token">Productos</p>
						<h3 class="text-3xl font-bold">{stats.productos_totales}</h3>
						{#if stats.productos_stock_bajo > 0}
							<p class="text-sm text-warning-500 mt-1">
								⚠️ {stats.productos_stock_bajo} con stock bajo
							</p>
						{/if}
					</div>
					<div class="text-5xl">📦</div>
				</div>
			</div>

			<!-- Proveedores -->
			<div class="card p-6">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-surface-600-300-token">Proveedores Activos</p>
						<h3 class="text-3xl font-bold">{stats.proveedores_activos}</h3>
					</div>
					<div class="text-5xl">🚚</div>
				</div>
			</div>

			<!-- Items del Menú -->
			<div class="card p-6">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-surface-600-300-token">Items en el Menú</p>
						<h3 class="text-3xl font-bold">{stats.items_menu}</h3>
					</div>
					<div class="text-5xl">📋</div>
				</div>
			</div>

			<!-- Órdenes Hoy -->
			<div class="card p-6">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-surface-600-300-token">Órdenes Hoy</p>
						<h3 class="text-3xl font-bold">{stats.ordenes_hoy}</h3>
					</div>
					<div class="text-5xl">🧾</div>
				</div>
			</div>

			<!-- Ventas Hoy -->
			<div class="card p-6">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-surface-600-300-token">Ventas Hoy</p>
						<h3 class="text-3xl font-bold">{formatCurrency(stats.ventas_hoy)}</h3>
					</div>
					<div class="text-5xl">💰</div>
				</div>
			</div>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<!-- Productos con Stock Bajo -->
			<div class="card">
				<header class="card-header flex justify-between items-center">
					<h3 class="h3">⚠️ Productos con Stock Bajo</h3>
					<a href="/inventario" class="btn btn-sm variant-ghost-primary">Ver todo</a>
				</header>
				<section class="p-4">
					{#if lowStockProducts.length === 0}
						<p class="text-center text-surface-600-300-token py-8">
							✅ No hay productos con stock bajo
						</p>
					{:else}
						<div class="space-y-3">
							{#each lowStockProducts as product}
								<div class="flex justify-between items-center p-3 bg-surface-100-800-token rounded-token">
									<div>
										<p class="font-semibold">{product.nombre}</p>
										<p class="text-sm text-surface-600-300-token">
											Stock: {product.cantidad_actual} {product.unidad}
										</p>
									</div>
									<span class="badge variant-filled-warning">
										Mín: {product.stock_minimo || 0}
									</span>
								</div>
							{/each}
						</div>
					{/if}
				</section>
			</div>

			<!-- Accesos Rápidos -->
			<div class="card">
				<header class="card-header">
					<h3 class="h3">🚀 Accesos Rápidos</h3>
				</header>
				<section class="p-4">
					<div class="grid grid-cols-2 gap-4">
						<a href="/compras" class="btn variant-filled-surface h-24 flex flex-col items-center justify-center gap-2">
							<span class="text-3xl">🛒</span>
							<span>Nueva Compra</span>
						</a>
						<a href="/inventario" class="btn variant-filled-surface h-24 flex flex-col items-center justify-center gap-2">
							<span class="text-3xl">📦</span>
							<span>Inventario</span>
						</a>
						<a href="/recetas" class="btn variant-filled-surface h-24 flex flex-col items-center justify-center gap-2">
							<span class="text-3xl">📖</span>
							<span>Recetas</span>
						</a>
						<a href="/carta" class="btn variant-filled-surface h-24 flex flex-col items-center justify-center gap-2">
							<span class="text-3xl">📋</span>
							<span>Carta/Menú</span>
						</a>
					</div>
				</section>
			</div>
		</div>
	{/if}
</div>
