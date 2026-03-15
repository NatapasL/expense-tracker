import type { Snippet } from 'svelte';

export interface ModalProps {
	open: boolean;
	onclose: () => void;
	title?: string;
	children?: Snippet;
	footer?: Snippet;
	closeOnBackdrop?: boolean;
}
