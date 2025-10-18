<script lang="ts">
	import { signInWithGoogle } from '$lib/firebase/auth';
</script>

<div class="login-container">
	<div class="login-card">
		<h1 class="login-title">Welcome Back to AI Namu Namu</h1>
		<p class="login-subtitle">Please sign in to access your personalized recipes and health planner.</p>

		<button on:click={signInWithGoogle} class="google-sign-in-btn">
			<svg class="google-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24" height="24">
			</svg>
			Sign in with Google
		</button>
	</div>
</div>

<style>
    /* New Deep Blue/Gold Colors for Login */
    :root {
        --primary-deep-blue: #192a56;
        --primary-gold: #fbc531;
        --border-color: #ecf0f1;
    }
    .login-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 80vh; /* Center the card vertically */
    }
    .login-card {
        background-color: white;
        border-radius: 12px;
        box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
        padding: 40px;
        width: 100%;
        max-width: 400px;
        text-align: center;
    }
    .login-title {
        color: var(--primary-deep-blue);
        font-size: 1.8em;
        margin-bottom: 10px;
    }
    .login-subtitle {
        color: #7f8c8d;
        margin-bottom: 30px;
    }
    .google-sign-in-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background-color: white;
        color: var(--primary-deep-blue);
        border: 2px solid var(--primary-deep-blue);
        border-radius: 8px;
        padding: 12px 20px;
        font-size: 1.1em;
        font-weight: 700;
        text-decoration: none;
        width: 100%;
        transition: all 0.2s ease;
    }
    .google-sign-in-btn:hover {
        background-color: var(--primary-deep-blue);
        color: white;
        box-shadow: 0 4px 10px rgba(25, 42, 86, 0.3);
    }
    .google-icon {
        margin-right: 10px;
    }
</style>