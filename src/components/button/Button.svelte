<script lang="ts">
	import type { ButtonProps } from './types';

	let {
		children,
		variant = 'primary',
		class: className = '',
		fullWidth = false,
		...rest
	}: ButtonProps = $props();

	let baseClasses =
		'inline-flex justify-center items-center px-4 py-2 text-sm font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-discord-bg disabled:opacity-50 disabled:cursor-not-allowed';

	let variantClasses = $derived.by(() => {
		switch (variant) {
			case 'primary':
				return 'bg-[#5865F2] hover:bg-[#4752C4] text-white focus:ring-[#5865F2]';
			case 'secondary':
				return 'bg-discord-sidebar hover:bg-discord-panel text-discord-text-normal focus:ring-gray-500';
			case 'danger':
				return 'bg-discord-red hover:bg-[#c9383b] text-white focus:ring-discord-red';
			default:
				return '';
		}
	});

	let widthClass = $derived(fullWidth ? 'w-full' : '');
</script>

<button class="{baseClasses} {variantClasses} {widthClass} {className}" {...rest}>
	{@render children?.()}
</button>
