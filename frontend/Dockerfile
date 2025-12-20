# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Build argument for API URL (will be replaced at build time)
ARG VITE_API_URL=https://tracker-backend.fly.dev

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Set environment variable for build
ENV VITE_API_URL=$VITE_API_URL

# Build
RUN npm run build

# Production stage
FROM nginx:alpine AS runner

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Fly.io uses port 8080 by default
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]

