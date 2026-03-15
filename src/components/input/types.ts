import type { HTMLInputAttributes } from 'svelte/elements';

export interface InputProps extends HTMLInputAttributes {
	id?: string;
	label?: string;
	error?: string;
	value?: string | number | null;
	class?: string;
}
