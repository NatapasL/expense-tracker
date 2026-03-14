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

<header
	class="sticky top-0 z-30 flex h-10 items-center border-b border-black/20 bg-discord-sidebar px-4"
>
	<div class="flex w-10 flex-shrink-0 items-center justify-start">
		{@render leftIcon?.()}
	</div>

	<div class="flex min-w-0 flex-1 justify-center">
		{#if clickable}
			<button
				class="truncate rounded px-2 text-[15px] font-bold text-white transition-colors hover:bg-white/5"
				{onclick}
			>
				{title}
				<span class="ml-1 text-[10px] opacity-50">▼</span>
			</button>
		{:else}
			<h1 class="truncate px-2 text-[15px] font-bold text-white">
				{title}
			</h1>
		{/if}
	</div>

	<div class="flex w-10 flex-shrink-0 items-center justify-end">
		{@render rightIcon?.()}
	</div>
</header>
