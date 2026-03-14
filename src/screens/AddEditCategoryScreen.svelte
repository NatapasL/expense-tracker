<script lang="ts">
	import Header from '../components/Header.svelte';
	import Button from '../components/Button.svelte';
	import Input from '../components/Input.svelte';
	import { db, type Category } from '../libs/dexie';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	interface Props {
		id?: string;
	}

	let { id }: Props = $props();
	let isEditing = $derived(!!id);

	let name = $state('');
	let color = $state('#5865F2');
	let icon = $state('');
	let loading = $state(true);
	let saving = $state(false);

	let nameError = $state('');
	let iconError = $state('');

	const discordColors = [
		'#5865F2', // Blurple
		'#57F287', // Green
		'#FEE75C', // Yellow
		'#EB459E', // Fuchsia
		'#ED4245', // Red
		'#1ABC9C', // Aqua
		'#3498DB', // Blue
		'#9B59B6', // Purple
		'#E67E22', // Orange
		'#E74C3C', // Alizarin
		'#95A5A6', // Grey
		'#4F545C' // Dark Grey
	];

	$effect(() => {
		if (id) {
			db.categories.get(id).then((cat) => {
				if (cat) {
					name = cat.name;
					color = cat.color;
					icon = cat.icon;
				}
				loading = false;
			});
		} else {
			loading = false;
		}
	});

	function validate() {
		let valid = true;
		nameError = '';
		iconError = '';

		if (!name.trim()) {
			nameError = 'Name is required';
			valid = false;
		}
		if (!icon.trim()) {
			iconError = 'Icon is required';
			valid = false;
		}
		return valid;
	}

	async function save() {
		if (!validate()) return;
		saving = true;

		const categoryData: Category = {
			id: isEditing && id ? id : `cat-${Date.now()}`,
			name: name.trim(),
			color,
			icon: icon.trim(),
			synced: 0,
			deleted: 0,
			updatedAt: Date.now()
		};

		try {
			if (isEditing) {
				await db.categories.put(categoryData);
			} else {
				await db.categories.add(categoryData);
			}
			goto(resolve('/categories'));
		} catch (e) {
			console.error(e);
			alert('Failed to save category');
		} finally {
			saving = false;
		}
	}

	function handleIconInput(e: Event) {
		const target = e.target as HTMLInputElement;
		const value = target.value;
		if (value) {
			const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
			const segments = [...segmenter.segment(value)];
			const firstSegment = segments[0]?.segment || '';
			icon = firstSegment;
			target.value = firstSegment; // Force DOM to match state immediately
		} else {
			icon = '';
		}
	}

	function cancel() {
		goto(resolve('/categories'));
	}
</script>

<div class="flex h-full flex-col">
	<Header title={isEditing ? 'Edit Category' : 'New Category'}>
		{#snippet leftIcon()}
			<button
				onclick={cancel}
				class="p-1 text-discord-text-muted transition-colors hover:text-white"
				aria-label="Cancel"
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
						d="M15 19l-7-7 7-7"
					/>
				</svg>
			</button>
		{/snippet}
	</Header>

	<div class="flex-1 space-y-6 overflow-y-auto p-4 pb-20">
		{#if loading}
			<div class="py-16 text-center text-discord-text-muted">Loading...</div>
		{:else}
			<!-- Preview Card -->
			<div class="flex justify-center py-4">
				<div
					class="flex h-20 w-20 items-center justify-center rounded-full border-4 border-discord-sidebar text-4xl shadow-lg transition-all duration-300"
					style="background-color: {color}33; color: {color}"
				>
					{icon}
				</div>
			</div>

			<!-- Form Fields -->
			<div class="space-y-4">
				<Input
					label="Category Name"
					placeholder="e.g. Travel"
					bind:value={name}
					error={nameError}
				/>

				<div>
					<label
						for="icon-input"
						class="mb-2 block px-1 text-xs font-bold tracking-wider text-discord-text-muted uppercase"
						>Icon (Emoji)</label
					>
					<div class="mb-3 flex justify-center">
						<input
							id="icon-input"
							type="text"
							value={icon}
							oninput={handleIconInput}
							placeholder="?"
							class="h-16 w-16 rounded-xl border border-black/30 bg-discord-panel text-center text-3xl shadow-inner focus:ring-2 focus:ring-discord-blurple focus:outline-none"
						/>
					</div>
					{#if iconError}
						<p class="mt-1 px-1 text-center text-xs font-medium text-discord-red">{iconError}</p>
					{/if}
				</div>

				<div>
					<h3
						class="mb-2 block px-1 text-xs font-bold tracking-wider text-discord-text-muted uppercase"
					>
						Color Palette
					</h3>
					<div class="grid grid-cols-6 gap-3 p-1">
						{#each discordColors as c (c)}
							<button
								onclick={() => (color = c)}
								class="aspect-square w-full rounded-full border-4 transition-all {color === c
									? 'border-white'
									: 'border-transparent hover:scale-110'}"
								style="background-color: {c}"
								aria-label="Color {c}"
								type="button"
							></button>
						{/each}
					</div>
				</div>
			</div>

			<div class="space-y-3 pt-4">
				<Button variant="primary" fullWidth onclick={save} disabled={saving}>
					{saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Category'}
				</Button>
				<Button variant="secondary" fullWidth onclick={cancel}>Cancel</Button>
			</div>
		{/if}
	</div>
</div>
