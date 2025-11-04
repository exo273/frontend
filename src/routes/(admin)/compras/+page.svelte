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
			format: (val) => val?.nombre || '-'
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
			const response = await apiService.getSuppliers({ activo: true });
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
				producto_nombre: producto?.nombre || '',
				producto_unidad: producto?.unidad || '',
				cantidad: newItem.cantidad,
				costo_unitario: newItem.costo_unitario,
				subtotal: newItem.cantidad * newItem.costo_unitario
			}
		];

		// Reset new item
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

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Compras</h1>
			<p class="text-muted-foreground">Registro de compras a proveedores</p>
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
									<td class="py-3 px-4 text-sm">{compra.proveedor?.nombre || '-'}</td>
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
{#if showModal}
	<Dialog open={showModal} onClose={() => (showModal = false)}>
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
									<option value={proveedor.id}>{proveedor.nombre}</option>
								{/each}
							</select>
						</div>

						<div class="space-y-2">
							<label class="text-sm font-medium">Fecha *</label>
							<Input type="date" bind:value={formData.fecha_compra} required />
						</div>

				<label class="label">
					<span>N° Factura</span>
					<input
						type="text"
						bind:value={formData.numero_factura}
						class="input"
						placeholder="F001-00001234"
					/>
				</label>
			</div>
		</div>

		<!-- Agregar productos -->
		<div class="card variant-ghost-primary p-4 space-y-4">
			<h4 class="h4">📦 Agregar Productos</h4>

			<div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
				<label class="label md:col-span-5">
					<span>Producto</span>
					<select bind:value={newItem.producto} class="select">
						<option value="">Seleccione...</option>
						{#each productos as producto}
							<option value={producto.id}>{producto.nombre} ({producto.unidad})</option>
						{/each}
					</select>
				</label>

				<label class="label md:col-span-2">
					<span>Cantidad</span>
					<input type="number" bind:value={newItem.cantidad} step="0.01" min="0" class="input" />
				</label>

				<label class="label md:col-span-3">
					<span>Costo Unitario</span>
					<input
						type="number"
						bind:value={newItem.costo_unitario}
						step="0.01"
						min="0"
						class="input"
						placeholder="S/ 0.00"
					/>
				</label>

				<div class="md:col-span-2">
					<button type="button" class="btn variant-filled-primary w-full" on:click={addItem}>
						➕ Agregar
					</button>
				</div>
			</div>
		</div>

		<!-- Lista de productos agregados -->
		{#if formData.detalles.length > 0}
			<div class="card p-4">
				<h4 class="h4 mb-4">🛒 Productos en la Compra</h4>
				<div class="table-container">
					<table class="table table-compact">
						<thead>
							<tr>
								<th>Producto</th>
								<th class="text-right">Cantidad</th>
								<th class="text-right">Costo Unit.</th>
								<th class="text-right">Subtotal</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{#each formData.detalles as item, index}
								<tr>
									<td>{item.producto_nombre}</td>
									<td class="text-right">{item.cantidad} {item.producto_unidad}</td>
									<td class="text-right">S/ {item.costo_unitario.toFixed(2)}</td>
									<td class="text-right font-semibold">S/ {item.subtotal.toFixed(2)}</td>
									<td class="text-right">
										<button
											type="button"
											class="btn btn-sm variant-ghost-error"
											on:click={() => removeItem(index)}
										>
											🗑️
										</button>
									</td>
								</tr>
							{/each}
						</tbody>
						<tfoot>
							<tr class="font-bold">
								<td colspan="3" class="text-right">TOTAL:</td>
								<td class="text-right text-xl">S/ {getTotal().toFixed(2)}</td>
								<td></td>
							</tr>
						</tfoot>
					</table>
				</div>
			</div>
		{/if}
	</form>

	<div slot="footer" class="flex justify-end gap-2">
		<button type="button" class="btn variant-ghost-surface" on:click={() => (showModal = false)}>
			Cancelar
		</button>
		<button
			type="button"
			class="btn variant-filled-primary"
			on:click={handleSubmit}
			disabled={formData.detalles.length === 0}
		>
			💾 Registrar Compra
		</button>
	</div>
</Modal>

