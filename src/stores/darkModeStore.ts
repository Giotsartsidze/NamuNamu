import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Initialize from localStorage or system preference
const getInitialTheme = (): boolean => {
	if (!browser) return false;

	const stored = localStorage.getItem('darkMode');
	if (stored !== null) {
		return stored === 'true';
	}

	// Check system preference
	return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

export const darkMode = writable<boolean>(getInitialTheme());

// Subscribe to changes and update localStorage
if (browser) {
	darkMode.subscribe(value => {
		localStorage.setItem('darkMode', String(value));
		if (value) {
			document.documentElement.classList.add('dark-mode');
		} else {
			document.documentElement.classList.remove('dark-mode');
		}
	});

	// Apply initial theme
	if (getInitialTheme()) {
		document.documentElement.classList.add('dark-mode');
	}
}

export const toggleDarkMode = () => {
	darkMode.update(current => !current);
};