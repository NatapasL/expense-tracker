<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		leftIcon?: Snippet;
		rightIcon?: Snippet;
		onclick?: () => void;
		clickable?: boolean;
	}

	let { title, leftIcon, rightIcon, onclick, clickable = false }: Props = $props();
</script>

<header class="bg-discord-sidebar border-b border-black/20 h-10 flex items-center px-4 sticky top-0 z-30">
	<div class="w-10 flex items-center justify-start flex-shrink-0">
		{@render leftIcon?.()}
	</div>
	
	<div class="flex-1 flex justify-center min-w-0">
		{#if clickable}
			<button 
				class="font-bold text-white truncate px-2 text-[15px] hover:bg-white/5 rounded transition-colors"
				onclick={onclick}
			>
				{title}
				<span class="text-[10px] ml-1 opacity-50">▼</span>
			</button>
		{:else}
			<h1 class="font-bold text-white truncate px-2 text-[15px]">
				{title}
			</h1>
		{/if}
	</div>

	<div class="w-10 flex items-center justify-end flex-shrink-0">
		{@render rightIcon?.()}
	</div>
</header>
