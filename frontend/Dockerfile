# syntax=docker/dockerfile:1

ARG NODE_VERSION=20

FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* ./

FROM base AS development
ENV NODE_ENV=development
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]

FROM base AS build
ENV NODE_ENV=production
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS production

# Install required packages
RUN apk add --no-cache openssl \
    && mkdir -p /etc/nginx/ssl /var/www/certbot \
    && openssl req -x509 -nodes -days 365 \
      -subj "/C=US/ST=State/L=City/O=HindiSpeech/CN=localhost" \
      -out /etc/nginx/ssl/selfsigned.crt \
      -keyout /etc/nginx/ssl/selfsigned.key

# Set environment variables with defaults
ENV BACKEND_URL=https://personal-ai-assistant-backend.onrender.com
ENV PORT=80

# Install gettext for envsubst
RUN apk add --no-cache gettext

# Create a script to handle environment variables
RUN echo '#!/bin/sh\n\
envsubst \''$BACKEND_URL $PORT\'' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf\n\
# Start Nginx\nexec nginx -g "daemon off;"' > /docker-entrypoint.d/20-envsubst.sh \
    && chmod +x /docker-entrypoint.d/20-envsubst.sh

# Copy configuration files
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY docker-entrypoint.d/ /docker-entrypoint.d/

# Set permissions and copy build files
RUN chmod +x /docker-entrypoint.d/*.sh \
    && chmod 644 /etc/nginx/conf.d/* /etc/nginx/nginx.conf \
    && chown -R nginx:nginx /var/cache/nginx \
    && touch /var/run/nginx.pid \
    && chown -R nginx:nginx /var/run/nginx.pid /var/cache/nginx/

COPY --from=build /app/build /usr/share/nginx/html

# Set up health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/ || exit 1

# Expose the port Nginx is running on
EXPOSE ${PORT}

# Run Nginx
CMD ["nginx", "-g", "daemon off;"]
