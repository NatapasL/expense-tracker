<script lang="ts">
	import type { HeaderProps } from './types';
	import { styles } from './styles';

	let { title, leftIcon, rightIcon, onclick, clickable = false }: HeaderProps = $props();
</script>

<header class={styles.header}>
	<div class={styles.iconContainerLeft}>
		{@render leftIcon?.()}
	</div>

	<div class={styles.titleContainer}>
		{#if clickable}
			<button class={styles.buttonTitle} {onclick}>
				{title}
				<span class={styles.dropdownArrow}>▼</span>
			</button>
		{:else}
			<h1 class={styles.textTitle}>
				{title}
			</h1>
		{/if}
	</div>

	<div class={styles.iconContainerRight}>
		{@render rightIcon?.()}
	</div>
</header>
