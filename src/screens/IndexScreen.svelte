<script lang="ts">
	import Header from '../components/Header.svelte';
	import Card from '../components/Card.svelte';
	import Modal from '../components/Modal.svelte';
	import { db, type Item, type Category } from '../libs/dexie';
	import { liveQuery } from 'dexie';
	import { onDestroy } from 'svelte';
	import { resolve } from '$app/paths';
	import { CURRENCY_SYMBOL } from '../libs/constants';

	let items: Item[] = $state([]);
	let categories: Category[] = $state([]);
	let groupedBy = $state<'date' | 'category'>('date');
	let selectedDate = $state(new Date());
	let showMonthPicker = $state(false);
	let pickerYear = $state(new Date().getFullYear());

	let startOfMonth = $derived(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).toISOString());
	let endOfMonth = $derived(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59, 999).toISOString());
	let monthLabel = $derived(selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));

	$effect(() => {
		// Access derived values here to ensure Svelte 5 tracks them as dependencies for this effect
		const start = startOfMonth;
		const end = endOfMonth;
		
		const itemsObservable = liveQuery(
			() => db.items.where('date').between(start, end).toArray()
		);
		const itemsSub = itemsObservable.subscribe(val => {
			items = val || [];
		});
		return () => itemsSub.unsubscribe();
	});

	const categoriesObservable = liveQuery(
		() => db.categories.toArray()
	);

	const catSub = categoriesObservable.subscribe(val => {
		categories = val || [];
	});

	onDestroy(() => {
		catSub.unsubscribe();
	});

	let totalSpent = $derived(items.reduce((sum, item) => sum + item.amount, 0));

	let groupedItemsByDate = $derived.by(() => {
		const groups: Record<string, { total: number; items: Item[] }> = {};
		items.forEach(item => {
			const d = item.date.split('T')[0];
			if (!groups[d]) groups[d] = { total: 0, items: [] };
			groups[d].items.push(item);
			groups[d].total += item.amount;
		});
		return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
	});

	let groupedItemsByCategory = $derived.by(() => {
		const groups: Record<string, { total: number; items: Item[]; category: Category | undefined }> = {};
		items.forEach(item => {
			const cid = item.category;
			if (!groups[cid]) {
				const cat = categories.find(c => c.id === cid);
				groups[cid] = { total: 0, items: [], category: cat };
			}
			groups[cid].items.push(item);
			groups[cid].total += item.amount;
		});
		return Object.entries(groups).sort((a, b) => b[1].total - a[1].total);
	});

	function getCategory(cid: string) {
		return categories.find(c => c.id === cid) || { id: 'unknown', name: 'Unknown', color: '#999', icon: '❓' };
	}

	const months = [
		'January', 'February', 'March', 'April', 'May', 'June',
		'July', 'August', 'September', 'October', 'November', 'December'
	];

	function selectMonth(monthIndex: number) {
		selectedDate = new Date(pickerYear, monthIndex, 1);
		showMonthPicker = false;
	}

</script>

