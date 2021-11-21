import { writable } from 'svelte/store';

interface User {
	id: number;
	email: string;
	name: string;
}

export const currentUserStore = writable<User | null>(null);
