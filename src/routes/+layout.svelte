<script lang="ts">
	import './layout.css';
	import LayoutScreen from '../screens/LayoutScreen.svelte';
	import LoginScreen from '../screens/LoginScreen.svelte';
	import { auth } from '../libs/auth.svelte';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(async () => {
		auth.init();

		if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
			const { registerSW } = await import('virtual:pwa-register');
			registerSW({
				immediate: true,
				onRegisteredSW(swUrl: string | URL, r: ServiceWorkerRegistration | undefined) {
					if (r) {
						setInterval(async () => {
							if (r.installing || !navigator.onLine) return;
							if (typeof swUrl === 'string' && (await fetch(swUrl, { cache: 'no-store' })).status === 200) {
								await r.update();
							}
						}, 60 * 60 * 1000); // Check every hour
					}
				},
				onNeedRefresh() {
					if (confirm('New content available, reload?')) {
						window.location.reload();
					}
				},
				onOfflineReady() {
					console.log('App ready to work offline');
				}
			});
		}
	});
</script>

<LayoutScreen>
	{#if auth.isInitialized}
		{#if auth.isAuthenticated}
			{@render children()}
		{:else}
			<LoginScreen />
		{/if}
	{:else}
		<div class="flex h-full min-h-screen items-center justify-center bg-gray-900 text-gray-100">
			<div class="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
		</div>
	{/if}
</LayoutScreen>
