<script>
	import { createEventDispatcher } from 'svelte';
	import Dialog from '$lib/components/ui/Dialog.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { apiService } from '$lib/api';
	import { toast } from '$lib/stores';

	export let show = false;
	export let zone = null; // Si es null, es creación; si tiene datos, es edición
	export let mode = 'create'; // 'create' o 'edit'

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
	bind:show
	title={mode === 'edit' ? 'Editar Zona' : 'Nueva Zona'}
	description={mode === 'edit'
		? 'Modifica los datos de la zona'
		: 'Crea una nueva zona para organizar tus mesas'}
	on:close={handleClose}
>
	<form on:submit|preventDefault={handleSubmit} class="space-y-4">
		<!-- Nombre -->
		<div>
			<label for="zone-name" class="block text-sm font-medium mb-2">
				Nombre <span class="text-error-500">*</span>
			</label>
			<input
				id="zone-name"
				type="text"
				bind:value={formData.nombre}
				placeholder="Ej: Salón Principal, Terraza, Bar..."
				class="input w-full"
				required
			/>
		</div>

		<!-- Descripción -->
		<div>
			<label for="zone-description" class="block text-sm font-medium mb-2">
				Descripción
			</label>
			<textarea
				id="zone-description"
				bind:value={formData.descripcion}
				placeholder="Descripción opcional de la zona..."
				rows="3"
				class="textarea w-full"
			/>
		</div>

		<!-- Estado Activo -->
		<div class="flex items-center gap-2">
			<input
				id="zone-active"
				type="checkbox"
				bind:checked={formData.is_active}
				class="checkbox"
			/>
			<label for="zone-active" class="text-sm font-medium">
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
