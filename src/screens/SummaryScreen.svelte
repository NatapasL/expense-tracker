<script lang="ts">
	import { Header } from '../components/header';
	import { Card } from '../components/card';
	import { MonthPicker } from '../feature/month-picker';
	import { db, type Expense, type Category } from '../libs/dexie';
	import { liveQuery } from 'dexie';
	import { onDestroy } from 'svelte';
	import { CURRENCY_SYMBOL } from '../libs/constants';
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { syncToGoogleSheets } from '../libs/sync';
	import { formatCurrency } from '../libs/utils';
	import { settings } from '../libs/settings.svelte.ts';
	import { auth } from '../libs/auth.svelte';


	let expenses: Expense[] = $state([]);
	let categories: Category[] = $state([]);
	let showMonthPicker = $state(false);
	let syncing = $state(false);

	async function handleSync() {
		if (syncing) return;
		if (!auth.isAuthenticated) {
			const success = await auth.login();
			if (!success) return;
		}
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
		new Date(settings.selectedDate.getFullYear(), settings.selectedDate.getMonth(), 1).toISOString()
	);
	let endOfMonth = $derived(
		new Date(
			settings.selectedDate.getFullYear(),
			settings.selectedDate.getMonth() + 1,
			0,
			23,
			59,
			59,
			999
		).toISOString()
	);
	let monthLabel = $derived(
		settings.selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
	);


	$effect(() => {
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

	// Metrics
	let totalSpent = $derived(expenses.reduce((sum, expense) => sum + expense.amount, 0));

	let dailyAverage = $derived.by(() => {
		if (expenses.length === 0) return 0;
		const today = new Date();
		let days;
		if (
			today.getMonth() === settings.selectedDate.getMonth() &&
			today.getFullYear() === settings.selectedDate.getFullYear()
		) {
			days = today.getDate(); // Use days passed if current month
		} else {
			days = new Date(settings.selectedDate.getFullYear(), settings.selectedDate.getMonth() + 1, 0).getDate(); // Total days if past month
		}

		return totalSpent / (days || 1);
	});

	let statsByCategory = $derived.by(() => {
		const groups: Record<string, { total: number; color: string; icon: string; name: string }> = {};
		expenses.forEach((expense) => {
			if (!groups[expense.category]) {
				const cat = categories.find((c) => c.id === expense.category);
				groups[expense.category] = {
					total: 0,
					color: cat?.color || '#999',
					icon: cat?.icon || '❓',
					name: cat?.name || 'Unknown'
				};
			}
			groups[expense.category].total += expense.amount;
		});
		return Object.values(groups).sort((a, b) => b.total - a.total);
	});

	let weeklyTotals = $derived.by(() => {
		const groups: { label: string; total: number }[] = [];
		const year = settings.selectedDate.getFullYear();
		const month = settings.selectedDate.getMonth();
		const monthStart = new Date(year, month, 1);
		const monthEnd = new Date(year, month + 1, 0);
		const totalDays = monthEnd.getDate();
		const today = new Date();
		const isCurrentMonth =
			today.getMonth() === month &&
			today.getFullYear() === year;

		const firstDayOfWeek = monthStart.getDay(); // 0 (Sun) to 6 (Sat)
		// Distance to the first Sunday (end of first calendar week)
		const daysToSunday = (7 - firstDayOfWeek) % 7;
		let currentStart = 1;

		while (currentStart <= totalDays) {
			let currentEnd;
			if (currentStart === 1) {
				currentEnd = Math.min(1 + daysToSunday, totalDays);
			} else {
				currentEnd = Math.min(currentStart + 6, totalDays);
			}

			const monthName = monthStart.toLocaleDateString('en-US', { month: 'short' });
			const label =
				currentStart === currentEnd
					? `${monthName} ${currentStart}`
					: `${monthName} ${currentStart}-${currentEnd}`;

			const total = expenses.reduce((sum, expense) => {
				const expenseDate = new Date(expense.date);
				const day = expenseDate.getDate();
				return day >= currentStart && day <= currentEnd ? sum + expense.amount : sum;
			}, 0);

			if (total > 0 || (isCurrentMonth && currentStart <= today.getDate())) {
				groups.push({ label, total });
			}

			currentStart = currentEnd + 1;
		}
		return groups;
	});

	let maxWeeklyTotal = $derived(Math.max(...weeklyTotals.map((w) => w.total), 0));
</script>

{#snippet rightIcon()}
	<div class="flex items-center gap-1">
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
		<button
			onclick={() => goto(resolve('/categories'))}
			class="p-1 text-discord-text-muted transition-colors hover:text-white"
			aria-label="Manage Categories"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-6 w-6"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
				/>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
				/>
			</svg>
		</button>
	</div>
{/snippet}

<div class="relative flex h-full flex-col">
	<Header
		title={monthLabel}
		{rightIcon}
		clickable={true}
		onclick={() => {
			showMonthPicker = true;
		}}
	/>

	<div class="flex-1 space-y-4 overflow-y-auto p-3 pb-10">
		<!-- Summary Cards -->
		<div class="grid grid-cols-2 gap-3">
			<Card variant="panel" class="flex flex-col items-center p-4">
				<span class="mb-1 text-[11px] font-bold tracking-wider text-discord-text-muted uppercase"
					>Total Spent</span
				>
				<span class="text-xl font-extrabold text-white"
					>{CURRENCY_SYMBOL}{formatCurrency(totalSpent)}</span
				>
			</Card>
			<Card variant="panel" class="flex flex-col items-center p-4">
				<span class="mb-1 text-[11px] font-bold tracking-wider text-discord-text-muted uppercase"
					>Daily Avg</span
				>
				<span class="text-xl font-extrabold text-white"
					>{CURRENCY_SYMBOL}{formatCurrency(dailyAverage)}</span
				>
			</Card>
		</div>

		<!-- Category Breakdown -->
		<section class="space-y-2">
			<h3 class="px-1 text-[13px] font-bold tracking-wide text-discord-text-muted uppercase">
				By Category
			</h3>
			<div class="space-y-2">
				{#each statsByCategory as stat (stat.name)}
					<Card variant="sidebar" padding="none" class="flex items-center gap-3 px-3 py-2.5">
						<div
							class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg"
							style="background-color: {stat.color}33; color: {stat.color}"
						>
							{stat.icon}
						</div>
						<div class="min-w-0 flex-1">
							<div class="truncate text-[15px] font-medium text-white">{stat.name}</div>
							<!-- Progress bar -->
							<div class="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-black/20">
								<div
									class="h-full rounded-full"
									style="background-color: {stat.color}; width: {(
										(stat.total / totalSpent) *
										100
									).toFixed(1)}%"
								></div>
							</div>
						</div>
						<div class="shrink-0 text-right">
							<div class="text-[15px] font-bold text-white">
								{CURRENCY_SYMBOL}{formatCurrency(stat.total)}
							</div>
							<div class="text-[10px] font-medium text-discord-text-muted">
								{((stat.total / totalSpent) * 100).toFixed(0)}%
							</div>
						</div>
					</Card>
				{:else}
					<div class="text-center py-6 text-discord-text-muted text-sm italic">
						No data to display.
					</div>
				{/each}
			</div>
		</section>

		<!-- Weekly Breakdown -->
		<section class="space-y-2">
			<h3 class="px-1 text-[13px] font-bold tracking-wide text-discord-text-muted uppercase">
				Weekly Totals
			</h3>
			<Card variant="panel" class="p-3">
				<div class="space-y-3">
					{#each weeklyTotals as group (group.label)}
						<div class="flex items-center gap-3">
							<span class="w-20 text-xs leading-tight font-bold text-discord-text-muted"
								>{group.label}</span
							>
							<div class="h-3 flex-1 overflow-hidden rounded-full bg-black/20">
								<div
									class="h-full rounded-full bg-discord-blurple"
									style="width: {((group.total / (maxWeeklyTotal || 1)) * 100).toFixed(1)}%"
								></div>
							</div>
							<span class="w-16 text-right text-xs font-bold text-white"
								>{CURRENCY_SYMBOL}{formatCurrency(group.total)}</span
							>
						</div>
					{:else}
						<div class="text-center py-2 text-discord-text-muted text-sm italic">
							No weekly data.
						</div>
					{/each}
				</div>
			</Card>
		</section>
	</div>

	<!-- Month Picker Feature -->
	<MonthPicker bind:value={settings.selectedDate} bind:open={showMonthPicker} />
</div>
