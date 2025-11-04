<script lang="ts">
	import { onMount } from 'svelte';
	import { apiService } from '$lib/api';
	import { toast } from '$lib/stores';
	import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui';
	import Package from '$lib/components/icons/Package.svelte';
	import Users from '$lib/components/icons/Users.svelte';
	import FileText from '$lib/components/icons/FileText.svelte';
	import CalendarCheck from '$lib/components/icons/CalendarCheck.svelte';
	import ShoppingCart from '$lib/components/icons/ShoppingCart.svelte';

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

<svelte:head>
	<title>Dashboard - SIGR</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div>
		<h2 class="text-3xl font-bold tracking-tight">Dashboard</h2>
		<p class="text-muted-foreground">Resumen general del sistema</p>
	</div>

	{#if loading}
		<div class="flex justify-center items-center p-12">
			<div class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
		</div>
	{:else}
		<!-- Stats Cards -->
		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			<!-- Productos -->
			<Card>
				<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle class="text-sm font-medium">Total Productos</CardTitle>
					<Package class="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div class="text-2xl font-bold">{stats.productos_totales}</div>
					{#if stats.productos_stock_bajo > 0}
						<p class="text-xs text-destructive mt-1">
							{stats.productos_stock_bajo} con stock bajo
						</p>
					{:else}
						<p class="text-xs text-muted-foreground mt-1">
							Stock saludable
						</p>
					{/if}
				</CardContent>
			</Card>

			<!-- Proveedores -->
			<Card>
				<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle class="text-sm font-medium">Proveedores Activos</CardTitle>
					<Users class="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div class="text-2xl font-bold">{stats.proveedores_activos}</div>
					<p class="text-xs text-muted-foreground mt-1">
						Total registrados
					</p>
				</CardContent>
			</Card>

			<!-- Items del Menú -->
			<Card>
				<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle class="text-sm font-medium">Items en el Menú</CardTitle>
					<FileText class="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div class="text-2xl font-bold">{stats.items_menu}</div>
					<p class="text-xs text-muted-foreground mt-1">
						Disponibles
					</p>
				</CardContent>
			</Card>

			<!-- Órdenes Hoy -->
			<Card>
				<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle class="text-sm font-medium">Órdenes Hoy</CardTitle>
					<CalendarCheck class="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div class="text-2xl font-bold">{stats.ordenes_hoy}</div>
					<p class="text-xs text-muted-foreground mt-1">
						+0% desde ayer
					</p>
				</CardContent>
			</Card>
		</div>

		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
			<!-- Productos con Stock Bajo -->
			<Card class="col-span-4">
				<CardHeader>
					<CardTitle>Productos con Stock Bajo</CardTitle>
				</CardHeader>
				<CardContent>
					{#if lowStockProducts.length === 0}
						<p class="text-center text-muted-foreground py-8">
							No hay productos con stock bajo
						</p>
					{:else}
						<div class="space-y-3">
							{#each lowStockProducts as product}
								<div class="flex items-center justify-between rounded-lg border p-3">
									<div class="space-y-1">
										<p class="text-sm font-medium leading-none">{product.nombre}</p>
										<p class="text-sm text-muted-foreground">
											Stock: {product.cantidad_actual} {product.unidad}
										</p>
									</div>
									<div class="text-sm font-medium text-destructive">
										Mín: {product.stock_minimo || 0}
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</CardContent>
			</Card>

			<!-- Accesos Rápidos -->
			<Card class="col-span-3">
				<CardHeader>
					<CardTitle>Accesos Rápidos</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="grid grid-cols-2 gap-4">
						<a 
							href="/compras" 
							class="flex flex-col items-center justify-center gap-2 rounded-lg border bg-card p-4 text-card-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
						>
							<ShoppingCart class="h-8 w-8" />
							<span class="text-sm font-medium">Nueva Compra</span>
						</a>
						<a 
							href="/inventario" 
							class="flex flex-col items-center justify-center gap-2 rounded-lg border bg-card p-4 text-card-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
						>
							<Package class="h-8 w-8" />
							<span class="text-sm font-medium">Inventario</span>
						</a>
						<a 
							href="/recetas" 
							class="flex flex-col items-center justify-center gap-2 rounded-lg border bg-card p-4 text-card-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
						>
							<FileText class="h-8 w-8" />
							<span class="text-sm font-medium">Recetas</span>
						</a>
						<a 
							href="/carta" 
							class="flex flex-col items-center justify-center gap-2 rounded-lg border bg-card p-4 text-card-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
						>
							<FileText class="h-8 w-8" />
							<span class="text-sm font-medium">Carta/Menú</span>
						</a>
					</div>
				</CardContent>
			</Card>
		</div>
	{/if}
</div>

