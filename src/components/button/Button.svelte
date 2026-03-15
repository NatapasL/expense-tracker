<script lang="ts">
	import { styles } from './styles';
	import type { ButtonProps } from './types';

	let {
		children,
		variant = 'primary',
		class: className = '',
		fullWidth = false,
		...rest
	}: ButtonProps = $props();

	let variantClasses = $derived(styles.variant[variant]);
	let widthClass = $derived(fullWidth ? 'w-full' : '');
</script>

<button class="{styles.base} {variantClasses} {widthClass} {className}" {...rest}>
	{@render children?.()}
</button>
