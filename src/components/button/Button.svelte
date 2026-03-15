<script lang="ts">
	import { baseStyle, variantStyle } from './styles';
	import type { ButtonProps } from './types';

	let {
		children,
		variant = 'primary',
		class: className = '',
		fullWidth = false,
		...rest
	}: ButtonProps = $props();

	let variantClasses = $derived(variantStyle[variant]);
	let widthClass = $derived(fullWidth ? 'w-full' : '');
</script>

<button class="{baseStyle} {variantClasses} {widthClass} {className}" {...rest}>
	{@render children?.()}
</button>
