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

	let variantClasses = $derived.by(() => {
		switch (variant) {
			case 'primary':
				return variantStyle.primary;
			case 'secondary':
				return variantStyle.secondary;
			case 'danger':
				return variantStyle.danger;
			default:
				return '';
		}
	});

	let widthClass = $derived(fullWidth ? 'w-full' : '');
</script>

<button class="{baseStyle} {variantClasses} {widthClass} {className}" {...rest}>
	{@render children?.()}
</button>
