// src/lib/firebase/auth.ts
import { auth } from './client';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const provider = new GoogleAuthProvider();

/**
 * Initiates the Google Sign-In process using a popup window.
 */
export async function signInWithGoogle() {
	try {
		// Note: Since this is a client-side function, SvelteKit will handle the routing
		// after the popup closes.
		const result = await signInWithPopup(auth, provider);

		// Optional: Get user info if needed
		const firebaseUser = result.user;
		console.log("Logged in user:", firebaseUser.displayName);

		// Redirect the user to the main app page (root) after successful login
		window.location.href = '/';

	} catch (error: any) {
		console.error("Google sign-in failed:", error.code, error.message);
		// Handle specific errors, e.g., if the user closes the popup
		alert(`Login Failed: ${error.message}`);
	}
}

/**
 * Signs the current user out.
 */
export async function logout() {
	try {
		await signOut(auth);
		// Redirect to login page after logout
		window.location.href = '/login';
	} catch (error) {
		console.error("Logout failed:", error);
		alert("Logout failed. Try again.");
	}
}