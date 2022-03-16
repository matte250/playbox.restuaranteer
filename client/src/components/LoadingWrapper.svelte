<script lang="ts">
	import { blur, slide } from 'svelte/transition';
	import LoadingAnimation from './LoadingAnimation.svelte';
	export let loading: Boolean = false;
</script>

<div class="rounded-inherit relative">
	{#if loading}
		<div
			in:slide
            out:blur
			class="flex items-center justify-center rounded-inherit absolute right-0 left-0 top-0 bottom-0 bg-yellow-200"
		>
			<LoadingAnimation />
		</div>
	{/if}
	<slot />
</div>
