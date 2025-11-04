<script><script>

	import { onMount } from 'svelte';	import { onMount } from 'svelte';

	import { apiService } from '$lib/api';	import { apiService } from '$lib/api';

	import { toast } from '$lib/stores';	import { toast } from '$lib/stores';

	import Card from '$lib/components/ui/Card.svelte';	import Card from '$lib/components/ui/Card.svelte';

	import CardHeader from '$lib/components/ui/CardHeader.svelte';	import CardHeader from '$lib/components/ui/CardHeader.svelte';

	import CardTitle from '$lib/components/ui/CardTitle.svelte';	import CardTitle from '$lib/components/ui/CardTitle.svelte';

	import CardContent from '$lib/components/ui/CardContent.svelte';	import CardContent from '$lib/components/ui/CardContent.svelte';

	import Button from '$lib/components/ui/Button.svelte';	import Button from '$lib/components/ui/Button.svelte';

	import Dialog from '$lib/components/ui/Dialog.svelte';	import Dialog from '$lib/components/ui/Dialog.svelte';

	import Edit2 from '$lib/components/icons/Edit2.svelte';	import Edit2 from '$lib/components/icons/Edit2.svelte';

	import Check from '$lib/components/icons/Check.svelte';	import Check from '$lib/components/icons/Check.svelte';

	import X from '$lib/components/icons/X.svelte';	import X from '$lib/components/icons/X.svelte';



	let zones = [];	let zones = [];

	let tables = [];	let tables = [];

	let menuItems = [];	let menuItems = [];

	let menuCategories = [];	let menuCategories = [];

	let loading = false;	let loading = false;

	let editMode = false;	let editMode = false;

	let selectedTable = null;	let selectedTable = null;

	let showOrderModal = false;	let showOrderModal = false;

	let showEditTableModal = false;	let showEditTableModal = false;



	// Order state	// Order state

	let orderItems = [];	let orderItems = [];

	let currentOrder = null;	let currentOrder = null;



	// Edit table state	// Edit table state

	let editingTable = null;	let editingTable = null;

	let draggedTable = null;	let draggedTable = null;



	onMount(async () => {	onMount(async () => {

		await Promise.all([loadZonesAndTables(), loadMenuData()]);		await loadZonesAndTables();

	});		await loadMenuData();

	});

	async function loadZonesAndTables() {

		loading = true;	async function loadZonesAndTables() {

		try {		loading = true;

			zones = await apiService.getZones();		try {

			const response = await apiService.getTables({ page_size: 1000 });			zones = await apiService.getZones();

			tables = response.results || response;			const tablesResponse = await apiService.getTables({ page_size: 1000 });

		} catch (error) {			tables = tablesResponse.results || tablesResponse;

			toast.error('Error al cargar mesas');		} catch (error) {

			console.error(error);			toast.error('Error al cargar mesas');

		} finally {			console.error(error);

			loading = false;		} finally {

		}			loading = false;

	}		}

	}

	async function loadMenuData() {

		try {	async function loadMenuData() {

			const [itemsResponse, categories] = await Promise.all([		try {

				apiService.getMenuItems({ page_size: 1000 }),			const [itemsResponse, categories] = await Promise.all([

				apiService.getMenuCategories()				apiService.getMenuItems({ disponible: true, page_size: 1000 }),

			]);				apiService.getMenuCategories()

			menuItems = itemsResponse.results || itemsResponse;			]);

			menuCategories = categories;			menuItems = itemsResponse.results || itemsResponse;

		} catch (error) {			menuCategories = categories;

			toast.error('Error al cargar menú');		} catch (error) {

			console.error(error);			toast.error('Error al cargar menú');

		}			console.error(error);

	}		}

	}

	function getTablesByZone(zoneId) {

		return tables.filter((t) => t.zona?.id === zoneId || t.zona === zoneId);	function getTablesByZone(zoneId) {

	}		return tables.filter((t) => t.zona?.id === zoneId || t.zona === zoneId);

	}

	function getTableColor(table) {

		if (table.estado === 'disponible') return 'bg-white border-gray-300';	function getTableClass(table) {

		if (table.estado === 'ocupada') return 'bg-red-100 border-red-400';		const baseClass = 'mesa-card';

		if (table.estado === 'reservada') return 'bg-yellow-50 border-yellow-400';		if (table.estado === 'disponible') return `${baseClass} available`;

		return 'bg-white border-gray-300';		if (table.estado === 'ocupada') return `${baseClass} occupied`;

	}		if (table.estado === 'reservada') return `${baseClass} reserved`;

		return baseClass;

	function getTableTextColor(table) {	}

		if (table.estado === 'ocupada') return 'text-red-700';

		if (table.estado === 'reservada') return 'text-yellow-700';	async function selectTable(table) {

		return 'text-gray-700';		if (table.estado === 'disponible') {

	}			// Nueva orden

			currentTable = table;

	function toggleEditMode() {			orderItems = [];

		editMode = !editMode;			currentOrder = null;

		if (!editMode) {			view = 'order';

			toast.success('Cambios guardados');			selectedTable.set(table);

		} else {		} else if (table.estado === 'ocupada') {

			toast.success('Modo edición activado');			// Cargar orden existente

		}			try {

	}				const orders = await apiService.getOrders({ mesa: table.id, estado: 'abierta' });

				if (orders.results && orders.results.length > 0) {

	// Drag and Drop handlers					currentOrder = orders.results[0];

	function handleDragStart(event, table) {					orderItems = currentOrder.items || [];

		if (!editMode) return;					currentTable = table;

		draggedTable = table;					view = 'order';

		event.dataTransfer.effectAllowed = 'move';					selectedTable.set(table);

	}				}

			} catch (error) {

	function handleDragOver(event) {				toast.error('Error al cargar orden de la mesa');

		if (!editMode) return;				console.error(error);

		event.preventDefault();			}

		event.dataTransfer.dropEffect = 'move';		}

	}	}



	function handleDrop(event, targetZone) {	function backToTables() {

		if (!editMode || !draggedTable) return;		view = 'tables';

		event.preventDefault();		currentTable = null;

		orderItems = [];

		// Actualizar la zona de la mesa		currentOrder = null;

		const tableIndex = tables.findIndex((t) => t.id === draggedTable.id);		selectedTable.set(null);

		if (tableIndex !== -1) {	}

			tables[tableIndex] = { ...tables[tableIndex], zona: targetZone };

			tables = [...tables];	async function addItemToOrder(item) {

		}		const existingIndex = orderItems.findIndex((oi) => oi.item_menu?.id === item.id);

		

		draggedTable = null;		if (existingIndex >= 0) {

	}			orderItems[existingIndex].cantidad += 1;

			orderItems[existingIndex].subtotal = orderItems[existingIndex].cantidad * orderItems[existingIndex].precio_unitario;

	function handleTableClick(table) {		} else {

		if (editMode) {			orderItems = [

			openEditTableModal(table);				...orderItems,

		} else {				{

			openOrderModal(table);					item_menu: item,

		}					cantidad: 1,

	}					precio_unitario: item.precio,

					subtotal: item.precio,

	function openEditTableModal(table) {					notas: ''

		editingTable = { ...table };				}

		showEditTableModal = true;			];

	}		}



	function openOrderModal(table) {		// Si ya hay orden creada, agregar item al backend

		selectedTable = table;		if (currentOrder) {

		if (table.estado === 'ocupada') {			try {

			loadTableOrder(table.id);				await apiService.addOrderItem(currentOrder.id, {

		} else {					item_menu: item.id,

			orderItems = [];					cantidad: 1,

			currentOrder = null;					precio_unitario: item.precio

		}				});

		showOrderModal = true;				toast.success(`${item.nombre} agregado`);

	}			} catch (error) {

				toast.error('Error al agregar item');

	async function loadTableOrder(tableId) {				console.error(error);

		try {			}

			const response = await apiService.getOrders({ mesa: tableId, estado: 'abierta' });		} else {

			if (response.results && response.results.length > 0) {			toast.success(`${item.nombre} agregado al carrito`);

				currentOrder = response.results[0];		}

				orderItems = currentOrder.items || [];	}

			}

		} catch (error) {	function removeOrderItem(index) {

			console.error('Error al cargar orden:', error);		orderItems = orderItems.filter((_, i) => i !== index);

		}	}

	}

	function getOrderTotal() {

	async function saveTableEdit() {		return orderItems.reduce((sum, item) => sum + item.subtotal, 0);

		try {	}

			await apiService.updateTable(editingTable.id, editingTable);

			const index = tables.findIndex((t) => t.id === editingTable.id);	async function createOrder() {

			if (index !== -1) {		if (!currentTable || orderItems.length === 0) {

				tables[index] = editingTable;			toast.warning('Agregue items a la orden');

				tables = [...tables];			return;

			}		}

			toast.success('Mesa actualizada');

			showEditTableModal = false;		try {

		} catch (error) {			// Crear orden

			toast.error('Error al actualizar mesa');			const orderPayload = {

			console.error(error);				mesa: currentTable.id

		}			};

	}			currentOrder = await apiService.createOrder(orderPayload);

</script>

			// Agregar items

<div class="h-full flex flex-col bg-background">			for (const item of orderItems) {

	<!-- Header -->				await apiService.addOrderItem(currentOrder.id, {

	<div class="flex items-center justify-between p-4 border-b border-border bg-card">					item_menu: item.item_menu.id,

		<div>					cantidad: item.cantidad,

			<h1 class="text-2xl font-bold text-foreground">Punto de Venta</h1>					precio_unitario: item.precio_unitario,

			<p class="text-sm text-muted-foreground">Gestión de mesas y pedidos</p>					notas: item.notas || ''

		</div>				});

		<Button on:click={toggleEditMode} variant={editMode ? 'default' : 'outline'}>			}

			{#if editMode}

				<Check class="h-4 w-4 mr-2" />			// Actualizar estado de mesa

				Guardar Cambios			await apiService.updateTableStatus(currentTable.id, { estado: 'ocupada' });

			{:else}

				<Edit2 class="h-4 w-4 mr-2" />			toast.success('Orden creada exitosamente');

				Editar Distribución			await loadZonesAndTables();

			{/if}		} catch (error) {

		</Button>			toast.error('Error al crear orden');

	</div>			console.error(error);

		}

	<!-- Main Content -->	}

	<div class="flex-1 overflow-auto p-6">

		{#if loading}	function openPaymentModal() {

			<div class="flex items-center justify-center h-full">		if (!currentOrder) {

				<div class="text-center">			toast.warning('Debe crear la orden primero');

					<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>			return;

					<p class="mt-4 text-muted-foreground">Cargando mesas...</p>		}

				</div>

			</div>		paymentData = {

		{:else if zones.length === 0}			metodo: 'efectivo',

			<Card>			monto: getOrderTotal(),

				<CardContent>			referencia: ''

					<div class="text-center py-12">		};

						<p class="text-muted-foreground">No hay zonas configuradas</p>		showPaymentModal = true;

						<p class="text-sm text-muted-foreground mt-2">	}

							Configura zonas y mesas desde el panel de administración

						</p>	async function processPayment() {

					</div>		if (paymentData.monto < getOrderTotal()) {

				</CardContent>			toast.warning('El monto debe cubrir el total de la orden');

			</Card>			return;

		{:else}		}

			<div class="grid gap-6">

				{#each zones as zone}		try {

					<Card>			// Registrar pago

						<CardHeader>			await apiService.addPayment(currentOrder.id, {

							<CardTitle>{zone.nombre || zone.name}</CardTitle>				metodo_pago: paymentData.metodo,

							<p class="text-sm text-muted-foreground">				monto: parseFloat(paymentData.monto),

								{getTablesByZone(zone.id).length} mesas				referencia: paymentData.referencia || null

							</p>			});

						</CardHeader>

						<CardContent>			toast.success('Pago procesado exitosamente');

							<div			showPaymentModal = false;

								class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"

								on:dragover={handleDragOver}			// Volver a mesas

								on:drop={(e) => handleDrop(e, zone.id)}			await loadZonesAndTables();

							>			backToTables();

								{#each getTablesByZone(zone.id) as table (table.id)}		} catch (error) {

									<button			toast.error('Error al procesar pago');

										class="relative aspect-square rounded-lg border-2 transition-all {getTableColor(			console.error(error);

											table		}

										)} {editMode	}

											? 'cursor-move hover:shadow-lg hover:scale-105'

											: 'cursor-pointer hover:shadow-md'}"	$: filteredMenuItems = menuItems.filter((item) => {

										draggable={editMode}		const matchesCategory = !selectedCategory || item.categoria?.id === parseInt(selectedCategory);

										on:dragstart={(e) => handleDragStart(e, table)}		const matchesSearch =

										on:click={() => handleTableClick(table)}			!searchQuery || item.nombre.toLowerCase().includes(searchQuery.toLowerCase());

									>		return matchesCategory && matchesSearch;

										<div class="absolute inset-0 flex flex-col items-center justify-center p-2">	});

											<div class="text-lg font-bold {getTableTextColor(table)}"></script>

												{table.numero || table.number}

											</div>{#if view === 'tables'}

											<div class="text-xs {getTableTextColor(table)} mt-1">	<!-- Vista de Mesas -->

												{table.capacidad || table.capacity} personas	<div class="p-6 space-y-6 overflow-y-auto h-full">

											</div>		<div class="flex justify-between items-center">

											{#if table.estado === 'ocupada'}			<h2 class="h2">Seleccione una Mesa</h2>

												<div class="text-xs font-medium text-red-600 mt-1">Ocupada</div>			<div class="flex gap-4 items-center">

											{:else if table.estado === 'reservada'}				<div class="flex items-center gap-2">

												<div class="text-xs font-medium text-yellow-600 mt-1">Reservada</div>					<span class="w-4 h-4 bg-success-500 rounded"></span>

											{/if}					<span class="text-sm">Disponible</span>

										</div>				</div>

									</button>				<div class="flex items-center gap-2">

								{/each}					<span class="w-4 h-4 bg-error-500 rounded"></span>

							</div>					<span class="text-sm">Ocupada</span>

						</CardContent>				</div>

					</Card>				<div class="flex items-center gap-2">

				{/each}					<span class="w-4 h-4 bg-warning-500 rounded"></span>

			</div>					<span class="text-sm">Reservada</span>

		{/if}				</div>

	</div>			</div>

</div>		</div>



<!-- Modal para editar mesa -->		{#if loading}

<Dialog bind:open={showEditTableModal}>			<div class="flex justify-center p-12">

	<div class="space-y-4">				<span class="text-6xl animate-spin">⏳</span>

		<div>			</div>

			<h3 class="text-lg font-semibold text-foreground">Editar Mesa</h3>		{:else}

			<p class="text-sm text-muted-foreground">Modifica los detalles de la mesa</p>			{#each zones as zone}

		</div>				<div class="card p-6">

					<h3 class="h3 mb-4">{zone.nombre}</h3>

		{#if editingTable}					<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">

			<div class="space-y-4">						{#each getTablesByZone(zone.id) as table}

				<div>							<button

					<label class="block text-sm font-medium text-foreground mb-1">Número de Mesa</label>								class={getTableClass(table)}

					<input								on:click={() => selectTable(table)}

						type="number"							>

						bind:value={editingTable.numero}								<div class="text-3xl mb-2">🪑</div>

						class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"								<div class="font-bold">{table.numero}</div>

					/>								<div class="text-xs opacity-75">{table.capacidad} pax</div>

				</div>							</button>

						{/each}

				<div>					</div>

					<label class="block text-sm font-medium text-foreground mb-1">Capacidad</label>				</div>

					<input			{/each}

						type="number"		{/if}

						bind:value={editingTable.capacidad}	</div>

						class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"{:else if view === 'order'}

					/>	<!-- Vista de Orden -->

				</div>	<div class="grid grid-cols-12 h-full">

		<!-- Menu Items (izquierda) -->

				<div>		<div class="col-span-8 border-r border-border overflow-y-auto p-4">

					<label class="block text-sm font-medium text-foreground mb-1">Estado</label>			<div class="space-y-4">

					<select				<!-- Buscador y filtros -->

						bind:value={editingTable.estado}				<div class="flex gap-4">

						class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"					<input

					>						type="search"

						<option value="disponible">Disponible</option>						bind:value={searchQuery}

						<option value="ocupada">Ocupada</option>						placeholder="🔍 Buscar platos..."

						<option value="reservada">Reservada</option>						class="input flex-1"

					</select>					/>

				</div>					<select bind:value={selectedCategory} class="select w-48">

			</div>						<option value="">Todas</option>

						{#each menuCategories as category}

			<div class="flex gap-2 justify-end">							<option value={category.id}>{category.nombre}</option>

				<Button variant="outline" on:click={() => (showEditTableModal = false)}>						{/each}

					<X class="h-4 w-4 mr-2" />					</select>

					Cancelar				</div>

				</Button>

				<Button on:click={saveTableEdit}>				<!-- Grid de items -->

					<Check class="h-4 w-4 mr-2" />				<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

					Guardar					{#each filteredMenuItems as item}

				</Button>						<button

			</div>							class="card card-hover p-4 text-left flex flex-col h-full"

		{/if}							on:click={() => addItemToOrder(item)}

	</div>						>

</Dialog>							{#if item.imagen_url}

								<img src={item.imagen_url} alt={item.nombre} class="w-full h-32 object-cover rounded mb-2" />

<!-- Modal para realizar pedido -->							{:else}

<Dialog bind:open={showOrderModal}>								<div class="w-full h-32 bg-muted rounded mb-2 flex items-center justify-center text-4xl">

	<div class="space-y-4 max-w-4xl">									🍽️

		<div>								</div>

			<h3 class="text-lg font-semibold text-foreground">							{/if}

				{selectedTable ? `Mesa ${selectedTable.numero || selectedTable.number}` : 'Pedido'}							<h4 class="font-semibold mb-1">{item.nombre}</h4>

			</h3>							<p class="text-sm text-muted-foreground mb-2 flex-1">

			<p class="text-sm text-muted-foreground">								{item.descripcion || ''}

				{currentOrder ? 'Orden en curso' : 'Nueva orden'}							</p>

			</p>							<p class="text-xl font-bold text-primary-500">S/ {item.precio.toFixed(2)}</p>

		</div>						</button>

					{/each}

		<div class="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">				</div>

			<!-- Lista de items del menú -->			</div>

			<div class="space-y-2">		</div>

				<h4 class="font-medium text-foreground">Menú</h4>

				{#if menuItems.length === 0}		<!-- Order Summary (derecha) -->

					<p class="text-sm text-muted-foreground">No hay items en el menú</p>		<div class="col-span-4 bg-sidebar flex flex-col h-full">

				{:else}			<!-- Header -->

					{#each menuItems as item}			<div class="p-4 border-b border-border">

						<button				<button class="btn btn-sm variant-ghost-surface mb-4" on:click={backToTables}>

							class="w-full text-left p-3 rounded-lg border border-border hover:bg-accent transition-colors"					◀ Volver a Mesas

							on:click={() => {				</button>

								orderItems = [...orderItems, { ...item, cantidad: 1 }];				<h3 class="h3">Mesa {currentTable?.numero || ''}</h3>

							}}				<p class="text-sm text-muted-foreground">

						>					Zona: {currentTable?.zona?.nombre || ''}

							<div class="font-medium text-foreground">{item.nombre || item.name}</div>				</p>

							<div class="text-sm text-muted-foreground">${item.precio || item.price}</div>			</div>

						</button>

					{/each}			<!-- Items list -->

				{/if}			<div class="flex-1 overflow-y-auto p-4">

			</div>				{#if orderItems.length === 0}

					<div class="text-center text-muted-foreground py-12">

			<!-- Items del pedido -->						<p class="text-4xl mb-2">🛒</p>

			<div class="space-y-2">						<p>Agregue items del menú</p>

				<h4 class="font-medium text-foreground">Pedido Actual</h4>					</div>

				{#if orderItems.length === 0}				{:else}

					<p class="text-sm text-muted-foreground">No hay items en el pedido</p>					<div class="space-y-2">

				{:else}						{#each orderItems as item, index}

					{#each orderItems as item, index}							<div class="card p-3 flex justify-between items-start">

						<div class="flex items-center justify-between p-2 rounded-lg bg-accent">								<div class="flex-1">

							<div class="flex-1">									<p class="font-semibold">{item.item_menu?.nombre || item.item_menu}</p>

								<div class="text-sm font-medium">{item.nombre || item.name}</div>									<p class="text-sm">

								<div class="text-xs text-muted-foreground">										{item.cantidad} x S/ {item.precio_unitario.toFixed(2)}

									${item.precio || item.price} x {item.cantidad}									</p>

								</div>								</div>

							</div>								<div class="flex items-center gap-2">

							<button									<p class="font-bold">S/ {item.subtotal.toFixed(2)}</p>

								class="text-destructive hover:text-destructive/80"									{#if !currentOrder}

								on:click={() => {										<button

									orderItems = orderItems.filter((_, i) => i !== index);											class="btn btn-sm variant-ghost-error"

								}}											on:click={() => removeOrderItem(index)}

							>										>

								<X class="h-4 w-4" />											🗑️

							</button>										</button>

						</div>									{/if}

					{/each}								</div>

							</div>

					<div class="pt-4 border-t border-border">						{/each}

						<div class="flex justify-between font-semibold text-foreground">					</div>

							<span>Total:</span>				{/if}

							<span>			</div>

								${orderItems.reduce(

									(sum, item) => sum + (item.precio || item.price) * item.cantidad,			<!-- Footer con total y acciones -->

									0			<div class="p-4 border-t border-border space-y-4">

								)}				<div class="flex justify-between items-center text-2xl font-bold">

							</span>					<span>TOTAL:</span>

						</div>					<span>S/ {getOrderTotal().toFixed(2)}</span>

					</div>				</div>

				{/if}

			</div>				<div class="space-y-2">

		</div>					{#if !currentOrder}

						<button

		<div class="flex gap-2 justify-end pt-4 border-t border-border">							class="btn variant-filled-primary w-full"

			<Button variant="outline" on:click={() => (showOrderModal = false)}>Cancelar</Button>							on:click={createOrder}

			<Button disabled={orderItems.length === 0}>Enviar Pedido</Button>							disabled={orderItems.length === 0}

		</div>						>

	</div>							✅ Crear Orden

</Dialog>						</button>

					{:else}

<style>						<button class="btn variant-filled-success w-full" on:click={openPaymentModal}>

	:global(body) {							💳 Procesar Pago

		overflow: hidden;						</button>

	}					{/if}

</style>				</div>

			</div>
		</div>
	</div>
{/if}

<!-- Modal de Pago -->
<Modal bind:show={showPaymentModal} title="Procesar Pago" size="md">
	<form on:submit|preventDefault={processPayment} class="space-y-4">
		<div class="card variant-ghost-surface p-4">
			<p class="text-2xl font-bold text-center">
				Total: S/ {getOrderTotal().toFixed(2)}
			</p>
		</div>

		<label class="label">
			<span>Método de Pago *</span>
			<select bind:value={paymentData.metodo} required class="select">
				<option value="efectivo">💵 Efectivo</option>
				<option value="tarjeta">💳 Tarjeta</option>
				<option value="yape">📱 Yape / Plin</option>
			</select>
		</label>

		<label class="label">
			<span>Monto Recibido *</span>
			<input
				type="number"
				bind:value={paymentData.monto}
				step="0.01"
				min={getOrderTotal()}
				required
				class="input"
			/>
		</label>

		{#if paymentData.monto > getOrderTotal()}
			<div class="card variant-ghost-success p-4">
				<p class="font-semibold">
					💰 Vuelto: S/ {(paymentData.monto - getOrderTotal()).toFixed(2)}
				</p>
			</div>
		{/if}

		{#if paymentData.metodo !== 'efectivo'}
			<label class="label">
				<span>Referencia / N° de Operación</span>
				<input
					type="text"
					bind:value={paymentData.referencia}
					class="input"
					placeholder="Opcional"
				/>
			</label>
		{/if}
	</form>

	<div slot="footer" class="flex justify-end gap-2">
		<button
			type="button"
			class="btn variant-ghost-surface"
			on:click={() => (showPaymentModal = false)}
		>
			Cancelar
		</button>
		<button type="button" class="btn variant-filled-success" on:click={processPayment}>
			✅ Confirmar Pago
		</button>
	</div>
</Modal>

