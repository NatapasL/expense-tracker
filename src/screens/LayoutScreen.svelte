<script lang="ts">
	import type { Snippet } from 'svelte';
	let { children }: { children: Snippet } = $props();
</script>

<div class="h-full min-h-screen text-gray-100 bg-gray-900">
	<main class="relative w-full max-w-md min-h-screen p-4 pb-20 mx-auto bg-gray-900 border-x border-gray-800">
		{@render children()}
	</main>
</div>
