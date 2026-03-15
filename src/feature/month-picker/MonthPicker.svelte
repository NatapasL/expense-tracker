<script lang="ts">
	import { Modal } from '@/components/modal';
	import { ChevronLeftIcon, ChevronRightIcon } from '@/components/icons';
	import type { MonthPickerProps } from './types';
	import { MONTHS } from './constants';
	import { styles } from './styles';

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
	<div class={styles.container}>
		<div class={styles.yearSelector}>
			<button class={styles.yearButton} onclick={() => pickerYear--} aria-label="Previous Year">
				<ChevronLeftIcon size={20} />
			</button>
			<span class={styles.yearLabel}>{pickerYear}</span>
			<button class={styles.yearButton} onclick={() => pickerYear++} aria-label="Next Year">
				<ChevronRightIcon size={20} />
			</button>
		</div>

		<div class={styles.grid}>
			{#each MONTHS as month, i (month)}
				{@const isSelected = i === value.getMonth() && pickerYear === value.getFullYear()}
				<button class={styles.monthButton(isSelected)} onclick={() => selectMonth(i)}>
					{month.substring(0, 3)}
				</button>
			{/each}
		</div>

		<button
			class={styles.jumpButton}
			onclick={() => {
				pickerYear = new Date().getFullYear();
				selectMonth(new Date().getMonth());
			}}
		>
			Jump to Current Month
		</button>
	</div>
</Modal>
