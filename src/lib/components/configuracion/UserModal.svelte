<script>
	import { createEventDispatcher } from 'svelte';
	import Dialog from '$lib/components/ui/Dialog.svelte';
	import Checkbox from '$lib/components/ui/Checkbox.svelte';
	import Upload from '$lib/components/icons/Upload.svelte';
	import Image from '$lib/components/icons/Image.svelte';
	import X from '$lib/components/icons/X.svelte';

	export let open = false;
	export let user = null;
	export let roles = [];
	export let mode = 'create'; // 'create' o 'edit'

	const dispatch = createEventDispatcher();

	let formData = {
		email: '',
		first_name: '',
		last_name: '',
		phone: '',
		role: null,
		password: '',
		password2: '',
		is_active: true,
		profile_image: null
	};

	let profileImagePreview = null;
	let errors = {};

	$: if (open && user && mode === 'edit') {
		formData = {
			email: user.email || '',
			first_name: user.first_name || '',
			last_name: user.last_name || '',
			phone: user.phone || '',
			role: user.role || null,
			password: '',
			password2: '',
			is_active: user.is_active !== false,
			profile_image: null
		};
		profileImagePreview = user.profile_image_url || null;
	} else if (open && mode === 'create') {
		formData = {
			email: '',
			first_name: '',
			last_name: '',
			phone: '',
			role: null,
			password: '',
			password2: '',
			is_active: true,
			profile_image: null
		};
		profileImagePreview = null;
	}

	function handleImageChange(event) {
		const file = event.target.files[0];
		if (file) {
			formData.profile_image = file;
			const reader = new FileReader();
			reader.onload = (e) => {
				profileImagePreview = e.target.result;
			};
			reader.readAsDataURL(file);
		}
	}

	function removeImage() {
		formData.profile_image = null;
		profileImagePreview = null;
	}

	function validate() {
		errors = {};

		if (!formData.email) errors.email = 'Email requerido';
		if (!formData.first_name) errors.first_name = 'Nombre requerido';
		if (!formData.last_name) errors.last_name = 'Apellido requerido';
		if (!formData.role) errors.role = 'Rol requerido';

		if (mode === 'create') {
			if (!formData.password) errors.password = 'Contraseña requerida';
			if (formData.password && formData.password.length < 8)
				errors.password = 'Mínimo 8 caracteres';
			if (formData.password !== formData.password2) errors.password2 = 'Las contraseñas no coinciden';
		}

		return Object.keys(errors).length === 0;
	}

	function handleSubmit() {
		if (!validate()) return;

		dispatch('submit', {
			...formData,
			id: user?.id
		});
	}

	function handleClose() {
		errors = {};
		dispatch('close');
	}
</script>

