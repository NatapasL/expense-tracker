<script lang="ts">
	import { Modal } from '../components/modal';

	interface Props {
		value: Date;
		open: boolean;
		onclose?: () => void;
	}

	let { value = $bindable(), open = $bindable(), onclose }: Props = $props();

	let pickerYear = $state(value.getFullYear());

	const months = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	];

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
	<div class="space-y-4">
		<div class="flex items-center justify-between rounded-md bg-discord-sidebar p-2">
			<button
				class="rounded p-1 text-white transition-colors hover:bg-white/10"
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
			<span class="text-lg font-bold text-white">{pickerYear}</span>
			<button
				class="rounded p-1 text-white transition-colors hover:bg-white/10"
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

		<div class="grid grid-cols-3 gap-2">
			{#each months as month, i (month)}
				{@const isSelected = i === value.getMonth() && pickerYear === value.getFullYear()}
				<button
					class="rounded-md px-2 py-3 text-sm font-medium transition-colors {isSelected
						? 'bg-discord-blurple text-white'
						: 'hover:bg-discord-sidebar-hover bg-discord-sidebar text-discord-text-normal hover:text-white'}"
					onclick={() => selectMonth(i)}
				>
					{month.substring(0, 3)}
				</button>
			{/each}
		</div>

		<button
			class="w-full rounded-md bg-discord-sidebar py-2 text-sm font-medium text-discord-text-muted transition-colors hover:text-white"
			onclick={() => {
				pickerYear = new Date().getFullYear();
				selectMonth(new Date().getMonth());
			}}
		>
			Jump to Current Month
		</button>
	</div>
</Modal>
