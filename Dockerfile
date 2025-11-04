FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./

# Instalar dependencias
RUN npm install --legacy-peer-deps

# Copiar el resto de la aplicación
COPY . .

# Build de producción
RUN npm run build

# Etapa de producción
FROM node:18-alpine

WORKDIR /app

# Copiar solo los archivos necesarios
COPY --from=builder /app/build ./build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Exponer puerto
EXPOSE 3000

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3000

# Comando de producción
CMD ["node", "build"]
