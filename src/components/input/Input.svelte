<script lang="ts">
	import type { InputProps } from './types';
	import { styles } from './styles';

	let {
		id = crypto.randomUUID(),
		label,
		error,
		value = $bindable(),
		class: className = '',
		...rest
	}: InputProps = $props();
</script>

<div class="{styles.container} {className}">
	{#if label}
		<label for={id} class={styles.label}>
			{label}
		</label>
	{/if}
	<input {id} bind:value class={styles.input} {...rest} />
	{#if error}
		<span class={styles.error}>{error}</span>
	{/if}
</div>
