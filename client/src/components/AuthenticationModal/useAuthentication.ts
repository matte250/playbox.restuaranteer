import { writable } from 'svelte/store';

export type AuthenticationCallback = (
	result: 'success' | 'failed' | 'already-open',
) => void;

interface AuthenticationModalState {
	callback?: AuthenticationCallback;
}

export const authenticationModalStore =
	writable<AuthenticationModalState | null>(null);

export const requestAuthentication = (callback?: AuthenticationCallback) => {
	authenticationModalStore.set({ callback });
};
