<script>
	import { onMount } from 'svelte';
	import { apiService } from '$lib/api';
	import { toast } from '$lib/stores';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import DataTable from '$lib/components/DataTable.svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import Modal from '$lib/components/Modal.svelte';

	let menuItems = [];
	let loading = false;
	let searchQuery = '';
	let categoriaFilter = '';
	let categorias = [];
	let recetas = [];

	// Modal state
	let showModal = false;
	let modalMode = 'create';
	let selectedItem = null;

	// Form data
	let formData = {
		nombre: '',
		descripcion: '',
		categoria: '',
		precio: 0,
		receta: '',
		disponible: true,
		imagen_url: ''
	};

	// Columnas de la tabla
	const columns = [
		{ key: 'nombre', label: 'Plato' },
		{ key: 'descripcion', label: 'Descripción' },
		{
			key: 'categoria',
			label: 'Categoría',
			format: (val) => val?.nombre || '-'
		},
		{
			key: 'precio',
			label: 'Precio',
			format: (val) => `S/ ${parseFloat(val).toFixed(2)}`,
			align: 'right'
		},
		{
			key: 'costo',
			label: 'Costo',
			format: (val) => `S/ ${parseFloat(val || 0).toFixed(2)}`,
			align: 'right'
		},
		{
			key: 'margen',
			label: 'Margen',
			format: (val, row) => {
				const margen = ((row.precio - (row.costo || 0)) / row.precio) * 100;
				return `${margen.toFixed(1)}%`;
			},
			align: 'center'
		},
		{
			key: 'disponible',
			label: 'Estado',
			format: (val) => (val ? '✅ Disponible' : '❌ No disponible'),
			align: 'center'
		}
	];

	// Acciones de la tabla
	const actions = [
		{
			label: 'Editar',
			icon: '✏️',
			class: 'variant-ghost-surface',
			onClick: openEditModal
		},
		{
			label: 'Toggle',
			icon: '🔄',
			class: 'variant-ghost-warning',
			onClick: toggleDisponibilidad
		},
		{
			label: 'Recalcular',
			icon: '🔢',
			class: 'variant-ghost-primary',
			onClick: recalcularCosto
		}
	];

	onMount(async () => {
		await Promise.all([loadMenuItems(), loadCategorias(), loadRecetas()]);
	});

	async function loadMenuItems() {
		loading = true;
		try {
			const params = { page_size: 1000 };
			if (searchQuery) params.search = searchQuery;
			if (categoriaFilter) params.categoria = categoriaFilter;

			const response = await apiService.getMenuItems(params);
			menuItems = response.results || response;
		} catch (error) {
			toast.error('Error al cargar items del menú');
			console.error(error);
		} finally {
			loading = false;
		}
	}

	async function loadCategorias() {
		try {
			categorias = await apiService.getMenuCategories();
		} catch (error) {
			console.error('Error al cargar categorías:', error);
		}
	}

	async function loadRecetas() {
		try {
			const response = await apiService.getRecetas({ page_size: 1000 });
			recetas = response.results || response;
		} catch (error) {
			console.error('Error al cargar recetas:', error);
		}
	}

	function openCreateModal() {
		modalMode = 'create';
		formData = {
			nombre: '',
			descripcion: '',
			categoria: '',
			precio: 0,
			receta: '',
			disponible: true,
			imagen_url: ''
		};
		showModal = true;
	}

	function openEditModal(item) {
		modalMode = 'edit';
		selectedItem = item;
		formData = {
			...item,
			categoria: item.categoria?.id || item.categoria,
			receta: item.receta?.id || item.receta || ''
		};
		showModal = true;
	}

	async function toggleDisponibilidad(item) {
		try {
			await apiService.updateMenuItem(item.id, {
				...item,
				disponible: !item.disponible,
				categoria: item.categoria?.id || item.categoria,
				receta: item.receta?.id || item.receta || null
			});
			toast.success(`Item ${!item.disponible ? 'habilitado' : 'deshabilitado'} exitosamente`);
			await loadMenuItems();
		} catch (error) {
			toast.error('Error al cambiar disponibilidad');
			console.error(error);
		}
	}

	async function recalcularCosto(item) {
		try {
			await apiService.recalculateCost(item.id);
			toast.success('Costo recalculado exitosamente');
			await loadMenuItems();
		} catch (error) {
			toast.error('Error al recalcular costo');
			console.error(error);
		}
	}

	async function handleSubmit() {
		if (!formData.nombre.trim()) {
			toast.warning('Ingrese el nombre del plato');
			return;
		}

		try {
			const payload = {
				nombre: formData.nombre,
				descripcion: formData.descripcion,
				categoria: formData.categoria ? parseInt(formData.categoria) : null,
				precio: parseFloat(formData.precio),
				receta: formData.receta ? parseInt(formData.receta) : null,
				disponible: formData.disponible,
				imagen_url: formData.imagen_url || null
			};

			if (modalMode === 'create') {
				await apiService.createMenuItem(payload);
				toast.success('Item del menú creado exitosamente');
			} else {
				await apiService.updateMenuItem(selectedItem.id, payload);
				toast.success('Item del menú actualizado exitosamente');
			}

			showModal = false;
			await loadMenuItems();
		} catch (error) {
			toast.error('Error al guardar item del menú');
			console.error(error);
		}
	}

	function handleSearch(query) {
		searchQuery = query;
		loadMenuItems();
	}
