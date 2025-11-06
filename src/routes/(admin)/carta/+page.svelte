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
	import Dialog from '$lib/components/ui/Dialog.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Checkbox from '$lib/components/ui/Checkbox.svelte';
	import FileText from '$lib/components/icons/FileText.svelte';
	import Plus from '$lib/components/icons/Plus.svelte';
	import Edit2 from '$lib/components/icons/Edit2.svelte';
	import Search from '$lib/components/icons/Search.svelte';
	import Check from '$lib/components/icons/Check.svelte';
	import X from '$lib/components/icons/X.svelte';

	let menuItems = [];
	let loading = false;
	let searchQuery = '';
	let categoriaFilter = '';
	let filteredItems = [];
	let categorias = [];
	let recetas = [];

	// Modal state
	let showModal = false;
	let modalMode = 'create';
	let selectedItem = null;

	// Modal de categoría
	let showCategoryModal = false;
	let categoryFormData = {
		nombre: '',
		descripcion: ''
	};

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

	$: filteredItems = menuItems.filter((item) => {
		const matchesSearch =
			!searchQuery ||
			item.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			item.descripcion?.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesCategory = !categoriaFilter || item.categoria?.id === parseInt(categoriaFilter);
		return matchesSearch && matchesCategory;
	});

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

	function handleSearch() {
		// Búsqueda reactiva
	}

	function handleCategoryFilter() {
		// Filtro reactivo
	}

	function openCategoryModal() {
		categoryFormData = { nombre: '', descripcion: '' };
		showCategoryModal = true;
	}

	async function handleCategorySubmit() {
		if (!categoryFormData.nombre.trim()) {
			toast.error('El nombre de la categoría es requerido');
			return;
		}

		try {
			await apiService.createMenuCategory({
				nombre: categoryFormData.nombre,
				descripcion: categoryFormData.descripcion || null
			});
			toast.success('Categoría creada exitosamente');
			showCategoryModal = false;
			await loadCategorias();
		} catch (error) {
			toast.error('Error al crear categoría');
			console.error(error);
		}
	}
</script>

<svelte:head>
	<title>Carta/Menú - SIGR</title>
</svelte:head>

