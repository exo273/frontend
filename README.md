# Frontend - Sistema de Gestión de Restaurantes

Frontend desarrollado con **SvelteKit** + **Skeleton UI** + **Tailwind CSS**.

## 🚀 Inicio Rápido

### 1. Instalar Node.js

**Descargar Node.js LTS** (versión 20.x recomendada):
- Visita: https://nodejs.org/
- Descarga e instala la versión LTS para Windows
- Verifica la instalación:
```powershell
node --version
npm --version
```

### 2. Instalar Dependencias

```powershell
cd frontend
npm install
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:8000
```

### 4. Iniciar Servidor de Desarrollo

```powershell
npm run dev
```

La aplicación estará disponible en: **http://localhost:5173/**

---

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── routes/                    # Páginas de la aplicación
│   │   ├── (admin)/              # Layout admin con sidebar
│   │   │   ├── +layout.svelte   # Layout principal
│   │   │   ├── +page.svelte     # Dashboard (/)
│   │   │   ├── inventario/      # Gestión de inventario
│   │   │   ├── proveedores/     # Gestión de proveedores
│   │   │   ├── compras/         # Registro de compras
│   │   │   ├── recetas/         # Gestión de recetas
│   │   │   └── carta/           # Gestión de menú
│   │   ├── pos/                  # Punto de Venta
│   │   │   ├── +layout.svelte   # Layout POS (pantalla completa)
│   │   │   └── +page.svelte     # Interfaz POS
│   │   ├── login/                # Página de login
│   │   └── +layout.svelte        # Layout raíz
│   ├── lib/
│   │   ├── components/           # Componentes reutilizables
│   │   ├── api.js                # Cliente API
│   │   ├── stores.js             # Stores de Svelte
│   │   └── config.js             # Configuración
│   ├── app.html                  # Template HTML
│   └── app.postcss               # Estilos globales
├── static/                        # Archivos estáticos
├── package.json
├── svelte.config.js
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

---

## 🎨 Tecnologías

- **SvelteKit 2.0** - Framework web moderno
- **Skeleton UI 2.5** - Librería de componentes
- **Tailwind CSS 3.3** - Framework de estilos
- **Vite 5.0** - Build tool ultrarrápido

---

## 🔧 Comandos Disponibles

```powershell
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo

# Producción
npm run build            # Construir para producción
npm run preview          # Vista previa de build de producción

# Calidad de código
npm run check            # Verificar tipos de TypeScript
npm run format           # Formatear código con Prettier
```

---

## 📡 Endpoints de la API

El frontend se comunica con dos microservicios backend:

### Backend de Operaciones (Puerto 8000)
- `/api/inventario/products/` - Gestión de productos
- `/api/inventario/categories/` - Categorías de productos
- `/api/suppliers/suppliers/` - Proveedores
- `/api/inventario/purchases/` - Compras
- `/api/recetas/recipes/` - Recetas

### Backend POS (Puerto 8001)
- `/api/zones/` - Zonas del restaurante
- `/api/tables/` - Mesas
- `/api/menu/items/` - Menú
- `/api/orders/orders/` - Órdenes
- `/api/orders/payments/` - Pagos

---

## 🏗️ Módulos Principales

### 1. Dashboard (/)
- Página de bienvenida
- Resumen de métricas clave
- Enlaces rápidos a módulos

### 2. Operaciones

#### Inventario (`/inventario`)
- Lista de productos con stock
- Filtros por categoría y búsqueda
- Ajuste de stock
- Creación/edición de productos

#### Proveedores (`/proveedores`)
- CRUD de proveedores
- Información de contacto
- Validación RUT (Chile)

#### Compras (`/compras`)
- Registro de compras
- Selección de proveedor
- Detalle de productos comprados
- Actualización automática de stock

#### Recetas (`/recetas`)
- Creación de recetas
- Búsqueda de ingredientes
- Cálculo automático de costos
- Rendimiento de recetas

### 3. Gestión de Ventas

#### Carta/Menú (`/carta`)
- Gestión de platos vendibles
- Composición (productos + recetas)
- Cálculo de costos y márgenes
- Activación/desactivación de platos

### 4. Punto de Venta (`/pos`)
- Vista de mesas por zonas
- Gestión de órdenes
- Búsqueda de platos
- Sistema de pagos múltiples
- Cambio de estado de mesas

---

## 🎯 Flujos de Usuario

### Flujo 1: Registro de Compra
1. Usuario va a `/compras`
2. Click en "+ Registrar Compra"
3. Selecciona proveedor y tipo de documento
4. Añade productos con cantidades y costos
5. Guarda la compra
6. ✅ Stock actualizado automáticamente

