<script>
	import { onMount } from 'svelte';
	import { apiService } from '$lib/api';
	import { toast } from '$lib/stores';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import DataTable from '$lib/components/DataTable.svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import Modal from '$lib/components/Modal.svelte';

	let proveedores = [];
	let loading = false;
	let searchQuery = '';

	// Modal state
	let showModal = false;
	let modalMode = 'create';
	let selectedProveedor = null;

	// Form data
	let formData = {
		nombre: '',
		ruc: '',
		direccion: '',
		telefono: '',
		email: '',
		contacto_nombre: '',
		activo: true
	};

	// Columnas de la tabla
	const columns = [
		{ key: 'nombre', label: 'Proveedor' },
		{ key: 'ruc', label: 'RUC' },
		{ key: 'telefono', label: 'Teléfono' },
		{ key: 'email', label: 'Email' },
		{ key: 'contacto_nombre', label: 'Contacto' },
		{
			key: 'activo',
			label: 'Estado',
			format: (val) => (val ? '✅ Activo' : '❌ Inactivo'),
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
			nombre: '',
			ruc: '',
			direccion: '',
			telefono: '',
			email: '',
			contacto_nombre: '',
			activo: true
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
				activo: !proveedor.activo
			});
			toast.success(
				`Proveedor ${!proveedor.activo ? 'activado' : 'desactivado'} exitosamente`
			);
			await loadProveedores();
		} catch (error) {
			toast.error('Error al cambiar estado del proveedor');
			console.error(error);
		}
	}

	async function handleSubmit() {
		try {
			if (modalMode === 'create') {
				await apiService.createSupplier(formData);
				toast.success('Proveedor creado exitosamente');
			} else {
				await apiService.updateSupplier(selectedProveedor.id, formData);
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

<div class="space-y-6">
	<PageHeader
		title="Proveedores"
		subtitle="Gestión de proveedores"
		buttonText="Nuevo Proveedor"
		buttonIcon="➕"
		onButtonClick={openCreateModal}
	/>

	<!-- Búsqueda -->
	<div class="card p-4">
		<SearchBar
			bind:value={searchQuery}
			placeholder="Buscar proveedores..."
			onSearch={handleSearch}
		/>
	</div>

	<!-- Tabla de proveedores -->
	<div class="card">
		<DataTable
			{columns}
			data={proveedores}
			{actions}
			{loading}
			emptyMessage="No hay proveedores registrados"
		/>
	</div>
</div>

<!-- Modal Crear/Editar Proveedor -->
<Modal
	bind:show={showModal}
	title={modalMode === 'create' ? 'Nuevo Proveedor' : 'Editar Proveedor'}
	size="lg"
>
	<form on:submit|preventDefault={handleSubmit} class="space-y-4">
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<label class="label">
				<span>Nombre / Razón Social *</span>
				<input
					type="text"
					bind:value={formData.nombre}
					required
					class="input"
					placeholder="Nombre del proveedor"
				/>
			</label>

			<label class="label">
				<span>RUC *</span>
				<input
					type="text"
					bind:value={formData.ruc}
					required
					pattern="[0-9]{11}"
					maxlength="11"
					class="input"
					placeholder="12345678901"
				/>
			</label>
		</div>

		<label class="label">
			<span>Dirección</span>
			<input
				type="text"
				bind:value={formData.direccion}
				class="input"
				placeholder="Dirección completa"
			/>
		</label>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<label class="label">
				<span>Teléfono</span>
				<input
					type="tel"
					bind:value={formData.telefono}
					class="input"
					placeholder="+51 999 999 999"
				/>
			</label>

			<label class="label">
				<span>Email</span>
				<input
					type="email"
					bind:value={formData.email}
					class="input"
					placeholder="email@proveedor.com"
				/>
			</label>
		</div>

		<label class="label">
			<span>Nombre de Contacto</span>
			<input
				type="text"
				bind:value={formData.contacto_nombre}
				class="input"
				placeholder="Nombre del contacto principal"
			/>
		</label>

		<label class="flex items-center space-x-2">
			<input type="checkbox" bind:checked={formData.activo} class="checkbox" />
			<span>Proveedor Activo</span>
		</label>
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

