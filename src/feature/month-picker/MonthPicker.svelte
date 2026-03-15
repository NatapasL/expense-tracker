<script lang="ts">
	import { Modal } from '../../components/modal';
	import type { MonthPickerProps } from './types';
	import { MONTHS } from './constants';
	import {
		containerStyle,
		yearSelectorStyle,
		yearButtonStyle,
		yearLabelStyle,
		gridStyle,
		monthButtonStyle,
		jumpButtonStyle
	} from './styles';

	let { value = $bindable(), open = $bindable(), onclose }: MonthPickerProps = $props();

	let pickerYear = $state(value.getFullYear());

	function selectMonth(monthIndex: number) {
		value = new Date(pickerYear, monthIndex, 1);
		open = false;
	}

	function handleClose() {
		open = false;
		onclose?.();
	}

	$effect(() => {
		if (open) {
			pickerYear = value.getFullYear();
		}
	});
</script>

<Modal {open} onclose={handleClose} title="Select Month">
	<div class={containerStyle}>
		<div class={yearSelectorStyle}>
			<button
				class={yearButtonStyle}
				onclick={() => pickerYear--}
				aria-label="Previous Year"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg
				>
			</button>
			<span class={yearLabelStyle}>{pickerYear}</span>
			<button
				class={yearButtonStyle}
				onclick={() => pickerYear++}
				aria-label="Next Year"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg
				>
			</button>
		</div>

		<div class={gridStyle}>
			{#each MONTHS as month, i (month)}
				{@const isSelected = i === value.getMonth() && pickerYear === value.getFullYear()}
				<button
					class={monthButtonStyle(isSelected)}
					onclick={() => selectMonth(i)}
				>
					{month.substring(0, 3)}
				</button>
			{/each}
		</div>

		<button
			class={jumpButtonStyle}
			onclick={() => {
				pickerYear = new Date().getFullYear();
				selectMonth(new Date().getMonth());
			}}
		>
			Jump to Current Month
		</button>
	</div>
</Modal>
