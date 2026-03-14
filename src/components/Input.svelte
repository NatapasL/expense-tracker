<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends HTMLInputAttributes {
		id?: string;
		label?: string;
		error?: string;
		value?: string | number | null;
		class?: string;
	}

	let { id = crypto.randomUUID(), label, error, value = $bindable(), class: className = '', ...rest }: Props = $props();
</script>

<div class="flex flex-col space-y-1 {className}">
	{#if label}
		<label for={id} class="text-xs font-bold text-discord-text-muted uppercase tracking-wide">
			{label}
		</label>
	{/if}
	<input
		{id}
		bind:value
		class="bg-discord-panel border border-black/30 rounded p-2.5 text-discord-text-normal focus:outline-none focus:ring-2 focus:ring-discord-blurple focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
		{...rest}
	/>
	{#if error}
		<span class="text-xs text-discord-red font-medium">{error}</span>
	{/if}
</div>
