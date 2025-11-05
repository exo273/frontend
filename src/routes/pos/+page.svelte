<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { apiService } from '$lib/api';
	import { toast } from '$lib/stores';
	import Plus from '$lib/components/icons/Plus.svelte';
	import Minus from '$lib/components/icons/Minus.svelte';
	import Search from '$lib/components/icons/Search.svelte';
	import X from '$lib/components/icons/X.svelte';

	let zones = [];
	let tables = [];
	let selectedZone = null;
	let selectedTable = null;
	let loading = true;
	let searchQuery = '';

	// Order state
	let orderItems = [];
	let customerCount = 1;
	let selectedCustomer = '';
	let selectedWaiter = '';
	let orderNotes = '';

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		loading = true;
		try {
			const zonesResponse = await apiService.getZones();
			zones = zonesResponse.results || zonesResponse;
			
			const tablesResponse = await apiService.getTables({ page_size: 1000 });
			tables = tablesResponse.results || tablesResponse;

			// Seleccionar primera zona por defecto
			if (zones.length > 0 && !selectedZone) {
				selectedZone = zones[0].id;
			}
		} catch (error) {
			console.error('Error al cargar datos:', error);
			toast.error('Error al cargar zonas y mesas');
		} finally {
			loading = false;
		}
	}

	function getTablesByZone(zoneId) {
		return tables.filter((t) => (t.zona?.id || t.zona) === zoneId);
	}

	function selectTable(table) {
		selectedTable = table;
		// Aquí cargarías la orden existente si la mesa está ocupada
		orderItems = [];
		customerCount = 1;
	}

	function closeOrder() {
		selectedTable = null;
		orderItems = [];
		customerCount = 1;
		selectedCustomer = '';
		selectedWaiter = '';
		orderNotes = '';
	}

	function getTablePosition(table) {
		const x = table.posicion_x ?? Math.random() * 500;
		const y = table.posicion_y ?? Math.random() * 400;
		const width = table.ancho || 100;
		const height = table.alto || 100;
		const shape = table.forma || 'cuadrada';
		return { x, y, width, height, shape };
	}

	function getTableClass(table) {
		if (selectedTable?.id === table.id) return 'selected';
		if (table.status === 'occupied') return 'occupied';
		if (table.status === 'reserved') return 'reserved';
		return 'available';
	}

	$: zoneTables = selectedZone ? getTablesByZone(selectedZone) : [];
</script>

