<script lang="ts">
	export let size = 20;
	export let strokeWidth = 2;
	let className = '';
	export { className as class };
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width={strokeWidth}
	stroke-linecap="round"
	stroke-linejoin="round"
	class={className}
	{...$$restProps}
>
	<rect width="7" height="9" x="3" y="3" rx="1" />
	<rect width="7" height="5" x="14" y="3" rx="1" />
	<rect width="7" height="9" x="14" y="12" rx="1" />
	<rect width="7" height="5" x="3" y="16" rx="1" />
</svg>
