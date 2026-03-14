<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		leftIcon?: Snippet;
		rightIcon?: Snippet;
	}

	let { title, leftIcon, rightIcon }: Props = $props();
</script>

<header class="bg-discord-sidebar border-b border-black/20 h-10 flex items-center px-4 sticky top-0 z-30">
	<div class="w-10 flex items-center justify-start flex-shrink-0">
		{@render leftIcon?.()}
	</div>
	
	<h1 class="flex-1 text-center font-bold text-white truncate px-2 text-[15px]">
		{title}
	</h1>

	<div class="w-10 flex items-center justify-end flex-shrink-0">
		{@render rightIcon?.()}
	</div>
</header>
