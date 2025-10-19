import { writable } from 'svelte/store';
import { auth } from '$lib/firebase/client';
import { onAuthStateChanged, type User } from 'firebase/auth';

export const user = writable<User | null | undefined>(undefined);

onAuthStateChanged(auth, (firebaseUser) => {
	user.set(firebaseUser);
});