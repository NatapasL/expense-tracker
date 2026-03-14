<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/stores';
	import { resolve } from '$app/paths';
	import { auth } from '../libs/auth.svelte';

	let { children }: { children: Snippet } = $props();

	// Show navigation only if authenticated
	const showNav = $derived(auth.isAuthenticated);
</script>

<div class="h-full min-h-screen bg-gray-900 text-gray-100">
	<main
		class="relative min-h-screen w-full max-w-md p-4 {showNav
			? 'pb-24'
			: 'pb-4'} mx-auto flex flex-col border-x border-gray-800 bg-gray-900"
	>
		<div class="flex-1">
			{@render children()}
		</div>

		<!-- Bottom Nav -->
		{#if showNav}
			<nav
				class="fixed bottom-0 left-1/2 z-40 flex h-16 w-full max-w-md -translate-x-1/2 items-center justify-around border-t border-black/20 bg-discord-panel px-6"
			>
				<a
					href={resolve('/')}
					class="flex flex-col items-center gap-1 transition-colors {$page.route.id === '/'
						? 'text-white'
						: 'text-discord-text-muted hover:text-discord-text-normal'}"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M3 12l9-9 9 9M5 10v10a2 2 0 002 2h3a2 2 0 002-2v-4a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 002 2h3a2 2 0 002-2V10"
						/>
					</svg>
					<span class="text-[10px] font-bold tracking-wider uppercase">Home</span>
				</a>

				<a
					href={resolve('/summary')}
					class="flex flex-col items-center gap-1 transition-colors {$page.route.id === '/summary'
						? 'text-white'
						: 'text-discord-text-muted hover:text-discord-text-normal'}"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
						/>
					</svg>
					<span class="text-[10px] font-bold tracking-wider uppercase">Summary</span>
				</a>
			</nav>
		{/if}
	</main>
</div>
