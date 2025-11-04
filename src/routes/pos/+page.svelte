<script>
	import { onMount } from 'svelte';
	import { apiService } from '$lib/api';
	import { toast } from '$lib/stores';
	import Card from '$lib/components/ui/Card.svelte';
	import CardHeader from '$lib/components/ui/CardHeader.svelte';
	import CardTitle from '$lib/components/ui/CardTitle.svelte';
	import CardContent from '$lib/components/ui/CardContent.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Dialog from '$lib/components/ui/Dialog.svelte';
	import Edit2 from '$lib/components/icons/Edit2.svelte';
	import Check from '$lib/components/icons/Check.svelte';
	import X from '$lib/components/icons/X.svelte';
	import Trash2 from '$lib/components/icons/Trash2.svelte';
	import CreditCard from '$lib/components/icons/CreditCard.svelte';
	import MoreVertical from '$lib/components/icons/MoreVertical.svelte';
	import Armchair from '$lib/components/icons/Armchair.svelte';
	import Loader from '$lib/components/icons/Loader.svelte';

	let zones = [];
	let tables = [];
	let menuItems = [];
	let menuCategories = [];
	let loading = false;
	let editMode = false;
	let selectedTable = null;
	let showOrderModal = false;
	let showEditTableModal = false;
	let showPaymentModal = false;
	let searchQuery = '';
	let selectedCategory = '';
	let view = 'tables'; // 'tables' o 'order'

	// Order state
	let orderItems = [];
	let currentOrder = null;
	let currentTable = null;

	// Payment data
	let paymentData = {
		metodo: 'efectivo',
		monto: 0,
		referencia: ''
	};

	// Edit table state
	let editingTable = null;
	let draggedTable = null;

	onMount(async () => {
		await loadZonesAndTables();
		await loadMenuData();
	});

	async function loadZonesAndTables() {
		loading = true;
		try {
			zones = await apiService.getZones();
			const tablesResponse = await apiService.getTables({ page_size: 1000 });
			tables = tablesResponse.results || tablesResponse;
		} catch (error) {
			toast.error('Error al cargar mesas');
			console.error(error);
		} finally {
			loading = false;
		}
	}

	async function loadMenuData() {
		try {
			const [itemsResponse, categories] = await Promise.all([
				apiService.getMenuItems({ disponible: true, page_size: 1000 }),
				apiService.getMenuCategories()
			]);
			menuItems = itemsResponse.results || itemsResponse;
			menuCategories = categories;
		} catch (error) {
			toast.error('Error al cargar menú');
			console.error(error);
		}
	}

	function getTablesByZone(zoneId) {
		return tables.filter((t) => t.zona?.id === zoneId || t.zona === zoneId);
	}

	function getTableClass(table) {
		const baseClass = 'mesa-card';
		if (table.estado === 'disponible') return `${baseClass} available`;
		if (table.estado === 'ocupada') return `${baseClass} occupied`;
		if (table.estado === 'reservada') return `${baseClass} reserved`;
		return baseClass;
	}

	async function selectTable(table) {
		if (table.estado === 'disponible') {
			// Nueva orden
			currentTable = table;
			orderItems = [];
			currentOrder = null;
			view = 'order';
			selectedTable.set(table);
		} else if (table.estado === 'ocupada') {
			// Cargar orden existente
			try {
				const orders = await apiService.getOrders({ mesa: table.id, estado: 'abierta' });
				if (orders.results && orders.results.length > 0) {
					currentOrder = orders.results[0];
					orderItems = currentOrder.items || [];
					currentTable = table;
					view = 'order';
					selectedTable.set(table);
				}
			} catch (error) {
				toast.error('Error al cargar orden de la mesa');
				console.error(error);
			}
		}
	}

	function backToTables() {
		view = 'tables';
		currentTable = null;
		orderItems = [];
		currentOrder = null;
		selectedTable.set(null);
	}

	async function addItemToOrder(item) {
		const existingIndex = orderItems.findIndex((oi) => oi.item_menu?.id === item.id);
		
		if (existingIndex >= 0) {
			orderItems[existingIndex].cantidad += 1;
			orderItems[existingIndex].subtotal = orderItems[existingIndex].cantidad * orderItems[existingIndex].precio_unitario;
		} else {
			orderItems = [
				...orderItems,
				{
					item_menu: item,
					cantidad: 1,
					precio_unitario: item.precio,
					subtotal: item.precio,
					notas: ''
				}
			];
		}

		// Si ya hay orden creada, agregar item al backend
		if (currentOrder) {
			try {
				await apiService.addOrderItem(currentOrder.id, {
					item_menu: item.id,
					cantidad: 1,
					precio_unitario: item.precio
				});
				toast.success(`${item.nombre} agregado`);
			} catch (error) {
				toast.error('Error al agregar item');
				console.error(error);
			}
		} else {
			toast.success(`${item.nombre} agregado al carrito`);
		}
	}

	function removeOrderItem(index) {
		orderItems = orderItems.filter((_, i) => i !== index);
	}

	function getOrderTotal() {
		return orderItems.reduce((sum, item) => sum + item.subtotal, 0);
	}

	async function createOrder() {
		if (!currentTable || orderItems.length === 0) {
			toast.warning('Agregue items a la orden');
			return;
		}

		try {
			// Crear orden
			const orderPayload = {
				mesa: currentTable.id
			};
			currentOrder = await apiService.createOrder(orderPayload);

			// Agregar items
			for (const item of orderItems) {
				await apiService.addOrderItem(currentOrder.id, {
					item_menu: item.item_menu.id,
					cantidad: item.cantidad,
					precio_unitario: item.precio_unitario,
					notas: item.notas || ''
				});
			}

			// Actualizar estado de mesa
			await apiService.updateTableStatus(currentTable.id, { estado: 'ocupada' });

			toast.success('Orden creada exitosamente');
			await loadZonesAndTables();
		} catch (error) {
			toast.error('Error al crear orden');
			console.error(error);
		}
	}

	function openPaymentModal() {
		if (!currentOrder) {
			toast.warning('Debe crear la orden primero');
			return;
		}

		paymentData = {
			metodo: 'efectivo',
			monto: getOrderTotal(),
			referencia: ''
		};
		showPaymentModal = true;
	}

	async function processPayment() {
		if (paymentData.monto < getOrderTotal()) {
			toast.warning('El monto debe cubrir el total de la orden');
			return;
		}

		try {
			// Registrar pago
			await apiService.addPayment(currentOrder.id, {
				metodo_pago: paymentData.metodo,
				monto: parseFloat(paymentData.monto),
				referencia: paymentData.referencia || null
			});

			toast.success('Pago procesado exitosamente');
			showPaymentModal = false;

			// Volver a mesas
			await loadZonesAndTables();
			backToTables();
		} catch (error) {
			toast.error('Error al procesar pago');
			console.error(error);
		}
	}

	$: filteredMenuItems = menuItems.filter((item) => {
		const matchesCategory = !selectedCategory || item.categoria?.id === parseInt(selectedCategory);
		const matchesSearch =
			!searchQuery || item.nombre.toLowerCase().includes(searchQuery.toLowerCase());
		return matchesCategory && matchesSearch;
	});
