export const styles = {
	container: 'flex h-full flex-col',
	scrollContent: 'flex-1 space-y-6 overflow-y-auto p-4 pb-20',
	previewContainer: 'flex justify-center py-4',
	previewCircle: 'flex h-20 w-20 items-center justify-center rounded-full border-4 border-discord-sidebar text-4xl shadow-lg transition-all duration-300',
	formContainer: 'space-y-4',
	label: 'mb-2 block px-1 text-xs font-bold tracking-wider text-discord-text-muted uppercase',
	iconInputWrapper: 'mb-3 flex justify-center',
	iconInput: 'h-16 w-16 rounded-xl border border-black/30 bg-discord-panel text-center text-3xl shadow-inner focus:ring-2 focus:ring-discord-blurple focus:outline-none',
	errorText: 'mt-1 px-1 text-center text-xs font-medium text-discord-red',
	colorGrid: 'grid grid-cols-6 gap-3 p-1',
	colorButton: 'aspect-square w-full rounded-full border-4 transition-all',
	activeColor: 'border-white',
	inactiveColor: 'border-transparent hover:scale-110',
	footerActions: 'space-y-3 pt-4',
	loadingState: 'py-16 text-center text-discord-text-muted'
};
