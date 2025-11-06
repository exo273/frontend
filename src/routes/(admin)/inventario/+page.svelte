<script>
	import { onMount } from 'svelte';
	import { apiService } from '$lib/api';
	import { toast } from '$lib/stores';
	import Card from '$lib/components/ui/Card.svelte';
	import CardHeader from '$lib/components/ui/CardHeader.svelte';
	import CardTitle from '$lib/components/ui/CardTitle.svelte';
	import CardContent from '$lib/components/ui/CardContent.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Dialog from '$lib/components/ui/Dialog.svelte';
	import Package from '$lib/components/icons/Package.svelte';
	import Plus from '$lib/components/icons/Plus.svelte';
	import Edit from '$lib/components/icons/Edit.svelte';
	import TrendingUp from '$lib/components/icons/TrendingUp.svelte';
	import TrendingDown from '$lib/components/icons/TrendingDown.svelte';
	import AlertTriangle from '$lib/components/icons/AlertTriangle.svelte';
	import CheckCircle from '$lib/components/icons/CheckCircle.svelte';

	let productos = [];
	let loading = false;
	let searchQuery = '';
	let categoriaFilter = '';
	let categorias = [];
	let unitsOfMeasure = [];

	// Modal states
	let showModal = false;
	let showAjusteModal = false;
	let showCategoryModal = false;
	let modalMode = 'create'; // 'create' o 'edit'
	let selectedProducto = null;

	// Form data para categoría
	let categoryFormData = {
		name: '',
		description: ''
	};

	// Form data
	let formData = {
		nombre: '',
		categoria: '',
		unidad: '',
		cantidad_actual: 0,
		stock_minimo: 0,
		costo_promedio: 0,
		waste_percentage: null
	};

	let ajusteData = {
		tipo_ajuste: 'entrada',
		cantidad: 0,
		razon: ''
	};

	// Columnas de la tabla - sin emojis
	const columns = [
		{ key: 'nombre', label: 'Producto' },
		{ key: 'categoria', label: 'Categoría' },
		{
			key: 'cantidad_actual',
			label: 'Stock',
			format: (val, row) => `${val} ${row.unit}`,
			align: 'center'
		},
		{
			key: 'stock_minimo',
			label: 'Stock Mín.',
			format: (val, row) => `${val || 0} ${row.unidad}`,
			align: 'center'
		},
		{
			key: 'costo_promedio',
			label: 'Costo Prom.',
			format: (val) => `$ ${val.toFixed(2)}`,
			align: 'right'
		},
		{
			key: 'status',
			label: 'Estado',
			align: 'center'
		}
	];

	// Estado del producto
	function getStockStatus(producto) {
		const cantidad = parseFloat(producto.current_stock) || 0;
		const minimo = parseFloat(producto.low_stock_threshold) || 0;
		
		if (minimo === 0) return { label: 'OK', variant: 'success' };
		if (cantidad <= minimo) return { label: 'Bajo', variant: 'destructive' };
		if (cantidad <= minimo * 1.5) return { label: 'Medio', variant: 'warning' };
		return { label: 'OK', variant: 'success' };
	}

	// Acciones de la tabla - sin emojis
	const actions = [
		{
			label: 'Ajustar',
			icon: TrendingUp,
			class: 'variant-ghost-primary',
			onClick: openAjusteModal
		},
		{
			label: 'Editar',
			icon: Edit,
			class: 'variant-ghost-surface',
			onClick: openEditModal
		}
	];

	onMount(async () => {
		await loadProductos();
		await loadCategorias();
		await loadUnitsOfMeasure();
	});

	async function loadProductos() {
		loading = true;
		try {
			const params = {};
			if (searchQuery) params.search = searchQuery;
			if (categoriaFilter) params.category = categoriaFilter;

			console.log('Loading productos with params:', params);
			const response = await apiService.getProductos(params);
			console.log('Productos response:', response);
			
			// Manejar tanto respuestas paginadas como no paginadas
			if (Array.isArray(response)) {
				productos = response;
			} else if (response.results) {
				productos = response.results;
			} else {
				productos = [];
			}
			
			console.log('Productos cargados:', productos.length, productos);
		} catch (error) {
			toast.error('Error al cargar productos');
			console.error('Error loading productos:', error);
			console.error('Error details:', error.response?.data || error);
			productos = [];
		} finally {
			loading = false;
		}
	}

	async function loadCategorias() {
		try {
			const response = await apiService.getCategorias();
			console.log('Categorías response:', response);
			
			// Si la respuesta tiene results, usar eso; si no, usar la respuesta directa
			categorias = response.results || response || [];
			console.log('Categorías cargadas:', categorias);
		} catch (error) {
			console.error('Error al cargar categorías:', error);
			categorias = [];
		}
	}

	async function loadUnitsOfMeasure() {
		try {
			const response = await apiService.getUnitsOfMeasure();
			unitsOfMeasure = response.results || response || [];
			console.log('Unidades de medida cargadas:', unitsOfMeasure);
		} catch (error) {
			console.error('Error al cargar unidades de medida:', error);
			unitsOfMeasure = [];
		}
	}

	function openCreateModal() {
		modalMode = 'create';
		formData = {
			nombre: '',
			categoria: '',
			unidad: '',
			cantidad_actual: 0,
			stock_minimo: 0,
			costo_promedio: 0,
			waste_percentage: null
		};
		showModal = true;
	}

	function openEditModal(producto) {
		modalMode = 'edit';
		selectedProducto = producto;
		// Mapear campos del backend al formato del formulario
		formData = {
			nombre: producto.name,
			categoria: producto.category,
			unidad: producto.inventory_unit,
			stock_minimo: producto.low_stock_threshold || 0,
			waste_percentage: producto.waste_percentage || null
		};
		showModal = true;
	}

	function openAjusteModal(producto) {
		selectedProducto = producto;
		ajusteData = {
			tipo_ajuste: 'entrada',
			cantidad: 0,
			razon: ''
		};
		showAjusteModal = true;
	}

	async function handleSubmit() {
		try {
			// Transformar datos del formulario al formato del backend
			const productData = {
				name: formData.nombre || formData.name,
				description: formData.descripcion || formData.description || '',
				category: formData.categoria || formData.category,
				inventory_unit: formData.unidad || formData.inventory_unit,
				low_stock_threshold: formData.stock_minimo || formData.low_stock_threshold || 0,
				waste_percentage: formData.waste_percentage || null
			};

			if (modalMode === 'create') {
				await apiService.createProducto(productData);
				toast.success('Producto creado exitosamente');
			} else {
				await apiService.updateProducto(selectedProducto.id, productData);
				toast.success('Producto actualizado exitosamente');
			}
			showModal = false;
			await loadProductos();
		} catch (error) {
			toast.error('Error al guardar producto');
			console.error('Error details:', error.response?.data || error);
		}
	}

	async function handleAjuste() {
		if (!ajusteData.razon.trim()) {
			toast.warning('Por favor ingrese una razón para el ajuste');
			return;
		}

		try {
			await apiService.adjustStock(selectedProducto.id, ajusteData);
			toast.success('Ajuste de stock registrado exitosamente');
			showAjusteModal = false;
			await loadProductos();
		} catch (error) {
			toast.error('Error al ajustar stock');
			console.error(error);
		}
	}

	function handleSearch(query) {
		searchQuery = query;
		loadProductos();
	}

	function openCategoryModal() {
		categoryFormData = { name: '', description: '' };
		showCategoryModal = true;
	}

	async function handleCategorySubmit() {
		if (!categoryFormData.name.trim()) {
			toast.error('El nombre de la categoría es requerido');
			return;
		}

		try {
			await apiService.createCategoria({
				name: categoryFormData.name,
				description: categoryFormData.description || ''
			});
			toast.success('Categoría creada exitosamente');
			showCategoryModal = false;
			await loadCategorias();
		} catch (error) {
			toast.error('Error al crear categoría');
			console.error('Error details:', error.response?.data || error);
		}
	}
