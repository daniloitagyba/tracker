FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /app

COPY package.json ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm db:generate

RUN pnpm build

FROM base AS runner
WORKDIR /app

RUN apk add --no-cache dumb-init openssl

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 fastify

COPY --from=builder --chown=fastify:nodejs /app/dist ./dist
COPY --from=builder --chown=fastify:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=fastify:nodejs /app/package.json ./package.json
COPY --from=builder --chown=fastify:nodejs /app/prisma ./prisma

USER fastify

ENV PORT=10000
ENV NODE_ENV=production
EXPOSE 10000

CMD ["dumb-init", "sh", "-c", "npx prisma db push --skip-generate && node dist/server.js"]
