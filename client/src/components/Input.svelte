<script lang="ts">
	export let value: string | number | string[];
	export let placeholder: string;
	export let id: string;
	export let type: 'text' | 'password' = 'text';
</script>

<input
    on:input={e => value = e.currentTarget.value}
	{placeholder}
	{id}
    {type}
    name={id}
	class="h-12 bg-yellow-100 mb-5 rounded p-5"
/>
