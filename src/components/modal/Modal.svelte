<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { Card } from '../card';
	import { CloseIcon } from '../icons';
	import type { ModalProps } from './types';
	import { styles } from './styles';

	let { open, onclose, title, children, footer, closeOnBackdrop = true }: ModalProps = $props();

	function handleBackdropClick(e: MouseEvent) {
		if (closeOnBackdrop && e.target === e.currentTarget) {
			onclose();
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (closeOnBackdrop && e.key === 'Escape') {
			onclose();
		}
	}

	const titleId = `modal-title-${Math.random().toString(36).slice(2, 9)}`;
</script>

{#if open}
	<div
		class={styles.backdrop}
		transition:fade={{ duration: 150 }}
		onclick={handleBackdropClick}
		onkeydown={handleKeyDown}
		role="presentation"
	>
		<div
			transition:fly={{ y: 20, duration: 150 }}
			class={styles.container}
			role="dialog"
			aria-modal="true"
			aria-labelledby={title ? titleId : undefined}
			tabindex="-1"
		>
			<Card padding="none" class={styles.cardContent}>
				{#if title}
					<div class={styles.header}>
						<h2 class={styles.title} id={titleId}>{title}</h2>
						<button class={styles.closeButton} onclick={onclose} aria-label="Close">
							<CloseIcon />
						</button>
					</div>
				{/if}

				<div class={styles.body}>
					{@render children?.()}
				</div>

				{#if footer}
					<div class={styles.footer}>
						{@render footer()}
					</div>
				{/if}
			</Card>
		</div>
	</div>
{/if}
