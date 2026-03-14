<script lang="ts">
	import Header from '../components/Header.svelte';
	import Card from '../components/Card.svelte';
	import MonthPicker from '../feature/MonthPicker.svelte';
	import { db, type Expense, type Category } from '../libs/dexie';
	import { liveQuery } from 'dexie';
	import { onDestroy } from 'svelte';
	import { resolve } from '$app/paths';
	import { CURRENCY_SYMBOL } from '../libs/constants';
	import { syncToGoogleSheets } from '../libs/sync';
	import { formatCurrency, formatDateLong } from '../libs/utils';

	let expenses: Expense[] = $state([]);
	let categories: Category[] = $state([]);
	let groupedBy = $state<'date' | 'category'>('date');
	let selectedDate = $state(new Date());
	let showMonthPicker = $state(false);
	let syncing = $state(false);

	async function handleSync() {
		if (syncing) return;
		syncing = true;
		try {
			await syncToGoogleSheets();
		} catch (error) {
			console.error('Manual sync failed:', error);
			alert('Sync failed. Please check your connection and try again.');
		} finally {
			syncing = false;
		}
	}

	let startOfMonth = $derived(
		new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).toISOString()
	);
	let endOfMonth = $derived(
		new Date(
			selectedDate.getFullYear(),
			selectedDate.getMonth() + 1,
			0,
			23,
			59,
			59,
			999
		).toISOString()
	);
	let monthLabel = $derived(
		selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
	);

	$effect(() => {
		// Access derived values here to ensure Svelte 5 tracks them as dependencies for this effect
		const start = startOfMonth;
		const end = endOfMonth;

		const expensesObservable = liveQuery(() =>
			db.expenses.where('date').between(start, end).filter((e) => e.deleted === 0).toArray()
		);
		const expensesSub = expensesObservable.subscribe((val) => {
			expenses = val || [];
		});
		return () => expensesSub.unsubscribe();
	});

	const categoriesObservable = liveQuery(() => db.categories.toArray());

	const catSub = categoriesObservable.subscribe((val) => {
		categories = val || [];
	});

	onDestroy(() => {
		catSub.unsubscribe();
	});

	let totalSpent = $derived(expenses.reduce((sum, expense) => sum + expense.amount, 0));

	let groupedExpensesByDate = $derived.by(() => {
		const groups: Record<string, { total: number; expenses: Expense[] }> = {};
		expenses.forEach((expense) => {
			const d = expense.date.split('T')[0];
			if (!groups[d]) groups[d] = { total: 0, expenses: [] };
			groups[d].expenses.push(expense);
			groups[d].total += expense.amount;
		});
		return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
	});

	let groupedExpensesByCategory = $derived.by(() => {
		const groups: Record<
			string,
			{ total: number; expenses: Expense[]; category: Category | undefined }
		> = {};
		expenses.forEach((expense) => {
			const cid = expense.category;
			if (!groups[cid]) {
				const cat = categories.find((c) => c.id === cid);
				groups[cid] = { total: 0, expenses: [], category: cat };
			}
			groups[cid].expenses.push(expense);
			groups[cid].total += expense.amount;
		});
		return Object.entries(groups).sort((a, b) => b[1].total - a[1].total);
	});

	function getCategory(cid: string) {
		return (
			categories.find((c) => c.id === cid) || {
				id: 'unknown',
				name: 'Unknown',
				color: '#999',
				icon: '❓'
			}
		);
	}
</script>

