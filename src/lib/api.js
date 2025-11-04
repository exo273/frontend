import { 
	API_BASE_URL, 
	IDENTITY_BASE_URL, 
	POS_BASE_URL,
	API_ENDPOINTS,
	getAuthHeaders 
} from './config';
import { auth, toast } from './stores';
import { get } from 'svelte/store';
import { goto } from '$app/navigation';

/**
 * Cliente API genérico con manejo de errores y reautenticación
 * Ahora con soporte para múltiples microservicios
 */
class APIClient {
	constructor(baseURL = API_BASE_URL) {
		this.baseURL = baseURL;
	}

	async request(endpoint, options = {}) {
		const authState = get(auth);
		const url = `${this.baseURL}${endpoint}`;

		const config = {
			...options,
			headers: {
				'Content-Type': 'application/json',
				...options.headers,
				...(authState.accessToken ? getAuthHeaders(authState.accessToken) : {})
			}
		};

		try {
			const response = await fetch(url, config);

			// Si el token expiró (401), intentar refrescar
			if (response.status === 401 && authState.accessToken && authState.refreshToken) {
				const refreshed = await this.refreshToken();
				if (refreshed) {
					// Reintentar la petición original con el nuevo token
					const newAuthState = get(auth);
					config.headers = {
						...config.headers,
						...getAuthHeaders(newAuthState.accessToken)
					};
					const retryResponse = await fetch(url, config);
					return this.handleResponse(retryResponse);
				} else {
					// No se pudo refrescar, cerrar sesión
					auth.logout();
					goto('/login');
					throw new Error('Sesión expirada');
				}
			}

			return this.handleResponse(response);
		} catch (error) {
			console.error('API Error:', error);
			toast.error(error.message || 'Error de conexión');
			throw error;
		}
	}

	async handleResponse(response) {
		const contentType = response.headers.get('content-type');
		const isJson = contentType && contentType.includes('application/json');

		if (!response.ok) {
			if (isJson) {
				const errorData = await response.json();
				const errorMessage =
					errorData.detail || errorData.message || 'Error en la petición';
				throw new Error(errorMessage);
			} else {
				throw new Error(`Error ${response.status}: ${response.statusText}`);
			}
		}

		// Si es 204 No Content, devolver null
		if (response.status === 204) {
			return null;
		}

		return isJson ? response.json() : response.text();
	}

