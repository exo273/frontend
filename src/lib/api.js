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

	async delete(endpoint) {
		return this.request(endpoint, {
			method: 'DELETE'
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
	getProductos: (params) => operacionesClient.get('/api/operaciones/productos/', params),
	createProducto: (data) => operacionesClient.post('/api/operaciones/productos/', data),
	updateProducto: (id, data) => operacionesClient.patch(`/api/operaciones/productos/${id}/`, data),
	deleteProducto: (id) => operacionesClient.delete(`/api/operaciones/productos/${id}/`),
	adjustStock: (id, data) => operacionesClient.post(`/api/operaciones/productos/${id}/adjust_stock/`, data),

	// Categorías
	getCategorias: () => operacionesClient.get('/api/operaciones/categorias/'),
	createCategoria: (data) => operacionesClient.post('/api/operaciones/categorias/', data),

	// Proveedores
	getSuppliers: () => operacionesClient.get('/api/operaciones/proveedores/'),
	createSupplier: (data) => operacionesClient.post('/api/operaciones/proveedores/', data),
	updateSupplier: (id, data) => operacionesClient.patch(`/api/operaciones/proveedores/${id}/`, data),
	deleteSupplier: (id) => operacionesClient.delete(`/api/operaciones/proveedores/${id}/`),

	// Compras
	getPurchases: (params) => operacionesClient.get('/api/operaciones/compras/', params),
	createPurchase: (data) => operacionesClient.post('/api/operaciones/compras/', data),

	// Recetas
	getRecetas: () => operacionesClient.get('/api/operaciones/recetas/'),
	createReceta: (data) => operacionesClient.post('/api/operaciones/recetas/', data),
	updateReceta: (id, data) => operacionesClient.patch(`/api/operaciones/recetas/${id}/`, data),
	deleteReceta: (id) => operacionesClient.delete(`/api/operaciones/recetas/${id}/`),

	// Menú (POS)
	getMenuCategories: () => operacionesClient.get('/api/operaciones/menu-categorias/'),
	getMenuItems: (params) => operacionesClient.get('/api/operaciones/menu-items/', params),
	getMenuItemsAvailable: () => operacionesClient.get('/api/operaciones/menu-items/available/'),
	createMenuItem: (data) => operacionesClient.post('/api/operaciones/menu-items/', data),
	updateMenuItem: (id, data) => operacionesClient.patch(`/api/operaciones/menu-items/${id}/`, data),
	recalculateCost: (id) => operacionesClient.post(`/api/operaciones/menu-items/${id}/recalculate_cost/`, {}),

	// Mesas y Zonas
	getZones: () => operacionesClient.get('/api/operaciones/zonas/'),
	getTables: (params) => operacionesClient.get('/api/operaciones/mesas/', params),
	updateTableStatus: (id, status) => operacionesClient.post(`/api/operaciones/mesas/${id}/update_status/`, { status }),
	getTablesSummary: () => operacionesClient.get('/api/operaciones/mesas/status_summary/'),

	// Órdenes
	getOrders: (params) => operacionesClient.get('/api/orders/orders/', params),
	createOrder: (data) => operacionesClient.post('/api/orders/orders/', data),
	updateOrderStatus: (id, status) => operacionesClient.post(`/api/orders/orders/${id}/change_status/`, { status }),
	addOrderItem: (id, data) => operacionesClient.post(`/api/orders/orders/${id}/add_item/`, data),
	addPayment: (id, data) => operacionesClient.post(`/api/orders/orders/${id}/add_payment/`, data),
	getKDSOrders: () => operacionesClient.get('/api/orders/orders/kds/'),
	getDailySummary: () => operacionesClient.get('/api/orders/orders/daily_summary/')
};
