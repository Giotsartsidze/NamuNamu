<script lang="ts">
	import { toast, type ToastConfig } from '../stores/toastStore';
	import { darkMode } from '../stores/darkModeStore';

	$: toastConfig = $toast;

	const icons: Record<ToastConfig['type'], { symbol: string, color: string, darkColor: string }> = {
		success: { symbol: '✔', color: '#4CAF50', darkColor: '#6FCF97' },
		error: { symbol: '✘', color: '#E74C3C', darkColor: '#EB5757' },
		warning: { symbol: '⋯', color: '#F39C12', darkColor: '#F2C94C' },
		info: { symbol: '!', color: '#3498DB', darkColor: '#56CCF2' },
	};

	$: currentIcon = icons[toastConfig.type].symbol;
	$: baseColor = $darkMode ? icons[toastConfig.type].darkColor : icons[toastConfig.type].color;
	$: backgroundColor = $darkMode ? 'rgba(40, 40, 40, 0.95)' : 'rgba(35, 35, 35, 0.9)';
</script>

{#if toastConfig.visible}
	<div
		class="toast-container"
		style="--toast-color: {baseColor}; --toast-bg: {backgroundColor};"
		role="alert"
		aria-live="assertive"
		aria-atomic="true"
		on:click={toast.hide}
	>
		<div class="toast-content">
			<div class="toast-icon">
				{currentIcon}
			</div>
			<div class="toast-message">
				{toastConfig.message}
			</div>
		</div>
	</div>
{/if}

<style>
    .toast-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1000;
        padding: 14px 24px;
        border-radius: 12px;
        color: white;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
        cursor: pointer;
        transition: transform 0.3s ease, opacity 0.3s ease;
        animation: fadeInSlideUp 0.3s forwards;
        display: inline-flex;
        max-width: 90%;
        min-width: 200px;
        backdrop-filter: blur(10px);

        background: var(--toast-bg);
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .toast-container:hover {
        transform: translateY(-2px);
    }

    .toast-content {
        display: flex;
        align-items: center;
        gap: 15px;
    }

    .toast-icon {
        font-size: 18px;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        font-weight: bold;
        flex-shrink: 0;

        background-color: var(--toast-color);
        color: var(--toast-bg);
    }

    .toast-message {
        letter-spacing: 0.3px;
    }

    @keyframes fadeInSlideUp {
        from {
            opacity: 0;
            transform: translateY(100%);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
</style>