<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { Card } from '../card';
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
</script>

{#if open}
	<div
		class={backdropStyle}
		transition:fade={{ duration: 150 }}
		onclick={handleBackdropClick}
		role="dialog"
		aria-modal="true"
	>
		<div transition:fly={{ y: 20, duration: 150 }} class={containerStyle}>
			<Card padding="none" class={cardContentStyle}>
				{#if title}
					<div class={headerStyle}>
						<h2 class={titleStyle}>{title}</h2>
						<button class={closeButtonStyle} onclick={onclose} aria-label="Close">
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
