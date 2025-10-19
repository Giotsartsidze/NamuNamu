import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const getInitialTheme = (): boolean => {
	if (!browser) return false;

	const stored = localStorage.getItem('darkMode');
	if (stored !== null) {
		return stored === 'true';
	}

	return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

export const darkMode = writable<boolean>(getInitialTheme());

if (browser) {
	darkMode.subscribe(value => {
		localStorage.setItem('darkMode', String(value));
		if (value) {
			document.documentElement.classList.add('dark-mode');
		} else {
			document.documentElement.classList.remove('dark-mode');
		}
	});

	if (getInitialTheme()) {
		document.documentElement.classList.add('dark-mode');
	}
}

export const toggleDarkMode = () => {
	darkMode.update(current => !current);
};