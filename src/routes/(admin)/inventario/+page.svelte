<script>
	import { onMount } from 'svelte';
	import { apiService } from '$lib/api';
	import { toast } from '$lib/stores';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import DataTable from '$lib/components/DataTable.svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import Modal from '$lib/components/Modal.svelte';

	let productos = [];
	let loading = false;
	let searchQuery = '';
	let categoriaFilter = '';
	let categorias = [];

	// Modal states
	let showModal = false;
	let showAjusteModal = false;
	let modalMode = 'create'; // 'create' o 'edit'
	let selectedProducto = null;

	// Form data
	let formData = {
		nombre: '',
		categoria: '',
		unidad: 'kg',
		cantidad_actual: 0,
		stock_minimo: 0,
		costo_promedio: 0
	};

	let ajusteData = {
		tipo_ajuste: 'entrada',
		cantidad: 0,
		razon: ''
	};

	// Columnas de la tabla
	const columns = [
		{ key: 'nombre', label: 'Producto' },
		{ key: 'categoria', label: 'Categoría' },
		{
			key: 'cantidad_actual',
			label: 'Stock',
			format: (val, row) => `${val} ${row.unidad}`,
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
			format: (val) => `S/ ${val.toFixed(2)}`,
			align: 'right'
		},
		{
			key: 'cantidad_actual',
			label: 'Estado',
			format: (val, row) => {
				if (val <= (row.stock_minimo || 0)) return '⚠️ Bajo';
				if (val <= (row.stock_minimo || 0) * 1.5) return '⚡ Medio';
				return '✅ OK';
			},
			align: 'center'
		}
	];

	// Acciones de la tabla
	const actions = [
		{
			label: 'Ajustar',
			icon: '📊',
			class: 'variant-ghost-primary',
			onClick: openAjusteModal
		},
		{
			label: 'Editar',
			icon: '✏️',
			class: 'variant-ghost-surface',
			onClick: openEditModal
		}
	];

	onMount(async () => {
		await loadProductos();
		await loadCategorias();
	});

	async function loadProductos() {
		loading = true;
		try {
			const params = { page_size: 1000 };
			if (searchQuery) params.search = searchQuery;
			if (categoriaFilter) params.categoria = categoriaFilter;

			const response = await apiService.getProductos(params);
			productos = response.results || response;
		} catch (error) {
			toast.error('Error al cargar productos');
			console.error(error);
		} finally {
			loading = false;
		}
	}

	async function loadCategorias() {
		try {
			categorias = await apiService.getCategorias();
		} catch (error) {
			console.error('Error al cargar categorías:', error);
		}
	}

	function openCreateModal() {
		modalMode = 'create';
		formData = {
			nombre: '',
			categoria: '',
			unidad: 'kg',
			cantidad_actual: 0,
			stock_minimo: 0,
			costo_promedio: 0
		};
		showModal = true;
	}

	function openEditModal(producto) {
		modalMode = 'edit';
		selectedProducto = producto;
		formData = { ...producto };
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
			if (modalMode === 'create') {
				await apiService.createProducto(formData);
				toast.success('Producto creado exitosamente');
			} else {
				await apiService.updateProducto(selectedProducto.id, formData);
				toast.success('Producto actualizado exitosamente');
			}
			showModal = false;
			await loadProductos();
		} catch (error) {
			toast.error('Error al guardar producto');
			console.error(error);
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
</script>

<div class="space-y-6">
	<PageHeader
		title="Inventario"
		subtitle="Gestión de productos y stock"
		buttonText="Nuevo Producto"
		buttonIcon="➕"
		onButtonClick={openCreateModal}
	/>

	<!-- Filters -->
	<div class="card p-4">
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<SearchBar
				bind:value={searchQuery}
				placeholder="Buscar productos..."
				onSearch={handleSearch}
			/>
			<select
				bind:value={categoriaFilter}
				on:change={loadProductos}
				class="select"
			>
				<option value="">Todas las categorías</option>
				{#each categorias as categoria}
					<option value={categoria.id}>{categoria.nombre}</option>
				{/each}
			</select>
		</div>
	</div>

	<!-- Tabla de productos -->
	<div class="card">
		<DataTable
			{columns}
			data={productos}
			{actions}
			{loading}
			emptyMessage="No hay productos registrados"
		/>
	</div>
</div>

<!-- Modal Crear/Editar Producto -->
<Modal
	bind:show={showModal}
	title={modalMode === 'create' ? 'Nuevo Producto' : 'Editar Producto'}
	size="md"
>
	<form on:submit|preventDefault={handleSubmit} class="space-y-4">
		<label class="label">
			<span>Nombre *</span>
			<input
				type="text"
				bind:value={formData.nombre}
				required
				class="input"
				placeholder="Nombre del producto"
			/>
		</label>

		<label class="label">
			<span>Categoría *</span>
			<select bind:value={formData.categoria} required class="select">
				<option value="">Seleccione una categoría</option>
				{#each categorias as categoria}
					<option value={categoria.id}>{categoria.nombre}</option>
				{/each}
			</select>
		</label>

		<div class="grid grid-cols-2 gap-4">
			<label class="label">
				<span>Unidad *</span>
				<select bind:value={formData.unidad} required class="select">
					<option value="kg">Kilogramos (kg)</option>
					<option value="gr">Gramos (gr)</option>
					<option value="lt">Litros (lt)</option>
					<option value="ml">Mililitros (ml)</option>
					<option value="unidad">Unidades</option>
				</select>
			</label>

			<label class="label">
				<span>Stock Mínimo</span>
				<input
					type="number"
					bind:value={formData.stock_minimo}
					step="0.01"
					min="0"
					class="input"
				/>
			</label>
		</div>

		{#if modalMode === 'create'}
			<div class="grid grid-cols-2 gap-4">
				<label class="label">
					<span>Cantidad Inicial</span>
					<input
						type="number"
						bind:value={formData.cantidad_actual}
						step="0.01"
						min="0"
						class="input"
					/>
				</label>

				<label class="label">
					<span>Costo Promedio</span>
					<input
						type="number"
						bind:value={formData.costo_promedio}
						step="0.01"
						min="0"
						class="input"
						placeholder="S/ 0.00"
					/>
				</label>
			</div>
		{/if}
	</form>

	<div slot="footer" class="flex justify-end gap-2">
		<button type="button" class="btn variant-ghost-surface" on:click={() => (showModal = false)}>
			Cancelar
		</button>
		<button type="button" class="btn variant-filled-primary" on:click={handleSubmit}>
			{modalMode === 'create' ? 'Crear' : 'Guardar'}
		</button>
	</div>
</Modal>

<!-- Modal Ajustar Stock -->
<Modal
	bind:show={showAjusteModal}
	title="Ajustar Stock: {selectedProducto?.nombre || ''}"
	size="sm"
>
	<form on:submit|preventDefault={handleAjuste} class="space-y-4">
		<label class="label">
			<span>Tipo de Ajuste *</span>
			<select bind:value={ajusteData.tipo_ajuste} required class="select">
				<option value="entrada">➕ Entrada (Agregar)</option>
				<option value="salida">➖ Salida (Reducir)</option>
			</select>
		</label>

		<label class="label">
			<span>Cantidad *</span>
			<input
				type="number"
				bind:value={ajusteData.cantidad}
				step="0.01"
				min="0.01"
				required
				class="input"
				placeholder="0.00"
			/>
			<small class="text-surface-600-300-token">
				Stock actual: {selectedProducto?.cantidad_actual || 0}
				{selectedProducto?.unidad || ''}
			</small>
		</label>

		<label class="label">
			<span>Razón del Ajuste *</span>
			<textarea
				bind:value={ajusteData.razon}
				required
				rows="3"
				class="textarea"
				placeholder="Explique el motivo del ajuste..."
			/>
		</label>
	</form>

	<div slot="footer" class="flex justify-end gap-2">
		<button
			type="button"
			class="btn variant-ghost-surface"
			on:click={() => (showAjusteModal = false)}
		>
			Cancelar
		</button>
		<button type="button" class="btn variant-filled-primary" on:click={handleAjuste}>
			Confirmar Ajuste
		</button>
	</div>
</Modal>
