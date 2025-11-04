<script>
	export let size = 20;
	export let strokeWidth = 2;
	export let className = '';
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
>
	<polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
	<polyline points="16 17 22 17 22 11" />
</svg>
