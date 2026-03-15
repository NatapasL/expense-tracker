<script lang="ts">
	import type { CardProps } from './types';
	import { styles } from './styles';

	let {
		children,
		class: className = '',
		padding = 'md',
		variant = 'panel',
		...rest
	}: CardProps = $props();

	let paddingClasses = $derived(styles.padding[padding]);
	let bgClass = $derived(styles.variant[variant]);
</script>

<div class="{bgClass} {styles.base} {paddingClasses} {className}" {...rest}>
	{@render children?.()}
</div>
