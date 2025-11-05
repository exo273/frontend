<script>
	import { createEventDispatcher } from 'svelte';
	import Checkbox from '$lib/components/ui/Checkbox.svelte';
	import X from '$lib/components/icons/X.svelte';

	export let open = false;
	export let printer = null;

	const dispatch = createEventDispatcher();

	let formData = {
		name: '',
		type: 'thermal',
		connection_type: 'usb',
		ip_address: '',
		port: 9100,
		is_active: true
	};

	$: if (open && printer) {
		formData = {
			name: printer.name || '',
			type: printer.type || 'thermal',
			connection_type: printer.connection_type || 'usb',
			ip_address: printer.ip_address || '',
			port: printer.port || 9100,
			is_active: printer.is_active ?? true
		};
	} else if (open && !printer) {
		formData = {
			name: '',
			type: 'thermal',
			connection_type: 'usb',
			ip_address: '',
			port: 9100,
			is_active: true
		};
	}

	function handleSubmit() {
		if (!formData.name.trim()) {
			alert('El nombre es requerido');
			return;
		}

		if (formData.connection_type === 'network' && !formData.ip_address.trim()) {
			alert('La dirección IP es requerida para conexión por red');
			return;
		}

		dispatch('save', {
			id: printer?.id,
			...formData
		});
	}

	function handleClose() {
		open = false;
	}
</script>

{#if open}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
		<div class="bg-card rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
			<!-- Header -->
			<div class="flex items-center justify-between p-6 border-b border-border">
				<h2 class="text-lg font-semibold">
					{printer ? 'Editar' : 'Nueva'} Impresora
				</h2>
				<button
					on:click={handleClose}
					class="p-1 hover:bg-accent rounded-lg transition-colors"
				>
					<X class="h-5 w-5" />
				</button>
			</div>

			<!-- Form -->
			<form on:submit|preventDefault={handleSubmit} class="p-6 space-y-4">
				<!-- Nombre -->
				<div>
					<label class="block text-sm font-medium mb-2">
						Nombre de la Impresora <span class="text-destructive">*</span>
					</label>
					<input
						type="text"
						bind:value={formData.name}
						placeholder="Ej: Impresora Principal, Impresora Cocina"
						required
						class="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
					/>
				</div>

				<!-- Tipo de impresora -->
				<div>
					<label class="block text-sm font-medium mb-2">
						Tipo de Impresora <span class="text-destructive">*</span>
					</label>
					<select
						bind:value={formData.type}
						required
						class="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
					>
						<option value="thermal">Térmica (Tickets)</option>
						<option value="fiscal">Fiscal (Boletas/Facturas)</option>
					</select>
					<p class="text-xs text-muted-foreground mt-1">
						{#if formData.type === 'thermal'}
							Impresora térmica para tickets de cocina y comanda
						{:else}
							Impresora fiscal para documentos tributarios
						{/if}
					</p>
				</div>

				<!-- Tipo de conexión -->
				<div>
					<label class="block text-sm font-medium mb-2">
						Tipo de Conexión <span class="text-destructive">*</span>
					</label>
					<select
						bind:value={formData.connection_type}
						required
						class="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
					>
						<option value="usb">USB</option>
						<option value="network">Red (Ethernet/WiFi)</option>
					</select>
				</div>

				<!-- Configuración de red (solo si es network) -->
				{#if formData.connection_type === 'network'}
					<div class="space-y-4 p-4 bg-muted/50 rounded-lg">
						<div>
							<label class="block text-sm font-medium mb-2">
								Dirección IP <span class="text-destructive">*</span>
							</label>
							<input
								type="text"
								bind:value={formData.ip_address}
								placeholder="192.168.1.100"
								required
								pattern="^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$"
								class="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
							/>
							<p class="text-xs text-muted-foreground mt-1">
								Dirección IP de la impresora en la red local
							</p>
						</div>

						<div>
							<label class="block text-sm font-medium mb-2">Puerto</label>
							<input
								type="number"
								bind:value={formData.port}
								placeholder="9100"
								min="1"
								max="65535"
								class="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
							/>
							<p class="text-xs text-muted-foreground mt-1">
								Puerto estándar: 9100 (RAW), 515 (LPR)
							</p>
						</div>
					</div>
				{/if}

			<!-- Estado activo -->
			<div class="flex items-center gap-3">
				<Checkbox
					id="printer_active"
					bind:checked={formData.is_active}
				/>
				<label for="printer_active" class="text-sm font-medium cursor-pointer">
					Impresora activa y disponible
				</label>
			</div>				<!-- Botones -->
				<div class="flex gap-3 pt-4">
					<button
						type="button"
						on:click={handleClose}
						class="flex-1 px-4 py-2 border border-input rounded-lg hover:bg-accent transition-colors"
					>
						Cancelar
					</button>
					<button
						type="submit"
						class="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
					>
						{printer ? 'Guardar Cambios' : 'Crear Impresora'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
