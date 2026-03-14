<script lang="ts">
	import ViewExpenseScreen from '../../../screens/ViewExpenseScreen.svelte';
	import { page } from '$app/stores';

	let id = $derived($page.params.id!);
</script>

<ViewExpenseScreen {id} />
