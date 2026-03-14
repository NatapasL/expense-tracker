<script lang="ts">
	import Header from '../components/Header.svelte';
	import Button from '../components/Button.svelte';
	import Input from '../components/Input.svelte';
	import Card from '../components/Card.svelte';
	import { db, type Expense, type Category } from '../libs/dexie';
	import { liveQuery } from 'dexie';
	import { onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { CURRENCY_SYMBOL } from '../libs/constants';
	import { page } from '$app/state';

	interface Props {
		/** If provided, we are in edit mode for this item id */
		id?: string;
	}

	let { id }: Props = $props();

	const isEditing = $derived(!!id);

	// form state
	let amount = $state('');
	let categoryId = $state('');
	let date = $state(
		!id && page.url.searchParams.get('date')
			? page.url.searchParams.get('date')!
			: new Date().toISOString().split('T')[0]
	);
	let description = $state('');
	let saving = $state(false);
	let loading = $state(true);
	let userHasSelectedCategory = $state(false);

	$effect(() => {
		if (id) {
			loading = true; // reset to true if id changes
			// ... existing logic handles loading=false
		} else {
			loading = false;
		}
	});

	// errors
	let amountError = $state('');
	let categoryError = $state('');
	let dateError = $state('');

	let categories = $state<Category[]>([]);

	const catObservable = liveQuery(() => db.categories.toArray());
	const catSub = catObservable.subscribe((val) => {
		categories = val || [];
		// default to first category if none selected yet
		if (!categoryId && categories.length > 0) {
			categoryId = categories[0].id;
		}
	});

	onDestroy(() => catSub.unsubscribe());

	$effect(() => {
		if (isEditing && id) {
			db.expenses.get(id).then((found) => {
				if (found) {
					amount = String(found.amount);
					categoryId = found.category;
					date = found.date.split('T')[0];
					description = found.description;
					userHasSelectedCategory = true; // prevent auto-select when editing
				}
				loading = false;
			});
		}
	});

	// Auto-select category based on amount
	$effect(() => {
		if (isEditing || userHasSelectedCategory || !amount || categories.length === 0) return;

		const parsedAmount = parseFloat(amount);
		if (isNaN(parsedAmount) || parsedAmount <= 0) return;

		const threeMonthsAgo = Date.now() - 3 * 30 * 24 * 60 * 60 * 1000;

		console.log(parsedAmount)
		db.expenses
			.where('amount')
			.equals(parsedAmount)
			.and((e) => e.updatedAt > threeMonthsAgo && e.deleted === 0)
			.toArray()
			.then((matches) => {
				if (matches.length > 0) {
					// Count frequency
					const counts: Record<string, number> = {};
					matches.forEach((m) => {
						counts[m.category] = (counts[m.category] || 0) + 1;
					});
					const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
					const mostFrequent = sorted[0][0];
					if (categoryId !== mostFrequent) {
						categoryId = mostFrequent;
					}
				}
			});
	});

	function validate() {
		let valid = true;
		amountError = '';
		categoryError = '';
		dateError = '';

		const parsed = parseFloat(amount);
		if (!amount || isNaN(parsed) || parsed <= 0) {
			amountError = 'Please enter a valid positive amount.';
			valid = false;
		}
		if (!categoryId) {
			categoryError = 'Please select a category.';
			valid = false;
		}
		if (!date) {
			dateError = 'Please select a date.';
			valid = false;
		}
		return valid;
	}

	async function save() {
		if (!validate()) return;
		saving = true;

		const expenseData: Expense = {
			id: isEditing && id ? id : crypto.randomUUID(),
			amount: parseFloat(amount),
			category: categoryId,
			date: new Date(date).toISOString(),
			description: description.trim(),
			synced: 0,
			deleted: 0,
			updatedAt: Date.now()
		};

		if (isEditing) {
			await db.expenses.put(expenseData);
			goto(resolve(`/expense/${expenseData.id}`));
		} else {
			await db.expenses.add(expenseData);
			goto(resolve(`/`));
		}
	}

	function cancel() {
		if (isEditing && id) {
			goto(resolve(`/expense/${id}`));
		} else {
			goto(resolve(`/`));
		}
	}
</script>

<div class="flex h-full flex-col">
	<Header title={isEditing ? 'Edit Expense' : 'Add Expense'}>
		{#snippet leftIcon()}
			<button
				aria-label="Cancel"
				onclick={cancel}
				class="p-1 text-discord-text-muted transition-colors hover:text-white"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="2"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
				</svg>
			</button>
		{/snippet}
	</Header>

	<div class="flex-1 space-y-4 overflow-y-auto p-4 pb-8">
		{#if loading}
			<div class="py-16 text-center text-discord-text-muted">Loading...</div>
		{:else}
			<!-- Amount -->
			<Card variant="panel" class="p-4">
				<label
					for="amount-input"
					class="mb-2 block text-xs font-bold tracking-wider text-discord-text-muted uppercase"
					>Amount</label
				>
				<div class="flex items-center gap-2">
					{#if CURRENCY_SYMBOL}
						<span class="text-2xl font-bold text-discord-text-muted">{CURRENCY_SYMBOL}</span>
					{/if}
					<input
						id="amount-input"
						type="text"
						inputmode="decimal"
						placeholder="0.00"
						bind:value={amount}
						class="min-w-0 flex-1 bg-transparent text-3xl font-extrabold text-white placeholder-discord-text-muted/40 focus:outline-none"
					/>
				</div>
				{#if amountError}
					<p class="mt-1.5 text-xs font-medium text-discord-red">{amountError}</p>
				{/if}
			</Card>

			<!-- Category -->
			<div>
				<p class="mb-2 px-1 text-xs font-bold tracking-wider text-discord-text-muted uppercase">
					Category
				</p>
				{#if categoryError}
					<p class="mb-1.5 px-1 text-xs font-medium text-discord-red">{categoryError}</p>
				{/if}
				<div class="grid grid-cols-4 gap-2">
					{#each categories as cat (cat.id)}
						<button
							onclick={() => {
								categoryId = cat.id;
								userHasSelectedCategory = true;
							}}
							class="flex flex-col items-center gap-1 rounded-lg border-2 p-2 transition-all {categoryId ===
							cat.id
								? 'border-discord-blurple bg-discord-blurple/10'
								: 'border-transparent bg-discord-sidebar hover:border-discord-blurple/40'}"
						>
							<span class="text-2xl">{cat.icon}</span>
							<span
								class="w-full truncate text-center text-[10px] leading-tight text-discord-text-muted"
								>{cat.name}</span
							>
						</button>
					{/each}
				</div>
			</div>

			<!-- Date -->
			<div>
				<label
					for="date-input"
					class="mb-2 block px-1 text-xs font-bold tracking-wider text-discord-text-muted uppercase"
					>Date</label
				>
				<input
					id="date-input"
					type="date"
					bind:value={date}
					class="w-full rounded border border-black/30 bg-discord-panel p-2.5 text-discord-text-normal transition-all focus:border-transparent focus:ring-2 focus:ring-discord-blurple focus:outline-none"
				/>
				{#if dateError}
					<p class="mt-1 text-xs font-medium text-discord-red">{dateError}</p>
				{/if}
			</div>

			<!-- Description -->
			<Input
				label="Description (optional)"
				placeholder="e.g. Lunch with friends"
				bind:value={description}
			/>

			<!-- Save -->
			<Button variant="primary" fullWidth onclick={save} disabled={saving}>
				{saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Expense'}
			</Button>

			<Button variant="secondary" fullWidth onclick={cancel}>Cancel</Button>
		{/if}
	</div>
</div>
