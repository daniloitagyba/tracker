FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /app

# Copy workspace config files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# Copy package.json for workspaces
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Install dependencies (frozen lockfile to ensure reproducibility)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY backend ./backend
COPY frontend ./frontend
COPY tsconfig.json ./

# Build backend
RUN pnpm --filter tracker-backend build
RUN pnpm --filter tracker-backend deploy --prod /app/deployed

FROM base AS runner
WORKDIR /app

# Install dumb-init and OpenSSL for Prisma
RUN apk add --no-cache dumb-init openssl

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 fastify

# Copy deployed app
COPY --from=builder --chown=fastify:nodejs /app/deployed .
# Copy prisma schema which might not be in the deployed package if not in 'files' list
COPY --from=builder --chown=fastify:nodejs /app/backend/prisma ./prisma

# Create data directory for SQLite if needed
RUN mkdir -p /data && chown -R fastify:nodejs /data

USER fastify

ENV PORT=10000
EXPOSE 10000

# Push schema to database and start server
CMD ["dumb-init", "sh", "-c", "npx prisma db push --skip-generate && node dist/server.js"]
