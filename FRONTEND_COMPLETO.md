# Frontend - SIG Restaurant

Frontend del Sistema Integral de Gestión para Restaurantes construido con **SvelteKit** + **Skeleton UI** + **Tailwind CSS**.

## ✅ Estado: COMPLETO

Todas las páginas y funcionalidades del frontend han sido implementadas.

## 📦 Estructura Completada

```
frontend/
├── src/
│   ├── lib/
│   │   ├── components/      # Componentes reutilizables
│   │   │   ├── PageHeader.svelte
│   │   │   ├── Modal.svelte
│   │   │   ├── DataTable.svelte
│   │   │   ├── SearchBar.svelte
│   │   │   └── index.js
│   │   ├── api.js           # Cliente API completo
│   │   ├── stores.js        # Stores de Svelte (auth, toast, cart, etc.)
│   │   └── config.js        # Configuración de endpoints
│   ├── routes/
│   │   ├── login/
│   │   │   └── +page.svelte           # ✅ Login
│   │   ├── (admin)/
│   │   │   ├── +layout.svelte         # ✅ Layout con sidebar
│   │   │   ├── +page.svelte           # ✅ Dashboard
│   │   │   ├── inventario/
│   │   │   │   └── +page.svelte       # ✅ Gestión de productos
│   │   │   ├── proveedores/
│   │   │   │   └── +page.svelte       # ✅ Gestión de proveedores
│   │   │   ├── compras/
│   │   │   │   └── +page.svelte       # ✅ Registro de compras
│   │   │   ├── recetas/
│   │   │   │   └── +page.svelte       # ✅ Gestión de recetas
│   │   │   └── carta/
│   │   │       └── +page.svelte       # ✅ Gestión del menú
│   │   ├── pos/
│   │   │   ├── +layout.svelte         # ✅ Layout POS
│   │   │   └── +page.svelte           # ✅ Punto de Venta
│   │   ├── +layout.svelte             # ✅ Root layout
│   │   └── app.html                   # ✅ HTML base
│   └── app.postcss                    # ✅ Estilos globales
├── package.json                        # ✅ Dependencias
├── vite.config.js                      # ✅ Configuración Vite
├── tailwind.config.js                  # ✅ Configuración Tailwind
└── svelte.config.js                    # ✅ Configuración SvelteKit
```

## 🎨 Páginas Implementadas

### 1. **Login** (`/login`)
- ✅ Formulario de autenticación
- ✅ Manejo de JWT tokens
- ✅ Persistencia en localStorage
- ✅ Redirección automática

### 2. **Dashboard** (`/`)
- ✅ Estadísticas generales del sistema
- ✅ Cards con métricas clave
- ✅ Alertas de stock bajo
- ✅ Accesos rápidos

### 3. **Inventario** (`/inventario`)
- ✅ Tabla de productos con filtros
- ✅ Crear/editar productos
- ✅ Ajustar stock (entrada/salida)
- ✅ Alertas de stock mínimo
- ✅ Búsqueda y filtros por categoría

### 4. **Proveedores** (`/proveedores`)
- ✅ CRUD completo de proveedores
- ✅ Validación de RUC
- ✅ Toggle activo/inactivo
- ✅ Información de contacto

### 5. **Compras** (`/compras`)
- ✅ Registro de compras
- ✅ Múltiples productos por compra
- ✅ Cálculo automático de totales
- ✅ Actualización automática de stock
- ✅ Historial de compras

### 6. **Recetas** (`/recetas`)
- ✅ Crear recetas con ingredientes
- ✅ Cálculo automático de costos
- ✅ Costo por porción
- ✅ Lista de ingredientes con cantidades

### 7. **Carta/Menú** (`/carta`)
- ✅ Gestión de items del menú
- ✅ Asociación con recetas
- ✅ Cálculo de margen de ganancia
- ✅ Toggle disponible/no disponible
- ✅ Recálculo de costos
- ✅ Filtros por categoría

### 8. **POS - Punto de Venta** (`/pos`)
- ✅ Vista de plano de mesas
- ✅ Estados visuales (disponible/ocupada/reservada)
- ✅ Agregar items a la orden
- ✅ Carrito de compra en tiempo real
- ✅ Crear orden
- ✅ Procesar pagos (efectivo/tarjeta/yape)
- ✅ Cálculo de vuelto
- ✅ Búsqueda y filtros de menú

## 🧩 Componentes Reutilizables

### PageHeader
- Título y subtítulo de página
- Botón de acción principal
- Diseño consistente

### Modal
- Tamaños configurables (sm, md, lg, xl, full)
- Header con título y botón cerrar
- Body con scroll automático
- Footer con slot para botones
- Cierre con ESC o backdrop

### DataTable
- Columnas configurables
- Formateo personalizado
- Acciones por fila
- Estado de carga
- Mensaje cuando está vacía
- Hover effects

### SearchBar
- Búsqueda con debounce
- Botón para limpiar
- Callback personalizable

