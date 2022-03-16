<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { clickOutside } from '../contexts/clickOutside';
	import Card from './Card.svelte';
	export let title: string = undefined;
	export let loading: boolean = false;

	const dispatch = createEventDispatcher();

	const requestClose = () => dispatch('requestClose');
</script>

<div
	class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto"
>
	<div class="py-5 md:py-8 px-5 h-full w-full">
		<div class="container mx-auto max-w-lg" use:clickOutside={requestClose}>
			<Card {title} {loading}>
				<slot />
			</Card>
		</div>
	</div>
</div>

<style>
</style>