FROM node:18-alpine

WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./

# Instalar dependencias (con legacy-peer-deps por si hay conflictos)
RUN npm install --legacy-peer-deps

# Copiar el resto de la aplicación
COPY . .

# Exponer puerto
EXPOSE 5173

# Comando por defecto
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
