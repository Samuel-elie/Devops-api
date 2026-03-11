FROM node:20-alpine

# Créer un utilisateur non-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Dossier de travail
WORKDIR /usr/src/app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer uniquement les dépendances de prod
RUN npm ci --omit=dev

# Copier le code utile
COPY src ./src

# Donner les droits au user non-root
RUN chown -R appuser:appgroup /usr/src/app

# Variables d'environnement
ENV PORT=3000
ENV NODE_ENV=production

# Utilisateur non-root
USER appuser

# Exposer le port
EXPOSE 3000

# Commande de démarrage
CMD ["node", "src/server.js"]