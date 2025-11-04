<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { toast } from '$lib/stores';
	import Settings from '$lib/components/icons/Settings.svelte';
	import Home from '$lib/components/icons/Home.svelte';
	import Users from '$lib/components/icons/Users.svelte';
	import Wallet from '$lib/components/icons/Wallet.svelte';
	import Printer from '$lib/components/icons/Printer.svelte';
	import Upload from '$lib/components/icons/Upload.svelte';
	import Image from '$lib/components/icons/Image.svelte';
	import Loader from '$lib/components/icons/Loader.svelte';

	// Pestañas de configuración
	const tabs = [
		{ id: 'restaurant', label: 'Mi Restaurante', icon: Home },
		{ id: 'users', label: 'Usuarios y Roles', icon: Users },
		{ id: 'payments', label: 'Métodos de Pago', icon: Wallet },
		{ id: 'printers', label: 'Impresoras', icon: Printer }
	];

	let activeTab = 'restaurant';
	let loading = false;
	let saving = false;

	// Datos de configuración del restaurante
	let restaurantConfig = {
		name: '',
		logo: null,
		receipt_logo: null,
		currency_symbol: 'S/',
		language: 'es',
		address: '',
		phone: '',
		email: '',
		website: ''
	};

	let logoPreview = null;
	let receiptLogoPreview = null;

	onMount(async () => {
		await loadRestaurantConfig();
	});

	async function loadRestaurantConfig() {
		loading = true;
		try {
			const response = await fetch('/api/operaciones/config/', {
				headers: {
					Authorization: `Bearer ${localStorage.getItem('access_token')}`
				}
			});

			if (response.ok) {
				const data = await response.json();
				// Si viene como array (del router), tomar el primer elemento
				const config = Array.isArray(data) ? data[0] : data;
				
				restaurantConfig = {
					name: config.name || '',
					logo: null,
					receipt_logo: null,
					currency_symbol: config.currency_symbol || 'S/',
					language: config.language || 'es',
					address: config.address || '',
					phone: config.phone || '',
					email: config.email || '',
					website: config.website || ''
				};

				logoPreview = config.logo_url;
				receiptLogoPreview = config.receipt_logo_url;
			}
		} catch (error) {
			console.error('Error al cargar configuración:', error);
			toast.error('Error al cargar la configuración');
		} finally {
			loading = false;
		}
	}

	async function saveRestaurantConfig() {
		saving = true;
		try {
			const formData = new FormData();
			formData.append('name', restaurantConfig.name);
			formData.append('currency_symbol', restaurantConfig.currency_symbol);
			formData.append('language', restaurantConfig.language);
			formData.append('address', restaurantConfig.address);
			formData.append('phone', restaurantConfig.phone);
			formData.append('email', restaurantConfig.email);
			formData.append('website', restaurantConfig.website);

			if (restaurantConfig.logo) {
				formData.append('logo', restaurantConfig.logo);
			}
			if (restaurantConfig.receipt_logo) {
				formData.append('receipt_logo', restaurantConfig.receipt_logo);
			}

			const response = await fetch('/api/operaciones/config/1/', {
				method: 'PATCH',
				headers: {
					Authorization: `Bearer ${localStorage.getItem('access_token')}`
				},
				body: formData
			});

			if (response.ok) {
				toast.success('Configuración guardada exitosamente');
				await loadRestaurantConfig();
			} else {
				toast.error('Error al guardar la configuración');
			}
		} catch (error) {
			console.error('Error al guardar configuración:', error);
			toast.error('Error al guardar la configuración');
		} finally {
			saving = false;
		}
	}

	function handleLogoChange(event) {
		const file = event.target.files[0];
		if (file) {
			restaurantConfig.logo = file;
			const reader = new FileReader();
			reader.onload = (e) => {
				logoPreview = e.target.result;
			};
			reader.readAsDataURL(file);
		}
	}

	function handleReceiptLogoChange(event) {
		const file = event.target.files[0];
		if (file) {
			restaurantConfig.receipt_logo = file;
			const reader = new FileReader();
			reader.onload = (e) => {
				receiptLogoPreview = e.target.result;
			};
			reader.readAsDataURL(file);
		}
	}

	function selectTab(tabId) {
		activeTab = tabId;
	}
