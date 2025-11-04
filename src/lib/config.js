/**
 * Configuración de la API - Sistema de Microservicios
 */

// URL del API Gateway (Nginx) - usar ruta relativa en producción
export const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || '';

// URLs de microservicios individuales (para desarrollo sin gateway)
export const IDENTITY_SERVICE_URL = import.meta.env.VITE_IDENTITY_URL || 'http://localhost:8001';
export const OPERACIONES_SERVICE_URL = import.meta.env.VITE_OPERACIONES_URL || 'http://localhost:8000';
export const POS_SERVICE_URL = import.meta.env.VITE_POS_URL || 'http://localhost:8002';

// Usar Gateway en producción (por defecto true si no se especifica)
export const USE_GATEWAY = import.meta.env.VITE_USE_GATEWAY !== 'false';

// URLs base
export const API_BASE_URL = USE_GATEWAY ? API_GATEWAY_URL : OPERACIONES_SERVICE_URL;
export const IDENTITY_BASE_URL = USE_GATEWAY ? API_GATEWAY_URL : IDENTITY_SERVICE_URL;
export const POS_BASE_URL = USE_GATEWAY ? API_GATEWAY_URL : POS_SERVICE_URL;

// Endpoints
export const API_ENDPOINTS = {
	// Auth (Microservicio de Identidad - Puerto 8001)
	auth: {
		login: '/api/auth/login/',
		logout: '/api/auth/logout/',
		refresh: '/api/auth/refresh/',
		register: '/api/auth/register/',
		profile: '/api/auth/profile/',
		changePassword: '/api/auth/change-password/',
		validate: '/api/auth/validate/',
		roles: '/api/auth/roles/',
		users: '/api/auth/users/'
	},
	// Operaciones
	operaciones: {
		productos: '/api/inventario/products/',
		categorias: '/api/inventario/categories/',
		suppliers: '/api/suppliers/suppliers/',
		purchases: '/api/inventario/purchases/',
		recetas: '/api/recetas/recipes/'
	},
	// POS
	pos: {
		zones: '/api/zones/',
		tables: '/api/tables/',
		menu: '/api/menu/items/',
		menuCategories: '/api/menu/categories/',
		orders: '/api/orders/orders/',
		payments: '/api/orders/payments/'
	}
};

// Headers para autenticación
export function getAuthHeaders(token) {
	return {
		'Content-Type': 'application/json',
		Authorization: `Bearer ${token}`
	};
}
