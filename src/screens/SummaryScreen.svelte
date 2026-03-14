<script lang="ts">
	import Header from '../components/Header.svelte';
	import Card from '../components/Card.svelte';
	import MonthPicker from '../feature/MonthPicker.svelte';
	import { db, type Item, type Category } from '../libs/dexie';
	import { liveQuery } from 'dexie';
	import { onDestroy } from 'svelte';
	import { CURRENCY_SYMBOL } from '../libs/constants';
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';

	let items: Item[] = $state([]);
	let categories: Category[] = $state([]);
	let selectedDate = $state(new Date());
	let showMonthPicker = $state(false);

	let startOfMonth = $derived(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).toISOString());
	let endOfMonth = $derived(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59, 999).toISOString());
	let monthLabel = $derived(selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));

	$effect(() => {
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

	// Metrics
	let totalSpent = $derived(items.reduce((sum, item) => sum + item.amount, 0));
	
	let dailyAverage = $derived.by(() => {
		if (items.length === 0) return 0;
		const today = new Date();
		let days;
		if (today.getMonth() === selectedDate.getMonth() && today.getFullYear() === selectedDate.getFullYear()) {
			days = today.getDate(); // Use days passed if current month
		} else {
			days = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate(); // Total days if past month
		}
		return totalSpent / (days || 1);
	});

	let statsByCategory = $derived.by(() => {
		const groups: Record<string, { total: number; color: string; icon: string; name: string }> = {};
		items.forEach(item => {
			if (!groups[item.category]) {
				const cat = categories.find(c => c.id === item.category);
				groups[item.category] = { 
					total: 0, 
					color: cat?.color || '#999', 
					icon: cat?.icon || '❓', 
					name: cat?.name || 'Unknown' 
				};
			}
			groups[item.category].total += item.amount;
		});
		return Object.values(groups).sort((a, b) => b.total - a.total);
	});

	let weeklyTotals = $derived.by(() => {
		const groups: { label: string; total: number }[] = [];
		const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
		const monthEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
		const totalDays = monthEnd.getDate();
		const today = new Date();
		const isCurrentMonth = today.getMonth() === selectedDate.getMonth() && today.getFullYear() === selectedDate.getFullYear();

		for (let i = 0; i < 5; i++) {
			const start = i * 7 + 1;
			if (start > totalDays) break;
			const end = Math.min((i + 1) * 7, totalDays);
			
			const monthName = monthStart.toLocaleDateString('en-US', { month: 'short' });
			const label = `${monthName} ${start}-${end}`;
			
			const total = items.reduce((sum, item) => {
				const itemDate = new Date(item.date);
				const day = itemDate.getDate();
				return (day >= start && day <= end) ? sum + item.amount : sum;
			}, 0);

			if (total > 0 || (isCurrentMonth && start <= today.getDate())) {
				groups.push({ label, total });
			}
		}
		return groups;
	});

	let maxWeeklyTotal = $derived(Math.max(...weeklyTotals.map(w => w.total), 0));


</script>

{#snippet rightIcon()}
	<button 
		onclick={() => goto(resolve('/categories'))} 
		class="text-discord-text-muted hover:text-white transition-colors p-1"
		aria-label="Manage Categories"
	>
		<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
		</svg>
	</button>
{/snippet}

<div class="h-full flex flex-col relative">
	<Header 
		title={monthLabel} 
		{rightIcon} 
		clickable={true} 
		onclick={() => {
			showMonthPicker = true;
		}}
	/>

	<div class="flex-1 overflow-y-auto p-3 space-y-4 pb-10">
		<!-- Summary Cards -->
		<div class="grid grid-cols-2 gap-3">
			<Card variant="panel" class="p-4 flex flex-col items-center">
				<span class="text-[11px] font-bold text-discord-text-muted uppercase tracking-wider mb-1">Total Spent</span>
				<span class="text-xl font-extrabold text-white">{CURRENCY_SYMBOL}{totalSpent.toFixed(2)}</span>
			</Card>
			<Card variant="panel" class="p-4 flex flex-col items-center">
				<span class="text-[11px] font-bold text-discord-text-muted uppercase tracking-wider mb-1">Daily Avg</span>
				<span class="text-xl font-extrabold text-white">{CURRENCY_SYMBOL}{dailyAverage.toFixed(2)}</span>
			</Card>
		</div>

		<!-- Category Breakdown -->
		<section class="space-y-2">
			<h3 class="text-[13px] font-bold text-discord-text-muted uppercase tracking-wide px-1">By Category</h3>
			<div class="space-y-2">
				{#each statsByCategory as stat (stat.name)}
					<Card variant="sidebar" padding="none" class="flex items-center gap-3 px-3 py-2.5">
						<div class="w-8 h-8 rounded-full flex items-center justify-center text-lg shrink-0" style="background-color: {stat.color}33; color: {stat.color}">
							{stat.icon}
						</div>
						<div class="flex-1 min-w-0">
							<div class="text-[15px] font-medium text-white truncate">{stat.name}</div>
							<!-- Progress bar -->
							<div class="mt-1.5 h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
								<div class="h-full rounded-full" style="background-color: {stat.color}; width: {(stat.total / totalSpent * 100).toFixed(1)}%"></div>
							</div>
						</div>
						<div class="text-right shrink-0">
							<div class="text-[15px] font-bold text-white">{CURRENCY_SYMBOL}{stat.total.toFixed(2)}</div>
							<div class="text-[10px] font-medium text-discord-text-muted">{(stat.total / totalSpent * 100).toFixed(0)}%</div>
						</div>
					</Card>
				{:else}
					<div class="text-center py-6 text-discord-text-muted text-sm italic">No data to display.</div>
				{/each}
			</div>
		</section>

		<!-- Weekly Breakdown -->
		<section class="space-y-2">
			<h3 class="text-[13px] font-bold text-discord-text-muted uppercase tracking-wide px-1">Weekly Totals</h3>
			<Card variant="panel" class="p-3">
				<div class="space-y-3">
					{#each weeklyTotals as group (group.label)}
						<div class="flex items-center gap-3">
							<span class="text-xs font-bold text-discord-text-muted w-20 leading-tight">{group.label}</span>
							<div class="flex-1 h-3 bg-black/20 rounded-full overflow-hidden">
								<div class="h-full bg-discord-blurple rounded-full" style="width: {(group.total / (maxWeeklyTotal || 1) * 100).toFixed(1)}%"></div>
							</div>
							<span class="text-xs font-bold text-white w-16 text-right">{CURRENCY_SYMBOL}{group.total.toFixed(0)}</span>
						</div>
					{:else}
						<div class="text-center py-2 text-discord-text-muted text-sm italic">No weekly data.</div>
					{/each}
				</div>
			</Card>
		</section>
	</div>

	<!-- Month Picker Feature -->
	<MonthPicker bind:value={selectedDate} bind:open={showMonthPicker} />
</div>
