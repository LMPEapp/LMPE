# Étape 1 : Build Angular
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build:prod  # génère dist/LMPE/browser

# Étape 2 : Serveur Nginx
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN ls -R /app/dist
COPY --from=builder /app/dist/LMPE/browser /usr/share/nginx/html
EXPOSE 80
