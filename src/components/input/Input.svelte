<script lang="ts">
	import type { InputProps } from './types';
	import { containerStyle, labelStyle, inputStyle, errorStyle } from './styles';

	let {
		id = crypto.randomUUID(),
		label,
		error,
		value = $bindable(),
		class: className = '',
		...rest
	}: InputProps = $props();
</script>

<div class="{containerStyle} {className}">
	{#if label}
		<label for={id} class={labelStyle}>
			{label}
		</label>
	{/if}
	<input {id} bind:value class={inputStyle} {...rest} />
	{#if error}
		<span class={errorStyle}>{error}</span>
	{/if}
</div>
