# Usar una imagen de Node para construir el proyecto
FROM node:18 AS build

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar los archivos necesarios
COPY package.json package-lock.json ./
RUN npm install

COPY . .

# Construir el proyecto Angular
RUN npm run build

# Usar una imagen de Nginx para servir el frontend
FROM nginx:alpine
COPY --from=build /app/dist/curso /usr/share/nginx/html

# Copiar configuración personalizada de Nginx si es necesario
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]