</script>

<div class="flex flex-col h-full p-6">
	<!-- Header -->
	<div class="flex items-center gap-3 mb-6">
		<div class="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
			<Settings class="h-5 w-5 text-primary" />
		</div>
		<div>
			<h1 class="text-2xl font-bold">Configuración</h1>
			<p class="text-sm text-muted-foreground">Gestión de configuraciones del sistema</p>
		</div>
	</div>

	<!-- Layout de pestañas verticales -->
	<div class="flex gap-6 flex-1 overflow-hidden">
		<!-- Sidebar de pestañas -->
		<div class="w-64 flex-shrink-0">
			<nav class="space-y-1">
				{#each tabs as tab}
					<button
						on:click={() => selectTab(tab.id)}
						class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors {activeTab ===
						tab.id
							? 'bg-primary text-primary-foreground'
							: 'text-muted-foreground hover:bg-muted hover:text-foreground'}"
					>
						<svelte:component this={tab.icon} className="h-5 w-5" />
						{tab.label}
					</button>
				{/each}
			</nav>
		</div>

		<!-- Área de contenido -->
		<div class="flex-1 overflow-y-auto">
			<div class="bg-card border border-border rounded-lg">
				{#if activeTab === 'restaurant'}
					<div class="p-6">
						{#if loading}
							<div class="flex items-center justify-center py-12">
								<Loader class="h-8 w-8 animate-spin text-primary" />
							</div>
						{:else}
							<!-- Branding -->
							<div class="mb-8">
								<h3 class="text-base font-semibold mb-4">Branding</h3>
								
								<div class="space-y-4">
									<!-- Nombre del restaurante -->
									<div>
										<label class="block text-sm font-medium mb-2">Nombre del Restaurante</label>
										<input
											type="text"
											bind:value={restaurantConfig.name}
											placeholder="Mi Restaurante"
											class="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
										/>
									</div>

									<!-- Logo Principal -->
									<div>
										<label class="block text-sm font-medium mb-2">Logo Principal</label>
										<p class="text-xs text-muted-foreground mb-2">
											Logo para el panel de administración
										</p>
										
										<div class="flex items-start gap-4">
											{#if logoPreview}
												<div class="h-24 w-24 border-2 border-dashed border-border rounded-lg overflow-hidden bg-muted flex items-center justify-center">
													<img src={logoPreview} alt="Logo" class="h-full w-full object-contain" />
												</div>
											{:else}
												<div class="h-24 w-24 border-2 border-dashed border-border rounded-lg bg-muted flex items-center justify-center">
													<Image class="h-8 w-8 text-muted-foreground" />
												</div>
											{/if}
											
											<div class="flex-1">
												<label class="inline-flex items-center gap-2 px-4 py-2 border border-input rounded-lg hover:bg-accent cursor-pointer transition-colors">
													<Upload class="h-4 w-4" />
													<span class="text-sm font-medium">Subir Logo</span>
													<input
														type="file"
														accept="image/*"
														on:change={handleLogoChange}
														class="hidden"
													/>
												</label>
												<p class="text-xs text-muted-foreground mt-2">
													Formatos: PNG, JPG, SVG. Máximo 2MB.
												</p>
											</div>
										</div>
									</div>

									<!-- Logo para Comandas -->
									<div>
										<label class="block text-sm font-medium mb-2">Logo para Comandas</label>
										<p class="text-xs text-muted-foreground mb-2">
											Logo simplificado para impresión en comandas
										</p>
										
										<div class="flex items-start gap-4">
											{#if receiptLogoPreview}
												<div class="h-24 w-24 border-2 border-dashed border-border rounded-lg overflow-hidden bg-muted flex items-center justify-center">
													<img
														src={receiptLogoPreview}
														alt="Logo Comanda"
														class="h-full w-full object-contain"
													/>
												</div>
											{:else}
												<div class="h-24 w-24 border-2 border-dashed border-border rounded-lg bg-muted flex items-center justify-center">
													<Image class="h-8 w-8 text-muted-foreground" />
												</div>
											{/if}
											
											<div class="flex-1">
												<label class="inline-flex items-center gap-2 px-4 py-2 border border-input rounded-lg hover:bg-accent cursor-pointer transition-colors">
													<Upload class="h-4 w-4" />
													<span class="text-sm font-medium">Subir Logo</span>
													<input
														type="file"
														accept="image/*"
														on:change={handleReceiptLogoChange}
														class="hidden"
													/>
												</label>
												<p class="text-xs text-muted-foreground mt-2">
													Recomendado: imagen monocromática, tamaño pequeño.
												</p>
											</div>
										</div>
									</div>
								</div>
							</div>

							<!-- Localización -->
							<div class="mb-8">
								<h3 class="text-base font-semibold mb-4">Localización</h3>
								
								<div class="grid grid-cols-2 gap-4">
									<div>
										<label class="block text-sm font-medium mb-2">Símbolo de Moneda</label>
										<input
											type="text"
											bind:value={restaurantConfig.currency_symbol}
											placeholder="S/"
											class="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
										/>
									</div>

									<div>
										<label class="block text-sm font-medium mb-2">Idioma</label>
										<select
											bind:value={restaurantConfig.language}
											disabled
											class="w-full px-3 py-2 border border-input rounded-lg bg-muted text-muted-foreground cursor-not-allowed"
										>
											<option value="es">Español</option>
										</select>
										<p class="text-xs text-muted-foreground mt-1">
											Actualmente solo está disponible Español
										</p>
									</div>
								</div>
							</div>

							<!-- Información de Contacto -->
							<div class="mb-8">
								<h3 class="text-base font-semibold mb-4">Información de Contacto (Opcional)</h3>
								
								<div class="space-y-4">
									<div>
										<label class="block text-sm font-medium mb-2">Dirección</label>
										<textarea
											bind:value={restaurantConfig.address}
											placeholder="Dirección del establecimiento"
											rows="2"
											class="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
										></textarea>
									</div>

									<div class="grid grid-cols-2 gap-4">
										<div>
											<label class="block text-sm font-medium mb-2">Teléfono</label>
											<input
												type="tel"
												bind:value={restaurantConfig.phone}
												placeholder="+51 999 999 999"
												class="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
											/>
										</div>

										<div>
											<label class="block text-sm font-medium mb-2">Email</label>
											<input
												type="email"
												bind:value={restaurantConfig.email}
												placeholder="contacto@restaurante.com"
												class="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
											/>
										</div>
									</div>

									<div>
										<label class="block text-sm font-medium mb-2">Sitio Web</label>
										<input
											type="url"
											bind:value={restaurantConfig.website}
											placeholder="https://mirestaurante.com"
											class="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
										/>
									</div>
								</div>
							</div>

							<!-- Botón Guardar -->
							<div class="flex justify-end pt-4 border-t border-border">
								<button
									on:click={saveRestaurantConfig}
									disabled={saving}
									class="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
								>
									{#if saving}
										<Loader class="h-4 w-4 animate-spin" />
										Guardando...
									{:else}
										Guardar Cambios
									{/if}
								</button>
							</div>
						{/if}
					</div>
				{:else if activeTab === 'users'}
					<div class="p-6">
						<h2 class="text-lg font-semibold mb-4">Usuarios y Roles</h2>
						<p class="text-muted-foreground">Gestión de usuarios y permisos</p>
					</div>
				{:else if activeTab === 'payments'}
					<div class="p-6">
						<h2 class="text-lg font-semibold mb-4">Métodos de Pago</h2>
						<p class="text-muted-foreground">Configuración de métodos de pago del POS</p>
					</div>
				{:else if activeTab === 'printers'}
					<div class="p-6">
						<h2 class="text-lg font-semibold mb-4">Impresoras</h2>
						<p class="text-muted-foreground">Configuración de impresoras fiscales y térmicas</p>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
