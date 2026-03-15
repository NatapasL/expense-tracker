<script lang="ts">
	import type { SVGAttributes } from 'svelte/elements';

	let {
		size = 24,
		class: className = '',
		...props
	}: SVGAttributes<SVGSVGElement> & { size?: number | string } = $props();
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	class={className}
	{...props}
>
	<polyline points="15 18 9 12 15 6"></polyline>
</svg>
