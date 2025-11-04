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
	import Book from '$lib/components/icons/Book.svelte';
	import Plus from '$lib/components/icons/Plus.svelte';
	import Edit2 from '$lib/components/icons/Edit2.svelte';
	import Trash2 from '$lib/components/icons/Trash2.svelte';
	import Search from '$lib/components/icons/Search.svelte';
	import Clock from '$lib/components/icons/Clock.svelte';
	import Users from '$lib/components/icons/Users.svelte';
	import Package from '$lib/components/icons/Package.svelte';

	let recetas = [];
	let loading = false;
	let searchQuery = '';
	let filteredRecetas = [];

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

	$: filteredRecetas = searchQuery
		? recetas.filter(
				(r) =>
					r.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
					r.descripcion?.toLowerCase().includes(searchQuery.toLowerCase())
		  )
		: recetas;

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

	function handleSearch() {
		// La búsqueda es reactiva, no necesita función
	}
</script>

<svelte:head>
	<title>Recetas - SIGR</title>
</svelte:head>

<div class="p-6 space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-3">
			<div class="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
				<Book class="h-5 w-5 text-primary" />
			</div>
			<div>
				<h1 class="text-2xl font-bold">Recetas</h1>
				<p class="text-sm text-muted-foreground">Gestión de recetas y sus ingredientes</p>
			</div>
		</div>
		<Button on:click={openCreateModal}>
			<Plus class="h-4 w-4 mr-2" />
			Nueva Receta
		</Button>
	</div>

	<!-- Búsqueda -->
	<Card>
		<CardContent class="p-4">
			<div class="relative">
				<Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
				<Input
					type="text"
					placeholder="Buscar recetas..."
					bind:value={searchQuery}
					class="pl-10"
				/>
			</div>
		</CardContent>
	</Card>

	<!-- Lista de Recetas -->
	{#if loading}
		<div class="flex justify-center py-12">
			<div class="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
		</div>
	{:else if filteredRecetas.length === 0}
		<Card>
			<CardContent class="p-12 text-center">
				<Book class="h-12 w-12 mx-auto text-muted-foreground mb-4" />
				<p class="text-muted-foreground">
					{searchQuery ? 'No se encontraron recetas' : 'No hay recetas registradas'}
				</p>
			</CardContent>
		</Card>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each filteredRecetas as receta}
				<Card class="hover:border-primary/50 transition-colors cursor-pointer" on:click={() => openEditModal(receta)}>
					<CardHeader>
						<CardTitle class="flex items-start justify-between">
							<span class="text-lg">{receta.nombre}</span>
							<Button variant="ghost" size="sm" on:click={(e) => { e.stopPropagation(); openEditModal(receta); }}>
								<Edit2 class="h-4 w-4" />
							</Button>
						</CardTitle>
					</CardHeader>
					<CardContent class="space-y-3">
						{#if receta.descripcion}
							<p class="text-sm text-muted-foreground line-clamp-2">{receta.descripcion}</p>
						{/if}
						
						<div class="flex items-center gap-4 text-sm">
							<div class="flex items-center gap-1.5 text-muted-foreground">
								<Users class="h-4 w-4" />
								<span>{receta.porciones} {receta.porciones === 1 ? 'porción' : 'porciones'}</span>
							</div>
							<div class="flex items-center gap-1.5 text-muted-foreground">
								<Clock class="h-4 w-4" />
								<span>{receta.tiempo_preparacion} min</span>
							</div>
						</div>

						<div class="flex items-center gap-1.5 text-sm text-muted-foreground">
							<Package class="h-4 w-4" />
							<span>{receta.ingredientes?.length || 0} ingredientes</span>
						</div>

						<div class="pt-3 border-t border-border">
							<div class="flex items-center justify-between">
								<span class="text-sm text-muted-foreground">Costo total:</span>
								<span class="text-lg font-semibold">S/ {parseFloat(receta.costo_total || 0).toFixed(2)}</span>
							</div>
							<div class="flex items-center justify-between mt-1">
								<span class="text-xs text-muted-foreground">Por porción:</span>
								<span class="text-sm font-medium">S/ {(parseFloat(receta.costo_total || 0) / (receta.porciones || 1)).toFixed(2)}</span>
							</div>
						</div>
					</CardContent>
				</Card>
			{/each}
		</div>
	{/if}
</div>

<Dialog bind:open={showModal}>
	<div class="space-y-6">
		<!-- Header -->
		<div>
			<h2 class="text-xl font-semibold">
				{modalMode === 'create' ? 'Nueva Receta' : 'Editar Receta'}
			</h2>
			<p class="text-sm text-muted-foreground mt-1">
				{modalMode === 'create' ? 'Crea una nueva receta con sus ingredientes' : 'Modifica la receta y sus ingredientes'}
			</p>
		</div>

		<form on:submit|preventDefault={handleSubmit} class="space-y-6">
			<!-- Información básica -->
			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						<Book class="h-5 w-5" />
						Información de la Receta
					</CardTitle>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-2">
						<label class="text-sm font-medium">Nombre *</label>
						<Input
							type="text"
							bind:value={formData.nombre}
							required
							placeholder="Nombre de la receta"
						/>
					</div>

					<div class="space-y-2">
						<label class="text-sm font-medium">Descripción</label>
						<textarea
							bind:value={formData.descripcion}
							rows="3"
							class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
							placeholder="Descripción de la receta..."
						/>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-2">
							<label class="text-sm font-medium">Porciones</label>
							<Input
								type="number"
								bind:value={formData.porciones}
								min="1"
								required
							/>
						</div>

						<div class="space-y-2">
							<label class="text-sm font-medium">Tiempo (min)</label>
							<Input
								type="number"
								bind:value={formData.tiempo_preparacion}
								min="0"
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			<!-- Agregar ingredientes -->
			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						<Package class="h-5 w-5" />
						Agregar Ingredientes
					</CardTitle>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
						<div class="md:col-span-8 space-y-2">
							<label class="text-sm font-medium">Producto</label>
							<select 
								bind:value={newIngrediente.producto} 
								class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
							>
								<option value="">Seleccione...</option>
								{#each productos as producto}
									<option value={producto.id}>
										{producto.nombre} ({producto.unidad}) - S/ {producto.costo_promedio.toFixed(2)}
									</option>
								{/each}
							</select>
						</div>

						<div class="md:col-span-2 space-y-2">
							<label class="text-sm font-medium">Cantidad</label>
							<Input
								type="number"
								bind:value={newIngrediente.cantidad}
								step="0.01"
								min="0"
							/>
						</div>

						<div class="md:col-span-2">
							<Button
								type="button"
								class="w-full"
								on:click={addIngrediente}
							>
								<Plus class="h-4 w-4 mr-2" />
								Agregar
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			<!-- Lista de ingredientes -->
			{#if formData.ingredientes.length > 0}
				<Card>
					<CardHeader>
						<CardTitle>Ingredientes de la Receta</CardTitle>
					</CardHeader>
					<CardContent>
						<div class="overflow-x-auto">
							<table class="w-full text-sm">
								<thead class="border-b border-border">
									<tr>
										<th class="text-left py-2 font-medium">Ingrediente</th>
										<th class="text-right py-2 font-medium">Cantidad</th>
										<th class="text-right py-2 font-medium">Costo Unit.</th>
										<th class="text-right py-2 font-medium">Subtotal</th>
										<th class="w-16"></th>
									</tr>
								</thead>
								<tbody class="divide-y divide-border">
									{#each formData.ingredientes as ingrediente, index}
										<tr>
											<td class="py-2">{ingrediente.producto_nombre}</td>
											<td class="text-right py-2">
												{ingrediente.cantidad} {ingrediente.producto_unidad}
											</td>
											<td class="text-right py-2">S/ {ingrediente.producto_costo.toFixed(2)}</td>
											<td class="text-right py-2">
												S/ {(ingrediente.cantidad * ingrediente.producto_costo).toFixed(2)}
											</td>
											<td class="text-right py-2">
												<Button
													variant="ghost"
													size="sm"
													on:click={() => removeIngrediente(index)}
												>
													<Trash2 class="h-4 w-4 text-destructive" />
												</Button>
											</td>
										</tr>
									{/each}
								</tbody>
								<tfoot class="border-t-2 border-border font-semibold">
									<tr>
										<td colspan="3" class="text-right py-2">COSTO TOTAL:</td>
										<td class="text-right py-2 text-lg">S/ {getCostoTotal().toFixed(2)}</td>
										<td></td>
									</tr>
									<tr class="text-muted-foreground font-normal">
										<td colspan="3" class="text-right py-1">Costo por porción:</td>
										<td class="text-right py-1">
											S/ {(getCostoTotal() / (formData.porciones || 1)).toFixed(2)}
										</td>
										<td></td>
									</tr>
								</tfoot>
							</table>
						</div>
					</CardContent>
				</Card>
			{/if}
		</form>

		<!-- Footer -->
		<div class="flex justify-end gap-2 pt-4">
			<Button variant="ghost" on:click={() => (showModal = false)}>
				Cancelar
			</Button>
			<Button
				on:click={handleSubmit}
				disabled={formData.ingredientes.length === 0}
			>
				{modalMode === 'create' ? 'Crear Receta' : 'Guardar Cambios'}
			</Button>
		</div>
	</div>
</Dialog>

