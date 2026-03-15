import type { CardPadding, CardVariant } from './types';

export const styles = {
	base: 'rounded-md shadow-sm',
	padding: {
		none: '',
		sm: 'p-3',
		md: 'p-4',
		lg: 'p-6'
	} as Record<CardPadding, string>,
	variant: {
		panel: 'bg-discord-panel',
		sidebar: 'bg-discord-sidebar'
	} as Record<CardVariant, string>
};
