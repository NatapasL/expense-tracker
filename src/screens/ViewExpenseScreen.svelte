<script lang="ts">
	import Header from '../components/Header.svelte';
	import Card from '../components/Card.svelte';
	import Button from '../components/Button.svelte';
	import Modal from '../components/Modal.svelte';
	import { db, type Expense, type Category } from '../libs/dexie';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { CURRENCY_SYMBOL } from '../libs/constants';

	interface Props {
		id: string;
	}

	let { id }: Props = $props();

	let expense = $state<Expense | undefined>(undefined);
	let category = $state<Category | undefined>(undefined);
	let loading = $state(true);
	let showDeleteModal = $state(false);
	let deleting = $state(false);

	$effect(() => {
		db.expenses.get(id).then(async (found) => {
			expense = found;
			if (found) {
				category = await db.categories.get(found.category);
			}
			loading = false;
		});
	});

	async function deleteExpense() {
		if (!expense?.id) return;
		deleting = true;
		await db.expenses.update(expense.id, {
			deleted: 1,
			synced: 0,
			updatedAt: Date.now()
		});
		goto(resolve(`/`));
	}
</script>

<div class="flex h-full flex-col">
	<Header title="Expense Detail">
		{#snippet leftIcon()}
			<a
				href={resolve(`/`)}
				aria-label="Back"
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
			</a>
		{/snippet}
	</Header>

	<div class="flex-1 space-y-2 overflow-y-auto p-3">
		{#if loading}
			<div class="py-16 text-center text-discord-text-muted">Loading...</div>
		{:else if !expense}
			<div class="py-16 text-center text-discord-text-muted">Expense not found.</div>
		{:else}
			<!-- Compact item row (same as index page) -->
			<Card variant="sidebar" padding="sm" class="flex items-center gap-3">
				{#if category}
					<div
						class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-xl"
						style="background-color: {category.color}33; color: {category.color}"
					>
						{category.icon}
					</div>
				{/if}
				<div class="min-w-0 flex-1">
					<div class="truncate font-medium text-white">{category?.name ?? 'Unknown'}</div>
					<div class="text-xs text-discord-text-muted">
						{new Date(expense.date).toLocaleDateString('en-US', {
							weekday: 'short',
							month: 'short',
							day: 'numeric'
						})}
					</div>
				</div>
				<div class="flex-shrink-0 font-semibold text-white">
					{CURRENCY_SYMBOL}{expense.amount.toFixed(2)}
				</div>
			</Card>

			<!-- Description box -->
			<Card variant="panel" class="px-4 py-3">
				<p class="mb-1 text-xs font-bold tracking-wider text-discord-text-muted uppercase">
					Description
				</p>
				<p class="text-sm text-discord-text-normal">{expense.description || '—'}</p>
			</Card>

			<!-- Actions -->
			<div class="flex gap-2 pt-1">
				<Button
					variant="secondary"
					fullWidth
					onclick={() => goto(resolve(`/expense/${expense!.id}/edit`))}
				>
					✏️ Edit
				</Button>
				<Button variant="danger" fullWidth onclick={() => (showDeleteModal = true)}>
					🗑️ Delete
				</Button>
			</div>
		{/if}
	</div>
</div>

<!-- Delete Confirmation Modal -->
<Modal open={showDeleteModal} onclose={() => (showDeleteModal = false)} title="Delete Expense">
	<p class="text-sm text-discord-text-normal">
		Are you sure you want to delete this expense? This action cannot be undone.
	</p>
	{#snippet footer()}
		<div class="flex justify-end gap-3">
			<Button variant="secondary" onclick={() => (showDeleteModal = false)}>Cancel</Button>
			<Button variant="danger" onclick={deleteExpense} disabled={deleting}>
				{deleting ? 'Deleting...' : 'Delete'}
			</Button>
		</div>
	{/snippet}
</Modal>
