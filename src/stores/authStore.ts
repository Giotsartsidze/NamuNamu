// src/stores/authStore.ts
import { writable } from 'svelte/store';
import { auth } from '$lib/firebase/client';
import { onAuthStateChanged, type User } from 'firebase/auth';

// Use a union type: User | null | undefined
// undefined: Initial state (we don't know the state yet)
// null: Logged out
// User: Logged in
export const user = writable<User | null | undefined>(undefined);

// Listen to auth state changes and update the store
onAuthStateChanged(auth, (firebaseUser) => {
	// Sets the store to the User object or null
	user.set(firebaseUser);
});