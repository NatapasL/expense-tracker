<script lang="ts">
	import type { CardProps } from './types';
	import { baseCardStyle, paddingStyle, variantStyle } from './styles';

	let {
		children,
		class: className = '',
		padding = 'md',
		variant = 'panel',
		...rest
	}: CardProps = $props();

	let paddingClasses = $derived(paddingStyle[padding]);
	let bgClass = $derived(variantStyle[variant]);
</script>

<div class="{bgClass} {baseCardStyle} {paddingClasses} {className}" {...rest}>
	{@render children?.()}
</div>
