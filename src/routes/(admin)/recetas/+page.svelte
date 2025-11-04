<script>
	import { onMount } from 'svelte';
	import { apiService } from '$lib/api';
	import { toast } from '$lib/stores';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import DataTable from '$lib/components/DataTable.svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import Modal from '$lib/components/Modal.svelte';

	let recetas = [];
	let loading = false;
	let searchQuery = '';

	// Modal state
	let showModal = false;
	let modalMode = 'create';
	let selectedReceta = null;
	let productos = [];

	// Form data
	let formData = {
		nombre: '',
		descripcion: '',
		porciones: 1,
		tiempo_preparacion: 0,
		ingredientes: []
	};

	let newIngrediente = {
		producto: '',
		cantidad: 0
	};

	// Columnas de la tabla
	const columns = [
		{ key: 'nombre', label: 'Receta' },
		{ key: 'descripcion', label: 'Descripción' },
		{
			key: 'porciones',
			label: 'Porciones',
			align: 'center'
		},
		{
			key: 'tiempo_preparacion',
			label: 'Tiempo (min)',
			align: 'center'
		},
		{
			key: 'ingredientes',
			label: 'Ingredientes',
			format: (val) => val?.length || 0,
			align: 'center'
		},
		{
			key: 'costo_total',
			label: 'Costo Total',
			format: (val) => `S/ ${parseFloat(val || 0).toFixed(2)}`,
			align: 'right'
		}
	];

	// Acciones de la tabla
	const actions = [
		{
			label: 'Ver/Editar',
			icon: '✏️',
			class: 'variant-ghost-surface',
			onClick: openEditModal
		}
	];

	onMount(async () => {
		await loadRecetas();
		await loadProductos();
	});

	async function loadRecetas() {
		loading = true;
		try {
			const params = { page_size: 1000 };
			if (searchQuery) params.search = searchQuery;

			const response = await apiService.getRecetas(params);
			recetas = response.results || response;
		} catch (error) {
			toast.error('Error al cargar recetas');
			console.error(error);
		} finally {
			loading = false;
		}
	}

	async function loadProductos() {
		try {
			const response = await apiService.getProductos({ page_size: 1000 });
			productos = response.results || response;
		} catch (error) {
			console.error('Error al cargar productos:', error);
		}
	}

	function openCreateModal() {
		modalMode = 'create';
		formData = {
			nombre: '',
			descripcion: '',
			porciones: 1,
			tiempo_preparacion: 0,
			ingredientes: []
		};
		newIngrediente = {
			producto: '',
			cantidad: 0
		};
		showModal = true;
	}

	function openEditModal(receta) {
		modalMode = 'edit';
		selectedReceta = receta;
		formData = {
			...receta,
			ingredientes: receta.ingredientes.map((ing) => ({
				...ing,
				producto: ing.producto?.id || ing.producto
			}))
		};
		showModal = true;
	}

	function addIngrediente() {
		if (!newIngrediente.producto || newIngrediente.cantidad <= 0) {
			toast.warning('Complete todos los campos del ingrediente');
			return;
		}

		const producto = productos.find((p) => p.id === parseInt(newIngrediente.producto));
		formData.ingredientes = [
			...formData.ingredientes,
			{
				producto: newIngrediente.producto,
				producto_nombre: producto?.nombre || '',
				producto_unidad: producto?.unidad || '',
				producto_costo: producto?.costo_promedio || 0,
				cantidad: newIngrediente.cantidad
			}
		];

		newIngrediente = {
			producto: '',
			cantidad: 0
		};
	}

	function removeIngrediente(index) {
		formData.ingredientes = formData.ingredientes.filter((_, i) => i !== index);
	}

	function getCostoTotal() {
		return formData.ingredientes.reduce(
			(sum, ing) => sum + (ing.producto_costo || 0) * ing.cantidad,
			0
		);
	}

	async function handleSubmit() {
		if (!formData.nombre.trim()) {
			toast.warning('Ingrese el nombre de la receta');
			return;
		}

		if (formData.ingredientes.length === 0) {
			toast.warning('Agregue al menos un ingrediente');
			return;
		}

		try {
			const payload = {
				nombre: formData.nombre,
				descripcion: formData.descripcion,
				porciones: parseInt(formData.porciones),
				tiempo_preparacion: parseInt(formData.tiempo_preparacion),
				ingredientes: formData.ingredientes.map((ing) => ({
					producto: parseInt(ing.producto),
					cantidad: parseFloat(ing.cantidad)
				}))
			};

			if (modalMode === 'create') {
				await apiService.createReceta(payload);
				toast.success('Receta creada exitosamente');
			} else {
				await apiService.updateReceta(selectedReceta.id, payload);
				toast.success('Receta actualizada exitosamente');
			}

			showModal = false;
			await loadRecetas();
		} catch (error) {
			toast.error('Error al guardar receta');
			console.error(error);
		}
	}

	function handleSearch(query) {
		searchQuery = query;
		loadRecetas();
	}
</script>

