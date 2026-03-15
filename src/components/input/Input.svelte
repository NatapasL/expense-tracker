<script lang="ts">
	import type { InputProps } from './types';

	let {
		id = crypto.randomUUID(),
		label,
		error,
		value = $bindable(),
		class: className = '',
		...rest
	}: InputProps = $props();
</script>

<div class="flex flex-col space-y-1 {className}">
	{#if label}
		<label for={id} class="text-xs font-bold tracking-wide text-discord-text-muted uppercase">
			{label}
		</label>
	{/if}
	<input
		{id}
		bind:value
		class="rounded border border-black/30 bg-discord-panel p-2.5 text-discord-text-normal transition-all focus:border-transparent focus:ring-2 focus:ring-discord-blurple focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
		{...rest}
	/>
	{#if error}
		<span class="text-xs font-medium text-discord-red">{error}</span>
	{/if}
</div>
