<script>
	import { goto } from '$app/navigation';
	import { auth, toast } from '$lib/stores';
	import { apiService } from '$lib/api';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import CardHeader from '$lib/components/ui/CardHeader.svelte';
	import CardTitle from '$lib/components/ui/CardTitle.svelte';
	import CardContent from '$lib/components/ui/CardContent.svelte';

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
	<title>Iniciar Sesión - SIGR</title>
</svelte:head>

<div class="min-h-screen w-full flex items-center justify-center bg-background p-4">
	<Card class="w-full max-w-md">
		<CardHeader class="space-y-1 text-center pb-4">
			<div class="flex justify-center mb-6">
				<div class="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
					<svg class="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
					</svg>
				</div>
			</div>
			<CardTitle class="text-2xl font-bold">SIGR</CardTitle>
			<p class="text-sm text-muted-foreground">Sistema Integral de Gestión de Restaurantes</p>
		</CardHeader>

		<CardContent>
			<form on:submit|preventDefault={handleLogin} class="space-y-4">
				<!-- Email -->
				<div class="space-y-2">
					<label class="text-sm font-medium" for="email">Email</label>
					<Input
						id="email"
						type="email"
						placeholder="email@example.com"
						bind:value={email}
						on:keypress={handleKeyPress}
						disabled={loading}
						required
					/>
				</div>

				<!-- Contraseña -->
				<div class="space-y-2">
					<label class="text-sm font-medium" for="password">Contraseña</label>
					<Input
						id="password"
						type="password"
						placeholder="••••••••"
						bind:value={password}
						on:keypress={handleKeyPress}
						disabled={loading}
						required
					/>
				</div>

				<!-- Botón de Login -->
				<Button
					type="submit"
					class="w-full"
					disabled={loading}
				>
					{#if loading}
						<div class="flex items-center justify-center gap-2">
							<div class="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent"></div>
							<span>Iniciando sesión...</span>
						</div>
					{:else}
						Iniciar Sesión
					{/if}
				</Button>
			</form>

			<!-- Footer -->
			<div class="mt-6 text-center">
				<p class="text-xs text-muted-foreground">
					© 2024 SIGR - Todos los derechos reservados
				</p>
			</div>
		</CardContent>
	</Card>
</div>
