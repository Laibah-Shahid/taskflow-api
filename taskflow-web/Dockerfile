# ─── Build stage ──────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files first for cache efficiency
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build -- --configuration=production

# ─── Runtime stage (nginx) ────────────────────────────────────
FROM nginx:alpine AS runtime

# Remove default nginx page and replace with our Angular build
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist/taskflow-web/browser /usr/share/nginx/html

# Replace default nginx config with our SPA-friendly one
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]