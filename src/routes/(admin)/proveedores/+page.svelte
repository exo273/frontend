<script>
	import { onMount } from 'svelte';
	import { apiService } from '$lib/api';
	import { toast } from '$lib/stores';
	import Card from '$lib/components/ui/Card.svelte';
	import CardContent from '$lib/components/ui/CardContent.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Dialog from '$lib/components/ui/Dialog.svelte';
	import Users from '$lib/components/icons/Users.svelte';
	import Plus from '$lib/components/icons/Plus.svelte';
	import Edit from '$lib/components/icons/Edit.svelte';
	import Activity from '$lib/components/icons/Activity.svelte';

	let proveedores = [];
	let loading = false;
	let searchQuery = '';

	// Modal state
	let showModal = false;
	let modalMode = 'create';
	let selectedProveedor = null;

	// Form data
	let formData = {
		name: '',
		rut: '',
		address: '',
		city: '',
		region: '',
		phone: '',
		email: '',
		website: '',
		contact_person: '',
		notes: '',
		is_active: true
	};

	// Columnas de la tabla - sin emojis
	const columns = [
		{ key: 'name', label: 'Proveedor' },
		{ key: 'rut', label: 'RUT' },
		{ key: 'phone', label: 'Teléfono' },
		{ key: 'email', label: 'Email' },
		{ key: 'contact_person', label: 'Contacto' },
		{
			key: 'is_active',
			label: 'Estado',
			align: 'center'
		}
	];

	// Acciones de la tabla - sin emojis
	const actions = [
		{
			label: 'Editar',
			icon: Edit,
			class: 'variant-ghost-surface',
			onClick: openEditModal
		},
		{
			label: 'Toggle',
			icon: Activity,
			class: 'variant-ghost-warning',
			onClick: toggleProveedorStatus
		}
	];

	onMount(async () => {
		await loadProveedores();
	});

	async function loadProveedores() {
		loading = true;
		try {
			const params = { page_size: 1000 };
			if (searchQuery) params.search = searchQuery;

			const response = await apiService.getSuppliers(params);
			proveedores = response.results || response;
		} catch (error) {
			toast.error('Error al cargar proveedores');
			console.error(error);
		} finally {
			loading = false;
		}
	}

	function openCreateModal() {
		modalMode = 'create';
		formData = {
			name: '',
			rut: '',
			address: '',
			city: '',
			region: '',
			phone: '',
			email: '',
			website: '',
			contact_person: '',
			notes: '',
			is_active: true
		};
		showModal = true;
	}

	function openEditModal(proveedor) {
		modalMode = 'edit';
		selectedProveedor = proveedor;
		formData = { ...proveedor };
		showModal = true;
	}

	async function toggleProveedorStatus(proveedor) {
		try {
			await apiService.updateSupplier(proveedor.id, {
				...proveedor,
				is_active: !proveedor.is_active
			});
			toast.success(
				`Proveedor ${!proveedor.is_active ? 'activado' : 'desactivado'} exitosamente`
			);
			await loadProveedores();
		} catch (error) {
			toast.error('Error al cambiar estado del proveedor');
			console.error(error);
		}
	}

	async function handleSubmit() {
		try {
			// Aplicar valores por defecto para ciudad y región si están vacíos
			const dataToSend = {
				...formData,
				city: formData.city || 'Santiago',
				region: formData.region || 'Región Metropolitana'
			};

			if (modalMode === 'create') {
				await apiService.createSupplier(dataToSend);
				toast.success('Proveedor creado exitosamente');
			} else {
				await apiService.updateSupplier(selectedProveedor.id, dataToSend);
				toast.success('Proveedor actualizado exitosamente');
			}
			showModal = false;
			await loadProveedores();
		} catch (error) {
			toast.error('Error al guardar proveedor');
			console.error(error);
		}
	}

	function handleSearch(query) {
		searchQuery = query;
		loadProveedores();
	}
</script>

<svelte:head>
	<title>Proveedores - SIGR</title>
</svelte:head>

