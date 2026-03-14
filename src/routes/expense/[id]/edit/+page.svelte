<script lang="ts">
	import AddEditExpenseScreen from '../../../../screens/AddEditExpenseScreen.svelte';
	import { page } from '$app/stores';

	let id = $derived($page.params.id);
</script>

<AddEditExpenseScreen {id} />
