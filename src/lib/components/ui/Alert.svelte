<script lang="ts">
	import { cn } from '$lib/utils';

	let className: string | undefined = undefined;
	export { className as class };
	export let variant: 'default' | 'destructive' | 'success' | 'warning' = 'default';

	$: variantClasses = {
		default: 'bg-background text-foreground border-border',
		destructive: 'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
		success: 'border-emerald-500/50 text-emerald-600 dark:border-emerald-500 [&>svg]:text-emerald-600',
		warning: 'border-yellow-500/50 text-yellow-600 dark:border-yellow-500 [&>svg]:text-yellow-600'
	};
</script>

<div
	class={cn(
		'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
		variantClasses[variant],
		className
	)}
	role="alert"
	{...$$restProps}
>
	<slot />
</div>
