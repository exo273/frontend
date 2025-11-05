<script>
	import { createEventDispatcher } from 'svelte';
	import Dialog from '$lib/components/ui/Dialog.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { apiService } from '$lib/api';
	import { toast } from '$lib/stores';

	export let show = false;
	export let zone = null; // Si es null, es creación; si tiene datos, es edición
	export let mode = 'create'; // 'create' o 'edit'

	$: console.log('🟡 ZoneModal - show cambió a:', show);

	const dispatch = createEventDispatcher();

	let formData = {
		nombre: '',
		descripcion: '',
		is_active: true
	};

	let loading = false;

	$: if (zone && mode === 'edit') {
		formData = {
			nombre: zone.nombre || '',
			descripcion: zone.descripcion || '',
			is_active: zone.is_active !== undefined ? zone.is_active : true
		};
	} else if (mode === 'create') {
		formData = {
			nombre: '',
			descripcion: '',
			is_active: true
		};
	}

	async function handleSubmit() {
		// Validación
		if (!formData.nombre.trim()) {
			toast.error('El nombre de la zona es requerido');
			return;
		}

		loading = true;
		try {
			if (mode === 'edit' && zone) {
				await apiService.updateZone(zone.id, formData);
				toast.success('Zona actualizada correctamente');
			} else {
				await apiService.createZone(formData);
				toast.success('Zona creada correctamente');
			}
			dispatch('saved');
			handleClose();
		} catch (error) {
			console.error('Error al guardar zona:', error);
			toast.error(error.response?.data?.detail || 'Error al guardar zona');
		} finally {
			loading = false;
		}
	}

	function handleClose() {
		show = false;
		dispatch('close');
	}
</script>

<Dialog
	bind:open={show}
	title={mode === 'edit' ? 'Editar Zona' : 'Nueva Zona'}
	description={mode === 'edit'
		? 'Modifica los datos de la zona'
		: 'Crea una nueva zona para organizar tus mesas'}
	on:close={handleClose}
>
	<form on:submit|preventDefault={handleSubmit} class="space-y-4">
		<!-- Nombre -->
		<div>
			<label for="zone-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
				Nombre <span class="text-red-500">*</span>
			</label>
			<input
				id="zone-name"
				type="text"
				bind:value={formData.nombre}
				placeholder="Ej: Salón Principal, Terraza, Bar..."
				class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
				required
			/>
		</div>

		<!-- Descripción -->
		<div>
			<label for="zone-description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
				Descripción
			</label>
			<textarea
				id="zone-description"
				bind:value={formData.descripcion}
				placeholder="Descripción opcional de la zona..."
				rows="3"
				class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
			/>
		</div>

		<!-- Estado Activo -->
		<div class="flex items-center gap-2">
			<input
				id="zone-active"
				type="checkbox"
				bind:checked={formData.is_active}
				class="w-4 h-4 text-primary-600 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 dark:focus:ring-primary-600"
			/>
			<label for="zone-active" class="text-sm font-medium text-gray-700 dark:text-gray-300">
				Zona activa
			</label>
		</div>
	</form>

	<div slot="footer" class="flex gap-2">
		<Button variant="outline" on:click={handleClose} disabled={loading}>
			Cancelar
		</Button>
		<Button on:click={handleSubmit} disabled={loading}>
			{loading ? 'Guardando...' : mode === 'edit' ? 'Actualizar' : 'Crear Zona'}
		</Button>
	</div>
</Dialog>
