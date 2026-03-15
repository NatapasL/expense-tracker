import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';
export type CardVariant = 'panel' | 'sidebar';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
	children?: Snippet;
	class?: string;
	padding?: CardPadding;
	variant?: CardVariant;
}
