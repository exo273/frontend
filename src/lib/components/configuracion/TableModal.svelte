<script>
	import { createEventDispatcher } from 'svelte';
	import Dialog from '$lib/components/ui/Dialog.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { apiService } from '$lib/api';
	import { toast } from '$lib/stores';

	export let show = false;
	export let table = null; // Si es null, es creación; si tiene datos, es edición
	export let mode = 'create'; // 'create' o 'edit'
	export let zones = []; // Lista de zonas disponibles

	const dispatch = createEventDispatcher();

	let formData = {
		numero: '',
		zona: '',
		capacidad: 4,
		posicion_x: 0,
		posicion_y: 0,
		ancho: 1,  // en unidades de cuadrícula
		alto: 1,   // en unidades de cuadrícula
		forma: 'cuadrada',
		is_active: true
	};

	let loading = false;

	$: if (table && mode === 'edit') {
		formData = {
			numero: table.numero || '',
			zona: table.zona?.id || table.zona || '',
			capacidad: table.capacidad || 4,
			posicion_x: table.posicion_x || 0,
			posicion_y: table.posicion_y || 0,
			ancho: table.ancho || 1,
			alto: table.alto || 1,
			forma: table.forma || 'cuadrada',
			is_active: table.is_active !== undefined ? table.is_active : true
		};
	} else if (mode === 'create' && table) {
		// Para nuevas mesas con posición predefinida
		formData = {
			numero: '',
			zona: table.zona || (zones.length > 0 ? zones[0].id : ''),
			capacidad: 4,
			posicion_x: table.posicion_x || 0,
			posicion_y: table.posicion_y || 0,
			ancho: 1,
			alto: 1,
			forma: 'cuadrada',
			is_active: true
		};
	} else if (mode === 'create') {
		formData = {
			numero: '',
			zona: zones.length > 0 ? zones[0].id : '',
			capacidad: 4,
			posicion_x: 0,
			posicion_y: 0,
			ancho: 1,
			alto: 1,
			forma: 'cuadrada',
			is_active: true
		};
	}

	async function handleSubmit() {
		// Validación
		if (!formData.numero) {
			toast.error('El número de mesa es requerido');
			return;
		}
		if (!formData.zona) {
			toast.error('Debe seleccionar una zona');
			return;
		}

		loading = true;
		try {
			// Preparar datos sin campos que el backend no acepta
			const dataToSend = {
				numero: String(formData.numero),
				zona: formData.zona,
				capacidad: formData.capacidad,
				posicion_x: formData.posicion_x,
				posicion_y: formData.posicion_y,
				is_active: formData.is_active
			};

			console.log('Enviando datos:', dataToSend);

			if (mode === 'edit' && table) {
				await apiService.updateTable(table.id, dataToSend);
				toast.success('Mesa actualizada correctamente');
			} else {
				await apiService.createTable(dataToSend);
				toast.success('Mesa creada correctamente');
			}
			dispatch('saved');
			handleClose();
		} catch (error) {
			console.error('Error al guardar mesa:', error);
			console.error('Respuesta del servidor:', error.response?.data);
			toast.error(error.response?.data?.detail || error.response?.data?.message || 'Error al guardar mesa');
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
	title={mode === 'edit' ? 'Editar Mesa' : 'Nueva Mesa'}
	description={mode === 'edit' ? 'Modifica los datos de la mesa' : 'Crea una nueva mesa'}
	on:close={handleClose}
>
	<form on:submit|preventDefault={handleSubmit} class="space-y-4">
		<div class="grid grid-cols-2 gap-4">
			<!-- Número de Mesa -->
			<div>
				<label for="table-number" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
					Número <span class="text-red-500">*</span>
				</label>
				<input
					id="table-number"
					type="text"
					bind:value={formData.numero}
					placeholder="1, 2, A1..."
					class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
					required
				/>
			</div>

			<!-- Zona -->
			<div>
				<label for="table-zone" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
					Zona <span class="text-red-500">*</span>
				</label>
				<select 
					id="table-zone" 
					bind:value={formData.zona} 
					class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
					required
				>
					<option value="">Seleccionar zona...</option>
					{#each zones as zone}
						<option value={zone.id}>{zone.nombre}</option>
					{/each}
				</select>
			</div>

			<!-- Capacidad -->
			<div>
				<label for="table-capacity" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
					Capacidad
				</label>
				<input
					id="table-capacity"
					type="number"
					bind:value={formData.capacidad}
					min="1"
					max="20"
					class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
				/>
			</div>

			<!-- Forma -->
			<div>
				<label for="table-shape" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
					Forma
				</label>
				<select 
					id="table-shape" 
					bind:value={formData.forma} 
					class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
				>
					<option value="cuadrada">Cuadrada</option>
					<option value="rectangular">Rectangular</option>
					<option value="redonda">Redonda</option>
				</select>
			</div>
		</div>

		<!-- Dimensiones -->
		<div class="border-t border-gray-200 dark:border-gray-700 pt-4">
			<h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Tamaño (en celdas de cuadrícula)</h4>
			<div class="grid grid-cols-2 gap-4">
				<div>
					<label for="table-width" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Ancho (celdas)
					</label>
					<input
						id="table-width"
						type="number"
						bind:value={formData.ancho}
						min="1"
						max="4"
						step="1"
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
					/>
				</div>

				<div>
					<label for="table-height" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Alto (celdas)
					</label>
					<input
						id="table-height"
						type="number"
						bind:value={formData.alto}
						min="1"
						max="4"
						step="1"
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
					/>
				</div>

				<div>
					<label for="table-x" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Posición Columna
					</label>
					<input
						id="table-x"
						type="number"
						bind:value={formData.posicion_x}
						min="0"
						max="11"
						step="1"
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
						readonly
						title="La posición se establece al hacer clic en la cuadrícula"
					/>
				</div>

				<div>
					<label for="table-y" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Posición Fila
					</label>
					<input
						id="table-y"
						type="number"
						bind:value={formData.posicion_y}
						min="0"
						max="7"
						step="1"
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
						readonly
						title="La posición se establece al hacer clic en la cuadrícula"
					/>
				</div>
			</div>
		</div>

		<!-- Estado Activo -->
		<div class="flex items-center gap-2">
			<input
				id="table-active"
				type="checkbox"
				bind:checked={formData.is_active}
				class="checkbox"
			/>
			<label for="table-active" class="text-sm font-medium">
				Mesa activa
			</label>
		</div>
	</form>

	<div slot="footer" class="flex gap-2">
		<Button variant="outline" on:click={handleClose} disabled={loading}>
			Cancelar
		</Button>
		<Button on:click={handleSubmit} disabled={loading}>
			{loading ? 'Guardando...' : mode === 'edit' ? 'Actualizar' : 'Crear Mesa'}
		</Button>
	</div>
</Dialog>