	async refreshToken() {
		try {
			const authState = get(auth);
			if (!authState.refreshToken) return false;

			// Llamar al microservicio de identidad para refrescar token
			const response = await fetch(`${IDENTITY_BASE_URL}${API_ENDPOINTS.auth.refresh}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ refresh: authState.refreshToken })
			});

			if (response.ok) {
				const data = await response.json();
				auth.updateTokens(data.access, data.refresh || authState.refreshToken);
				return true;
			}
			return false;
		} catch (error) {
			console.error('Error refreshing token:', error);
			return false;
		}
	}

	// Métodos HTTP
	async get(endpoint, params = {}) {
		const queryString = new URLSearchParams(params).toString();
		const url = queryString ? `${endpoint}?${queryString}` : endpoint;
		return this.request(url, { method: 'GET' });
	}

	async post(endpoint, data) {
		return this.request(endpoint, {
			method: 'POST',
			body: JSON.stringify(data)
		});
	}

	async put(endpoint, data) {
		return this.request(endpoint, {
			method: 'PUT',
			body: JSON.stringify(data)
		});
	}

	async patch(endpoint, data) {
		return this.request(endpoint, {
			method: 'PATCH',
			body: JSON.stringify(data)
		});
	}

}

// Crear instancias de clientes para cada microservicio
const identityClient = new APIClient(IDENTITY_BASE_URL);
const operacionesClient = new APIClient(API_BASE_URL);
const posClient = new APIClient(POS_BASE_URL);

// Funciones helper para endpoints comunes
export const apiService = {
	// ===== Autenticación (Microservicio de Identidad) =====
	login: (email, password) => 
		identityClient.post(API_ENDPOINTS.auth.login, { email, password }),
	
	logout: (refreshToken) => 
		identityClient.post(API_ENDPOINTS.auth.logout, { refresh: refreshToken }),
	
	refreshToken: (refreshToken) => 
		identityClient.post(API_ENDPOINTS.auth.refresh, { refresh: refreshToken }),
	
	register: (userData) => 
		identityClient.post(API_ENDPOINTS.auth.register, userData),
	
	getProfile: () => 
		identityClient.get(API_ENDPOINTS.auth.profile),
	
	updateProfile: (userData) => 
		identityClient.patch(API_ENDPOINTS.auth.profile, userData),
	
	changePassword: (oldPassword, newPassword) => 
		identityClient.post(API_ENDPOINTS.auth.changePassword, {
			old_password: oldPassword,
			new_password: newPassword,
			new_password2: newPassword
		}),
	
	validateToken: (token) => 
		identityClient.post(API_ENDPOINTS.auth.validate, { token }),
	
	getRoles: () => 
		identityClient.get(API_ENDPOINTS.auth.roles),
	
	getUsers: () => 
		identityClient.get(API_ENDPOINTS.auth.users),

	// ===== Operaciones (Microservicio de Operaciones) =====

	// Productos
	getProductos: (params) => api.get('/api/inventario/products/', params),
	createProducto: (data) => api.post('/api/inventario/products/', data),
	updateProducto: (id, data) => api.patch(`/api/inventario/products/${id}/`, data),
	deleteProducto: (id) => api.delete(`/api/inventario/products/${id}/`),
	adjustStock: (id, data) => api.post(`/api/inventario/products/${id}/adjust_stock/`, data),

	// Categorías
	getCategorias: () => api.get('/api/inventario/categories/'),
	createCategoria: (data) => api.post('/api/inventario/categories/', data),

	// Proveedores
	getSuppliers: () => api.get('/api/suppliers/suppliers/'),
	createSupplier: (data) => api.post('/api/suppliers/suppliers/', data),
	updateSupplier: (id, data) => api.patch(`/api/suppliers/suppliers/${id}/`, data),
	deleteSupplier: (id) => api.delete(`/api/suppliers/suppliers/${id}/`),

	// Compras
	getPurchases: (params) => api.get('/api/inventario/purchases/', params),
	createPurchase: (data) => api.post('/api/inventario/purchases/', data),

	// Recetas
	getRecetas: () => api.get('/api/recetas/recipes/'),
	createReceta: (data) => api.post('/api/recetas/recipes/', data),
	updateReceta: (id, data) => api.patch(`/api/recetas/recipes/${id}/`, data),
	deleteReceta: (id) => api.delete(`/api/recetas/recipes/${id}/`),

	// Menú (POS)
	getMenuCategories: () => api.get('/api/menu/categories/'),
	getMenuItems: (params) => api.get('/api/menu/items/', params),
	getMenuItemsAvailable: () => api.get('/api/menu/items/available/'),
	createMenuItem: (data) => api.post('/api/menu/items/', data),
	updateMenuItem: (id, data) => api.patch(`/api/menu/items/${id}/`, data),
	recalculateCost: (id) => api.post(`/api/menu/items/${id}/recalculate_cost/`, {}),

	// Mesas y Zonas
	getZones: () => api.get('/api/zones/'),
	getTables: (params) => api.get('/api/tables/', params),
	updateTableStatus: (id, status) => api.post(`/api/tables/${id}/update_status/`, { status }),
	getTablesSummary: () => api.get('/api/tables/status_summary/'),

	// Órdenes
	getOrders: (params) => api.get('/api/orders/orders/', params),
	createOrder: (data) => api.post('/api/orders/orders/', data),
	updateOrderStatus: (id, status) => api.post(`/api/orders/orders/${id}/change_status/`, { status }),
	addOrderItem: (id, data) => api.post(`/api/orders/orders/${id}/add_item/`, data),
	addPayment: (id, data) => api.post(`/api/orders/orders/${id}/add_payment/`, data),
	getKDSOrders: () => api.get('/api/orders/orders/kds/'),
	getDailySummary: () => api.get('/api/orders/orders/daily_summary/')
};
