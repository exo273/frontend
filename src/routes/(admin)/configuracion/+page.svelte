<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { auth, toast } from '$lib/stores';
	import { apiService } from '$lib/api';
	import Checkbox from '$lib/components/ui/Checkbox.svelte';
	import Settings from '$lib/components/icons/Settings.svelte';
	import Home from '$lib/components/icons/Home.svelte';
	import Users from '$lib/components/icons/Users.svelte';
	import Wallet from '$lib/components/icons/Wallet.svelte';
	import Printer from '$lib/components/icons/Printer.svelte';
	import LayoutGrid from '$lib/components/icons/LayoutGrid.svelte';
	import Upload from '$lib/components/icons/Upload.svelte';
	import Image from '$lib/components/icons/Image.svelte';
	import Loader from '$lib/components/icons/Loader.svelte';
	import Plus from '$lib/components/icons/Plus.svelte';
	import Edit2 from '$lib/components/icons/Edit2.svelte';
	import Trash2 from '$lib/components/icons/Trash2.svelte';
	import UserModal from '$lib/components/configuracion/UserModal.svelte';
	import RoleModal from '$lib/components/configuracion/RoleModal.svelte';
	import PaymentMethodModal from '$lib/components/configuracion/PaymentMethodModal.svelte';
	import PrinterModal from '$lib/components/configuracion/PrinterModal.svelte';
	import ZoneModal from '$lib/components/configuracion/ZoneModal.svelte';
	import TableModal from '$lib/components/configuracion/TableModal.svelte';

	// Obtener token del store
	let accessToken;
	auth.subscribe(state => {
		accessToken = state.accessToken;
	});

	// Pestañas de configuración
	const tabs = [
		{ id: 'restaurant', label: 'Mi Restaurante', icon: Home },
		{ id: 'users', label: 'Usuarios y Roles', icon: Users },
		{ id: 'payments', label: 'Métodos de Pago', icon: Wallet },
		{ id: 'printers', label: 'Impresoras', icon: Printer },
		{ id: 'zones', label: 'Zonas y Mesas', icon: LayoutGrid }
	];

	let activeTab = 'restaurant';
	let loading = false;
	let saving = false;

	// Detectar tab desde URL query params
	$: {
		const urlParams = new URLSearchParams($page.url.search);
		const tabParam = urlParams.get('tab');
		if (tabParam && tabs.some(t => t.id === tabParam)) {
			activeTab = tabParam;
		}
	}

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

	// Datos de usuarios y roles
	let users = [];
	let roles = [];
	let userSubTab = 'users'; // 'users' o 'roles'
	let showUserModal = false;
	let showRoleModal = false;
	let editingUser = null;
	let editingRole = null;
	let userModalMode = 'create';
	let roleModalMode = 'create';

	// Tab 3 - Métodos de Pago
	let paymentMethods = [];
	let showPaymentModal = false;
	let editingPayment = null;

	// Tab 4 - Impresoras
	let printers = [];
	let showPrinterModal = false;
	let editingPrinter = null;

	// Tab 5 - Zonas y Mesas
	let zones = [];
	let tables = [];
	let showZoneModal = false;
	let showTableModal = false;
	let editingZone = null;
	let editingTable = null;
	let zoneModalMode = 'create';
	let tableModalMode = 'create';
	let selectedZoneForView = null;
	let draggedTable = null;
	let isDragging = false;

	onMount(async () => {
		loading = true;
		try {
			// Cargar todos los datos en paralelo
			await Promise.all([
				loadRestaurantConfig(),
				loadUsers(),
				loadRoles(),
				loadPaymentMethods(),
				loadPrinters(),
				loadZones(),
				loadTables()
			]);
		} catch (error) {
			console.error('Error al cargar datos iniciales:', error);
		} finally {
			loading = false;
		}
	});

	async function loadRestaurantConfig() {
		try {
			const response = await fetch('/api/operaciones/config/', {
				headers: {
					Authorization: `Bearer ${accessToken}`
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
					Authorization: `Bearer ${accessToken}`
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
		// Ya no es necesario cargar datos aquí porque se cargan en onMount
	}

	// ============================================================================
	// Funciones para Usuarios y Roles
	// ============================================================================

	async function loadUsers() {
		try {
			const response = await fetch('/api/auth/users/', {
				headers: {
					Authorization: `Bearer ${accessToken}`
				}
			});

			if (response.ok) {
				users = await response.json();
			}
		} catch (error) {
			console.error('Error al cargar usuarios:', error);
		}
	}

	async function loadRoles() {
		try {
			const response = await fetch('/api/auth/roles/', {
				headers: {
					Authorization: `Bearer ${accessToken}`
				}
			});

			if (response.ok) {
				roles = await response.json();
			}
		} catch (error) {
			console.error('Error al cargar roles:', error);
		}
	}

	function openUserModal(user = null) {
		editingUser = user;
		userModalMode = user ? 'edit' : 'create';
		showUserModal = true;
	}

	async function handleSaveUser(event) {
		const data = event.detail;
		saving = true;

		try {
			const formData = new FormData();
			formData.append('email', data.email);
			formData.append('first_name', data.first_name);
			formData.append('last_name', data.last_name);
			formData.append('phone', data.phone || '');
			formData.append('role', data.role);
			formData.append('is_active', data.is_active);

			if (data.profile_image) {
				formData.append('profile_image', data.profile_image);
			}

			if (userModalMode === 'create') {
				formData.append('password', data.password);
				formData.append('password2', data.password2);
			}

			const url =
				userModalMode === 'create' ? '/api/auth/users/' : `/api/auth/users/${data.id}/`;
			const method = userModalMode === 'create' ? 'POST' : 'PATCH';

			const response = await fetch(url, {
				method,
				headers: {
					Authorization: `Bearer ${accessToken}`
				},
				body: formData
			});

			if (response.ok) {
				toast.success(
					userModalMode === 'create' ? 'Usuario creado exitosamente' : 'Usuario actualizado'
				);
				showUserModal = false;
				await loadUsers();
			} else {
				const error = await response.json();
				toast.error(error.detail || 'Error al guardar usuario');
			}
		} catch (error) {
			console.error('Error:', error);
			toast.error('Error al guardar usuario');
		} finally {
			saving = false;
		}
	}

	async function deleteUser(userId) {
		if (!confirm('¿Estás seguro de eliminar este usuario?')) return;

		try {
			const response = await fetch(`/api/auth/users/${userId}/`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${accessToken}`
				}
			});

			if (response.ok) {
				toast.success('Usuario eliminado');
				await loadUsers();
			} else {
				toast.error('Error al eliminar usuario');
			}
		} catch (error) {
			console.error('Error:', error);
			toast.error('Error al eliminar usuario');
		}
	}

	function openRoleModal(role = null) {
		editingRole = role;
		roleModalMode = role ? 'edit' : 'create';
		showRoleModal = true;
	}

	async function handleSaveRole(event) {
		const data = event.detail;
		saving = true;

		try {
			const url = roleModalMode === 'create' ? '/api/auth/roles/' : `/api/auth/roles/${data.id}/`;
			const method = roleModalMode === 'create' ? 'POST' : 'PATCH';

			const response = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${accessToken}`
				},
				body: JSON.stringify({
					name: data.name,
					description: data.description,
					permissions: data.permissions
				})
			});

			if (response.ok) {
				toast.success(roleModalMode === 'create' ? 'Rol creado exitosamente' : 'Rol actualizado');
				showRoleModal = false;
				await loadRoles();
			} else {
				const error = await response.json();
				toast.error(error.detail || 'Error al guardar rol');
			}
		} catch (error) {
			console.error('Error:', error);
			toast.error('Error al guardar rol');
		} finally {
			saving = false;
		}
	}

	async function deleteRole(roleId) {
		if (!confirm('¿Estás seguro de eliminar este rol?')) return;

		try {
			const response = await fetch(`/api/auth/roles/${roleId}/`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${accessToken}`
				}
			});

			if (response.ok) {
				toast.success('Rol eliminado');
				await loadRoles();
			} else {
				const error = await response.json();
				toast.error(error.detail || 'Error al eliminar rol');
			}
		} catch (error) {
			console.error('Error:', error);
			toast.error('Error al eliminar rol');
		}
	}

	// ============================================================================
	// Funciones para Métodos de Pago
	// ============================================================================

	async function loadPaymentMethods() {
		try {
			const response = await fetch('/api/pos/config/payment-methods/', {
				headers: {
					Authorization: `Bearer ${accessToken}`
				}
			});

			if (response.ok) {
				paymentMethods = await response.json();
			} else {
				console.error('Error loading payment methods');
				paymentMethods = [];
			}
		} catch (error) {
			console.error('Error:', error);
			paymentMethods = [];
		}
	}

	function openPaymentModal(payment = null) {
		editingPayment = payment;
		showPaymentModal = true;
	}

	async function handleSavePayment(event) {
		const paymentData = event.detail;
		loading = true;

		try {
			const formData = new FormData();
			formData.append('name', paymentData.name);
			formData.append('description', paymentData.description || '');
			formData.append('is_active', paymentData.is_active);

			if (paymentData.logo) {
				formData.append('logo', paymentData.logo);
			}

			const url = paymentData.id
				? `/api/pos/config/payment-methods/${paymentData.id}/`
				: '/api/pos/config/payment-methods/';

			const method = paymentData.id ? 'PATCH' : 'POST';

			const response = await fetch(url, {
				method,
				headers: {
					Authorization: `Bearer ${accessToken}`
				},
				body: formData
			});

			if (response.ok) {
				toast.success(
					paymentData.id ? 'Método de pago actualizado' : 'Método de pago creado'
				);
				showPaymentModal = false;
				editingPayment = null;
				await loadPaymentMethods();
			} else {
				const error = await response.json();
				toast.error(error.detail || 'Error al guardar método de pago');
			}
		} catch (error) {
			console.error('Error:', error);
			toast.error('Error al guardar método de pago');
		} finally {
			loading = false;
		}
	}

	async function deletePaymentMethod(paymentId) {
		if (!confirm('¿Estás seguro de eliminar este método de pago?')) return;

		try {
			const response = await fetch(`/api/pos/config/payment-methods/${paymentId}/`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${accessToken}`
				}
			});

			if (response.ok) {
				toast.success('Método de pago eliminado');
				await loadPaymentMethods();
			} else {
				const error = await response.json();
				toast.error(error.detail || 'Error al eliminar método de pago');
			}
		} catch (error) {
			console.error('Error:', error);
			toast.error('Error al eliminar método de pago');
		}
	}

	async function togglePaymentActive(paymentId, currentState) {
		try {
			const response = await fetch(`/api/pos/config/payment-methods/${paymentId}/`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${accessToken}`
				},
				body: JSON.stringify({ is_active: !currentState })
			});

			if (response.ok) {
				toast.success('Estado actualizado');
				await loadPaymentMethods();
			} else {
				toast.error('Error al actualizar estado');
			}
		} catch (error) {
			console.error('Error:', error);
			toast.error('Error al actualizar estado');
		}
	}

	// ============================================================================
	// Funciones para Impresoras
	// ============================================================================

	async function loadPrinters() {
		try {
			const response = await fetch('/api/pos/config/printers/', {
				headers: {
					Authorization: `Bearer ${accessToken}`
				}
			});

			if (response.ok) {
				printers = await response.json();
			} else {
				console.error('Error loading printers');
				printers = [];
			}
		} catch (error) {
			console.error('Error:', error);
			printers = [];
		}
	}

	function openPrinterModal(printer = null) {
		editingPrinter = printer;
		showPrinterModal = true;
	}

	async function handleSavePrinter(event) {
		const printerData = event.detail;
		loading = true;

		try {
			const url = printerData.id
				? `/api/pos/config/printers/${printerData.id}/`
				: '/api/pos/config/printers/';

			const method = printerData.id ? 'PATCH' : 'POST';

			const body = {
				name: printerData.name,
				type: printerData.type,
				connection_type: printerData.connection_type,
				is_active: printerData.is_active
			};

			// Solo incluir campos de red si la conexión es por red
			if (printerData.connection_type === 'network') {
				body.ip_address = printerData.ip_address;
				body.port = printerData.port;
			}

			const response = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${accessToken}`
				},
				body: JSON.stringify(body)
			});

			if (response.ok) {
				toast.success(printerData.id ? 'Impresora actualizada' : 'Impresora creada');
				showPrinterModal = false;
				editingPrinter = null;
				await loadPrinters();
			} else {
				const error = await response.json();
				toast.error(error.detail || 'Error al guardar impresora');
			}
		} catch (error) {
			console.error('Error:', error);
			toast.error('Error al guardar impresora');
		} finally {
			loading = false;
		}
	}

	async function deletePrinter(printerId) {
		if (!confirm('¿Estás seguro de eliminar esta impresora?')) return;

		try {
			const response = await fetch(`/api/pos/config/printers/${printerId}/`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${accessToken}`
				}
			});

			if (response.ok) {
				toast.success('Impresora eliminada');
				await loadPrinters();
			} else {
				const error = await response.json();
				toast.error(error.detail || 'Error al eliminar impresora');
			}
		} catch (error) {
			console.error('Error:', error);
			toast.error('Error al eliminar impresora');
		}
	}

	async function togglePrinterActive(printerId, currentState) {
		try {
			const response = await fetch(`/api/pos/config/printers/${printerId}/`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${accessToken}`
				},
				body: JSON.stringify({ is_active: !currentState })
			});

			if (response.ok) {
				toast.success('Estado actualizado');
				await loadPrinters();
			} else {
				toast.error('Error al actualizar estado');
			}
		} catch (error) {
			console.error('Error:', error);
			toast.error('Error al actualizar estado');
		}
	}

	// ============================================================================
	// TAB 5: ZONAS Y MESAS
	// ============================================================================

	async function loadZones() {
		try {
			zones = await apiService.getZones();
			if (zones.length > 0 && !selectedZoneForView) {
				selectedZoneForView = zones[0].id;
			}
		} catch (error) {
			console.error('Error al cargar zonas:', error);
			toast.error('Error al cargar zonas');
		}
	}

	async function loadTables() {
		try {
			const response = await apiService.getTables({ page_size: 1000 });
			tables = response.results || response;
		} catch (error) {
			console.error('Error al cargar mesas:', error);
			toast.error('Error al cargar mesas');
		}
	}

	function openZoneModal(zone = null) {
		editingZone = zone;
		zoneModalMode = zone ? 'edit' : 'create';
		showZoneModal = true;
	}

	async function handleSaveZone() {
		await loadZones();
		await loadTables();
	}

	async function deleteZone(zoneId) {
		if (!confirm('¿Estás seguro de eliminar esta zona? Se eliminarán todas sus mesas.')) {
			return;
		}

		try {
			await apiService.deleteZone(zoneId);
			toast.success('Zona eliminada exitosamente');
			await loadZones();
			await loadTables();
		} catch (error) {
			console.error('Error al eliminar zona:', error);
			toast.error('Error al eliminar zona');
		}
	}

	function openTableModal(table = null) {
		editingTable = table;
		tableModalMode = table ? 'edit' : 'create';
		showTableModal = true;
	}

	async function handleSaveTable() {
		await loadTables();
	}

	async function deleteTable(tableId) {
		if (!confirm('¿Estás seguro de eliminar esta mesa?')) {
			return;
		}

		try {
			await apiService.deleteTable(tableId);
			toast.success('Mesa eliminada exitosamente');
			await loadTables();
		} catch (error) {
			console.error('Error al eliminar mesa:', error);
			toast.error('Error al eliminar mesa');
		}
	}

	function getTablesByZone(zoneId) {
		return tables.filter((t) => (t.zona?.id || t.zona) === zoneId);
	}

	// Drag & Drop functions
	function handleTableDragStart(event, table) {
		draggedTable = table;
		isDragging = true;
		event.dataTransfer.effectAllowed = 'move';
	}

	function handleTableDrag(event) {
		if (!draggedTable) return;
		// Puedes agregar lógica adicional aquí si es necesario
	}

	function handleTableDragEnd(event) {
		isDragging = false;
		draggedTable = null;
	}

	async function handleTableDrop(event) {
		event.preventDefault();
		if (!draggedTable) return;

		const canvas = event.currentTarget;
		const rect = canvas.getBoundingClientRect();
		const x = Math.max(0, Math.min(event.clientX - rect.left - 50, rect.width - 100));
		const y = Math.max(0, Math.min(event.clientY - rect.top - 50, rect.height - 100));

		try {
			await apiService.updateTable(draggedTable.id, {
				...draggedTable,
				zona: draggedTable.zona?.id || draggedTable.zona,
				posicion_x: Math.round(x / 10) * 10,
				posicion_y: Math.round(y / 10) * 10
			});
			await loadTables();
		} catch (error) {
			console.error('Error al actualizar posición:', error);
			toast.error('Error al mover mesa');
		}

		isDragging = false;
		draggedTable = null;
	}

	function handleDragOver(event) {
		event.preventDefault();
		event.dataTransfer.dropEffect = 'move';
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
						type="button"
						on:click={() => selectTab(tab.id)}
						class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors"
						class:bg-primary={activeTab === tab.id}
						class:text-primary-foreground={activeTab === tab.id}
						class:text-muted-foreground={activeTab !== tab.id}
						class:hover:bg-muted={activeTab !== tab.id}
						class:hover:text-foreground={activeTab !== tab.id}
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
						<!-- Sub-pestañas horizontales -->
						<div class="flex gap-2 mb-6 border-b border-border">
							<button
								on:click={() => (userSubTab = 'users')}
								class="px-4 py-2 text-sm font-medium border-b-2 transition-colors {userSubTab ===
								'users'
									? 'border-primary text-primary'
									: 'border-transparent text-muted-foreground hover:text-foreground'}"
							>
								Usuarios
							</button>
							<button
								on:click={() => (userSubTab = 'roles')}
								class="px-4 py-2 text-sm font-medium border-b-2 transition-colors {userSubTab ===
								'roles'
									? 'border-primary text-primary'
									: 'border-transparent text-muted-foreground hover:text-foreground'}"
							>
								Roles
							</button>
						</div>

						{#if userSubTab === 'users'}
							<!-- Tabla de Usuarios -->
							<div class="mb-4 flex justify-between items-center">
								<h3 class="text-base font-semibold">Usuarios del Sistema</h3>
								<button
									on:click={() => openUserModal()}
									class="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
								>
									<Plus class="h-4 w-4" />
									Invitar Usuario
								</button>
							</div>

							<div class="border border-border rounded-lg overflow-hidden">
								<table class="w-full">
									<thead class="bg-muted">
										<tr>
											<th class="text-left p-3 text-sm font-medium">Usuario</th>
											<th class="text-left p-3 text-sm font-medium">Email</th>
											<th class="text-left p-3 text-sm font-medium">Rol</th>
											<th class="text-left p-3 text-sm font-medium">Estado</th>
											<th class="text-right p-3 text-sm font-medium">Acciones</th>
										</tr>
									</thead>
									<tbody>
										{#each users as user}
											<tr class="border-t border-border hover:bg-muted/50">
												<td class="p-3">
													<div class="flex items-center gap-3">
														{#if user.profile_image_url}
															<img
																src={user.profile_image_url}
																alt={user.full_name}
																class="h-10 w-10 rounded-full object-cover"
															/>
														{:else}
															<div
																class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold"
															>
																{user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
															</div>
														{/if}
														<div>
															<div class="font-medium">{user.full_name}</div>
															<div class="text-xs text-muted-foreground">{user.phone || '-'}</div>
														</div>
													</div>
												</td>
												<td class="p-3 text-sm">{user.email}</td>
												<td class="p-3 text-sm">
													{#if user.role_detail}
														<span
															class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
														>
															{user.role_detail.name}
														</span>
													{:else}
														<span class="text-muted-foreground">Sin rol</span>
													{/if}
												</td>
												<td class="p-3 text-sm">
													{#if user.is_active}
														<span
															class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-700 dark:text-green-400"
														>
															Activo
														</span>
													{:else}
														<span
															class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-700 dark:text-red-400"
														>
															Inactivo
														</span>
													{/if}
												</td>
												<td class="p-3">
													<div class="flex items-center justify-end gap-2">
														<button
															on:click={() => openUserModal(user)}
															class="p-2 hover:bg-accent rounded-lg transition-colors"
															title="Editar"
														>
															<Edit2 class="h-4 w-4" />
														</button>
														<button
															on:click={() => deleteUser(user.id)}
															class="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
															title="Eliminar"
														>
															<Trash2 class="h-4 w-4" />
														</button>
													</div>
												</td>
											</tr>
										{:else}
											<tr>
												<td colspan="5" class="p-8 text-center text-muted-foreground">
													No hay usuarios registrados
												</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						{:else}
							<!-- Tabla de Roles -->
							<div class="mb-4 flex justify-between items-center">
								<h3 class="text-base font-semibold">Roles y Permisos</h3>
								<button
									on:click={() => openRoleModal()}
									class="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
								>
									<Plus class="h-4 w-4" />
									Crear Rol
								</button>
							</div>

							<div class="border border-border rounded-lg overflow-hidden">
								<table class="w-full">
									<thead class="bg-muted">
										<tr>
											<th class="text-left p-3 text-sm font-medium">Nombre</th>
											<th class="text-left p-3 text-sm font-medium">Descripción</th>
											<th class="text-right p-3 text-sm font-medium">Acciones</th>
										</tr>
									</thead>
									<tbody>
										{#each roles as role}
											<tr class="border-t border-border hover:bg-muted/50">
												<td class="p-3">
													<span class="font-medium">{role.name}</span>
												</td>
												<td class="p-3 text-sm text-muted-foreground">
													{role.description || '-'}
												</td>
												<td class="p-3">
													<div class="flex items-center justify-end gap-2">
														<button
															on:click={() => openRoleModal(role)}
															class="p-2 hover:bg-accent rounded-lg transition-colors"
															title="Editar"
														>
															<Edit2 class="h-4 w-4" />
														</button>
														<button
															on:click={() => deleteRole(role.id)}
															class="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
															title="Eliminar"
														>
															<Trash2 class="h-4 w-4" />
														</button>
													</div>
												</td>
											</tr>
										{:else}
											<tr>
												<td colspan="3" class="p-8 text-center text-muted-foreground">
													No hay roles definidos
												</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						{/if}
					</div>
				{:else if activeTab === 'payments'}
					<div class="p-6">
						<div class="mb-6 flex justify-between items-center">
							<div>
								<h2 class="text-lg font-semibold">Métodos de Pago</h2>
								<p class="text-sm text-muted-foreground">
									Configura los métodos de pago disponibles en el POS
								</p>
							</div>
							<button
								on:click={() => openPaymentModal()}
								class="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
							>
								<Plus class="h-4 w-4" />
								Agregar Método
							</button>
						</div>

						{#if loading}
							<div class="flex justify-center items-center py-12">
								<Loader class="h-8 w-8 animate-spin text-primary" />
							</div>
						{:else if paymentMethods.length === 0}
							<div class="text-center py-12">
								<Wallet class="h-12 w-12 mx-auto text-muted-foreground mb-4" />
								<p class="text-muted-foreground mb-4">No hay métodos de pago configurados</p>
								<button
									on:click={() => openPaymentModal()}
									class="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
								>
									<Plus class="h-4 w-4" />
									Agregar Primer Método
								</button>
							</div>
						{:else}
							<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{#each paymentMethods as payment}
									<div
										class="border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
									>
										<div class="flex items-start justify-between mb-3">
											<div class="flex items-center gap-3">
												{#if payment.logo_url}
													<img
														src={payment.logo_url}
														alt={payment.name}
														class="h-12 w-12 object-contain"
													/>
												{:else}
													<div
														class="h-12 w-12 bg-muted rounded-lg flex items-center justify-center"
													>
														<Wallet class="h-6 w-6 text-muted-foreground" />
													</div>
												{/if}
												<div>
													<h3 class="font-semibold">{payment.name}</h3>
													{#if payment.is_active}
														<span
															class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-700 dark:text-green-400"
														>
															Activo
														</span>
													{:else}
														<span
															class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-700 dark:text-red-400"
														>
															Inactivo
														</span>
													{/if}
												</div>
											</div>
										</div>

										{#if payment.description}
											<p class="text-sm text-muted-foreground mb-3 line-clamp-2">
												{payment.description}
											</p>
										{/if}

										<div class="flex items-center justify-between pt-3 border-t border-border">
										<label class="flex items-center gap-2 cursor-pointer">
											<Checkbox
												checked={payment.is_active}
												on:click={() => togglePaymentActive(payment.id, payment.is_active)}
											/>
											<span class="text-sm">Habilitado</span>
										</label>											<div class="flex items-center gap-1">
												<button
													on:click={() => openPaymentModal(payment)}
													class="p-2 hover:bg-accent rounded-lg transition-colors"
													title="Editar"
												>
													<Edit2 class="h-4 w-4" />
												</button>
												<button
													on:click={() => deletePaymentMethod(payment.id)}
													class="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
													title="Eliminar"
												>
													<Trash2 class="h-4 w-4" />
												</button>
											</div>
										</div>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				{:else if activeTab === 'printers'}
					<div class="p-6">
						<div class="mb-6 flex justify-between items-center">
							<div>
								<h2 class="text-lg font-semibold">Impresoras</h2>
								<p class="text-sm text-muted-foreground">
									Configura impresoras fiscales y térmicas para el sistema
								</p>
							</div>
							<button
								on:click={() => openPrinterModal()}
								class="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
							>
								<Plus class="h-4 w-4" />
								Agregar Impresora
							</button>
						</div>

						{#if loading}
							<div class="flex justify-center items-center py-12">
								<Loader class="h-8 w-8 animate-spin text-primary" />
							</div>
						{:else if printers.length === 0}
							<div class="text-center py-12">
								<Printer class="h-12 w-12 mx-auto text-muted-foreground mb-4" />
								<p class="text-muted-foreground mb-4">No hay impresoras configuradas</p>
								<button
									on:click={() => openPrinterModal()}
									class="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
								>
									<Plus class="h-4 w-4" />
									Agregar Primera Impresora
								</button>
							</div>
						{:else}
							<div class="border border-border rounded-lg overflow-hidden">
								<table class="w-full">
									<thead class="bg-muted">
										<tr>
											<th class="text-left p-3 text-sm font-medium">Nombre</th>
											<th class="text-left p-3 text-sm font-medium">Tipo</th>
											<th class="text-left p-3 text-sm font-medium">Conexión</th>
											<th class="text-left p-3 text-sm font-medium">Dirección</th>
											<th class="text-left p-3 text-sm font-medium">Estado</th>
											<th class="text-right p-3 text-sm font-medium">Acciones</th>
										</tr>
									</thead>
									<tbody>
										{#each printers as printer}
											<tr class="border-t border-border hover:bg-muted/50">
												<td class="p-3">
													<div class="flex items-center gap-2">
														<Printer class="h-5 w-5 text-muted-foreground" />
														<span class="font-medium">{printer.name}</span>
													</div>
												</td>
												<td class="p-3 text-sm">
													{#if printer.type === 'fiscal'}
														<span
															class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-700 dark:text-blue-400"
														>
															Fiscal
														</span>
													{:else}
														<span
															class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-700 dark:text-purple-400"
														>
															Térmica
														</span>
													{/if}
												</td>
												<td class="p-3 text-sm">
													{#if printer.connection_type === 'usb'}
														<span class="text-muted-foreground">USB</span>
													{:else}
														<span class="text-muted-foreground">Red</span>
													{/if}
												</td>
												<td class="p-3 text-sm">
													{#if printer.connection_type === 'network'}
														<code class="text-xs bg-muted px-2 py-1 rounded">
															{printer.ip_address}:{printer.port}
														</code>
													{:else}
														<span class="text-muted-foreground">—</span>
													{/if}
												</td>
												<td class="p-3">
													<label class="flex items-center gap-2 cursor-pointer">
														<Checkbox
															checked={printer.is_active}
															on:click={() => togglePrinterActive(printer.id, printer.is_active)}
														/>
														<span class="text-sm">
															{#if printer.is_active}
																<span class="text-green-600 dark:text-green-400">Activa</span>
															{:else}
																<span class="text-muted-foreground">Inactiva</span>
															{/if}
														</span>
													</label>
												</td>
												<td class="p-3">
													<div class="flex items-center justify-end gap-2">
														<button
															on:click={() => openPrinterModal(printer)}
															class="p-2 hover:bg-accent rounded-lg transition-colors"
															title="Editar"
														>
															<Edit2 class="h-4 w-4" />
														</button>
														<button
															on:click={() => deletePrinter(printer.id)}
															class="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
															title="Eliminar"
														>
															<Trash2 class="h-4 w-4" />
														</button>
													</div>
												</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						{/if}
					</div>
				{:else if activeTab === 'zones'}
					<div class="p-6">
						<div class="mb-6">
							<h2 class="text-lg font-semibold mb-1">Zonas y Mesas</h2>
							<p class="text-sm text-muted-foreground">
								Configura las zonas de tu restaurante y organiza las mesas con drag & drop
							</p>
						</div>

						<!-- Selector de zona -->
						<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
							<!-- Panel izquierdo: Gestión de zonas -->
							<div class="lg:col-span-1 space-y-4">
								<div class="flex items-center justify-between mb-4">
									<h3 class="font-semibold">Zonas</h3>
									<button
										on:click={() => openZoneModal()}
										class="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
									>
										<Plus class="h-4 w-4" />
										Nueva Zona
									</button>
								</div>

								<div class="space-y-2">
									{#each zones as zone}
										<div
											class="p-4 border rounded-lg transition-colors cursor-pointer {selectedZoneForView ===
											zone.id
												? 'border-primary bg-primary/5'
												: 'border-border hover:border-primary/50'}"
											on:click={() => (selectedZoneForView = zone.id)}
											role="button"
											tabindex="0"
										>
											<div class="flex items-center justify-between mb-2">
												<h4 class="font-semibold">{zone.nombre}</h4>
												<div class="flex items-center gap-1">
													<button
														on:click|stopPropagation={() => openZoneModal(zone)}
														class="p-1.5 hover:bg-accent rounded transition-colors"
														title="Editar"
													>
														<Edit2 class="h-3.5 w-3.5" />
													</button>
													<button
														on:click|stopPropagation={() => deleteZone(zone.id)}
														class="p-1.5 hover:bg-destructive/10 text-destructive rounded transition-colors"
														title="Eliminar"
													>
														<Trash2 class="h-3.5 w-3.5" />
													</button>
												</div>
											</div>
											{#if zone.descripcion}
												<p class="text-xs text-muted-foreground">{zone.descripcion}</p>
											{/if}
											<div class="mt-2 flex items-center gap-2 text-xs">
												<span class="text-muted-foreground">
													{getTablesByZone(zone.id).length} mesas
												</span>
												{#if !zone.is_active}
													<span class="px-2 py-0.5 bg-muted rounded text-muted-foreground">
														Inactiva
													</span>
												{/if}
											</div>
										</div>
									{/each}

									{#if zones.length === 0}
										<div class="text-center py-8 text-muted-foreground">
											<p>No hay zonas creadas</p>
											<p class="text-sm mt-1">Crea tu primera zona</p>
										</div>
									{/if}
								</div>
							</div>

							<!-- Panel derecho: Canvas de mesas con drag & drop -->
							<div class="lg:col-span-2">
								{#if selectedZoneForView}
									{@const selectedZone = zones.find((z) => z.id === selectedZoneForView)}
									{@const zoneTables = getTablesByZone(selectedZoneForView)}
									<div class="border rounded-lg overflow-hidden">
										<div class="bg-muted p-4 border-b flex items-center justify-between">
											<div>
												<h3 class="font-semibold">{selectedZone?.nombre}</h3>
												<p class="text-sm text-muted-foreground">
													Arrastra las mesas para posicionarlas
												</p>
											</div>
											<button
												on:click={() => openTableModal()}
												class="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
											>
												<Plus class="h-4 w-4" />
												Nueva Mesa
											</button>
										</div>

										<!-- Canvas de mesas -->
										<div
											class="relative bg-background"
											style="height: 600px; width: 100%;"
											on:drop={handleTableDrop}
											on:dragover={handleDragOver}
											role="application"
										>
											{#each zoneTables as table}
												<div
													draggable="true"
													on:dragstart={(e) => handleTableDragStart(e, table)}
													on:drag={handleTableDrag}
													on:dragend={handleTableDragEnd}
													class="absolute cursor-move border-2 border-primary bg-card hover:bg-accent transition-colors rounded-lg flex flex-col items-center justify-center text-center shadow-md group"
													style="left: {table.posicion_x}px; top: {table.posicion_y}px; width: {table.ancho}px; height: {table.alto}px; {table.forma ===
													'redonda'
														? 'border-radius: 50%;'
														: ''}"
													role="button"
													tabindex="0"
												>
													<div class="font-semibold text-lg">Mesa {table.numero}</div>
													<div class="text-xs text-muted-foreground">
														{table.capacidad} personas
													</div>
													<div
														class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1"
													>
														<button
															on:click|stopPropagation={() => openTableModal(table)}
															class="p-1 bg-background/90 hover:bg-accent rounded text-foreground"
															title="Editar"
														>
															<Edit2 class="h-3 w-3" />
														</button>
														<button
															on:click|stopPropagation={() => deleteTable(table.id)}
															class="p-1 bg-background/90 hover:bg-destructive/10 text-destructive rounded"
															title="Eliminar"
														>
															<Trash2 class="h-3 w-3" />
														</button>
													</div>
												</div>
											{/each}

											{#if zoneTables.length === 0}
												<div
													class="absolute inset-0 flex items-center justify-center text-muted-foreground"
												>
													<div class="text-center">
														<p class="text-lg">No hay mesas en esta zona</p>
														<p class="text-sm mt-1">Crea una mesa para comenzar</p>
													</div>
												</div>
											{/if}
										</div>
									</div>
								{:else}
									<div class="border rounded-lg p-12 text-center text-muted-foreground">
										<p>Selecciona una zona para ver sus mesas</p>
									</div>
								{/if}
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<!-- Modales -->
<UserModal bind:open={showUserModal} user={editingUser} allRoles={roles} on:save={handleSaveUser} />
<RoleModal bind:open={showRoleModal} role={editingRole} on:save={handleSaveRole} />
<PaymentMethodModal
	bind:open={showPaymentModal}
	paymentMethod={editingPayment}
	on:save={handleSavePayment}
/>
<PrinterModal bind:open={showPrinterModal} printer={editingPrinter} on:save={handleSavePrinter} />
<ZoneModal
	bind:show={showZoneModal}
	zone={editingZone}
	mode={zoneModalMode}
	on:saved={handleSaveZone}
/>
<TableModal
	bind:show={showTableModal}
	table={editingTable}
	mode={tableModalMode}
	{zones}
	on:saved={handleSaveTable}
/>
