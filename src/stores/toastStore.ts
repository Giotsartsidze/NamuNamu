import { writable } from 'svelte/store';

export interface ToastConfig {
	message: string;
	type: 'success' | 'error' | 'warning' | 'info';
	visible: boolean;
}

const initialToast: ToastConfig = {
	message: '',
	type: 'info',
	visible: false,
};

const { subscribe, set, update } = writable<ToastConfig>(initialToast);

export const toast = {
	subscribe,

	show(message: string, type: ToastConfig['type'] = 'info') {
		update(current => ({
			message,
			type,
			visible: true,
		}));

		setTimeout(() => {
			this.hide();
		}, 3000);
	},

	hide() {
		update(current => ({
			...current,
			visible: false,
		}));
	}
};