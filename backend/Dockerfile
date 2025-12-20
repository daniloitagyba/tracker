# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl openssl-dev

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install --legacy-peer-deps

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install dumb-init and OpenSSL for Prisma
RUN apk add --no-cache dumb-init openssl

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 fastify

# Copy built files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Create data directory for SQLite (Fly.io volume mount)
RUN mkdir -p /data && chown -R fastify:nodejs /data

# Change ownership
RUN chown -R fastify:nodejs /app

USER fastify

# Fly.io uses port 8080 by default
ENV PORT=8080
EXPOSE 8080

# Push schema to database and start server
CMD ["dumb-init", "sh", "-c", "npx prisma db push --skip-generate && npm start"]

