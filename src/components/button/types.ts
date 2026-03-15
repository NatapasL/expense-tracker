import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';

export interface ButtonProps extends HTMLButtonAttributes {
	children?: Snippet;
	variant?: ButtonVariant;
	class?: string;
	fullWidth?: boolean;
}
