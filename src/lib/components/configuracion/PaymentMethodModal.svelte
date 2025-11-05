<script>
	import { createEventDispatcher } from 'svelte';
	import Checkbox from '$lib/components/ui/Checkbox.svelte';
	import Upload from '$lib/components/icons/Upload.svelte';
	import Image from '$lib/components/icons/Image.svelte';
	import X from '$lib/components/icons/X.svelte';

	export let open = false;
	export let paymentMethod = null;

	const dispatch = createEventDispatcher();

	let formData = {
		name: '',
		description: '',
		logo: null,
		is_active: true
	};

	let logoPreview = null;

	$: if (open && paymentMethod) {
		formData = {
			name: paymentMethod.name || '',
			description: paymentMethod.description || '',
			logo: null,
			is_active: paymentMethod.is_active ?? true
		};
		logoPreview = paymentMethod.logo_url || null;
	} else if (open && !paymentMethod) {
		formData = {
			name: '',
			description: '',
			logo: null,
			is_active: true
		};
		logoPreview = null;
	}

	function handleLogoChange(event) {
		const file = event.target.files[0];
		if (file) {
			formData.logo = file;
			const reader = new FileReader();
			reader.onload = (e) => {
				logoPreview = e.target.result;
			};
			reader.readAsDataURL(file);
		}
	}

	function handleSubmit() {
		if (!formData.name.trim()) {
			alert('El nombre es requerido');
			return;
		}

		dispatch('save', {
			id: paymentMethod?.id,
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
					{paymentMethod ? 'Editar' : 'Nuevo'} Método de Pago
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
				<!-- Logo -->
				<div>
					<label class="block text-sm font-medium mb-2">Logo del Método de Pago</label>
					<div class="flex items-center gap-4">
						{#if logoPreview}
							<img src={logoPreview} alt="Preview" class="h-20 w-20 object-contain rounded-lg border border-border" />
						{:else}
							<div class="h-20 w-20 bg-muted rounded-lg flex items-center justify-center border border-border">
								<Image class="h-8 w-8 text-muted-foreground" />
							</div>
						{/if}
						<label
							class="flex-1 flex flex-col items-center gap-2 px-4 py-3 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors"
						>
							<Upload class="h-5 w-5 text-muted-foreground" />
							<span class="text-sm text-muted-foreground">
								{logoPreview ? 'Cambiar logo' : 'Subir logo'}
							</span>
							<input
								type="file"
								accept="image/*"
								on:change={handleLogoChange}
								class="hidden"
							/>
						</label>
					</div>
					<p class="text-xs text-muted-foreground mt-1">
						Recomendado: PNG o SVG con fondo transparente
					</p>
				</div>

				<!-- Nombre -->
				<div>
					<label class="block text-sm font-medium mb-2">
						Nombre <span class="text-destructive">*</span>
					</label>
					<input
						type="text"
						bind:value={formData.name}
						placeholder="Ej: Visa, Mastercard, Efectivo"
						required
						class="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
					/>
				</div>

				<!-- Descripción -->
				<div>
					<label class="block text-sm font-medium mb-2">Descripción</label>
					<textarea
						bind:value={formData.description}
						placeholder="Información adicional sobre este método de pago"
						rows="3"
						class="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
					/>
				</div>

			<!-- Estado activo -->
			<div class="flex items-center gap-3">
				<Checkbox
					id="is_active"
					bind:checked={formData.is_active}
				/>
				<label for="is_active" class="text-sm font-medium cursor-pointer">
					Método de pago activo
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
						{paymentMethod ? 'Guardar Cambios' : 'Crear Método'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