</script>

{#if view === 'tables'}
	<!-- Vista de Mesas -->
	<div class="p-6 space-y-6 overflow-y-auto h-full">
		<div class="flex justify-between items-center">
			<h2 class="h2">Seleccione una Mesa</h2>
			<div class="flex gap-4 items-center">
				<div class="flex items-center gap-2">
					<span class="w-4 h-4 bg-success-500 rounded"></span>
					<span class="text-sm">Disponible</span>
				</div>
				<div class="flex items-center gap-2">
					<span class="w-4 h-4 bg-error-500 rounded"></span>
					<span class="text-sm">Ocupada</span>
				</div>
				<div class="flex items-center gap-2">
					<span class="w-4 h-4 bg-warning-500 rounded"></span>
					<span class="text-sm">Reservada</span>
				</div>
			</div>
		</div>

		{#if loading}
			<div class="flex justify-center p-12">
				<Loader class="h-12 w-12 animate-spin text-primary" />
			</div>
		{:else}
			{#each zones as zone}
				<div class="card p-6">
					<h3 class="h3 mb-4">{zone.nombre}</h3>
					<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
						{#each getTablesByZone(zone.id) as table}
							<button
								class={getTableClass(table)}
								on:click={() => selectTable(table)}
							>
								<Armchair class="h-8 w-8 mb-2 mx-auto" />
								<div class="font-bold">{table.numero}</div>
								<div class="text-xs opacity-75">{table.capacidad} pax</div>
							</button>
						{/each}
					</div>
				</div>
			{/each}
		{/if}
	</div>
{:else if view === 'order'}
	<!-- Vista de Orden -->
	<div class="grid grid-cols-12 h-full">
		<!-- Menu Items (izquierda) -->
		<div class="col-span-8 border-r border-border overflow-y-auto p-4">
			<div class="space-y-4">
				<!-- Buscador y filtros -->
				<div class="flex gap-4">
					<input
						type="search"
						bind:value={searchQuery}
						placeholder="🔍 Buscar platos..."
						class="input flex-1"
					/>
					<select bind:value={selectedCategory} class="select w-48">
						<option value="">Todas</option>
						{#each menuCategories as category}
							<option value={category.id}>{category.nombre}</option>
						{/each}
					</select>
				</div>

				<!-- Grid de items -->
				<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
					{#each filteredMenuItems as item}
						<button
							class="card card-hover p-4 text-left flex flex-col h-full"
							on:click={() => addItemToOrder(item)}
						>
							{#if item.imagen_url}
								<img src={item.imagen_url} alt={item.nombre} class="w-full h-32 object-cover rounded mb-2" />
							{:else}
								<div class="w-full h-32 bg-muted rounded mb-2 flex items-center justify-center">
									<MoreVertical class="w-12 h-12 text-muted-foreground" />
								</div>
							{/if}
							<h4 class="font-semibold mb-1">{item.nombre}</h4>
							<p class="text-sm text-muted-foreground mb-2 flex-1">
								{item.descripcion || ''}
							</p>
							<p class="text-xl font-bold text-primary-500">S/ {item.precio.toFixed(2)}</p>
						</button>
					{/each}
				</div>
			</div>
		</div>

		<!-- Order Summary (derecha) -->
		<div class="col-span-4 bg-sidebar flex flex-col h-full">
			<!-- Header -->
			<div class="p-4 border-b border-border">
				<button class="btn btn-sm variant-ghost-surface mb-4" on:click={backToTables}>
					◀ Volver a Mesas
				</button>
				<h3 class="h3">Mesa {currentTable?.numero || ''}</h3>
				<p class="text-sm text-muted-foreground">
					Zona: {currentTable?.zona?.nombre || ''}
				</p>
			</div>

			<!-- Items list -->
			<div class="flex-1 overflow-y-auto p-4">
				{#if orderItems.length === 0}
					<div class="text-center text-muted-foreground py-12">
						<p class="text-4xl mb-2">🛒</p>
						<p>Agregue items del menú</p>
					</div>
				{:else}
					<div class="space-y-2">
						{#each orderItems as item, index}
							<div class="card p-3 flex justify-between items-start">
								<div class="flex-1">
									<p class="font-semibold">{item.item_menu?.nombre || item.item_menu}</p>
									<p class="text-sm">
										{item.cantidad} x S/ {item.precio_unitario.toFixed(2)}
									</p>
								</div>
							<div class="flex items-center gap-2">
								<p class="font-bold">S/ {item.subtotal.toFixed(2)}</p>
								{#if !currentOrder}
									<button
										class="btn btn-sm variant-ghost-error"
										on:click={() => removeOrderItem(index)}
									>
										<Trash2 class="w-4 h-4" />
									</button>
								{/if}
							</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Footer con total y acciones -->
			<div class="p-4 border-t border-border space-y-4">
				<div class="flex justify-between items-center text-2xl font-bold">
					<span>TOTAL:</span>
					<span>S/ {getOrderTotal().toFixed(2)}</span>
				</div>

				<div class="space-y-2">
					{#if !currentOrder}
						<button
							class="btn variant-filled-primary w-full flex items-center justify-center gap-2"
							on:click={createOrder}
							disabled={orderItems.length === 0}
						>
							<Check class="w-5 h-5" />
							Crear Orden
						</button>
					{:else}
						<button class="btn variant-filled-success w-full flex items-center justify-center gap-2" on:click={openPaymentModal}>
							<CreditCard class="w-5 h-5" />
							Procesar Pago
						</button>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- Dialog de Pago -->
<Dialog bind:open={showPaymentModal}>
	<h2 slot="header" class="text-xl font-bold">Procesar Pago</h2>
	
	<form on:submit|preventDefault={processPayment} class="space-y-4">
		<div class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
			<p class="text-2xl font-bold text-center">
				Total: S/ {getOrderTotal().toFixed(2)}
			</p>
		</div>

		<label class="block">
			<span class="text-sm font-medium mb-1 block">Método de Pago *</span>
			<select bind:value={paymentData.metodo} required class="w-full px-3 py-2 border rounded-lg">
				<option value="efectivo">Efectivo</option>
				<option value="tarjeta">Tarjeta</option>
				<option value="yape">Yape / Plin</option>
			</select>
		</label>

		<label class="block">
			<span class="text-sm font-medium mb-1 block">Monto Recibido *</span>
			<input
				type="number"
				bind:value={paymentData.monto}
				step="0.01"
				min={getOrderTotal()}
				required
				class="w-full px-3 py-2 border rounded-lg"
			/>
		</label>

		{#if paymentData.monto > getOrderTotal()}
			<div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg">
				<p class="font-semibold text-green-800 dark:text-green-200">
					Vuelto: S/ {(paymentData.monto - getOrderTotal()).toFixed(2)}
				</p>
			</div>
		{/if}

		{#if paymentData.metodo !== 'efectivo'}
			<label class="block">
				<span class="text-sm font-medium mb-1 block">Referencia / N° de Operación</span>
				<input
					type="text"
					bind:value={paymentData.referencia}
					class="w-full px-3 py-2 border rounded-lg"
					placeholder="Opcional"
				/>
			</label>
		{/if}
	</form>

	<div slot="footer" class="flex justify-end gap-2">
		<Button variant="outline" on:click={() => (showPaymentModal = false)}>
			Cancelar
		</Button>
		<Button variant="default" on:click={processPayment}>
			Confirmar Pago
		</Button>
	</div>
</Dialog>