</script>

<div class="space-y-6">
	<PageHeader
		title="Carta / Menú"
		subtitle="Gestión de platos y bebidas del menú"
		buttonText="Nuevo Item"
		buttonIcon="➕"
		onButtonClick={openCreateModal}
	/>

	<!-- Filters -->
	<div class="card p-4">
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<SearchBar
				bind:value={searchQuery}
				placeholder="Buscar en el menú..."
				onSearch={handleSearch}
			/>
			<select bind:value={categoriaFilter} on:change={loadMenuItems} class="select">
				<option value="">Todas las categorías</option>
				{#each categorias as categoria}
					<option value={categoria.id}>{categoria.nombre}</option>
				{/each}
			</select>
		</div>
	</div>

	<!-- Tabla de items del menú -->
	<div class="card">
		<DataTable
			{columns}
			data={menuItems}
			{actions}
			{loading}
			emptyMessage="No hay items en el menú"
		/>
	</div>
</div>

<!-- Modal Crear/Editar Item -->
<Modal
	bind:show={showModal}
	title={modalMode === 'create' ? 'Nuevo Item del Menú' : 'Editar Item del Menú'}
	size="lg"
>
	<form on:submit|preventDefault={handleSubmit} class="space-y-4">
		<label class="label">
			<span>Nombre del Plato *</span>
			<input
				type="text"
				bind:value={formData.nombre}
				required
				class="input"
				placeholder="Ej: Lomo Saltado"
			/>
		</label>

		<label class="label">
			<span>Descripción</span>
			<textarea
				bind:value={formData.descripcion}
				rows="3"
				class="textarea"
				placeholder="Descripción del plato..."
			/>
		</label>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<label class="label">
				<span>Categoría</span>
				<select bind:value={formData.categoria} class="select">
					<option value="">Sin categoría</option>
					{#each categorias as categoria}
						<option value={categoria.id}>{categoria.nombre}</option>
					{/each}
				</select>
			</label>

			<label class="label">
				<span>Receta Asociada</span>
				<select bind:value={formData.receta} class="select">
					<option value="">Sin receta</option>
					{#each recetas as receta}
						<option value={receta.id}>
							{receta.nombre} (S/ {receta.costo_total?.toFixed(2) || '0.00'})
						</option>
					{/each}
				</select>
			</label>
		</div>

		<label class="label">
			<span>Precio de Venta *</span>
			<input
				type="number"
				bind:value={formData.precio}
				step="0.01"
				min="0"
				required
				class="input"
				placeholder="S/ 0.00"
			/>
		</label>

		<label class="label">
			<span>URL de Imagen</span>
			<input
				type="url"
				bind:value={formData.imagen_url}
				class="input"
				placeholder="https://ejemplo.com/imagen.jpg"
			/>
		</label>

		<label class="flex items-center space-x-2">
			<input type="checkbox" bind:checked={formData.disponible} class="checkbox" />
			<span>Disponible para venta</span>
		</label>

		{#if formData.receta}
			<div class="card variant-ghost-primary p-4">
				<p class="text-sm">
					💡 <strong>Nota:</strong> El costo de este item se calculará automáticamente basándose
					en la receta seleccionada.
				</p>
			</div>
		{/if}
	</form>

	<div slot="footer" class="flex justify-end gap-2">
		<button type="button" class="btn variant-ghost-surface" on:click={() => (showModal = false)}>
			Cancelar
		</button>
		<button type="button" class="btn variant-filled-primary" on:click={handleSubmit}>
			{modalMode === 'create' ? '💾 Crear Item' : '💾 Guardar Cambios'}
		</button>
	</div>
</Modal>
