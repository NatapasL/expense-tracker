import type { Snippet } from 'svelte';

export interface HeaderProps {
	title: string;
	leftIcon?: Snippet;
	rightIcon?: Snippet;
	onclick?: () => void;
	clickable?: boolean;
}
