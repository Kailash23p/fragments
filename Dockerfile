# Dockerfile for the fragments Node.js microservice.
# Defines instructions used by the Docker Engine to build a runnable image.

# Use the same major Node version as local development (node --version).
FROM node:22.20.0

LABEL maintainer="Vivek Patel"
LABEL description="Fragments node.js microservice"

# Default application port inside the container.
ENV PORT=8080

# Reduce npm log noise during image builds.
# https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable colour output when npm runs inside Docker.
# https://docs.npmjs.com/cli/v8/using-npm/config#color
ENV NPM_CONFIG_COLOR=false

# Application working directory inside the image.
WORKDIR /app

# Install dependencies first so Docker can cache this layer when only source changes.
COPY package*.json ./

RUN npm install

# Copy application source code.
COPY ./src ./src

# Copy test auth file needed when HTPASSWD_FILE is set (e.g. env.jest).
COPY ./tests/.htpasswd ./tests/.htpasswd

# Document the port the service listens on inside the container.
EXPOSE 8080

# Start the fragments API server.
CMD npm start
