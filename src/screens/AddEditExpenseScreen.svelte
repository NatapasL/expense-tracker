<script lang="ts">
	import Header from '../components/Header.svelte';
	import Button from '../components/Button.svelte';
	import Input from '../components/Input.svelte';
	import Card from '../components/Card.svelte';
	import { db, type Item, type Category } from '../libs/dexie';
	import { liveQuery } from 'dexie';
	import { onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { CURRENCY_SYMBOL } from '../libs/constants';

	interface Props {
		/** If provided, we are in edit mode for this item id */
		id?: string;
	}

	let { id }: Props = $props();

	const isEditing = $derived(!!id);

	// form state
	let amount = $state('');
	let categoryId = $state('');
	let date = $state(new Date().toISOString().split('T')[0]);
	let description = $state('');
	let saving = $state(false);
	let loading = $state(!!id);

	// errors
	let amountError = $state('');
	let categoryError = $state('');
	let dateError = $state('');

	let categories = $state<Category[]>([]);

	const catObservable = liveQuery(() => db.categories.toArray());
	const catSub = catObservable.subscribe(val => {
		categories = val || [];
		// default to first category if none selected yet
		if (!categoryId && categories.length > 0) {
			categoryId = categories[0].id;
		}
	});

	onDestroy(() => catSub.unsubscribe());

	// Load existing item in edit mode
	$effect(() => {
		if (isEditing && id) {
			db.items.get(id).then((found) => {
				if (found) {
					amount = String(found.amount);
					categoryId = found.category;
					date = found.date.split('T')[0];
					description = found.description;
				}
				loading = false;
			});
		}
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

		const itemData: Item = {
			id: isEditing && id ? id : crypto.randomUUID(),
			amount: parseFloat(amount),
			category: categoryId,
			date: new Date(date).toISOString(),
			description: description.trim()
		};

		if (isEditing) {
			await db.items.put(itemData);
			goto(resolve(`/expense/${itemData.id}`));
		} else {
			await db.items.add(itemData);
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

<div class="h-full flex flex-col">
	<Header title={isEditing ? 'Edit Expense' : 'Add Expense'}>
		{#snippet leftIcon()}
			<button
				aria-label="Cancel"
				onclick={cancel}
				class="text-discord-text-muted hover:text-white transition-colors p-1"
			>
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
				</svg>
			</button>
		{/snippet}
	</Header>

	<div class="flex-1 overflow-y-auto p-4 space-y-4 pb-8">
		{#if loading}
			<div class="text-center text-discord-text-muted py-16">Loading...</div>
		{:else}
			<!-- Amount -->
			<Card variant="panel" class="p-4">
				<label for="amount-input" class="text-xs font-bold text-discord-text-muted uppercase tracking-wider block mb-2">Amount</label>
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
						class="flex-1 min-w-0 bg-transparent text-3xl font-extrabold text-white placeholder-discord-text-muted/40 focus:outline-none"
					/>
				</div>
				{#if amountError}
					<p class="text-xs text-discord-red mt-1.5 font-medium">{amountError}</p>
				{/if}
			</Card>

			<!-- Category -->
			<div>
				<p class="text-xs font-bold text-discord-text-muted uppercase tracking-wider mb-2 px-1">Category</p>
				{#if categoryError}
					<p class="text-xs text-discord-red mb-1.5 font-medium px-1">{categoryError}</p>
				{/if}
				<div class="grid grid-cols-4 gap-2">
					{#each categories as cat (cat.id)}
						<button
							onclick={() => (categoryId = cat.id)}
							class="flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all {categoryId === cat.id ? 'border-discord-blurple bg-discord-blurple/10' : 'border-transparent bg-discord-sidebar hover:border-discord-blurple/40'}"
						>
							<span class="text-2xl">{cat.icon}</span>
							<span class="text-[10px] text-discord-text-muted leading-tight text-center truncate w-full">{cat.name}</span>
						</button>
					{/each}
				</div>
			</div>

			<!-- Date -->
			<div>
				<label for="date-input" class="text-xs font-bold text-discord-text-muted uppercase tracking-wider block mb-2 px-1">Date</label>
				<input
					id="date-input"
					type="date"
					bind:value={date}
					class="w-full bg-discord-panel border border-black/30 rounded p-2.5 text-discord-text-normal focus:outline-none focus:ring-2 focus:ring-discord-blurple focus:border-transparent transition-all"
				/>
				{#if dateError}
					<p class="text-xs text-discord-red mt-1 font-medium">{dateError}</p>
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

			<Button variant="secondary" fullWidth onclick={cancel}>
				Cancel
			</Button>
		{/if}
	</div>
</div>
