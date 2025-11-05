<script>
	import { createEventDispatcher } from 'svelte';
	import Dialog from '$lib/components/ui/Dialog.svelte';
	import Checkbox from '$lib/components/ui/Checkbox.svelte';

	export let open = false;
	export let role = null;
	export let mode = 'create'; // 'create' o 'edit'

	const dispatch = createEventDispatcher();

	let formData = {
		name: '',
		description: '',
		permissions: {}
	};

	let errors = {};

	// Permisos disponibles estructurados
	const availablePermissions = {
		inventory: {
			label: 'Inventario',
			actions: ['read', 'create', 'update', 'delete']
		},
		suppliers: {
			label: 'Proveedores',
			actions: ['read', 'create', 'update', 'delete']
		},
		purchases: {
			label: 'Compras',
			actions: ['read', 'create', 'update', 'delete']
		},
		recipes: {
			label: 'Recetas',
			actions: ['read', 'create', 'update', 'delete']
		},
		pos: {
			label: 'Punto de Venta',
			actions: ['access', 'process_payments', 'cancel_orders']
		},
		reports: {
			label: 'Reportes',
			actions: ['view', 'export']
		},
		config: {
			label: 'Configuración',
			actions: ['view', 'edit']
		}
	};

	const actionLabels = {
		read: 'Ver',
		create: 'Crear',
		update: 'Editar',
		delete: 'Eliminar',
		access: 'Acceder',
		process_payments: 'Procesar pagos',
		cancel_orders: 'Cancelar órdenes',
		view: 'Ver',
		export: 'Exportar',
		edit: 'Editar'
	};

	$: if (open && role && mode === 'edit') {
		formData = {
			name: role.name || '',
			description: role.description || '',
			permissions: { ...(role.permissions || {}) }
		};
	} else if (open && mode === 'create') {
		formData = {
			name: '',
			description: '',
			permissions: {}
		};
	}

	function togglePermission(module, action) {
		if (!formData.permissions[module]) {
			formData.permissions[module] = [];
		}

		const index = formData.permissions[module].indexOf(action);
		if (index > -1) {
			formData.permissions[module].splice(index, 1);
		} else {
			formData.permissions[module].push(action);
		}

		formData.permissions = { ...formData.permissions };
	}

	function hasPermission(module, action) {
		return formData.permissions[module]?.includes(action) || false;
	}

	function validate() {
		errors = {};

		if (!formData.name) errors.name = 'Nombre requerido';

		return Object.keys(errors).length === 0;
	}

	function handleSubmit() {
		if (!validate()) return;

		dispatch('submit', {
			...formData,
			id: role?.id
		});
	}

	function handleClose() {
		errors = {};
		dispatch('close');
	}
</script>

<Dialog {open} on:close={handleClose}>
	<svelte:fragment slot="title">
		{mode === 'create' ? 'Crear Rol' : 'Editar Rol'}
	</svelte:fragment>

	<svelte:fragment slot="description">
		{mode === 'create'
			? 'Define un nuevo rol con permisos personalizados'
			: 'Modifica el rol y sus permisos'}
	</svelte:fragment>

	<div class="space-y-4 py-4">
		<!-- Nombre del rol -->
		<div>
			<label class="block text-sm font-medium mb-2">Nombre del Rol *</label>
			<input
				type="text"
				bind:value={formData.name}
				placeholder="ej: Gerente, Cajero, Mesero"
				class="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary {errors.name
					? 'border-destructive'
					: ''}"
			/>
			{#if errors.name}
				<p class="text-xs text-destructive mt-1">{errors.name}</p>
			{/if}
		</div>

		<!-- Descripción -->
		<div>
			<label class="block text-sm font-medium mb-2">Descripción (Opcional)</label>
			<textarea
				bind:value={formData.description}
				placeholder="Descripción del rol y sus responsabilidades"
				rows="2"
				class="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
			></textarea>
		</div>

		<!-- Permisos -->
		<div>
			<label class="block text-sm font-medium mb-3">Permisos</label>

			<div class="space-y-4 max-h-96 overflow-y-auto pr-2">
				{#each Object.entries(availablePermissions) as [module, { label, actions }]}
					<div class="border border-border rounded-lg p-4">
						<h4 class="font-medium text-sm mb-3">{label}</h4>

					<div class="grid grid-cols-2 gap-2">
						{#each actions as action}
							<label class="flex items-center gap-2 cursor-pointer hover:bg-accent p-2 rounded">
								<Checkbox
									checked={hasPermission(module, action)}
									on:click={() => togglePermission(module, action)}
								/>
								<span class="text-sm">{actionLabels[action] || action}</span>
							</label>
						{/each}
					</div>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<svelte:fragment slot="footer">
		<button
			type="button"
			on:click={handleClose}
			class="px-4 py-2 border border-input rounded-lg hover:bg-accent transition-colors text-sm font-medium"
		>
			Cancelar
		</button>
		<button
			type="button"
			on:click={handleSubmit}
			class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
		>
			{mode === 'create' ? 'Crear Rol' : 'Guardar Cambios'}
		</button>
	</svelte:fragment>
</Dialog>