<div class="p-6 space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-3">
			<div class="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
				<FileText class="h-5 w-5 text-primary" />
			</div>
			<div>
				<h1 class="text-2xl font-bold">Carta / Menú</h1>
				<p class="text-sm text-muted-foreground">Gestión de platos y bebidas del menú</p>
			</div>
		</div>
		<Button on:click={openCreateModal}>
			<Plus class="h-4 w-4 mr-2" />
			Nuevo Item
		</Button>
	</div>

	<!-- Filtros -->
	<Card>
		<CardContent class="p-4">
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div class="relative">
					<Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						type="text"
						placeholder="Buscar en el menú..."
						bind:value={searchQuery}
						class="pl-10"
					/>
				</div>
				<select 
					bind:value={categoriaFilter} 
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
				>
					<option value="">Todas las categorías</option>
					{#each categorias as categoria}
						<option value={categoria.id}>{categoria.nombre}</option>
					{/each}
				</select>
			</div>
		</CardContent>
	</Card>

	<!-- Lista de items del menú -->
	{#if loading}
		<div class="flex justify-center py-12">
			<div class="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
		</div>
	{:else if filteredItems.length === 0}
		<Card>
			<CardContent class="p-12 text-center">
				<FileText class="h-12 w-12 mx-auto text-muted-foreground mb-4" />
				<p class="text-muted-foreground">
					{searchQuery || categoriaFilter ? 'No se encontraron items' : 'No hay items en el menú'}
				</p>
			</CardContent>
		</Card>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each filteredItems as item}
				<Card class="hover:border-primary/50 transition-colors">
					<CardHeader>
						<CardTitle class="flex items-start justify-between">
							<span class="text-lg">{item.nombre}</span>
							<div class="flex items-center gap-2">
								{#if item.disponible}
									<Badge variant="success">
										<Check class="h-3 w-3 mr-1" />
										Disponible
									</Badge>
								{:else}
									<Badge variant="destructive">
										<X class="h-3 w-3 mr-1" />
										No disponible
									</Badge>
								{/if}
								<Button variant="ghost" size="sm" on:click={() => openEditModal(item)}>
									<Edit2 class="h-4 w-4" />
								</Button>
							</div>
						</CardTitle>
					</CardHeader>
					<CardContent class="space-y-3">
						{#if item.descripcion}
							<p class="text-sm text-muted-foreground line-clamp-2">{item.descripcion}</p>
						{/if}

						{#if item.categoria}
							<Badge variant="outline">{item.categoria.nombre}</Badge>
						{/if}

						<div class="space-y-2 pt-3 border-t border-border">
							<div class="flex items-center justify-between">
								<span class="text-sm text-muted-foreground">Precio:</span>
								<span class="text-lg font-semibold text-green-600">S/ {parseFloat(item.precio).toFixed(2)}</span>
							</div>
							<div class="flex items-center justify-between text-sm">
								<span class="text-muted-foreground">Costo:</span>
								<span>S/ {parseFloat(item.costo || 0).toFixed(2)}</span>
							</div>
							<div class="flex items-center justify-between text-sm">
								<span class="text-muted-foreground">Margen:</span>
								<span class="font-medium">
									{((item.precio - (item.costo || 0)) / item.precio * 100).toFixed(1)}%
								</span>
							</div>
						</div>

						<div class="flex gap-2 pt-2">
							<Button 
								variant="outline" 
								size="sm" 
								class="flex-1"
								on:click={() => toggleDisponibilidad(item)}
							>
								{item.disponible ? 'Deshabilitar' : 'Habilitar'}
							</Button>
							{#if item.receta}
								<Button 
									variant="outline" 
									size="sm"
									on:click={() => recalcularCosto(item)}
								>
									Recalcular
								</Button>
							{/if}
						</div>
					</CardContent>
				</Card>
			{/each}
		</div>
	{/if}
</div>

<!-- Modal Crear/Editar Item -->
<Dialog bind:open={showModal}>
	<div class="space-y-6">
		<!-- Header -->
		<div>
			<h2 class="text-xl font-semibold">
				{modalMode === 'create' ? 'Nuevo Item del Menú' : 'Editar Item del Menú'}
			</h2>
			<p class="text-sm text-muted-foreground mt-1">
				{modalMode === 'create' ? 'Crea un nuevo item para la carta' : 'Modifica el item del menú'}
			</p>
		</div>

		<form on:submit|preventDefault={handleSubmit} class="space-y-4">
			<div class="space-y-2">
				<label class="text-sm font-medium">Nombre del Plato *</label>
				<Input
					type="text"
					bind:value={formData.nombre}
					required
					placeholder="Ej: Lomo Saltado"
				/>
			</div>

			<div class="space-y-2">
				<label class="text-sm font-medium">Descripción</label>
				<textarea
					bind:value={formData.descripcion}
					rows="3"
					class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
					placeholder="Descripción del plato..."
				/>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<label class="text-sm font-medium">Categoría</label>
						<button
							type="button"
							on:click={openCategoryModal}
							class="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
						>
							<Plus class="h-3 w-3" />
							Nueva
						</button>
					</div>
					<select 
						bind:value={formData.categoria} 
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
					>
						<option value="">Sin categoría</option>
						{#each categorias as categoria}
							<option value={categoria.id}>{categoria.nombre}</option>
						{/each}
					</select>
				</div>

				<div class="space-y-2">
					<label class="text-sm font-medium">Receta Asociada</label>
					<select 
						bind:value={formData.receta} 
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
					>
						<option value="">Sin receta</option>
						{#each recetas as receta}
							<option value={receta.id}>
								{receta.nombre} (S/ {receta.costo_total?.toFixed(2) || '0.00'})
							</option>
						{/each}
					</select>
				</div>
			</div>

			<div class="space-y-2">
				<label class="text-sm font-medium">Precio de Venta *</label>
				<Input
					type="number"
					bind:value={formData.precio}
					step="0.01"
					min="0"
					required
					placeholder="S/ 0.00"
				/>
			</div>

			<div class="space-y-2">
				<label class="text-sm font-medium">URL de Imagen</label>
				<Input
					type="url"
					bind:value={formData.imagen_url}
					placeholder="https://ejemplo.com/imagen.jpg"
				/>
			</div>

		<div class="flex items-center space-x-2">
			<Checkbox 
				bind:checked={formData.disponible} 
				id="disponible"
			/>
			<label for="disponible" class="text-sm font-medium">
				Disponible para venta
			</label>
		</div>			{#if formData.receta}
				<Card class="bg-primary/5 border-primary/20">
					<CardContent class="p-4">
						<p class="text-sm text-muted-foreground">
							<strong>Nota:</strong> El costo de este item se calculará automáticamente basándose
							en la receta seleccionada.
						</p>
					</CardContent>
				</Card>
			{/if}
		</form>

		<!-- Footer -->
		<div class="flex justify-end gap-2 pt-4">
			<Button variant="ghost" on:click={() => (showModal = false)}>
				Cancelar
			</Button>
			<Button on:click={handleSubmit}>
				{modalMode === 'create' ? 'Crear Item' : 'Guardar Cambios'}
			</Button>
		</div>
	</div>
</Dialog>

<!-- Modal para crear categoría -->
<Dialog bind:open={showCategoryModal} title="Nueva Categoría">
	<div class="space-y-4">
		<form on:submit|preventDefault={handleCategorySubmit} class="space-y-4">
			<div class="space-y-2">
				<label class="text-sm font-medium">Nombre de la Categoría *</label>
				<Input
					type="text"
					bind:value={categoryFormData.nombre}
					required
					placeholder="Ej: Entradas, Platos de Fondo, Bebidas..."
					autofocus
				/>
			</div>

			<div class="space-y-2">
				<label class="text-sm font-medium">Descripción</label>
				<textarea
					bind:value={categoryFormData.descripcion}
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
