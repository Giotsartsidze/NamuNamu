<script lang="ts">
	import { signInWithGoogle } from '$lib/firebase/auth';
</script>

<div class="login-container">
	<div class="login-card">
		<h1 class="login-title">Welcome Back to AI Namu Namu</h1>
		<p class="login-subtitle">Please sign in to access your personalized recipes and health planner.</p>

		<button on:click={signInWithGoogle} class="google-sign-in-btn">
			<svg class="google-icon" viewBox="0 0 18 18" width="18" height="18" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
				<path d="M9 10.3c1.3 0 2.5-.5 3.4-1.4l1.4 1.4c-1.2 1.2-2.7 1.8-4.8 1.8-3.1 0-5.7-1.8-7-4.4l1.7-1.3c.7 2 2.6 3.4 5.2 3.9v.7z" fill="#4285F4"/>
				<path d="M3.7 7.7c.3-.9.6-1.7 1.2-2.5l-1.3-1.3C2.8 5.1 2.3 6.3 2 7.7h1.7z" fill="#34A853"/>
				<path d="M9 4.2c1.7 0 3.2.7 4.3 1.7l1.4-1.4C13.2 3.1 11.2 2 9 2 5.9 2 3.3 3.8 2 6.4L3.7 7.7c.7-1.4 2.1-2.4 3.9-2.9v-.7z" fill="#EAB649"/>
				<path d="M16 9c0-.6-.1-1.1-.2-1.6h-6.8v3h4.1c-.2 1.1-.7 2-1.5 2.6l1.3 1.1c1.2-1 2.1-2.4 2.5-4h.7z" fill="#E04333"/>
			</svg>
			Sign in with Google
		</button>
	</div>
</div>

<style>
    :root {
        --app-primary: #586879;
        --app-secondary-accent: #c6dddb;
        --app-background-card: rgba(255, 255, 255, 0.85);
        --app-shadow: 0 10px 40px rgba(88, 104, 121, 0.15);
        --app-border: 1px solid rgba(146, 164, 172, 0.3);
    }

    .login-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: calc(100vh - 40px);
        padding: 20px;
        position: relative;
        z-index: 1; /* Match app-shell's z-index */
    }

    .login-card {
        background: linear-gradient(135deg, #c6dddb 0%, #92a4ac 40%, #f9fbfd 100%);
        backdrop-filter: blur(30px);
        border-radius: 25px;
        box-shadow: var(--app-shadow);
        border: 1px solid rgba(255, 255, 255, 0.6);
        padding: 48px;
        width: 100%;
        max-width: 450px;
        text-align: center;
        transition: all 0.3s ease;
    }

    :global(body.dark-mode) .login-card {
        background: rgba(255, 255, 255, 0.06);
        border-color: rgba(255, 255, 255, 0.1);
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    }

    .login-title {
        color: var(--app-primary);
        font-size: 28px;
        font-weight: 600;
        margin-bottom: 15px;
        letter-spacing: 0.5px;
        transition: color 0.3s ease;
    }

    :global(body.dark-mode) .login-title {
        color: #D4D4E0;
    }

    .login-subtitle {
        color: #7a8996;
        font-size: 15px;
        margin-bottom: 40px;
        letter-spacing: 0.2px;
        transition: color 0.3s ease;
    }

    :global(body.dark-mode) .login-subtitle {
        color: #9898A8;
    }

    .google-sign-in-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, var(--app-primary) 0%, #485566 100%);
        color: #f9fbfd;
        border: none;
        border-radius: 15px;
        padding: 16px 24px;
        font-size: 14px;
        font-weight: 500;
        text-decoration: none;
        width: 100%;
        transition: all 0.3s ease;
        letter-spacing: 1.2px;
        text-transform: uppercase;
        box-shadow: 0 6px 25px rgba(88, 104, 121, 0.3);
        cursor: pointer;
    }

    .google-sign-in-btn:hover {
        background: linear-gradient(135deg, #485566 0%, #3a4453 100%);
        transform: translateY(-2px);
        box-shadow: 0 10px 35px rgba(88, 104, 121, 0.4);
    }

    :global(body.dark-mode) .google-sign-in-btn {
        background: #5A5A6D;
        color: white;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    :global(body.dark-mode) .google-sign-in-btn:hover {
        background: #4A4A5D;
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
    }

    .google-icon {
        margin-right: 12px;
    }
</style>