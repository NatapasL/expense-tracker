<script lang="ts">
	import './layout.css';
	import LayoutScreen from '../screens/LayoutScreen.svelte';
	import { auth } from '../libs/auth.svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		auth.init();
	});

	$effect(() => {
		if (auth.isInitialized) {
			const currentPath = $page.url.pathname as string;
			if (!auth.isAuthenticated && currentPath !== '/login') {
				goto(resolve('/login')).catch(console.error);
			} else if (auth.isAuthenticated && currentPath === '/login') {
				goto(resolve('/')).catch(console.error);
			}
		}
	});
</script>

<LayoutScreen>
	{@render children()}
</LayoutScreen>
