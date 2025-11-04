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
	<path d="M18 20V10" />
	<path d="M12 20V4" />
	<path d="M6 20v-6" />
</svg>
