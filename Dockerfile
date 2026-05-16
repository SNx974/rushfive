FROM node:20-alpine

WORKDIR /app

# Dépendances d'abord (cache layer)
COPY package*.json ./
RUN npm install --omit=dev

# Sources
COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
