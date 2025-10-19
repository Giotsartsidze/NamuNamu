// src/lib/firebase/client.ts
import { initializeApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { PUBLIC_FIREBASE_API_KEY, PUBLIC_FIREBASE_AUTH_DOMAIN, PUBLIC_FIREBASE_PROJECT_ID, PUBLIC_FIREBASE_APP_ID } from '$env/static/public';

const firebaseConfig = {
	apiKey: PUBLIC_FIREBASE_API_KEY,
	authDomain: PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId: PUBLIC_FIREBASE_PROJECT_ID,
	appId: PUBLIC_FIREBASE_APP_ID,
	// You can include others like storageBucket and messagingSenderId if needed
};

const app = initializeApp(firebaseConfig);

export const auth: Auth = getAuth(app);