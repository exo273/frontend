<script>
	import { onMount } from 'svelte';
	import { apiService } from '$lib/api';
	import { toast } from '$lib/stores';
	import Card from '$lib/components/ui/Card.svelte';
	import CardContent from '$lib/components/ui/CardContent.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Dialog from '$lib/components/ui/Dialog.svelte';
	import ShoppingCart from '$lib/components/icons/ShoppingCart.svelte';
	import Plus from '$lib/components/icons/Plus.svelte';
	import Truck from '$lib/components/icons/Truck.svelte';
	import Package from '$lib/components/icons/Package.svelte';
	import X from '$lib/components/icons/X.svelte';

	let compras = [];
	let loading = false;

	// Modal state
	let showModal = false;
	let proveedores = [];
	let productos = [];

	// Form data
	let formData = {
		proveedor: '',
		fecha_compra: new Date().toISOString().split('T')[0],
		numero_factura: '',
		detalles: []
	};

	let newItem = {
		producto: '',
		cantidad: 0,
		costo_unitario: 0
	};

	// Columnas de la tabla
	const columns = [
		{
			key: 'fecha_compra',
			label: 'Fecha',
			format: (val) => new Date(val).toLocaleDateString('es-PE')
		},
		{ key: 'numero_factura', label: 'N° Factura' },
		{
			key: 'proveedor',
			label: 'Proveedor',
			format: (val) => val?.name || '-'
		},
		{
			key: 'detalles',
			label: 'Items',
			format: (val) => val?.length || 0,
			align: 'center'
		},
		{
			key: 'total',
			label: 'Total',
			format: (val) => `S/ ${parseFloat(val || 0).toFixed(2)}`,
			align: 'right'
		},
		{
			key: 'fecha_creacion',
			label: 'Registrado',
			format: (val) => new Date(val).toLocaleString('es-PE')
		}
	];

	onMount(async () => {
		await loadCompras();
		await loadProveedores();
		await loadProductos();
	});

	async function loadCompras() {
		loading = true;
		try {
			const response = await apiService.getPurchases({ page_size: 1000 });
			compras = response.results || response;
		} catch (error) {
			toast.error('Error al cargar compras');
			console.error(error);
		} finally {
			loading = false;
		}
	}

	async function loadProveedores() {
		try {
			const response = await apiService.getSuppliers({ is_active: true });
			proveedores = response.results || response;
		} catch (error) {
			console.error('Error al cargar proveedores:', error);
		}
	}

	async function loadProductos() {
		try {
			const response = await apiService.getProductos({ page_size: 1000 });
			productos = response.results || response;
		} catch (error) {
			console.error('Error al cargar productos:', error);
		}
	}

	function openCreateModal() {
		formData = {
			proveedor: '',
			fecha_compra: new Date().toISOString().split('T')[0],
			numero_factura: '',
			detalles: []
		};
		newItem = {
			producto: '',
			cantidad: 0,
			costo_unitario: 0
		};
		showModal = true;
	}

	function addItem() {
		if (!newItem.producto || newItem.cantidad <= 0 || newItem.costo_unitario <= 0) {
			toast.warning('Complete todos los campos del item');
			return;
		}

	const producto = productos.find((p) => p.id === parseInt(newItem.producto));
	formData.detalles = [
		...formData.detalles,
		{
			producto: newItem.producto,
			producto_nombre: producto?.name || '',
			producto_unidad: producto?.unit || '',
			cantidad: newItem.cantidad,
			costo_unitario: newItem.costo_unitario,
			subtotal: newItem.cantidad * newItem.costo_unitario
		}
	];		// Reset new item
		newItem = {
			producto: '',
			cantidad: 0,
			costo_unitario: 0
		};
	}

	function removeItem(index) {
		formData.detalles = formData.detalles.filter((_, i) => i !== index);
	}

	function getTotal() {
		return formData.detalles.reduce((sum, item) => sum + item.subtotal, 0);
	}

	async function handleSubmit() {
		if (!formData.proveedor) {
			toast.warning('Seleccione un proveedor');
			return;
		}

		if (formData.detalles.length === 0) {
			toast.warning('Agregue al menos un producto');
			return;
		}

		try {
			const payload = {
				proveedor: formData.proveedor,
				fecha_compra: formData.fecha_compra,
				numero_factura: formData.numero_factura,
				detalles: formData.detalles.map((item) => ({
					producto: item.producto,
					cantidad: parseFloat(item.cantidad),
					costo_unitario: parseFloat(item.costo_unitario)
				}))
			};

			await apiService.createPurchase(payload);
			toast.success('Compra registrada exitosamente. Stock actualizado.');
			showModal = false;
			await loadCompras();
		} catch (error) {
			toast.error('Error al registrar compra');
			console.error(error);
		}
	}
