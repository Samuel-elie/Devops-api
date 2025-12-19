# Dockerfile pour l'API Express (Ubuntu 22.04 comme hôte, mais image Node alpine)
FROM node:20-alpine

# Dossier de travail dans le conteneur
WORKDIR /usr/src/app

# Copier uniquement les fichiers de dépendances pour optimiser le cache
COPY package*.json ./

# Installer les dépendances en mode production
RUN npm install --only=production

# Copier le reste du code
COPY . .

# Variables d'environnement par défaut
ENV PORT=3000
ENV NODE_ENV=production

# Exposer le port
EXPOSE 3000

# Commande de démarrage
CMD ["node", "src/server.js"]