<Dialog {open} on:close={handleClose}>
	<svelte:fragment slot="title">
		{mode === 'create' ? 'Invitar Usuario' : 'Editar Usuario'}
	</svelte:fragment>

	<svelte:fragment slot="description">
		{mode === 'create'
			? 'Crea un nuevo usuario y asigna su rol en el sistema'
			: 'Modifica la información del usuario'}
	</svelte:fragment>

	<div class="space-y-4 py-4">
		<!-- Foto de perfil -->
		<div>
			<label class="block text-sm font-medium mb-2">Foto de Perfil (Opcional)</label>

			<div class="flex items-center gap-4">
				{#if profileImagePreview}
					<div class="relative">
						<div
							class="h-20 w-20 rounded-full overflow-hidden border-2 border-border bg-muted flex items-center justify-center"
						>
							<img src={profileImagePreview} alt="Perfil" class="h-full w-full object-cover" />
						</div>
						<button
							type="button"
							on:click={removeImage}
							class="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90"
						>
							<X class="h-3 w-3" />
						</button>
					</div>
				{:else}
					<div
						class="h-20 w-20 rounded-full border-2 border-dashed border-border bg-muted flex items-center justify-center"
					>
						<Image class="h-8 w-8 text-muted-foreground" />
					</div>
				{/if}

				<label
					class="inline-flex items-center gap-2 px-4 py-2 border border-input rounded-lg hover:bg-accent cursor-pointer transition-colors"
				>
					<Upload class="h-4 w-4" />
					<span class="text-sm font-medium">Subir Foto</span>
					<input type="file" accept="image/*" on:change={handleImageChange} class="hidden" />
				</label>
			</div>
		</div>

		<!-- Email -->
		<div>
			<label class="block text-sm font-medium mb-2">Email *</label>
			<input
				type="email"
				bind:value={formData.email}
				placeholder="usuario@ejemplo.com"
				class="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary {errors.email
					? 'border-destructive'
					: ''}"
			/>
			{#if errors.email}
				<p class="text-xs text-destructive mt-1">{errors.email}</p>
			{/if}
		</div>

		<!-- Nombre y Apellido -->
		<div class="grid grid-cols-2 gap-4">
			<div>
				<label class="block text-sm font-medium mb-2">Nombre *</label>
				<input
					type="text"
					bind:value={formData.first_name}
					placeholder="Juan"
					class="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary {errors.first_name
						? 'border-destructive'
						: ''}"
				/>
				{#if errors.first_name}
					<p class="text-xs text-destructive mt-1">{errors.first_name}</p>
				{/if}
			</div>

			<div>
				<label class="block text-sm font-medium mb-2">Apellido *</label>
				<input
					type="text"
					bind:value={formData.last_name}
					placeholder="Pérez"
					class="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary {errors.last_name
						? 'border-destructive'
						: ''}"
				/>
				{#if errors.last_name}
					<p class="text-xs text-destructive mt-1">{errors.last_name}</p>
				{/if}
			</div>
		</div>

		<!-- Teléfono y Rol -->
		<div class="grid grid-cols-2 gap-4">
			<div>
				<label class="block text-sm font-medium mb-2">Teléfono</label>
				<input
					type="tel"
					bind:value={formData.phone}
					placeholder="+51 999 999 999"
					class="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
				/>
			</div>

			<div>
				<label class="block text-sm font-medium mb-2">Rol *</label>
				<select
					bind:value={formData.role}
					class="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary {errors.role
						? 'border-destructive'
						: ''}"
				>
					<option value={null}>Seleccionar rol</option>
					{#each roles as role}
						<option value={role.id}>{role.name}</option>
					{/each}
				</select>
				{#if errors.role}
					<p class="text-xs text-destructive mt-1">{errors.role}</p>
				{/if}
			</div>
		</div>

		{#if mode === 'create'}
			<!-- Contraseñas (solo al crear) -->
			<div class="grid grid-cols-2 gap-4">
				<div>
					<label class="block text-sm font-medium mb-2">Contraseña *</label>
					<input
						type="password"
						bind:value={formData.password}
						placeholder="••••••••"
						class="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary {errors.password
							? 'border-destructive'
							: ''}"
					/>
					{#if errors.password}
						<p class="text-xs text-destructive mt-1">{errors.password}</p>
					{/if}
				</div>

				<div>
					<label class="block text-sm font-medium mb-2">Confirmar Contraseña *</label>
					<input
						type="password"
						bind:value={formData.password2}
						placeholder="••••••••"
						class="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary {errors.password2
							? 'border-destructive'
							: ''}"
					/>
					{#if errors.password2}
						<p class="text-xs text-destructive mt-1">{errors.password2}</p>
					{/if}
				</div>
			</div>
	{/if}

	<!-- Estado Activo -->
	<div class="flex items-center gap-2">
		<Checkbox
			id="is_active"
			bind:checked={formData.is_active}
		/>
		<label for="is_active" class="text-sm font-medium cursor-pointer">Usuario activo</label>
	</div>
</div>	<svelte:fragment slot="footer">
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
			{mode === 'create' ? 'Crear Usuario' : 'Guardar Cambios'}
		</button>
	</svelte:fragment>
</Dialog>
