# Multi-stage Dockerfile for the fragments Node.js microservice.
# Stage 1 installs production dependencies; stage 2 copies only what is needed to run.

# Stage 1: install production node_modules in an isolated build layer.
FROM node:22.20.0-bookworm-slim AS dependencies

WORKDIR /app

COPY package.json package-lock.json ./

# Install only production dependencies to keep the final image smaller.
RUN npm ci --omit=dev && npm cache clean --force

# Stage 2: create a smaller runtime image without build tooling or dev dependencies.
FROM node:22.20.0-bookworm-slim

LABEL maintainer="Vivek Patel"
LABEL description="Fragments node.js microservice"

ENV PORT=8080
ENV NODE_ENV=production
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_COLOR=false

WORKDIR /app

# Re-use installed dependencies from the build stage instead of running npm again.
COPY --from=dependencies --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package.json package-lock.json ./
COPY --chown=node:node ./src ./src
COPY --chown=node:node ./tests/.htpasswd ./tests/.htpasswd

USER node

EXPOSE 8080

CMD ["npm", "start"]
