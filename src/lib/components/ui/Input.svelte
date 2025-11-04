<script lang="ts">
	import { cn } from '$lib/utils';
	
	let className: string | undefined = undefined;
	export { className as class };
	export let type: string = 'text';
	export let errorMessage: string | undefined = undefined;
	export let value: string | number | undefined = undefined;
	
	let showPassword = false;
	$: isPassword = type === 'password';
	$: inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
	
	function togglePassword() {
		showPassword = !showPassword;
	}

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		value = target.value;
	}
</script>

<div class="w-full space-y-1">
	<div class="relative w-full">
		<input
			type={inputType}
			class={cn(
				"flex h-10 w-full rounded-md bg-input px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border disabled:cursor-not-allowed disabled:opacity-50",
				isPassword && "pr-10",
				className
			)}
			{value}
			on:input={handleInput}
			{...$$restProps}
		/>
		{#if isPassword}
			<button
				type="button"
				class="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground focus:outline-none"
				on:click={togglePassword}
				tabindex="-1"
			>
				{#if showPassword}
					<!-- EyeOff Icon -->
					<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
						<path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
						<path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
						<line x1="2" y1="2" x2="22" y2="22"/>
					</svg>
				{:else}
					<!-- Eye Icon -->
					<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
						<circle cx="12" cy="12" r="3"/>
					</svg>
				{/if}
			</button>
		{/if}
	</div>
	{#if errorMessage}
		<span class="text-sm text-red-600 text-secondary-foreground">
			{errorMessage}
		</span>
	{/if}
</div>

