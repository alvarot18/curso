# Etapa 1: Construir la aplicación Angular
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration production

# Etapa 2: Servir con Nginx
FROM nginx:alpine
COPY --from=build /app/dist/curso/browser /usr/share/nginx/html
EXPOSE 80