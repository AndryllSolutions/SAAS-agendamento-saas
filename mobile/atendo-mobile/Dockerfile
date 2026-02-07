# Multi-stage build para React Native Expo App (Produção)
# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Instalar dependências do sistema
RUN apk add --no-cache python3 make g++ git

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Build da aplicação web (export estático)
RUN npx expo export --platform web --output-dir web-build

# Stage 2: Nginx para servir arquivos estáticos
FROM nginx:alpine

# Copiar build para nginx
COPY --from=builder /app/web-build /usr/share/nginx/html

# Copiar config nginx customizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
