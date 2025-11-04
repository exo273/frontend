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
	<rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
	<line x1="16" x2="16" y1="2" y2="6" />
	<line x1="8" x2="8" y1="2" y2="6" />
	<line x1="3" x2="21" y1="10" y2="10" />
	<path d="m9 16 2 2 4-4" />
</svg>
