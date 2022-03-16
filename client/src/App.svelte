<script lang="ts">
	import { Route,Router } from 'svelte-routing';
	import AuthenticationModal from './components/AuthenticationModal/AuthenticationModal.svelte';
	import { requestAuthentication } from './components/AuthenticationModal/useAuthentication';
	import { currentUserStore } from './contexts/currentUser';
	import { HttpClient,setHttpClient } from './contexts/httpClient';

	const httpClient: HttpClient = new HttpClient();
	setHttpClient(httpClient);

	const onSignInClick = () => requestAuthentication();
	

</script>

<main>
	<AuthenticationModal />
		<Router>
			<Route path="*">
				<div class="w-screen h-screen bg-yellow-300">
					<div class="w-full h-16 flex justify-between items-center px-3">
						<h1 class="text-indigo-400 font-bold text-4xl">
							Resturanteer
						</h1>
						{#if !$currentUserStore}
						<button class="bg-green-500 text-white font-bold p-2" on:click={onSignInClick}>Sign in</button>
						{:else}
						<button class="bg-red-500 text-white font-bold p-2" on:click={() => currentUserStore.set(null)}>Sign out</button>
						{/if}
					</div>
					<p class="p-3">
						Lorem ipsum dolor sit amet consectetur adipisicing elit. Culpa delectus cumque, ad velit vitae itaque rem voluptatibus aut. In, unde neque. Nemo, corrupti aspernatur mollitia vero tempora ipsum veritatis rerum!
						Lorem ipsum dolor sit amet consectetur adipisicing elit. Ab vero quibusdam, aspernatur eum reprehenderit fugiat enim autem sed ipsum labore quis recusandae velit temporibus natus optio, rerum quod ullam beatae?
						Lorem ipsum, dolor sit amet consectetur adipisicing elit. Nisi quam velit ut quae, unde obcaecati consectetur earum aut soluta tempore similique aliquam asperiores enim quaerat praesentium voluptates, facilis impedit officia.
						Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias, at magnam! Aperiam, eveniet laborum mollitia fuga eum, vitae illum, obcaecati corrupti maiores quaerat sunt rem. Animi ratione perferendis dolor. Placeat?
						Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolores molestiae modi voluptas, quam laboriosam magni, laborum excepturi ab eaque esse ex voluptatum voluptatem, omnis iusto distinctio porro. Molestias, dolor dolorem?
					</p>
				</div>
			</Route>
		</Router>
</main>

<style global lang="postcss">
	@tailwind base;
	@tailwind components;
	@tailwind utilities;

	h1 {
		font-family: 'Amatic SC';
	}
</style>
