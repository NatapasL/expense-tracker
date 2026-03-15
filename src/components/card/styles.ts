import type { CardPadding, CardVariant } from './types';

export const baseCardStyle = 'rounded-md shadow-sm';

export const paddingStyle: Record<CardPadding, string> = {
	none: '',
	sm: 'p-3',
	md: 'p-4',
	lg: 'p-6'
};

export const variantStyle: Record<CardVariant, string> = {
	panel: 'bg-discord-panel',
	sidebar: 'bg-discord-sidebar'
};
