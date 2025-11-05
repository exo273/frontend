<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { apiService } from '$lib/api';
	import { toast } from '$lib/stores';
	import Plus from '$lib/components/icons/Plus.svelte';
	import Edit2 from '$lib/components/icons/Edit2.svelte';
	import Trash2 from '$lib/components/icons/Trash2.svelte';
	import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
	import ZoneModal from '$lib/components/configuracion/ZoneModal.svelte';
	import TableModal from '$lib/components/configuracion/TableModal.svelte';

	let zones = [];
	let tables = [];
	let selectedZone = null;
	let loading = true;
	
	// Modals
	let showZoneModal = false;
	let showTableModal = false;
	let editingZone = null;
	let editingTable = null;
	let zoneModalMode = 'create';
	let tableModalMode = 'create';
	
	// Drag & Drop
	let draggedTable = null;
	let isDragging = false;

	onMount(async () => {
		console.log('🟣 Componente configuración montado');
		await loadData();
	});

	async function loadData() {
		loading = true;
		try {
			zones = await apiService.getZones();
			const response = await apiService.getTables({ page_size: 1000 });
			tables = response.results || response;
			
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

	function backToPOS() {
		goto('/pos');
	}

	// Zone functions
	function openZoneModal(zone = null) {
		console.log('🔵 openZoneModal llamado', { zone, showZoneModal });
		editingZone = zone;
		zoneModalMode = zone ? 'edit' : 'create';
		showZoneModal = true;
		console.log('🟢 showZoneModal actualizado a:', showZoneModal);
	}

	async function handleSaveZone() {
		await loadData();
	}

	async function deleteZone(zoneId) {
		if (!confirm('¿Estás seguro de eliminar esta zona? Se eliminarán todas sus mesas.')) {
			return;
		}

		try {
			await apiService.deleteZone(zoneId);
			toast.success('Zona eliminada exitosamente');
			await loadData();
			if (selectedZone === zoneId && zones.length > 0) {
				selectedZone = zones[0].id;
			}
		} catch (error) {
			console.error('Error al eliminar zona:', error);
			toast.error('Error al eliminar zona');
		}
	}

	// Table functions
	function openTableModal(table = null) {
		editingTable = table;
		tableModalMode = table ? 'edit' : 'create';
		showTableModal = true;
	}

	async function handleSaveTable() {
		await loadData();
	}

	async function deleteTable(tableId) {
		if (!confirm('¿Estás seguro de eliminar esta mesa?')) {
			return;
		}

		try {
			await apiService.deleteTable(tableId);
			toast.success('Mesa eliminada exitosamente');
			await loadData();
		} catch (error) {
			console.error('Error al eliminar mesa:', error);
			toast.error('Error al eliminar mesa');
		}
	}

	function getTablesByZone(zoneId) {
		return tables.filter((t) => (t.zona?.id || t.zona) === zoneId);
	}

	// Drag & Drop functions
	function handleTableDragStart(event, table) {
		draggedTable = table;
		isDragging = true;
		event.dataTransfer.effectAllowed = 'move';
	}

	function handleTableDragEnd(event) {
		isDragging = false;
		draggedTable = null;
	}

	async function handleTableDrop(event) {
		event.preventDefault();
		if (!draggedTable) return;

		const canvas = event.currentTarget;
		const rect = canvas.getBoundingClientRect();
		
		// Calcular posición relativa con snap to grid
		const x = Math.max(0, Math.min(event.clientX - rect.left - (draggedTable.ancho / 2), rect.width - draggedTable.ancho));
		const y = Math.max(0, Math.min(event.clientY - rect.top - (draggedTable.alto / 2), rect.height - draggedTable.alto));

		try {
			await apiService.updateTable(draggedTable.id, {
				...draggedTable,
				zona: draggedTable.zona?.id || draggedTable.zona,
				posicion_x: Math.round(x / 10) * 10,
				posicion_y: Math.round(y / 10) * 10
			});
			await loadData();
			toast.success('Mesa reposicionada');
		} catch (error) {
			console.error('Error al actualizar posición:', error);
			toast.error('Error al mover mesa');
		}

		isDragging = false;
		draggedTable = null;
	}

	function handleDragOver(event) {
		event.preventDefault();
		event.dataTransfer.dropEffect = 'move';
	}
</script>

<div class="flex h-full bg-background">
	<!-- Sidebar izquierdo - Zonas -->
	<div class="w-80 bg-sidebar border-r border-border flex flex-col">
		<!-- Header -->
		<div class="p-6 border-b border-border">
			<button
				on:click={backToPOS}
				class="flex items-center gap-2 px-3 py-2 hover:bg-muted rounded-lg transition-colors text-sm font-medium mb-4"
			>
				<ArrowLeft class="h-4 w-4" />
				Volver al POS
			</button>
			<div class="flex items-center justify-between">
				<div>
					<h2 class="text-xl font-bold">Zonas</h2>
					<p class="text-sm text-muted-foreground">Gestiona tus zonas</p>
				</div>
				<button
					on:click={() => openZoneModal()}
					class="flex items-center justify-center h-9 w-9 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
					title="Nueva Zona"
				>
					<Plus class="h-4 w-4" />
				</button>
			</div>
		</div>

		<!-- Lista de zonas -->
		<div class="flex-1 overflow-y-auto p-4">
			{#if loading}
				<div class="flex justify-center py-12">
					<div class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
				</div>
			{:else if zones.length === 0}
				<div class="text-center py-12 text-muted-foreground">
					<p class="mb-2">No hay zonas</p>
					<p class="text-sm">Crea tu primera zona</p>
				</div>
			{:else}
				<div class="space-y-2">
					{#each zones as zone}
						<button
							class="w-full p-4 rounded-lg border transition-all text-left {selectedZone === zone.id
								? 'border-primary bg-primary/5'
								: 'border-border hover:border-primary/50'}"
							on:click={() => (selectedZone = zone.id)}
						>
							<div class="flex items-start justify-between mb-2">
								<div class="flex-1">
									<h3 class="font-semibold">{zone.nombre}</h3>
									{#if zone.descripcion}
										<p class="text-sm text-muted-foreground mt-1">{zone.descripcion}</p>
									{/if}
								</div>
								<div class="flex items-center gap-1">
									<button
										on:click|stopPropagation={() => openZoneModal(zone)}
										class="p-1.5 hover:bg-accent rounded transition-colors"
										title="Editar"
									>
										<Edit2 class="h-3.5 w-3.5" />
									</button>
									<button
										on:click|stopPropagation={() => deleteZone(zone.id)}
										class="p-1.5 hover:bg-destructive/10 text-destructive rounded transition-colors"
										title="Eliminar"
									>
										<Trash2 class="h-3.5 w-3.5" />
									</button>
								</div>
							</div>
							<div class="flex items-center gap-3 text-xs text-muted-foreground">
								<span>{getTablesByZone(zone.id).length} mesas</span>
								{#if !zone.is_active}
									<span class="px-2 py-0.5 bg-muted rounded">Inactiva</span>
								{/if}
							</div>
						</button>
					{/each}
				</div>
			{/if}
		</div>
	</div>

	<!-- Canvas principal - Mesas -->
	<div class="flex-1 flex flex-col">
		{#if selectedZone}
			{@const zone = zones.find((z) => z.id === selectedZone)}
			{@const zoneTables = getTablesByZone(selectedZone)}

			<!-- Header del canvas -->
			<div class="bg-sidebar border-b border-border px-6 py-4">
				<div class="flex items-center justify-between">
					<div>
						<h2 class="text-2xl font-bold">{zone?.nombre}</h2>
						<p class="text-sm text-muted-foreground">
							Arrastra las mesas para posicionarlas • {zoneTables.length} mesas
						</p>
					</div>
					<button
						on:click={() => openTableModal()}
						class="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
					>
						<Plus class="h-4 w-4" />
						Nueva Mesa
					</button>
				</div>
			</div>

			<!-- Canvas de mesas -->
			<div class="flex-1 overflow-auto p-6 bg-muted/30">
				<div
					class="relative bg-background rounded-lg border-2 border-dashed border-border"
					style="min-height: calc(100vh - 200px); width: 100%;"
					on:drop={handleTableDrop}
					on:dragover={handleDragOver}
					role="application"
					aria-label="Canvas de mesas"
				>
					{#if zoneTables.length === 0}
						<div class="absolute inset-0 flex items-center justify-center text-muted-foreground">
							<div class="text-center">
								<p class="text-2xl mb-2">🪑</p>
								<p class="text-lg font-semibold">No hay mesas en esta zona</p>
								<p class="text-sm mt-1">Crea una mesa para comenzar</p>
							</div>
						</div>
					{:else}
						{#each zoneTables as table}
							<div
								draggable="true"
								on:dragstart={(e) => handleTableDragStart(e, table)}
								on:dragend={handleTableDragEnd}
								class="absolute cursor-move border-2 bg-card hover:bg-accent transition-all rounded-lg flex flex-col items-center justify-center text-center shadow-lg group select-none {isDragging &&
								draggedTable?.id === table.id
									? 'opacity-50 border-primary'
									: 'border-primary'}"
								style="left: {table.posicion_x}px; top: {table.posicion_y}px; width: {table.ancho}px; height: {table.alto}px; {table.forma ===
								'redonda'
									? 'border-radius: 50%;'
									: table.forma === 'rectangular'
										? 'border-radius: 0.5rem;'
										: 'border-radius: 0.5rem;'}"
								role="button"
								tabindex="0"
							>
								<div class="font-bold text-xl">Mesa {table.numero}</div>
								<div class="text-sm text-muted-foreground">{table.capacidad} personas</div>

								<!-- Botones de acción -->
								<div
									class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1"
								>
									<button
										on:click|stopPropagation={() => openTableModal(table)}
										class="p-2 bg-background/90 hover:bg-accent rounded-lg shadow-md"
										title="Editar"
									>
										<Edit2 class="h-4 w-4" />
									</button>
									<button
										on:click|stopPropagation={() => deleteTable(table.id)}
										class="p-2 bg-background/90 hover:bg-destructive/10 text-destructive rounded-lg shadow-md"
										title="Eliminar"
									>
										<Trash2 class="h-4 w-4" />
									</button>
								</div>

								<!-- Indicador de arrastre -->
								<div class="absolute bottom-2 left-0 right-0 flex justify-center opacity-50">
									<div class="flex gap-1">
										<div class="w-1 h-1 bg-current rounded-full"></div>
										<div class="w-1 h-1 bg-current rounded-full"></div>
										<div class="w-1 h-1 bg-current rounded-full"></div>
									</div>
								</div>
							</div>
						{/each}
					{/if}
				</div>
			</div>
		{:else}
			<div class="flex-1 flex items-center justify-center text-muted-foreground">
				<div class="text-center">
					<p class="text-xl mb-2">Selecciona una zona</p>
					<p class="text-sm">o crea una nueva para comenzar</p>
				</div>
			</div>
		{/if}
	</div>
</div>

<!-- Modales -->
<ZoneModal
	bind:show={showZoneModal}
	zone={editingZone}
	mode={zoneModalMode}
	on:saved={handleSaveZone}
/>
<TableModal
	bind:show={showTableModal}
	table={editingTable}
	mode={tableModalMode}
	{zones}
	on:saved={handleSaveTable}
/>
