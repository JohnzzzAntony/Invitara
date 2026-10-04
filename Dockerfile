FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY public ./public
COPY server ./server
COPY src ./src
COPY config ./config
COPY scripts ./scripts
COPY tests ./tests
COPY eslint.config.mjs ./
RUN npm run lint && npm run build

FROM node:24-bookworm-slim AS runtime
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/public ./public
COPY server ./server
COPY config ./config
RUN mkdir -p /app/data && chown node:node /app/data
USER node
ENV NODE_ENV=production PORT=3000 DATA_DIR=/app/data
EXPOSE 3000
CMD ["node", "server/index.mjs"]