### Flujo 2: Creación de Receta
1. Usuario va a `/recetas`
2. Click en "+ Crear Nueva Receta"
3. Ingresa nombre y rendimiento
4. Busca y añade ingredientes (productos)
5. Ve el costo total calculado en tiempo real
6. Guarda la receta

### Flujo 3: Creación de Plato del Menú
1. Usuario va a `/carta`
2. Click en "+ Crear Plato"
3. Ingresa información básica (nombre, precio, foto)
4. En pestaña "Composición", añade componentes:
   - Recetas (ej: Salsa Bolognesa)
   - Productos directos (ej: Queso rallado)
5. Ve el costo calculado y margen de ganancia
6. Activa el plato para que aparezca en POS

### Flujo 4: Tomar una Orden (POS)
1. Mesero abre `/pos`
2. Ve el plano de mesas (verdes = disponibles, rojas = ocupadas)
3. Click en una mesa verde → se pone roja (ocupada)
4. Busca platos y añade a la orden
5. Click en "Confirmar y Enviar"
6. ✅ Orden enviada a cocina

### Flujo 5: Cobrar una Orden (POS)
1. Cliente pide la cuenta
2. Mesero click en la mesa ocupada
3. Click en "Cobrar"
4. Selecciona método de pago (efectivo/tarjeta/convenio)
5. Ingresa monto
6. Click en "Pagar"
7. ✅ Mesa liberada (vuelve a verde)

---

## 🔐 Autenticación

El frontend usa **JWT (JSON Web Tokens)** para autenticación:

1. Usuario ingresa credenciales en `/login`
2. Backend devuelve token de acceso
3. Token se guarda en `localStorage`
4. Todas las peticiones incluyen el token en headers
5. Si el token expira, se intenta refrescar automáticamente
6. Si falla, usuario es redirigido a `/login`

---

## 🎨 Personalización de Tema

Skeleton UI permite cambiar el tema fácilmente:

**En `tailwind.config.js`:**
```javascript
skeleton({
  themes: {
    preset: ['skeleton', 'modern', 'crimson', 'gold-nouveau']
  }
})
```

**Temas disponibles:**
- `skeleton` (por defecto)
- `modern`
- `crimson`
- `gold-nouveau`
- `hamlindigo`
- `rocket`
- `seafoam`
- `vintage`
- `sahara`
- `wintry`

---

## 📱 Responsive Design

La interfaz está optimizada para:
- ✅ Desktop (1920x1080)
- ✅ Laptop (1366x768)
- ✅ Tablet (768x1024)
- ✅ POS (pantallas táctiles)

---

## 🚀 Despliegue en Producción

### Opción 1: Build Estático

```powershell
# Construir aplicación
npm run build

# Los archivos estarán en /build
```

Sirve los archivos con un servidor web (Nginx, Apache, etc.)

### Opción 2: Node.js Server

```powershell
# Construir
npm run build

# Instalar adapter-node
npm install @sveltejs/adapter-node

# Cambiar en svelte.config.js:
# import adapter from '@sveltejs/adapter-node';

# Ejecutar
node build
```

### Opción 3: Docker

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/build build/
COPY --from=builder /app/package.json .
RUN npm ci --production
EXPOSE 3000
CMD ["node", "build"]
```

---

## 🐛 Troubleshooting

### Error: "Cannot find module '@skeletonlabs/skeleton'"
```powershell
npm install
```

### Error: Puerto 5173 en uso
Cambia el puerto en `vite.config.js`:
```javascript
server: {
  port: 5174
}
```

### Error: No se conecta a la API
Verifica que los backends estén corriendo:
- Backend Operaciones: http://localhost:8000
- Backend POS: http://localhost:8001

### Estilos no se aplican
```powershell
npm run dev --force
```

---

## 📚 Documentación Adicional

- [SvelteKit Docs](https://kit.svelte.dev/docs)
- [Skeleton UI Docs](https://www.skeleton.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

## ✅ Checklist de Configuración

- [ ] Node.js instalado (v20+)
- [ ] Dependencias instaladas (`npm install`)
- [ ] Backend Operaciones corriendo (puerto 8000)
- [ ] Backend POS corriendo (puerto 8001)
- [ ] Variables de entorno configuradas (`.env`)
- [ ] Frontend corriendo (`npm run dev`)
- [ ] Login funciona
- [ ] Puede acceder a módulos de administración
- [ ] Puede acceder a POS

---

**¡Frontend listo para desarrollo!** 🎉

La estructura base está creada. Los próximos pasos son crear los componentes y páginas específicas de cada módulo.
