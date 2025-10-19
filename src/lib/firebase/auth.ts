// src/lib/firebase/auth.ts
import { auth } from './client';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const provider = new GoogleAuthProvider();

export async function signInWithGoogle() {
	try {
		const result = await signInWithPopup(auth, provider);

		const firebaseUser = result.user;
		console.log("Logged in user:", firebaseUser.displayName);

		window.location.href = '/';

	} catch (error: any) {
		console.error("Google sign-in failed:", error.code, error.message);
		alert(`Login Failed: ${error.message}`);
	}
}

export async function logout() {
	try {
		await signOut(auth);
		window.location.href = '/login';
	} catch (error) {
		console.error("Logout failed:", error);
		alert("Logout failed. Try again.");
	}
}