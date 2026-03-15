<script lang="ts">
	import { Header } from '../../components/header';
	import { Button } from '../../components/button';
	import { Input } from '../../components/input';
	import { db, type Category } from '../../libs/dexie';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { discordColors } from './constants';
	import * as styles from './styles';

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

	$effect(() => {
		if (id) {
			db.categories.get(id).then((cat: Category | undefined) => {
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

<div class={styles.containerStyle}>
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

	<div class={styles.scrollContentStyle}>
		{#if loading}
			<div class={styles.loadingStateStyle}>Loading...</div>
		{:else}
			<!-- Preview Card -->
			<div class={styles.previewContainerStyle}>
				<div
					class={styles.previewCircleStyle}
					style="background-color: {color}33; color: {color}"
				>
					{icon}
				</div>
			</div>

			<!-- Form Fields -->
			<div class={styles.formContainerStyle}>
				<Input
					label="Category Name"
					placeholder="e.g. Travel"
					bind:value={name}
					error={nameError}
				/>

				<div>
					<label for="icon-input" class={styles.labelStyle}>Icon (Emoji)</label>
					<div class={styles.iconInputWrapperStyle}>
						<input
							id="icon-input"
							type="text"
							value={icon}
							oninput={handleIconInput}
							placeholder="?"
							class={styles.iconInputStyle}
						/>
					</div>
					{#if iconError}
						<p class={styles.errorTextStyle}>{iconError}</p>
					{/if}
				</div>

				<div>
					<h3 class={styles.labelStyle}>Color Palette</h3>
					<div class={styles.colorGridStyle}>
						{#each discordColors as c (c)}
							<button
								onclick={() => (color = c)}
								class="{styles.colorButtonStyle} {color === c
									? styles.activeColorStyle
									: styles.inactiveColorStyle}"
								style="background-color: {c}"
								aria-label="Color {c}"
								type="button"
							></button>
						{/each}
					</div>
				</div>
			</div>

			<div class={styles.footerActionsStyle}>
				<Button variant="primary" fullWidth onclick={save} disabled={saving}>
					{saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Category'}
				</Button>
				<Button variant="secondary" fullWidth onclick={cancel}>Cancel</Button>
			</div>
		{/if}
	</div>
</div>
