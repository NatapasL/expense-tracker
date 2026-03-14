<script lang="ts">
	import { page } from '$app/state';
	import AddEditCategoryScreen from '../../../../screens/AddEditCategoryScreen.svelte';

	let id = $derived(page.params.id);
</script>

<AddEditCategoryScreen {id} />