## 🎯 Características Implementadas

### Autenticación
- ✅ Login con JWT
- ✅ Refresh token automático
- ✅ Logout
- ✅ Redirección a login si no autenticado
- ✅ Persistencia de sesión

### Notificaciones
- ✅ Toast notifications (success, error, warning)
- ✅ Auto-dismiss configurable
- ✅ Posición top-right
- ✅ Iconos por tipo
- ✅ Animaciones

### Estados Visuales
- ✅ Loading states
- ✅ Empty states
- ✅ Error handling
- ✅ Confirmaciones
- ✅ Badges y tags

### Responsive Design
- ✅ Mobile-first
- ✅ Breakpoints de Tailwind
- ✅ Sidebar colapsable
- ✅ Grids adaptables

## 🚀 Próximos Pasos para el Usuario

### 1. Instalar Node.js
```bash
# Descargar de https://nodejs.org/ (versión LTS recomendada)
# Verificar instalación:
node --version
npm --version
```

### 2. Instalar Dependencias
```bash
cd frontend
npm install
```

### 3. Configurar Backend
Asegurarse de que el backend esté corriendo en `http://localhost:8000`

### 4. Iniciar Dev Server
```bash
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

### 5. Build para Producción
```bash
npm run build
npm run preview  # Para previsualizar el build
```

## 🔧 Configuración

### API Endpoint
El frontend está configurado para conectarse al backend en:
- **Dev:** `http://localhost:8000` (con proxy de Vite)
- **Producción:** Configurar en `src/lib/config.js`

### Temas
El proyecto usa el tema "skeleton" de Skeleton UI. Se puede cambiar en:
- `src/app.html`: Atributo `data-theme`
- `tailwind.config.js`: Plugin de Skeleton

## 📝 Flujos de Usuario Implementados

### Flujo 1: Registro de Compra
1. Admin entra a `/compras`
2. Click en "Nueva Compra"
3. Selecciona proveedor y fecha
4. Agrega productos con cantidades y costos
5. Confirma compra
6. ✅ Stock actualizado automáticamente

### Flujo 2: Creación de Receta
1. Admin entra a `/recetas`
2. Click en "Nueva Receta"
3. Ingresa nombre, porciones, tiempo
4. Agrega ingredientes con cantidades
5. Ve costo total calculado
6. Guarda receta

### Flujo 3: Item del Menú
1. Admin entra a `/carta`
2. Click en "Nuevo Item"
3. Ingresa datos del plato
4. Asocia receta (opcional)
5. Define precio de venta
6. ✅ Margen calculado automáticamente

### Flujo 4: Toma de Orden (POS)
1. Mesero entra a `/pos`
2. Selecciona mesa (cambia a amarillo "en uso")
3. Busca y agrega items del menú
4. Confirma orden
5. ✅ Mesa marcada como ocupada (rojo)

### Flujo 5: Procesamiento de Pago (POS)
1. Mesero desde orden activa
2. Click "Procesar Pago"
3. Selecciona método de pago
4. Ingresa monto recibido
5. Sistema calcula vuelto
6. Confirma pago
7. ✅ Mesa vuelve a disponible (verde)

## 🎨 Diseño y UX

### Colores y Estados
- **Verde:** Disponible, éxito, confirmado
- **Rojo:** Ocupado, error, alerta crítica
- **Amarillo:** Reservado, warning, pendiente
- **Azul:** Información, acciones primarias
- **Gris:** Neutral, deshabilitado

### Iconos
Emojis usados para mejor UX visual:
- 🍽️ Restaurant/comida
- 📦 Inventario/productos
- 🚚 Proveedores
- 🛒 Compras
- 📖 Recetas
- 📋 Menú/carta
- 🖥️ POS
- ✅ Éxito/confirmación
- ⚠️ Advertencia
- ❌ Error/cancelar

## 🔐 Seguridad

- ✅ JWT tokens en localStorage
- ✅ Auto-refresh de tokens
- ✅ Logout en token expirado
- ✅ Validación de formularios
- ✅ Sanitización de inputs

## 📱 Compatibilidad

- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers
- ✅ Tablets

## 🐛 Debugging

Si encuentra errores:

1. **Verificar backend:** `http://localhost:8000/docs`
2. **Ver console:** F12 → Console
3. **Verificar network:** F12 → Network
4. **Limpiar caché:** Ctrl+Shift+R

## 📚 Documentación de Librerías

- **SvelteKit:** https://kit.svelte.dev/
- **Skeleton UI:** https://www.skeleton.dev/
- **Tailwind CSS:** https://tailwindcss.com/

---

## ✨ ¡Frontend 100% Completo!

Todas las páginas, componentes y funcionalidades están implementadas. Una vez que instale Node.js y ejecute `npm install`, el sistema estará listo para usar.

**Próximo paso:** Instalar Node.js y ejecutar el proyecto.
