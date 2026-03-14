<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children?: Snippet;
		class?: string;
		padding?: 'none' | 'sm' | 'md' | 'lg';
		variant?: 'panel' | 'sidebar';
	}

	let { children, class: className = '', padding = 'md', variant = 'panel', ...rest }: Props = $props();

	let paddingClasses = $derived.by(() => {
		switch (padding) {
			case 'none': return '';
			case 'sm': return 'p-3';
			case 'md': return 'p-4';
			case 'lg': return 'p-6';
			default: return 'p-4';
		}
	});

	let bgClass = $derived(variant === 'panel' ? 'bg-discord-panel' : 'bg-discord-sidebar');

</script>

<div class="{bgClass} rounded-md shadow-sm {paddingClasses} {className}" {...rest}>
	{@render children?.()}
</div>
