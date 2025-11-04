import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Obtener tokens del localStorage
function getStoredAccessToken() {
	if (browser) {
		return localStorage.getItem('accessToken');
	}
	return null;
}

function getStoredRefreshToken() {
	if (browser) {
		return localStorage.getItem('refreshToken');
	}
	return null;
}

// Obtener usuario del localStorage
function getStoredUser() {
	if (browser) {
		const user = localStorage.getItem('user');
		return user ? JSON.parse(user) : null;
	}
	return null;
}

// Store de autenticación
function createAuthStore() {
	const accessToken = getStoredAccessToken();
	const refreshToken = getStoredRefreshToken();
	
	const { subscribe, set, update } = writable({
		accessToken,
		refreshToken,
		user: getStoredUser(),
		isAuthenticated: !!(accessToken && refreshToken)
	});

	return {
		subscribe,
		login: (accessToken, refreshToken, user) => {
			if (browser) {
				localStorage.setItem('accessToken', accessToken);
				localStorage.setItem('refreshToken', refreshToken);
				localStorage.setItem('user', JSON.stringify(user));
			}
			set({ accessToken, refreshToken, user, isAuthenticated: true });
		},
		logout: () => {
			if (browser) {
				localStorage.removeItem('accessToken');
				localStorage.removeItem('refreshToken');
				localStorage.removeItem('user');
			}
			set({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false });
		},
		updateTokens: (accessToken, refreshToken) => {
			if (browser) {
				localStorage.setItem('accessToken', accessToken);
				if (refreshToken) {
					localStorage.setItem('refreshToken', refreshToken);
				}
			}
			update((state) => ({ ...state, accessToken, refreshToken: refreshToken || state.refreshToken }));
		},
		updateUser: (user) => {
			if (browser) {
				localStorage.setItem('user', JSON.stringify(user));
			}
			update((state) => ({ ...state, user }));
		}
	};
}

export const auth = createAuthStore();

// Store de notificaciones (toasts)
function createToastStore() {
	const { subscribe, update } = writable([]);

	return {
		subscribe,
		success: (message) => {
			const id = Date.now();
			update((toasts) => [...toasts, { id, type: 'success', message }]);
			setTimeout(() => {
				update((toasts) => toasts.filter((t) => t.id !== id));
			}, 3000);
		},
		error: (message) => {
			const id = Date.now();
			update((toasts) => [...toasts, { id, type: 'error', message }]);
			setTimeout(() => {
				update((toasts) => toasts.filter((t) => t.id !== id));
			}, 4000);
		},
		warning: (message) => {
			const id = Date.now();
			update((toasts) => [...toasts, { id, type: 'warning', message }]);
			setTimeout(() => {
				update((toasts) => toasts.filter((t) => t.id !== id));
			}, 3000);
		},
		dismiss: (id) => {
			update((toasts) => toasts.filter((t) => t.id !== id));
		}
	};
}

export const toast = createToastStore();

// Store del carrito del POS
export const cart = writable([]);

// Store de la mesa seleccionada en el POS
export const selectedTable = writable(null);
