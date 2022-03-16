<script lang="ts">
	import LoadingWrapper from './LoadingWrapper.svelte';

	export let title: string;
	export let loading: boolean | undefined = false;
</script>

<div class="w-full bg-yellow-200 rounded-lg">
	<LoadingWrapper {loading}>
		{#if title}
		<div class="rounded-t-lg bg-indigo-200">
			<h2 class="p-5 text-indigo-400 font-bold text-lg">{title}</h2>
		</div>
		{/if}
		<div>
			<slot />
		</div>
	</LoadingWrapper>
</div>

<style>
</style>
