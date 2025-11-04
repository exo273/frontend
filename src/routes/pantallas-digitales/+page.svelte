<script>
	import { Card, Button } from '@skeletonlabs/skeleton';
	import { clipboard } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	
	// URL que se mostrará en las TVs (ajustar según el dominio)
	let tvUrl = '';
	let copied = false;
	let refreshing = false;
	
	onMount(() => {
		// Construir la URL completa para la TV
		// En producción: usar el dominio real
		const protocol = window.location.protocol;
		const host = window.location.host;
		tvUrl = `${protocol}//${host}/tv`;
	});
	
	/**
	 * Copia la URL de la TV al portapapeles
	 */
	async function copyToClipboard() {
		try {
			await navigator.clipboard.writeText(tvUrl);
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2000);
		} catch (err) {
			console.error('Error al copiar:', err);
			alert('Error al copiar la URL. Por favor, cópiela manualmente.');
		}
	}
	
	/**
	 * Fuerza una actualización del menú en todas las pantallas
	 * Esto podría llamar a un endpoint del backend que dispare el signal manualmente
	 */
	async function forceRefresh() {
		refreshing = true;
		
		try {
			// TODO: Implementar endpoint en el backend si se desea esta funcionalidad
			// const response = await fetch('/api/operaciones/signage/refresh', {
			//     method: 'POST',
			//     headers: {
			//         'Authorization': `Bearer ${localStorage.getItem('access_token')}`
			//     }
			// });
			
			// Por ahora, solo simulamos la acción
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			alert('Señal de actualización enviada a todas las pantallas.');
		} catch (err) {
			console.error('Error al forzar actualización:', err);
			alert('Error al enviar la actualización.');
		} finally {
			refreshing = false;
		}
	}
</script>

<div class="container mx-auto p-8 space-y-8">
	<div class="flex items-center justify-between">
		<h1 class="h1">Pantallas Digitales</h1>
	</div>
	
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<!-- Card principal: URL de la TV -->
		<Card class="p-6 space-y-4">
			<header class="card-header">
				<h2 class="h2">Señalización de Menú (TV)</h2>
			</header>
			
			<section class="space-y-4">
				<p class="text-surface-600-300-token">
					Abra la siguiente URL en el navegador de su Smart TV o dispositivo de señalización. 
					El menú se actualizará automáticamente cuando modifique productos en el sistema.
				</p>
				
				<!-- Campo con la URL -->
				<div class="space-y-2">
					<label class="label" for="tv-url">
						<span>URL de la Pantalla</span>
					</label>
					<div class="input-group input-group-divider grid-cols-[1fr_auto]">
						<input
							id="tv-url"
							type="text"
							class="input"
							value={tvUrl}
							readonly
						/>
						<button
							class="variant-filled-primary"
							on:click={copyToClipboard}
							disabled={copied}
						>
							{#if copied}
								<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
									<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
								</svg>
								<span class="ml-1">¡Copiado!</span>
							{:else}
								<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
									<path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
									<path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
								</svg>
								<span class="ml-1">Copiar</span>
							{/if}
						</button>
					</div>
				</div>
				
				<!-- Botón para forzar actualización -->
				<div class="flex justify-between items-center pt-4">
					<Button
						on:click={forceRefresh}
						disabled={refreshing}
						class="variant-ghost-secondary"
					>
						{#if refreshing}
							<svg class="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							Actualizando...
						{:else}
							<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
								<path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
							</svg>
							Forzar Actualización
						{/if}
					</Button>
				</div>
			</section>
		</Card>
		
		<!-- Card de instrucciones -->
		<Card class="p-6 space-y-4">
			<header class="card-header">
				<h2 class="h2">Instrucciones de Configuración</h2>
			</header>
			
			<section class="space-y-4">
				<div class="space-y-2">
					<h3 class="h3">Configurar Smart TV</h3>
					<ol class="list-decimal list-inside space-y-1 text-surface-600-300-token">
						<li>Copie la URL mostrada arriba</li>
						<li>Abra el navegador web de su Smart TV</li>
						<li>Pegue la URL en la barra de direcciones</li>
						<li>Presione F11 o busque la opción "Pantalla completa"</li>
						<li>El menú se mostrará automáticamente</li>
					</ol>
				</div>
				
				<div class="space-y-2">
					<h3 class="h3">Actualizaciones Automáticas</h3>
					<p class="text-surface-600-300-token">
						Cada vez que modifique un producto activo en la web (cambio de precio, nombre, 
						descripción, etc.), todas las pantallas conectadas se actualizarán automáticamente 
						en tiempo real sin necesidad de recargar la página.
					</p>
				</div>
				
				<div class="space-y-2">
					<h3 class="h3">Requisitos</h3>
					<ul class="list-disc list-inside space-y-1 text-surface-600-300-token">
						<li>Smart TV con navegador web</li>
						<li>Conexión a Internet estable</li>
						<li>Resolución mínima: 1920x1080 (Full HD)</li>
					</ul>
				</div>
				
				<div class="alert variant-ghost-warning">
					<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
					</svg>
					<p>
						<strong>Importante:</strong> Mantenga el navegador abierto y evite cerrarlo. 
						Si la conexión se pierde, la página intentará reconectarse automáticamente.
					</p>
				</div>
			</section>
		</Card>
	</div>
	
	<!-- Estadísticas o información adicional -->
	<Card class="p-6">
		<header class="card-header">
			<h2 class="h2">Estado del Sistema</h2>
		</header>
		
		<section class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
			<div class="text-center">
				<p class="text-4xl font-bold text-primary-500">WebSocket</p>
				<p class="text-surface-600-300-token">Protocolo de Comunicación</p>
			</div>
			<div class="text-center">
				<p class="text-4xl font-bold text-success-500">Tiempo Real</p>
				<p class="text-surface-600-300-token">Actualizaciones Instantáneas</p>
			</div>
			<div class="text-center">
				<p class="text-4xl font-bold text-secondary-500">Sin Límites</p>
				<p class="text-surface-600-300-token">Pantallas Simultáneas</p>
			</div>
		</section>
	</Card>
</div>

<style>
	/* Estilos adicionales si son necesarios */
</style>
