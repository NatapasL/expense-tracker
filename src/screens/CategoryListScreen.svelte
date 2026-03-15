<script lang="ts">
	import { Header } from '../components/header';
	import { Card } from '../components/card';
	import { Button } from '../components/button';
	import { Modal } from '../components/modal';
	import { db, type Category } from '../libs/dexie';
	import { liveQuery } from 'dexie';
	import { onDestroy } from 'svelte';
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';

	let categories: Category[] = $state([]);
	let isDeleteModalOpen = $state(false);
	let categoryToDelete: Category | null = $state(null);

	const categoriesObservable = liveQuery(() =>
		db.categories.filter((c) => c.deleted === 0).toArray()
	);
	const catSub = categoriesObservable.subscribe((val) => {
		categories = val || [];
	});

	onDestroy(() => {
		catSub.unsubscribe();
	});

	function confirmDelete(category: Category) {
		categoryToDelete = category;
		isDeleteModalOpen = true;
	}

	async function handleDelete() {
		if (categoryToDelete) {
			// Check if any expenses use this category
			const count = await db.expenses.where('category').equals(categoryToDelete.id).count();
			if (count > 0) {
				alert(
					`Cannot delete category "${categoryToDelete.name}" because it is used by ${count} expense(s). Please reassign them first.`
				);
			} else {
				await db.categories.update(categoryToDelete.id, {
					deleted: 1,
					synced: 0,
					updatedAt: Date.now()
				});
			}
			isDeleteModalOpen = false;
			categoryToDelete = null;
		}
	}
</script>

{#snippet leftIcon()}
	<button
		onclick={() => goto(resolve('/summary'))}
		class="p-1 text-discord-text-normal transition-colors hover:text-white"
		aria-label="Back to Summary"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="h-6 w-6"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
		</svg>
	</button>
{/snippet}

<div class="relative flex h-full flex-col pb-20">
	<Header title="Manage Categories" {leftIcon} />

	<div class="flex-1 space-y-3 overflow-y-auto p-4">
		<p class="px-1 text-[13px] text-discord-text-muted">
			Custom categories allow you to organize your expenses exactly how you want.
		</p>

		<div class="space-y-2">
			{#each categories as category (category.id)}
				<Card variant="sidebar" padding="none" class="flex items-center gap-3 px-3 py-3">
					<div
						class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl"
						style="background-color: {category.color}33; color: {category.color}"
					>
						{category.icon}
					</div>
					<div class="min-w-0 flex-1">
						<div class="text-[15px] font-bold text-white">{category.name}</div>
					</div>
					<div class="flex items-center gap-2">
						<button
							onclick={() => goto(resolve(`/categories/${category.id}/edit`))}
							class="p-2 text-discord-text-muted transition-colors hover:text-white"
							aria-label="Edit category"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
								/>
							</svg>
						</button>
						<button
							onclick={() => confirmDelete(category)}
							class="hover:text-discord-danger p-2 text-discord-text-muted transition-colors"
							aria-label="Delete category"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
								/>
							</svg>
						</button>
					</div>
				</Card>
			{/each}
		</div>
	</div>

	<!-- FAB -->
	<div class="fixed right-6 bottom-6 z-50">
		<button
			onclick={() => goto(resolve('/categories/new'))}
			class="flex h-14 w-14 items-center justify-center rounded-full bg-discord-blurple text-white shadow-lg transition-transform hover:scale-105 hover:bg-[#4752C4] active:scale-95"
			aria-label="Add Category"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-6 w-6"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				stroke-width="3"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
			</svg>
		</button>
	</div>
</div>

<Modal open={isDeleteModalOpen} title="Delete Category" onclose={() => (isDeleteModalOpen = false)}>
	<div class="space-y-4">
		<p class="text-discord-text-normal">
			Are you sure you want to delete the category <span class="font-bold text-white"
				>{categoryToDelete?.name}</span
			>? This action cannot be undone.
		</p>
		<div class="flex justify-end gap-3">
			<Button variant="secondary" onclick={() => (isDeleteModalOpen = false)}>Cancel</Button>
			<Button variant="danger" onclick={handleDelete}>Delete</Button>
		</div>
	</div>
</Modal>