<div class="h-full flex flex-col relative pb-20">
	<Header 
		title={monthLabel} 
		clickable={true} 
		onclick={() => {
			pickerYear = selectedDate.getFullYear();
			showMonthPicker = true;
		}} 
	/>

	<div class="flex-1 overflow-y-auto p-3 space-y-2">
		<Card variant="panel" class="flex items-center justify-between px-4 py-2">
			<h2 class="text-discord-text-muted text-[13px] uppercase font-bold tracking-wider">Total Spent</h2>
			<div class="text-lg font-extrabold text-white">{CURRENCY_SYMBOL}{totalSpent.toFixed(2)}</div>
		</Card>

		<div class="flex bg-discord-sidebar rounded-md p-1">
			<button class="flex-1 py-1.5 text-sm font-medium rounded {groupedBy === 'date' ? 'bg-discord-blurple text-white' : 'text-discord-text-normal hover:text-white'}" onclick={() => groupedBy = 'date'}>By Date</button>
			<button class="flex-1 py-1.5 text-sm font-medium rounded {groupedBy === 'category' ? 'bg-discord-blurple text-white' : 'text-discord-text-normal hover:text-white'}" onclick={() => groupedBy = 'category'}>By Category</button>
		</div>

		{#if items.length === 0}
			<div class="text-center text-discord-text-muted py-10">
				No expenses this month yet. Tap + to add one.
			</div>
		{:else}
			{#if groupedBy === 'date'}
				{#each groupedItemsByDate as [dateStr, group] (dateStr)}
					<div class="space-y-1">
						<div class="flex justify-between items-center px-1 pt-1">
							<h3 class="text-[13px] font-semibold text-discord-text-muted uppercase tracking-wide">{new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</h3>
							<span class="text-[13px] font-bold text-discord-text-muted">{CURRENCY_SYMBOL}{group.total.toFixed(2)}</span>
						</div>
						<div class="space-y-2">
							{#each group.items as item (item.id)}
								{@const cat = getCategory(item.category)}
								<a href={resolve(`/expense/${item.id}`)} class="block">
									<Card variant="sidebar" padding="none" class="flex items-center gap-3 px-3 py-2 hover:bg-discord-panel transition-colors cursor-pointer">
										<div class="w-8 h-8 rounded-full flex items-center justify-center text-lg" style="background-color: {cat.color}33; color: {cat.color}">
											{cat.icon}
										</div>
										<div class="flex-1 min-w-0">
											<div class="font-medium text-white truncate text-[15px]">{cat.name}</div>
											<div class="text-xs text-discord-text-muted">{item.description}</div>
										</div>
										<div class="font-semibold text-white text-[15px]">
											{CURRENCY_SYMBOL}{item.amount.toFixed(2)}
										</div>
									</Card>
								</a>
							{/each}
						</div>
					</div>
				{/each}
			{:else}
				{#each groupedItemsByCategory as [cid, group] (cid)}
					{@const cat = group.category || getCategory(cid)}
					<div class="space-y-1">
						<div class="flex justify-between items-center px-1 pt-1">
							<div class="flex items-center gap-1.5">
								<span class="text-base">{cat.icon}</span>
								<h3 class="text-[13px] font-semibold text-discord-text-muted uppercase tracking-wide">{cat.name}</h3>
							</div>
							<span class="text-[13px] font-bold text-discord-text-muted">{CURRENCY_SYMBOL}{group.total.toFixed(2)}</span>
						</div>
						<div class="space-y-2">
							{#each group.items as item (item.id)}
								<a href={resolve(`/expense/${item.id}`)} class="block">
									<Card variant="sidebar" padding="none" class="flex items-center gap-3 px-3 py-2 hover:bg-discord-panel transition-colors cursor-pointer">
										<div class="flex-1 min-w-0">
											<div class="font-medium text-white truncate text-[15px]">{new Date(item.date).toLocaleDateString()}</div>
											<div class="text-xs text-discord-text-muted">{item.description}</div>
										</div>
										<div class="font-semibold text-white text-[15px]">
											{CURRENCY_SYMBOL}{item.amount.toFixed(2)}
										</div>
									</Card>
								</a>
							{/each}
						</div>
					</div>
				{/each}
			{/if}
		{/if}
	</div>

	<!-- FAB -->
	<div class="fixed bottom-6 right-6 z-50">
		<a href={resolve(`/expense/new`)} aria-label="Add Expense via Link">
			<button aria-label="Add Expense" class="w-14 h-14 bg-discord-blurple hover:bg-[#4752C4] text-white rounded-full flex items-center justify-center shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-discord-bg transition-transform hover:scale-105 active:scale-95">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
				</svg>
			</button>
		</a>
	</div>

	<!-- Month Picker Modal -->
	<Modal open={showMonthPicker} onclose={() => showMonthPicker = false} title="Select Month">
		<div class="space-y-4">
			<div class="flex items-center justify-between bg-discord-sidebar p-2 rounded-md">
				<button 
					class="p-1 hover:bg-white/10 rounded transition-colors text-white"
					onclick={() => pickerYear--}
					aria-label="Previous Year"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
				</button>
				<span class="font-bold text-white text-lg">{pickerYear}</span>
				<button 
					class="p-1 hover:bg-white/10 rounded transition-colors text-white"
					onclick={() => pickerYear++}
					aria-label="Next Year"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
				</button>
			</div>

			<div class="grid grid-cols-3 gap-2">
				{#each months as month, i (month)}
					{@const isSelected = i === selectedDate.getMonth() && pickerYear === selectedDate.getFullYear()}
					<button 
						class="py-3 px-2 rounded-md text-sm font-medium transition-colors {isSelected ? 'bg-discord-blurple text-white' : 'bg-discord-sidebar text-discord-text-normal hover:bg-discord-sidebar-hover hover:text-white'}"
						onclick={() => selectMonth(i)}
					>
						{month.substring(0, 3)}
					</button>
				{/each}
			</div>

			<button 
				class="w-full py-2 bg-discord-sidebar text-discord-text-muted hover:text-white transition-colors text-sm font-medium rounded-md"
				onclick={() => {
					pickerYear = new Date().getFullYear();
					selectMonth(new Date().getMonth());
				}}
			>
				Jump to Current Month
			</button>
		</div>
	</Modal>
</div>
