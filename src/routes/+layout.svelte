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
			const isLoginRoute = $page.route.id === '/login';
			
			if (!auth.isAuthenticated && !isLoginRoute) {
				goto(resolve('/login'), { replaceState: true }).catch(console.error);
			} else if (auth.isAuthenticated && isLoginRoute) {
				goto(resolve('/'), { replaceState: true }).catch(console.error);
			}
		}
	});
</script>

<LayoutScreen>
	{@render children()}
</LayoutScreen>
