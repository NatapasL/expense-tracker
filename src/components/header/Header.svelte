<script lang="ts">
	import type { HeaderProps } from './types';
	import {
		headerStyle,
		iconContainerLeftStyle,
		iconContainerRightStyle,
		titleContainerStyle,
		buttonTitleStyle,
		textTitleStyle,
		dropdownArrowStyle
	} from './styles';

	let { title, leftIcon, rightIcon, onclick, clickable = false }: HeaderProps = $props();
</script>

<header class={headerStyle}>
	<div class={iconContainerLeftStyle}>
		{@render leftIcon?.()}
	</div>

	<div class={titleContainerStyle}>
		{#if clickable}
			<button class={buttonTitleStyle} {onclick}>
				{title}
				<span class={dropdownArrowStyle}>▼</span>
			</button>
		{:else}
			<h1 class={textTitleStyle}>
				{title}
			</h1>
		{/if}
	</div>

	<div class={iconContainerRightStyle}>
		{@render rightIcon?.()}
	</div>
</header>
