<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { Card } from '../card';
	import { CloseIcon } from '../icons';
	import type { ModalProps } from './types';
	import {
		backdropStyle,
		containerStyle,
		cardContentStyle,
		headerStyle,
		titleStyle,
		closeButtonStyle,
		bodyStyle,
		footerStyle
	} from './styles';

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
		class={backdropStyle}
		transition:fade={{ duration: 150 }}
		onclick={handleBackdropClick}
		onkeydown={handleKeyDown}
		role="presentation"
	>
		<div
			transition:fly={{ y: 20, duration: 150 }}
			class={containerStyle}
			role="dialog"
			aria-modal="true"
			aria-labelledby={title ? titleId : undefined}
			tabindex="-1"
		>
			<Card padding="none" class={cardContentStyle}>
				{#if title}
					<div class={headerStyle}>
						<h2 class={titleStyle} id={titleId}>{title}</h2>
						<button class={closeButtonStyle} onclick={onclose} aria-label="Close">
							<CloseIcon />
						</button>
					</div>
				{/if}

				<div class={bodyStyle}>
					{@render children?.()}
				</div>

				{#if footer}
					<div class={footerStyle}>
						{@render footer()}
					</div>
				{/if}
			</Card>
		</div>
	</div>
{/if}
