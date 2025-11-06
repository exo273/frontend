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
	
	// Grid configuration
	const GRID_ROWS = 12;  // Aumentado de 8 a 12
	const GRID_COLS = 16;  // Aumentado de 12 a 16
	const CELL_SIZE = 80; // px
	
	// Drag & Drop state
	let draggedTable = null;
	let isDragging = false;

	onMount(async () => {
		console.log('🟣 Componente configuración montado');
		await loadData();
	});

	async function loadData() {
		loading = true;
		try {
			const zonesResponse = await apiService.getZones();
			zones = zonesResponse.results || zonesResponse;
			console.log('📍 Zonas cargadas:', zones);
			const response = await apiService.getTables({ page_size: 1000 });
			tables = response.results || response;
			console.log('📍 Mesas cargadas:', tables);
			
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
	function openTableModal(table = null, gridRow = null, gridCol = null) {
		if (!table && selectedZone) {
			// Si es una nueva mesa, usar la posición de la cuadrícula
			editingTable = {
				zona: selectedZone,
				capacidad: 4,
				posicion_x: gridCol !== null ? gridCol : 0,
				posicion_y: gridRow !== null ? gridRow : 0,
				ancho: 1, // en unidades de cuadrícula
				alto: 1,
				forma: 'cuadrada'
			};
		} else {
			editingTable = table;
		}
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

	// Función para obtener el siguiente número de mesa disponible
	function getNextTableNumber(zoneTables) {
		if (zoneTables.length === 0) return '1';
		
		// Obtener todos los números de mesa como números
		const numbers = zoneTables
			.map(t => {
				const num = parseInt(t.numero);
				return isNaN(num) ? 0 : num;
			})
			.filter(n => n > 0)
			.sort((a, b) => a - b);
		
		// Encontrar el siguiente número disponible
		if (numbers.length === 0) return '1';
		return String(numbers[numbers.length - 1] + 1);
	}

	// Grid functions
	async function handleCellClick(row, col) {
		// Verificar si hay una mesa en esta celda
		const zoneTables = getTablesByZone(selectedZone);
		const tableInCell = zoneTables.find(
			(t) => t.posicion_y === row && t.posicion_x === col
		);

		if (tableInCell) {
			// Si hay una mesa, abrir modal para editar
			openTableModal(tableInCell);
		} else {
			// Si no hay mesa, crear automáticamente con número consecutivo
			await createTableAutomatically(row, col);
		}
	}

	// Crear mesa automáticamente sin modal
	async function createTableAutomatically(row, col) {
		if (!selectedZone) {
			toast.error('Selecciona una zona primero');
			return;
		}

		const zoneTables = getTablesByZone(selectedZone);
		const nextNumber = getNextTableNumber(zoneTables);

		try {
			const newTable = {
				numero: nextNumber,
				zona: selectedZone,
				capacidad: 4,
				posicion_x: col,
				posicion_y: row,
				ancho: 1,
				alto: 1,
				is_active: true
			};

			console.log('Creando mesa:', newTable);
			await apiService.createTable(newTable);
			toast.success(`Mesa ${nextNumber} creada`);
			await loadData();
		} catch (error) {
			console.error('Error al crear mesa:', error);
			console.error('Respuesta del servidor:', error.response?.data);
			toast.error(error.response?.data?.detail || error.response?.data?.message || 'Error al crear mesa');
		}
	}

	// Drag & Drop functions
	function handleTableDragStart(event, table) {
		draggedTable = table;
		isDragging = true;
		event.dataTransfer.effectAllowed = 'move';
		event.dataTransfer.setData('text/plain', table.id);
	}

	function handleTableDragEnd() {
		isDragging = false;
		draggedTable = null;
	}

	async function handleCellDrop(event, row, col) {
		event.preventDefault();
		
		if (!draggedTable) return;

		// Verificar si la celda de destino está ocupada
		const zoneTables = getTablesByZone(selectedZone);
		const tableInCell = isTableInCell(row, col, zoneTables);
		
		if (tableInCell && tableInCell.id !== draggedTable.id) {
			toast.error('Esta celda ya está ocupada');
			isDragging = false;
			draggedTable = null;
			return;
		}

		// Guardar el ID para verificación posterior
		const tableId = draggedTable.id;
		const targetRow = row;
		const targetCol = col;

		try {
			const updateData = {
				numero: draggedTable.numero,
				zona: draggedTable.zona?.id || draggedTable.zona,
				capacidad: draggedTable.capacidad || 4,
				posicion_x: col,
				posicion_y: row,
				ancho: draggedTable.ancho || 1,
				alto: draggedTable.alto || 1,
				is_active: draggedTable.is_active
			};

			await apiService.updateTable(draggedTable.id, updateData);
			toast.success('Mesa reposicionada');
			await loadData();
		} catch (error) {
			console.error('Error al mover mesa:', error);
			// El backend puede devolver error aunque se guardó (problema de Redis)
			// Recargar y verificar si realmente se movió
			await loadData();
			
			// Esperar un momento para que tables se actualice
			setTimeout(() => {
				const updatedTable = tables.find(t => t.id === tableId);
				if (updatedTable && updatedTable.posicion_x === targetCol && updatedTable.posicion_y === targetRow) {
					console.log('✅ Mesa movida exitosamente a pesar del error de backend');
					toast.success('Mesa reposicionada');
				} else {
					console.log('❌ Error real al mover mesa');
					toast.error('Error al mover mesa');
				}
			}, 100);
		}

		isDragging = false;
		draggedTable = null;
	}

	function handleDragOver(event) {
		event.preventDefault();
		event.dataTransfer.dropEffect = 'move';
	}

	function isTableInCell(row, col, zoneTables) {
		return zoneTables.find(
			(t) => {
				const tableRow = t.posicion_y ?? 0;
				const tableCol = t.posicion_x ?? 0;
				const tableHeight = t.alto || 1;
				const tableWidth = t.ancho || 1;
				
				return row >= tableRow && 
					   row < tableRow + tableHeight && 
					   col >= tableCol && 
					   col < tableCol + tableWidth;
			}
		);
	}

	function getTableAtPosition(row, col, zoneTables) {
		return zoneTables.find(
			(t) => t.posicion_y === row && t.posicion_x === col
		);
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
							Haz clic en una celda para agregar o editar mesa • {zoneTables.length} mesas
						</p>
					</div>
				</div>
			</div>

			<!-- Canvas de mesas con cuadrícula -->
			<div class="flex-1 overflow-auto p-6 bg-muted/30">
				<div class="inline-block bg-background rounded-lg border border-border p-2">
					<!-- Grid de celdas -->
					<div class="grid gap-1" style="grid-template-columns: repeat({GRID_COLS}, {CELL_SIZE}px);">
						{#each Array(GRID_ROWS) as _, row}
							{#each Array(GRID_COLS) as _, col}
								{@const tableInCell = isTableInCell(row, col, zoneTables)}
								{@const isTableOrigin = tableInCell && tableInCell.posicion_y === row && tableInCell.posicion_x === col}
								
								{#if isTableOrigin}
									<!-- Celda con mesa (origen) - ARRASTRABLE -->
									{@const width = (tableInCell.ancho || 1)}
									{@const height = (tableInCell.alto || 1)}
									<div
										draggable="true"
										on:dragstart={(e) => handleTableDragStart(e, tableInCell)}
										on:dragend={handleTableDragEnd}
										on:click={() => handleCellClick(row, col)}
										class="bg-primary hover:bg-primary/90 border-2 border-primary text-primary-foreground rounded-lg flex flex-col items-center justify-center font-bold transition-all hover:scale-105 shadow-sm group relative cursor-move {isDragging && draggedTable?.id === tableInCell.id ? 'opacity-50' : ''}"
										style="width: {width * CELL_SIZE + (width - 1) * 4}px; height: {height * CELL_SIZE + (height - 1) * 4}px; grid-column: span {width}; grid-row: span {height};"
										title="Mesa {tableInCell.numero} - Arrastra para mover"
										role="button"
										tabindex="0"
									>
										<div class="text-lg">{tableInCell.numero}</div>
										<div class="text-xs opacity-90">{tableInCell.capacidad || 4}p</div>
										
										<!-- Indicador de drag -->
										<div class="absolute bottom-1 left-0 right-0 flex justify-center opacity-50">
											<div class="flex gap-0.5">
												<div class="w-1 h-1 bg-current rounded-full"></div>
												<div class="w-1 h-1 bg-current rounded-full"></div>
												<div class="w-1 h-1 bg-current rounded-full"></div>
											</div>
										</div>
										
										<!-- Botones de acción -->
										<div class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
											<button
												on:click|stopPropagation={() => openTableModal(tableInCell)}
												class="p-1 bg-background/90 hover:bg-accent rounded shadow-md"
												title="Editar"
											>
												<Edit2 class="h-3 w-3" />
											</button>
											<button
												on:click|stopPropagation={() => deleteTable(tableInCell.id)}
												class="p-1 bg-background/90 hover:bg-destructive/10 text-destructive rounded shadow-md"
												title="Eliminar"
											>
												<Trash2 class="h-3 w-3" />
											</button>
										</div>
									</div>
								{:else if tableInCell}
									<!-- Celda ocupada por una mesa (no es el origen) - NO RENDERIZAR NADA -->
									<!-- Esta celda es parte de una mesa más grande, grid-column: span manejará el espacio -->
								{:else}
									<!-- Celda vacía - DROP ZONE -->
									<button
										on:click={() => handleCellClick(row, col)}
										on:drop={(e) => handleCellDrop(e, row, col)}
										on:dragover={handleDragOver}
										class="bg-muted/50 hover:bg-accent border border-border rounded transition-colors {isDragging ? 'border-dashed border-primary/50' : ''}"
										style="width: {CELL_SIZE}px; height: {CELL_SIZE}px;"
										title="Agregar mesa en ({row}, {col})"
									>
										<div class="w-full h-full flex items-center justify-center opacity-0 hover:opacity-50 transition-opacity">
											<Plus class="h-4 w-4" />
										</div>
									</button>
								{/if}
							{/each}
						{/each}
					</div>
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
