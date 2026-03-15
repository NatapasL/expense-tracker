<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { Card } from './card';

	interface Props {
		open: boolean;
		onclose: () => void;
		title?: string;
		children?: Snippet;
		footer?: Snippet;
		closeOnBackdrop?: boolean;
	}

	let { open, onclose, title, children, footer, closeOnBackdrop = true }: Props = $props();

	function handleBackdropClick(e: MouseEvent) {
		if (closeOnBackdrop && e.target === e.currentTarget) {
			onclose();
		}
	}
</script>

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
		transition:fade={{ duration: 150 }}
		onclick={handleBackdropClick}
		role="dialog"
		aria-modal="true"
	>
		<div transition:fly={{ y: 20, duration: 150 }} class="w-full max-w-md">
			<Card
				padding="none"
				class="flex max-h-[90vh] flex-col overflow-hidden bg-[var(--color-discord-bg)]"
			>
				{#if title}
					<div class="flex flex-shrink-0 items-center justify-between border-b border-black/20 p-4">
						<h2 class="text-xl font-bold text-white">{title}</h2>
						<button
							class="text-discord-text-muted transition-colors hover:text-white focus:outline-none"
							onclick={onclose}
							aria-label="Close"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"
								></line></svg
							>
						</button>
					</div>
				{/if}

				<div class="overflow-y-auto p-4">
					{@render children?.()}
				</div>

				{#if footer}
					<div
						class="flex flex-shrink-0 justify-end gap-2 border-t border-black/20 bg-discord-sidebar p-4"
					>
						{@render footer()}
					</div>
				{/if}
			</Card>
		</div>
	</div>
{/if}
