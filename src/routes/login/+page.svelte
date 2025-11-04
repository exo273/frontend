<script>
	import { goto } from '$app/navigation';
	import { auth, toast } from '$lib/stores';
	import { apiService } from '$lib/api';

	let email = '';
	let password = '';
	let loading = false;

	async function handleLogin() {
		if (!email || !password) {
			toast.error('Por favor ingresa email y contraseña');
			return;
		}

		loading = true;
		try {
			// Llamar al microservicio de identidad
			const response = await apiService.login(email, password);
			
			// Guardar tokens (access y refresh) y datos de usuario
			auth.login(response.access, response.refresh, response.user);

			toast.success(`¡Bienvenido, ${response.user.first_name}!`);
			goto('/');
		} catch (error) {
			toast.error(error.message || 'Error al iniciar sesión');
		} finally {
			loading = false;
		}
	}

	function handleKeyPress(event) {
		if (event.key === 'Enter') {
			handleLogin();
		}
	}
</script>

<svelte:head>
	<title>Iniciar Sesión - Sistema de Restaurante</title>
</svelte:head>

<div class="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary-500 to-secondary-500">
	<div class="card w-full max-w-md p-8 space-y-6 shadow-2xl">
		<!-- Logo y Título -->
		<div class="text-center space-y-2">
			<div class="flex justify-center mb-4">
				<div class="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center">
					<span class="text-4xl">🍽️</span>
				</div>
			</div>
			<h1 class="h2">Sistema de Gestión</h1>
			<p class="text-surface-600-300-token">Restaurante</p>
		</div>

		<!-- Formulario -->
		<form on:submit|preventDefault={handleLogin} class="space-y-4">
			<!-- Email -->
			<label class="label">
				<span class="label-text">Email</span>
				<input
					type="email"
					class="input"
					placeholder="email@example.com"
					bind:value={email}
					on:keypress={handleKeyPress}
					disabled={loading}
					required
					autocomplete="email"
				/>
			</label>

			<!-- Contraseña -->
			<label class="label">
				<span class="label-text">Contraseña</span>
				<input
					type="password"
					class="input"
					placeholder="Ingresa tu contraseña"
					bind:value={password}
					on:keypress={handleKeyPress}
					disabled={loading}
					required
					autocomplete="current-password"
				/>
			</label>

			<!-- Botón de Login -->
			<button
				type="submit"
				class="btn variant-filled-primary w-full"
				disabled={loading}
			>
				{#if loading}
					<span class="animate-spin">⏳</span>
					<span>Iniciando sesión...</span>
				{:else}
					<span>🔓</span>
					<span>Iniciar Sesión</span>
				{/if}
			</button>
		</form>

		<!-- Footer -->
		<div class="text-center text-sm text-surface-600-300-token">
			<p>© 2024 Sistema de Gestión de Restaurantes</p>
		</div>
	</div>
</div>

<style>
	:global(body) {
		overflow: hidden;
	}
</style>
