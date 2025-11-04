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
	<rect x="3" y="3" width="7" height="7" />
	<rect x="14" y="3" width="7" height="7" />
	<rect x="14" y="14" width="7" height="7" />
	<rect x="3" y="14" width="7" height="7" />
</svg>
