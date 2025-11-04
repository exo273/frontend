<script>
	import { onMount } from 'svelte';
	import { apiService } from '$lib/api';
	import { toast } from '$lib/stores';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import DataTable from '$lib/components/DataTable.svelte';
	import Modal from '$lib/components/Modal.svelte';

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
	<PageHeader
		title="Compras"
		subtitle="Registro de compras a proveedores"
		buttonText="Nueva Compra"
		buttonIcon="🛒"
		onButtonClick={openCreateModal}
	/>

	<!-- Tabla de compras -->
	<div class="card">
		<DataTable {columns} data={compras} {loading} emptyMessage="No hay compras registradas" />
	</div>
</div>

<!-- Modal Nueva Compra -->
<Modal bind:show={showModal} title="Registrar Nueva Compra" size="xl">
	<form on:submit|preventDefault={handleSubmit} class="space-y-6">
		<!-- Información de la compra -->
		<div class="card variant-ghost-surface p-4 space-y-4">
			<h4 class="h4">📋 Información de la Compra</h4>

			<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
				<label class="label">
					<span>Proveedor *</span>
					<select bind:value={formData.proveedor} required class="select">
						<option value="">Seleccione...</option>
						{#each proveedores as proveedor}
							<option value={proveedor.id}>{proveedor.nombre}</option>
						{/each}
					</select>
				</label>

				<label class="label">
					<span>Fecha *</span>
					<input type="date" bind:value={formData.fecha_compra} required class="input" />
				</label>

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

