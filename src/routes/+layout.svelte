<script lang="ts">
	import './layout.css';
	import LayoutScreen from '../screens/LayoutScreen.svelte';
	import LoginScreen from '../screens/LoginScreen.svelte';
	import { auth } from '../libs/auth.svelte';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		auth.init();
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
