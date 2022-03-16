<script lang="ts">
	import { currentUserStore } from '../../contexts/currentUser';
	import { useHttpClient } from '../../contexts/httpClient';
	import slideAnimate from '../../contexts/slideAnimate';
	import Input from '../Input.svelte';
	import Modal from '../Modal.svelte';
	import {
	AuthenticationCallback,
	authenticationModalStore
	} from './useAuthentication';

	let showing = true;
	let type: 'Login' | 'Register' = 'Login';
	let loading = false;
	let email = '';
	let password = '';
	let name = '';
	let callback: AuthenticationCallback | undefined = undefined;

	authenticationModalStore.subscribe((incoming) => {
		if (!incoming)
			return; 
		if (showing === true) {
			incoming.callback('already-open');
		} else {
			callback = incoming.callback;
			showing = true;
		}
	});

	const httpClient = useHttpClient();

	const requestClose = () => {
		showing = false;
	};
	const login = async () => {
		const loginResponse = await httpClient.post('/auth/v1/login', {
			body: { email, password },
		});

		if (!loginResponse.success) return false;

		httpClient.setToken(loginResponse.data.result);

		const userResponse = await httpClient.get(`/auth/v1/user/1`);

		if (!userResponse.success) return false;

		currentUserStore.set(userResponse.data.result);

		return true;
	};
	async function handleOnSubmit() {
		loading = true;
		const requestFunc = type === 'Login' ? login : login;
		const res = await requestFunc();
		loading = false;
		if(res)
			showing = false;
		callback(res ? 'success' : 'failed');
	}
</script>

{#if showing}
	<Modal on:requestClose={requestClose} title={type} {loading}>
		<form on:submit|preventDefault={handleOnSubmit} use:slideAnimate={true}>
			<div class="p-5 flex flex-col">
				<h1 class="text-yellow-500 font-bold text-6xl mb-5 mx-auto">
					Resturanteer
				</h1>
				<Input id="email" placeholder="Email" bind:value={email} />
				{#if type === 'Register'}
					<Input id="name" placeholder="Name" bind:value={name} />
				{/if}
				<Input
					id="password"
					type="password"
					placeholder="Password"
					bind:value={password}
				/>
				<button type="submit" class="bg-blue-400 text-white h-12"
					>Login</button
				>
				<p class="pt-5">
					{#if type === 'Login'}
						No account? Create one
						<button
							on:click={() => (type = 'Register')}
							class="text-blue-400">here</button
						>
					{:else}
						Already have an account? Login
						<button
							on:click={() => (type = 'Login')}
							class="text-blue-400">here</button
						>
					{/if}
				</p>
			</div>
		</form>
	</Modal>
{/if}

<style>
</style>
