<script lang="ts">
	import Input from './Input.svelte';
	import { useHttpClient } from '../contexts/httpClient'
	import { Link, navigate } from 'svelte-routing'

	let email = '';
	let password = '';
	let name = '';

	const httpClient = useHttpClient();

	async function handleOnSubmit() {
		const registerResponse = await httpClient.post('/auth/v1/register', {
			body: { email, password, name },
		});
		if (!registerResponse.success)
			return;
		
		navigate('/login');
	}
</script>

<div
	class="bg-yellow-300 w-screen h-screen flex flex-col items-center sm:justify-center px-5"
>
	<h1 class="text-yellow-500 font-bold text-6xl sm:text-8xl p-5">
		Resturanteer
	</h1>
	<div class="bg-yellow-200 max-w-3xl rounded-lg container">
		<form on:submit|preventDefault={handleOnSubmit}>
			<div>
				<div class="w-full rounded-t-lg bg-indigo-200">
					<h2 class="p-5 text-indigo-400 font-bold text-lg">
						New account
					</h2>
				</div>
				<div class="p-5 flex flex-col">
					<Input
						id="email"
						placeholder="Email"
						bind:value={email}
					/>
					<Input
						id="name"
						placeholder="Name"
						bind:value={name}
					/>
					<Input
						id="password"
						type="password"
						placeholder="Password"
						bind:value={password}
					/>
					<button type="submit" class="bg-blue-400 text-white h-12">
						Register
					</button>
				</div>
			</div>
		</form>
	</div>
	<p class="p-5">
		Already have an account? login
		<Link class="text-blue-400" to="/">here</Link>
	</p>
</div>

<style>
</style>
