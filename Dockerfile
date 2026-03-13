FROM node:20-alpine

RUN addgroup -g 10001 -S appgroup && adduser -S -D -H -u 10001 -G appgroup appuser

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src

RUN chown -R 10001:10001 /usr/src/app

ENV PORT=3000
ENV NODE_ENV=production

USER 10001:10001

EXPOSE 3000

CMD ["node", "src/server.js"]