</script>

<svelte:head>
	<title>Compras - SIGR</title>
</svelte:head>

<div class="p-6 space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-3">
			<div class="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
				<ShoppingCart class="h-5 w-5 text-primary" />
			</div>
			<div>
				<h1 class="text-2xl font-bold">Compras</h1>
				<p class="text-sm text-muted-foreground">Registro de compras a proveedores</p>
			</div>
		</div>
		<Button on:click={openCreateModal}>
			<Plus class="h-4 w-4 mr-2" />
			Nueva Compra
		</Button>
	</div>

	<!-- Tabla de compras -->
	<Card>
		<CardContent class="p-0">
			{#if loading}
				<div class="flex items-center justify-center py-8">
					<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
				</div>
			{:else if compras.length === 0}
				<div class="text-center py-12">
					<ShoppingCart class="h-12 w-12 mx-auto text-muted-foreground mb-4" />
					<p class="text-muted-foreground">No hay compras registradas</p>
				</div>
			{:else}
				<div class="overflow-x-auto">
					<table class="w-full">
						<thead>
							<tr class="border-b border-border">
								<th class="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Fecha</th>
								<th class="text-left py-3 px-4 text-sm font-medium text-muted-foreground">N° Factura</th>
								<th class="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Proveedor</th>
								<th class="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Items</th>
								<th class="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Total</th>
								<th class="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Registrado</th>
							</tr>
						</thead>
						<tbody>
							{#each compras as compra}
							<tr class="border-b border-border hover:bg-accent transition-colors">
								<td class="py-3 px-4 text-sm">{new Date(compra.fecha_compra).toLocaleDateString('es-PE')}</td>
								<td class="py-3 px-4 font-medium">{compra.numero_factura}</td>
								<td class="py-3 px-4 text-sm">{compra.proveedor?.name || '-'}</td>
								<td class="py-3 px-4 text-center text-sm">{compra.detalles?.length || 0}</td>
								<td class="py-3 px-4 text-right font-medium">S/ {parseFloat(compra.total || 0).toFixed(2)}</td>
								<td class="py-3 px-4 text-sm text-muted-foreground">{new Date(compra.fecha_creacion).toLocaleString('es-PE')}</td>
							</tr>
						{/each}
					</tbody>
				</table>
				</div>
			{/if}
		</CardContent>
	</Card>
</div>

<!-- Modal Nueva Compra -->
<Dialog bind:open={showModal}>
	<div class="space-y-6">
		<div>
			<h2 class="text-lg font-semibold">Registrar Nueva Compra</h2>
		</div>

			<form on:submit|preventDefault={handleSubmit} class="space-y-6">
				<!-- Información de la compra -->
				<div class="space-y-4">
					<h4 class="text-sm font-semibold flex items-center gap-2">
						<Truck class="h-4 w-4" />
						Información de la Compra
					</h4>

					<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
		<div class="space-y-2">
			<label class="text-sm font-medium">Proveedor *</label>
			<select bind:value={formData.proveedor} required class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
				<option value="">Seleccione...</option>
				{#each proveedores as proveedor}
					<option value={proveedor.id}>{proveedor.name}</option>
				{/each}
			</select>
		</div>						<div class="space-y-2">
							<label class="text-sm font-medium">Fecha *</label>
							<Input type="date" bind:value={formData.fecha_compra} required />
						</div>

						<div class="space-y-2">
							<label class="text-sm font-medium">N° Factura</label>
							<Input
								bind:value={formData.numero_factura}
								placeholder="F001-00001234"
							/>
						</div>
					</div>
				</div>

				<!-- Agregar productos -->
				<div class="space-y-4">
					<h4 class="text-sm font-semibold flex items-center gap-2">
						<Package class="h-4 w-4" />
						Agregar Productos
					</h4>

					<div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
		<div class="space-y-2 md:col-span-5">
			<label class="text-sm font-medium">Producto</label>
			<select bind:value={newItem.producto} class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
				<option value="">Seleccione...</option>
				{#each productos as producto}
					<option value={producto.id}>{producto.name} ({producto.unit})</option>
				{/each}
			</select>
		</div>						<div class="space-y-2 md:col-span-2">
							<label class="text-sm font-medium">Cantidad</label>
							<Input type="number" bind:value={newItem.cantidad} step="0.01" min="0" />
						</div>

						<div class="space-y-2 md:col-span-3">
							<label class="text-sm font-medium">Costo Unit.</label>
							<Input
								type="number"
								bind:value={newItem.costo_unitario}
								step="0.01"
								min="0"
								placeholder="S/ 0.00"
							/>
						</div>

						<div class="md:col-span-2">
							<Button type="button" class="w-full" on:click={addItem}>
								<Plus class="h-4 w-4 mr-2" />
								Agregar
							</Button>
						</div>
					</div>
				</div>

				<!-- Lista de productos agregados -->
				{#if formData.detalles.length > 0}
					<div class="space-y-4">
						<h4 class="text-sm font-semibold flex items-center gap-2">
							<ShoppingCart class="h-4 w-4" />
							Productos en la Compra
						</h4>
						<div class="border rounded-lg overflow-hidden">
							<table class="w-full">
								<thead>
									<tr class="border-b border-border bg-muted/50">
										<th class="text-left py-2 px-4 text-sm font-medium">Producto</th>
										<th class="text-right py-2 px-4 text-sm font-medium">Cantidad</th>
										<th class="text-right py-2 px-4 text-sm font-medium">Costo Unit.</th>
										<th class="text-right py-2 px-4 text-sm font-medium">Subtotal</th>
										<th class="w-12"></th>
									</tr>
								</thead>
								<tbody>
									{#each formData.detalles as item, index}
										<tr class="border-b border-border">
											<td class="py-2 px-4 text-sm">{item.producto_nombre}</td>
											<td class="py-2 px-4 text-right text-sm">{item.cantidad} {item.producto_unidad}</td>
											<td class="py-2 px-4 text-right text-sm">S/ {item.costo_unitario.toFixed(2)}</td>
											<td class="py-2 px-4 text-right font-medium">S/ {item.subtotal.toFixed(2)}</td>
											<td class="py-2 px-4 text-right">
												<Button
													type="button"
													variant="ghost"
													size="sm"
													on:click={() => removeItem(index)}
												>
													<X class="h-4 w-4" />
												</Button>
											</td>
										</tr>
									{/each}
								</tbody>
								<tfoot>
									<tr class="bg-muted/50">
										<td colspan="3" class="py-3 px-4 text-right font-semibold">TOTAL:</td>
										<td class="py-3 px-4 text-right text-lg font-bold">S/ {getTotal().toFixed(2)}</td>
										<td></td>
									</tr>
								</tfoot>
							</table>
						</div>
					</div>
				{/if}

				<div class="flex justify-end gap-2 pt-4">
					<Button type="button" variant="ghost" on:click={() => (showModal = false)}>
						Cancelar
					</Button>
					<Button
						type="button"
						on:click={handleSubmit}
						disabled={formData.detalles.length === 0}
					>
						Registrar Compra
					</Button>
				</div>
			</form>
		</div>
	</Dialog>