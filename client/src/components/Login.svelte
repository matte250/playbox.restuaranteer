<script lang="ts">
	import Input from './Input.svelte';
	import { useHttpClient } from '../contexts/httpClient'
	import { currentUserStore } from '../contexts/currentUser'
	import { Link } from 'svelte-routing'

	let email = '';
	let password = '';

	const httpClient = useHttpClient();

	async function handleOnSubmit() {
		const loginResponse = await httpClient.post('/auth/v1/login', {
			body: { email, password },
		});

		if (!loginResponse.success) return;

		httpClient.setToken(loginResponse.data.result);

		const userResponse = await httpClient.get(`/auth/v1/user/1`);
		
		if(!userResponse.success) return;

		currentUserStore.set(userResponse.data.result)
	}
</script>

<div
	class="bg-yellow-300 w-screen h-screen flex flex-col items-center sm:justify-center px-5"
>
	<h1 class="text-yellow-500 font-bold text-6xl sm:text-8xl p-5">
		Joakim är en dålig vän</h1>
	<div
		class="bg-yellow-200 max-w-3xl rounded-lg container"
	>
		<form on:submit|preventDefault={handleOnSubmit}>
			<div>
				<div class="w-full rounded-t-lg bg-indigo-200">
					<h2 class="p-5 text-indigo-400 font-bold text-lg">
						Welcome!
					</h2>
				</div>
				<div class="p-5 flex flex-col">
					<Input
						id="email"
						placeholder="Email"
						bind:value={email}
					/>
					<Input
						id="password"
						type="password"
						placeholder="Password"
						bind:value={password}
					/>
					<button type="submit" class="bg-blue-400 text-white h-12"
						>Login</button
					>
				</div>
			</div>
		</form>
	</div>

	<p class="p-5">
		Dont have an account? Create one <Link
			class="text-blue-400"
			to="register"
		>
			here
		</Link>
	</p>
</div>

<style>
</style>
