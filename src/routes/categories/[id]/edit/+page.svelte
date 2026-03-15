<script lang="ts">
	import { page } from '$app/state';
	import { AddEditCategoryScreen } from '@/screens/add-edit-category';

	let id = $derived(page.params.id);
</script>

<AddEditCategoryScreen {id} />