{#snippet rightIcon()}
	<button
		onclick={handleSync}
		disabled={syncing}
		class="p-1 text-discord-text-muted transition-colors hover:text-white disabled:opacity-50"
		aria-label="Sync now"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="h-5 w-5 {syncing ? 'animate-spin' : ''}"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
			/>
		</svg>
	</button>
{/snippet}

<div class="relative flex h-full flex-col pb-20">
	<Header
		title={monthLabel}
		{rightIcon}
		clickable={true}
		onclick={() => {
			showMonthPicker = true;
		}}
	/>

	<div class="flex-1 space-y-2 overflow-y-auto p-3">
		<Card variant="panel" class="flex items-center justify-between px-4 py-2">
			<h2 class="text-[13px] font-bold tracking-wider text-discord-text-muted uppercase">
				Total Spent
			</h2>
			<div class="text-lg font-extrabold text-white">{CURRENCY_SYMBOL}{formatCurrency(totalSpent)}</div>
		</Card>

		<div class="flex rounded-md bg-discord-sidebar p-1">
			<button
				class="flex-1 rounded py-1.5 text-sm font-medium {groupedBy === 'date'
					? 'bg-discord-blurple text-white'
					: 'text-discord-text-normal hover:text-white'}"
				onclick={() => (groupedBy = 'date')}>By Date</button
			>
			<button
				class="flex-1 rounded py-1.5 text-sm font-medium {groupedBy === 'category'
					? 'bg-discord-blurple text-white'
					: 'text-discord-text-normal hover:text-white'}"
				onclick={() => (groupedBy = 'category')}>By Category</button
			>
		</div>

		{#if expenses.length === 0}
			<div class="py-10 text-center text-discord-text-muted">
				No expenses this month yet. Tap + to add one.
			</div>
		{:else if groupedBy === 'date'}
			{#each groupedExpensesByDate as [dateStr, group] (dateStr)}
				<div class="space-y-1">
					<div class="flex items-center justify-between px-1 pt-1">
						<h3 class="text-[13px] font-semibold tracking-wide text-discord-text-muted uppercase">
							{new Date(dateStr).toLocaleDateString('en-US', {
								weekday: 'short',
								month: 'short',
								day: 'numeric'
							})}
						</h3>
						<span class="text-[13px] font-bold text-discord-text-muted"
							>{CURRENCY_SYMBOL}{formatCurrency(group.total)}</span
						>
					</div>
					<div class="space-y-2">
						{#each group.expenses as expense (expense.id)}
							{@const cat = getCategory(expense.category)}
							<a href={resolve(`/expense/${expense.id}`)} class="block">
								<Card
									variant="sidebar"
									padding="none"
									class="flex cursor-pointer items-center gap-3 px-3 py-2 transition-colors hover:bg-discord-panel"
								>
									<div
										class="flex h-8 w-8 items-center justify-center rounded-full text-lg"
										style="background-color: {cat.color}33; color: {cat.color}"
									>
										{cat.icon}
									</div>
									<div class="min-w-0 flex-1">
										<div class="truncate text-[15px] font-medium text-white">{cat.name}</div>
										<div class="text-xs text-discord-text-muted">{expense.description}</div>
									</div>
									<div class="text-[15px] font-semibold text-white">
										{CURRENCY_SYMBOL}{formatCurrency(expense.amount)}
									</div>
								</Card>
							</a>
						{/each}
					</div>
				</div>
			{/each}
		{:else}
			{#each groupedExpensesByCategory as [cid, group] (cid)}
				{@const cat = group.category || getCategory(cid)}
				<div class="space-y-1">
					<div class="flex items-center justify-between px-1 pt-1">
						<div class="flex items-center gap-1.5">
							<span class="text-base">{cat.icon}</span>
							<h3 class="text-[13px] font-semibold tracking-wide text-discord-text-muted uppercase">
								{cat.name}
							</h3>
						</div>
						<span class="text-[13px] font-bold text-discord-text-muted"
							>{CURRENCY_SYMBOL}{formatCurrency(group.total)}</span
						>
					</div>
					<div class="space-y-2">
						{#each group.expenses as expense (expense.id)}
							<a href={resolve(`/expense/${expense.id}`)} class="block">
								<Card
									variant="sidebar"
									padding="none"
									class="flex cursor-pointer items-center gap-3 px-3 py-2 transition-colors hover:bg-discord-panel"
								>
									<div class="min-w-0 flex-1">
										<div class="truncate text-[15px] font-medium text-white">
											{formatDateLong(expense.date)}
										</div>
										<div class="text-xs text-discord-text-muted">{expense.description}</div>
									</div>
									<div class="text-[15px] font-semibold text-white">
										{CURRENCY_SYMBOL}{formatCurrency(expense.amount)}
									</div>
								</Card>
							</a>
						{/each}
					</div>
				</div>
			{/each}
		{/if}
	</div>

	<!-- FAB -->
	<div class="fixed right-6 bottom-6 z-50">
		<a href={resolve(`/expense/new`)} aria-label="Add Expense via Link">
			<button
				aria-label="Add Expense"
				class="flex h-14 w-14 items-center justify-center rounded-full bg-discord-blurple text-white shadow-lg transition-transform hover:scale-105 hover:bg-[#4752C4] focus:ring-2 focus:ring-offset-2 focus:ring-offset-discord-bg focus:outline-none active:scale-95"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="2"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
				</svg>
			</button>
		</a>
	</div>

	<!-- Month Picker Feature -->
	<MonthPicker bind:value={selectedDate} bind:open={showMonthPicker} />
</div>