<div class="space-y-6">
	<PageHeader
		title="Recetas"
		subtitle="Gestión de recetas y sus ingredientes"
		buttonText="Nueva Receta"
		buttonIcon="➕"
		onButtonClick={openCreateModal}
	/>

	<!-- Búsqueda -->
	<div class="card p-4">
		<SearchBar
			bind:value={searchQuery}
			placeholder="Buscar recetas..."
			onSearch={handleSearch}
		/>
	</div>

	<!-- Tabla de recetas -->
	<div class="card">
		<DataTable {columns} data={recetas} {actions} {loading} emptyMessage="No hay recetas registradas" />
	</div>
</div>

<!-- Modal Crear/Editar Receta -->
<Modal
	bind:show={showModal}
	title={modalMode === 'create' ? 'Nueva Receta' : 'Editar Receta'}
	size="xl"
>
	<form on:submit|preventDefault={handleSubmit} class="space-y-6">
		<!-- Información básica -->
		<div class="card variant-ghost-surface p-4 space-y-4">
			<h4 class="h4">📖 Información de la Receta</h4>

			<label class="label">
				<span>Nombre *</span>
				<input
					type="text"
					bind:value={formData.nombre}
					required
					class="input"
					placeholder="Nombre de la receta"
				/>
			</label>

			<label class="label">
				<span>Descripción</span>
				<textarea
					bind:value={formData.descripcion}
					rows="3"
					class="textarea"
					placeholder="Descripción de la receta..."
				/>
			</label>

			<div class="grid grid-cols-2 gap-4">
				<label class="label">
					<span>Porciones</span>
					<input
						type="number"
						bind:value={formData.porciones}
						min="1"
						required
						class="input"
					/>
				</label>

				<label class="label">
					<span>Tiempo de Preparación (min)</span>
					<input
						type="number"
						bind:value={formData.tiempo_preparacion}
						min="0"
						class="input"
					/>
				</label>
			</div>
		</div>

		<!-- Agregar ingredientes -->
		<div class="card variant-ghost-primary p-4 space-y-4">
			<h4 class="h4">📦 Agregar Ingredientes</h4>

			<div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
				<label class="label md:col-span-8">
					<span>Producto</span>
					<select bind:value={newIngrediente.producto} class="select">
						<option value="">Seleccione...</option>
						{#each productos as producto}
							<option value={producto.id}>
								{producto.nombre} ({producto.unidad}) - S/ {producto.costo_promedio.toFixed(2)}
							</option>
						{/each}
					</select>
				</label>

				<label class="label md:col-span-2">
					<span>Cantidad</span>
					<input
						type="number"
						bind:value={newIngrediente.cantidad}
						step="0.01"
						min="0"
						class="input"
					/>
				</label>

				<div class="md:col-span-2">
					<button
						type="button"
						class="btn variant-filled-primary w-full"
						on:click={addIngrediente}
					>
						➕
					</button>
				</div>
			</div>
		</div>

		<!-- Lista de ingredientes -->
		{#if formData.ingredientes.length > 0}
			<div class="card p-4">
				<h4 class="h4 mb-4">🥘 Ingredientes de la Receta</h4>
				<div class="table-container">
					<table class="table table-compact">
						<thead>
							<tr>
								<th>Ingrediente</th>
								<th class="text-right">Cantidad</th>
								<th class="text-right">Costo Unit.</th>
								<th class="text-right">Subtotal</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{#each formData.ingredientes as ingrediente, index}
								<tr>
									<td>{ingrediente.producto_nombre}</td>
									<td class="text-right">
										{ingrediente.cantidad} {ingrediente.producto_unidad}
									</td>
									<td class="text-right">S/ {ingrediente.producto_costo.toFixed(2)}</td>
									<td class="text-right">
										S/ {(ingrediente.cantidad * ingrediente.producto_costo).toFixed(2)}
									</td>
									<td class="text-right">
										<button
											type="button"
											class="btn btn-sm variant-ghost-error"
											on:click={() => removeIngrediente(index)}
										>
											🗑️
										</button>
									</td>
								</tr>
							{/each}
						</tbody>
						<tfoot>
							<tr class="font-bold">
								<td colspan="3" class="text-right">COSTO TOTAL:</td>
								<td class="text-right text-xl">S/ {getCostoTotal().toFixed(2)}</td>
								<td></td>
							</tr>
							<tr>
								<td colspan="3" class="text-right">Costo por porción:</td>
								<td class="text-right">
									S/ {(getCostoTotal() / (formData.porciones || 1)).toFixed(2)}
								</td>
								<td></td>
							</tr>
						</tfoot>
					</table>
				</div>
			</div>
		{/if}
	</form>

	<div slot="footer" class="flex justify-end gap-2">
		<button type="button" class="btn variant-ghost-surface" on:click={() => (showModal = false)}>
			Cancelar
		</button>
		<button
			type="button"
			class="btn variant-filled-primary"
			on:click={handleSubmit}
			disabled={formData.ingredientes.length === 0}
		>
			{modalMode === 'create' ? '💾 Crear Receta' : '💾 Guardar Cambios'}
		</button>
	</div>
</Modal>

