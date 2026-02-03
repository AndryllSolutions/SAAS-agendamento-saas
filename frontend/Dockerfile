# Dockerfile para desenvolvimento
# Como o docker-compose usa volumes, este Dockerfile apenas instala dependências
FROM node:20-alpine

WORKDIR /app

# Copiar apenas arquivos de dependências primeiro (para cache)
COPY package*.json ./

# Instalar dependências
RUN npm install

# Expor porta do Next.js
EXPOSE 3000

# Comando padrão (será sobrescrito pelo volume mount no docker-compose)
# O código será montado via volume, então npm run dev funciona
CMD ["npm", "run", "dev"]
