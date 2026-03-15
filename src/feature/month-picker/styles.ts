export const styles = {
	container: 'space-y-4',
	yearSelector: 'flex items-center justify-between rounded-md bg-discord-sidebar p-2',
	yearButton: 'rounded p-1 text-white transition-colors hover:bg-white/10',
	yearLabel: 'text-lg font-bold text-white',
	grid: 'grid grid-cols-3 gap-2',
	monthButton: (isSelected: boolean) =>
		`rounded-md px-2 py-3 text-sm font-medium transition-colors ${
			isSelected
				? 'bg-discord-blurple text-white'
				: 'hover:bg-discord-sidebar-hover bg-discord-sidebar text-discord-text-normal hover:text-white'
		}`,
	jumpButton:
		'w-full rounded-md bg-discord-sidebar py-2 text-sm font-medium text-discord-text-muted transition-colors hover:text-white'
};