<div class="p-6 space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-3">
			<div class="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
				<Users class="h-5 w-5 text-primary" />
			</div>
			<div>
				<h1 class="text-2xl font-bold">Proveedores</h1>
				<p class="text-sm text-muted-foreground">Gestión de proveedores</p>
			</div>
		</div>
		<Button on:click={openCreateModal}>
			<Plus class="h-4 w-4 mr-2" />
			Nuevo Proveedor
		</Button>
	</div>

	<!-- Búsqueda -->
	<Card>
		<CardContent class="pt-6">
			<Input
				bind:value={searchQuery}
				on:input={() => loadProveedores()}
				placeholder="Buscar proveedores..."
				class="w-full"
			/>
		</CardContent>
	</Card>

	<!-- Tabla de proveedores -->
	<Card>
		<CardContent class="p-0">
			{#if loading}
				<div class="flex items-center justify-center py-8">
					<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
				</div>
			{:else if proveedores.length === 0}
				<div class="text-center py-12">
					<Users class="h-12 w-12 mx-auto text-muted-foreground mb-4" />
					<p class="text-muted-foreground">No hay proveedores registrados</p>
				</div>
			{:else}
				<div class="overflow-x-auto">
					<table class="w-full">
						<thead>
							<tr class="border-b border-border">
								<th class="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Proveedor</th>
								<th class="text-left py-3 px-4 text-sm font-medium text-muted-foreground">RUT</th>
								<th class="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Teléfono</th>
								<th class="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
								<th class="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Contacto</th>
								<th class="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
								<th class="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
							</tr>
						</thead>
						<tbody>
							{#each proveedores as proveedor}
								<tr class="border-b border-border hover:bg-accent transition-colors">
									<td class="py-3 px-4 font-medium">{proveedor.name}</td>
									<td class="py-3 px-4 text-sm text-muted-foreground">{proveedor.rut}</td>
									<td class="py-3 px-4 text-sm">{proveedor.phone || '-'}</td>
									<td class="py-3 px-4 text-sm">{proveedor.email || '-'}</td>
									<td class="py-3 px-4 text-sm">{proveedor.contact_person || '-'}</td>
									<td class="py-3 px-4 text-center">
										<Badge variant={proveedor.is_active ? 'success' : 'secondary'}>
											{proveedor.is_active ? 'Activo' : 'Inactivo'}
										</Badge>
									</td>
									<td class="py-3 px-4 text-right">
										<div class="flex items-center justify-end gap-2">
											<Button variant="ghost" size="sm" on:click={() => openEditModal(proveedor)}>
												<Edit class="h-4 w-4" />
											</Button>
											<Button variant="ghost" size="sm" on:click={() => toggleProveedorStatus(proveedor)}>
												<Activity class="h-4 w-4" />
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

<!-- Modal Crear/Editar Proveedor -->
{#if showModal}
	<Dialog open={showModal} onClose={() => (showModal = false)}>
		<div class="space-y-6">
			<div>
				<h2 class="text-lg font-semibold">{modalMode === 'create' ? 'Nuevo Proveedor' : 'Editar Proveedor'}</h2>
			</div>

			<form on:submit|preventDefault={handleSubmit} class="space-y-4">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div class="space-y-2">
						<label class="text-sm font-medium">Nombre / Razón Social *</label>
						<Input
							bind:value={formData.name}
							required
							placeholder="Nombre del proveedor"
						/>
					</div>

					<div class="space-y-2">
						<label class="text-sm font-medium">RUT *</label>
						<Input
							bind:value={formData.rut}
							required
							maxlength="12"
							placeholder="12.345.678-9"
						/>
					</div>
				</div>

				<div class="space-y-2">
					<label class="text-sm font-medium">Dirección</label>
					<Input
						bind:value={formData.address}
						placeholder="Dirección completa"
					/>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div class="space-y-2">
						<label class="text-sm font-medium">Ciudad</label>
						<Input
							bind:value={formData.city}
							placeholder="Santiago"
						/>
					</div>

					<div class="space-y-2">
						<label class="text-sm font-medium">Región</label>
						<Input
							bind:value={formData.region}
							placeholder="Región Metropolitana"
						/>
					</div>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div class="space-y-2">
						<label class="text-sm font-medium">Teléfono</label>
						<Input
							type="tel"
							bind:value={formData.phone}
							placeholder="+56 9 1234 5678"
						/>
					</div>

					<div class="space-y-2">
						<label class="text-sm font-medium">Email</label>
						<Input
							type="email"
							bind:value={formData.email}
							placeholder="email@proveedor.cl"
						/>
					</div>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div class="space-y-2">
						<label class="text-sm font-medium">Nombre de Contacto</label>
						<Input
							bind:value={formData.contact_person}
							placeholder="Nombre del contacto principal"
						/>
					</div>

					<div class="space-y-2">
						<label class="text-sm font-medium">Sitio Web</label>
						<Input
							type="url"
							bind:value={formData.website}
							placeholder="https://www.proveedor.cl"
						/>
					</div>
				</div>

				<div class="space-y-2">
					<label class="text-sm font-medium">Notas</label>
					<textarea
						bind:value={formData.notes}
						placeholder="Notas adicionales sobre el proveedor"
						class="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-background"
					/>
				</div>

				<label class="flex items-center space-x-2">
					<input type="checkbox" bind:checked={formData.is_active} class="h-4 w-4 rounded border-input" />
					<span class="text-sm font-medium">Proveedor Activo</span>
				</label>

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