<div class="h-screen flex flex-col bg-gray-50">
	<!-- Header -->
	<div class="bg-gray-700 text-white px-6 py-3 flex items-center justify-between">
		<div class="flex items-center gap-4">
			<button
				on:click={() => goto('/admin')}
				class="text-white hover:text-gray-300 transition-colors"
			>
				← Admin
			</button>
			<h1 class="text-xl font-semibold">Mesas</h1>
		</div>
		<div class="flex items-center gap-4">
			<div class="relative">
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Ir a mesa"
					class="px-4 py-2 pl-10 rounded-lg bg-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-64"
				/>
				<Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
			</div>
			<button class="p-2 hover:bg-gray-600 rounded-lg transition-colors">
				<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
				</svg>
			</button>
		</div>
	</div>

	<div class="flex-1 flex overflow-hidden">
		<!-- Main Content - Tables -->
		<div class="flex-1 flex flex-col">
			<!-- Tabs de Zonas -->
			<div class="bg-gray-600 flex items-center">
				{#each zones as zone}
					<button
						on:click={() => (selectedZone = zone.id)}
						class="px-6 py-3 font-medium transition-colors {selectedZone === zone.id
							? 'bg-gray-100 text-gray-900'
							: 'text-white hover:bg-gray-500'}"
					>
						{zone.nombre}
					</button>
				{/each}
			</div>

			<!-- Canvas de Mesas -->
			<div class="flex-1 p-6 overflow-auto relative bg-white">
				{#if loading}
					<div class="flex items-center justify-center h-full">
						<div class="text-gray-500">Cargando mesas...</div>
					</div>
				{:else if zoneTables.length === 0}
					<div class="flex items-center justify-center h-full">
						<div class="text-center text-gray-500">
							<p class="text-lg mb-2">No hay mesas en esta zona</p>
							<p class="text-sm">Configura tus zonas y mesas primero</p>
						</div>
					</div>
				{:else}
					<div class="relative" style="min-height: 600px; min-width: 1000px;">
						{#each zoneTables as table}
							{@const pos = getTablePosition(table)}
							{@const statusClass = getTableClass(table)}
							<button
								on:click={() => selectTable(table)}
								class="absolute flex flex-col items-center justify-center font-bold text-white shadow-lg transition-all hover:scale-105 border-2 {statusClass === 'selected'
									? 'bg-yellow-400 border-yellow-500'
									: statusClass === 'occupied'
										? 'bg-red-400 border-red-500'
										: statusClass === 'reserved'
											? 'bg-blue-400 border-blue-500'
											: 'bg-emerald-400 border-emerald-500'}"
								style="left: {pos.x}px; top: {pos.y}px; width: {pos.width}px; height: {pos.height}px; {pos.shape ===
								'redonda'
									? 'border-radius: 50%;'
									: 'border-radius: 0.5rem;'}"
							>
								<span class="text-2xl">{table.numero}</span>
							</button>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<!-- Sidebar Derecho - Orden -->
		{#if selectedTable}
			<div class="w-96 bg-emerald-400 flex flex-col shadow-xl">
				<!-- Header de la Mesa -->
				<div class="bg-emerald-500 text-white px-6 py-4 flex items-center justify-between">
					<h2 class="text-2xl font-bold">MESA {selectedTable.numero}</h2>
					<button
						on:click={closeOrder}
						class="p-2 hover:bg-emerald-600 rounded-lg transition-colors"
					>
						<X class="h-6 w-6" />
					</button>
				</div>

				<!-- Formulario de Orden -->
				<div class="flex-1 overflow-auto p-6 space-y-4">
					<!-- Personas -->
					<div>
						<label class="block text-white font-medium mb-2">
							Personas <span class="text-red-600">*</span>
						</label>
						<div class="flex items-center gap-2">
							<button
								on:click={() => customerCount > 1 && customerCount--}
								class="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
								disabled={customerCount <= 1}
							>
								<Minus class="h-5 w-5 text-gray-700" />
							</button>
							<input
								type="number"
								bind:value={customerCount}
								min="1"
								class="flex-1 px-4 py-2 border-2 border-white rounded-lg text-center font-bold text-xl"
							/>
							<button
								on:click={() => customerCount++}
								class="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
							>
								<Plus class="h-5 w-5 text-gray-700" />
							</button>
						</div>
					</div>

					<!-- Cliente -->
					<div>
						<label class="block text-white font-medium mb-2">Cliente</label>
						<select
							bind:value={selectedCustomer}
							class="w-full px-4 py-3 border-2 border-white rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-white"
						>
							<option value="">Seleccionar...</option>
							<!-- Aquí irían los clientes desde el backend -->
						</select>
					</div>

					<!-- Garzón -->
					<div>
						<label class="block text-white font-medium mb-2">Garzón</label>
						<select
							bind:value={selectedWaiter}
							class="w-full px-4 py-3 border-2 border-white rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-white"
						>
							<option value="">Seleccionar...</option>
							<!-- Aquí irían los garzones desde el backend -->
						</select>
					</div>

					<!-- Comentario -->
					<div>
						<label class="block text-white font-medium mb-2">Comentario</label>
						<textarea
							bind:value={orderNotes}
							rows="4"
							class="w-full px-4 py-3 border-2 border-white rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-white resize-none"
							placeholder="Observaciones de la orden..."
						/>
					</div>

					<!-- Botón Abrir Mesa -->
					<button
						class="w-full bg-orange-400 hover:bg-orange-500 text-white font-bold py-4 rounded-lg transition-colors shadow-lg text-lg"
					>
						Abrir mesa
					</button>

					<!-- Items de la Orden (cuando esté implementado) -->
					{#if orderItems.length > 0}
						<div class="mt-6 space-y-2">
							<h3 class="text-white font-bold text-lg">Productos</h3>
							{#each orderItems as item}
								<div class="bg-white rounded-lg p-3 flex justify-between items-center">
									<div>
										<div class="font-medium">{item.nombre}</div>
										<div class="text-sm text-gray-600">${item.precio}</div>
									</div>
									<div class="flex items-center gap-2">
										<button class="p-1 hover:bg-gray-100 rounded">
											<Minus class="h-4 w-4" />
										</button>
										<span class="font-bold w-8 text-center">{item.cantidad}</span>
										<button class="p-1 hover:bg-gray-100 rounded">
											<Plus class="h-4 w-4" />
										</button>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.available {
		@apply bg-emerald-400 border-emerald-500;
	}
	
	.occupied {
		@apply bg-red-400 border-red-500;
	}
	
	.reserved {
		@apply bg-blue-400 border-blue-500;
	}
	
	.selected {
		@apply bg-yellow-400 border-yellow-500;
	}
</style>