</script>

<svelte:head>
	<title>Inventario - SIGR</title>
</svelte:head>

<div class="p-6 space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-3">
			<div class="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
				<Package class="h-5 w-5 text-primary" />
			</div>
			<div>
				<h1 class="text-2xl font-bold">Inventario</h1>
				<p class="text-sm text-muted-foreground">Gestión de productos y stock</p>
			</div>
		</div>
		<Button on:click={openCreateModal}>
			<Plus class="h-4 w-4 mr-2" />
			Nuevo Producto
		</Button>
	</div>

	<!-- Filters -->
	<Card>
		<CardContent class="pt-6">
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Input
					bind:value={searchQuery}
					on:input={() => loadProductos()}
					placeholder="Buscar productos..."
					class="w-full"
				/>
				<select
					bind:value={categoriaFilter}
					on:change={loadProductos}
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
				>
					<option value="">Todas las categorías</option>
					{#each categorias as categoria}
						<option value={categoria.id}>{categoria.name}</option>
					{/each}
				</select>
			</div>
		</CardContent>
	</Card>

	<!-- Tabla de productos -->
	<Card>
		<CardContent class="p-0">
			{#if loading}
				<div class="flex items-center justify-center py-8">
					<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
				</div>
			{:else if productos.length === 0}
				<div class="text-center py-12">
					<Package class="h-12 w-12 mx-auto text-muted-foreground mb-4" />
					<p class="text-muted-foreground">No hay productos registrados</p>
				</div>
			{:else}
				<div class="overflow-x-auto">
					<table class="w-full">
						<thead>
							<tr class="border-b border-border">
								<th class="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Producto</th>
								<th class="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Categoría</th>
								<th class="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Stock</th>
								<th class="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Stock Mín.</th>
								<th class="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Costo Prom.</th>
								<th class="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
								<th class="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
							</tr>
						</thead>
						<tbody>
							{#each productos as producto}
								{@const status = getStockStatus(producto)}
								{@const avgCost = typeof producto.average_cost === 'number' ? producto.average_cost : parseFloat(producto.average_cost) || 0}
								{@const currentStock = typeof producto.current_stock === 'number' ? producto.current_stock : parseFloat(producto.current_stock) || 0}
								{@const lowStock = typeof producto.low_stock_threshold === 'number' ? producto.low_stock_threshold : parseFloat(producto.low_stock_threshold) || 0}
								<tr class="border-b border-border hover:bg-accent transition-colors">
									<td class="py-3 px-4 font-medium">{producto.name}</td>
									<td class="py-3 px-4 text-sm text-muted-foreground">{producto.category_name || '-'}</td>
									<td class="py-3 px-4 text-center text-sm">{currentStock} {producto.inventory_unit_abbreviation}</td>
									<td class="py-3 px-4 text-center text-sm">{lowStock} {producto.inventory_unit_abbreviation}</td>
									<td class="py-3 px-4 text-right text-sm">$ {avgCost.toFixed(2)}</td>
									<td class="py-3 px-4 text-center">
										<Badge variant={status.variant}>{status.label}</Badge>
									</td>
									<td class="py-3 px-4 text-right">
										<div class="flex items-center justify-end gap-2">
											<Button variant="ghost" size="sm" on:click={() => openAjusteModal(producto)}>
												<TrendingUp class="h-4 w-4" />
											</Button>
											<Button variant="ghost" size="sm" on:click={() => openEditModal(producto)}>
												<Edit class="h-4 w-4" />
											</Button>
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</CardContent>
	</Card>
</div>

<!-- Modal Crear/Editar Producto -->
{#if showModal}
	<Dialog open={showModal} onClose={() => (showModal = false)}>
		<div class="space-y-6">
			<div>
				<h2 class="text-lg font-semibold">{modalMode === 'create' ? 'Nuevo Producto' : 'Editar Producto'}</h2>
			</div>

			<form on:submit|preventDefault={handleSubmit} class="space-y-4">
				<div class="space-y-2">
					<label class="text-sm font-medium">Nombre *</label>
					<Input
						bind:value={formData.nombre}
						required
						placeholder="Nombre del producto"
					/>
				</div>

				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<label class="text-sm font-medium">Categoría *</label>
						<button
							type="button"
							on:click={openCategoryModal}
							class="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
						>
							<Plus class="h-3 w-3" />
							Nueva
						</button>
					</div>
					<select bind:value={formData.categoria} required class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
						<option value="">Seleccione una categoría</option>
						{#each categorias as categoria}
							<option value={categoria.id}>{categoria.name}</option>
						{/each}
					</select>
				</div>				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<label class="text-sm font-medium">Unidad *</label>
						<select bind:value={formData.unidad} required class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
							<option value="">Seleccione una unidad</option>
							{#each unitsOfMeasure as unit}
								<option value={unit.id}>{unit.name} ({unit.abbreviation})</option>
							{/each}
						</select>
					</div>

					<div class="space-y-2">
						<label class="text-sm font-medium">Stock Mínimo</label>
						<Input
							type="number"
							bind:value={formData.stock_minimo}
							step="0.01"
							min="0"
						/>
					</div>
				</div>

				<div class="space-y-2">
					<label class="text-sm font-medium">Porcentaje de Merma (%)</label>
					<Input
						type="number"
						bind:value={formData.waste_percentage}
						step="0.01"
						min="0"
						max="100"
						placeholder="Opcional: 0-100%"
					/>
					<p class="text-xs text-muted-foreground">Porcentaje de desperdicio o merma del producto</p>
				</div>

				{#if modalMode === 'create'}
					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-2">
							<label class="text-sm font-medium">Cantidad Inicial</label>
							<Input
								type="number"
								bind:value={formData.cantidad_actual}
								step="0.01"
								min="0"
							/>
						</div>

						<div class="space-y-2">
							<label class="text-sm font-medium">Costo Promedio</label>
							<Input
								type="number"
								bind:value={formData.costo_promedio}
								step="0.01"
								min="0"
								placeholder="S/ 0.00"
							/>
						</div>
					</div>
				{/if}

				<div class="flex justify-end gap-2 pt-4">
					<Button type="button" variant="ghost" on:click={() => (showModal = false)}>
						Cancelar
					</Button>
					<Button type="submit">
						{modalMode === 'create' ? 'Crear' : 'Guardar'}
					</Button>
				</div>
			</form>
		</div>
	</Dialog>
{/if}

<!-- Modal para crear categoría de producto -->
<Dialog bind:open={showCategoryModal} title="Nueva Categoría de Producto">
	<div class="space-y-4">
		<form on:submit|preventDefault={handleCategorySubmit} class="space-y-4">
			<div class="space-y-2">
				<label class="text-sm font-medium">Nombre de la Categoría *</label>
				<Input
					type="text"
					bind:value={categoryFormData.name}
					required
					placeholder="Ej: Abarrotes, Verduras, Carnes, Lácteos..."
					autofocus
				/>
			</div>

			<div class="space-y-2">
				<label class="text-sm font-medium">Descripción</label>
				<textarea
					bind:value={categoryFormData.description}
					rows="2"
					class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
					placeholder="Descripción opcional de la categoría..."
				/>
			</div>
		</form>

		<!-- Footer -->
		<div class="flex justify-end gap-2 pt-4">
			<Button variant="ghost" on:click={() => (showCategoryModal = false)}>
				Cancelar
			</Button>
			<Button on:click={handleCategorySubmit}>
				Crear Categoría
			</Button>
		</div>
	</div>
</Dialog>

<!-- Modal Ajustar Stock -->
{#if showAjusteModal}
	<Dialog open={showAjusteModal} onClose={() => (showAjusteModal = false)}>
	<div class="space-y-6">
		<div>
			<h2 class="text-lg font-semibold">Ajustar Stock: {selectedProducto?.name || ''}</h2>
		</div>

		<form on:submit|preventDefault={handleAjuste} class="space-y-4">
			<div class="space-y-2">
				<label class="text-sm font-medium">Tipo de Ajuste *</label>
				<select bind:value={ajusteData.tipo_ajuste} required class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
					<option value="entrada">Entrada (Agregar)</option>
					<option value="salida">Salida (Reducir)</option>
				</select>
			</div>

			<div class="space-y-2">
				<label class="text-sm font-medium">Cantidad *</label>
				<Input
					type="number"
					bind:value={ajusteData.cantidad}
					step="0.01"
					min="0.01"
					required
					placeholder="0.00"
				/>
				<p class="text-xs text-muted-foreground">
					Stock actual: {selectedProducto?.cantidad_actual || 0} {selectedProducto?.unit || ''}
				</p>
			</div>				<div class="space-y-2">
					<label class="text-sm font-medium">Razón del Ajuste *</label>
					<textarea
						bind:value={ajusteData.razon}
						required
						rows="3"
						class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
						placeholder="Explique el motivo del ajuste..."
					/>
				</div>

				<div class="flex justify-end gap-2 pt-4">
					<Button type="button" variant="ghost" on:click={() => (showAjusteModal = false)}>
						Cancelar
					</Button>
					<Button type="submit">
						Confirmar Ajuste
					</Button>
				</div>
			</form>
		</div>
	</Dialog>
{/if}