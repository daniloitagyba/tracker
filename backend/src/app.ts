import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import { env } from './config/env.js';
import authPlugin from './plugins/auth.plugin.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { userRoutes } from './modules/user/user.routes.js';
import { packageRoutes } from './modules/package/package.routes.js';

export async function buildApp() {
  const fastify = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'development' ? 'info' : 'warn',
    },
  });

  // Register plugins
  await fastify.register(cors, {
    origin: (origin, cb) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return cb(null, true);
      
      // Allow configured frontend URL and hosting platform domains
      const allowedPatterns = [
        env.FRONTEND_URL,
        /\.onrender\.com$/,
        /\.fly\.dev$/,
        /^http:\/\/localhost(:\d+)?$/, // Strict localhost check
      ];
      
      const isAllowed = allowedPatterns.some((pattern) =>
        pattern instanceof RegExp ? pattern.test(origin) : pattern === origin
      );
      
      cb(null, isAllowed);
    },
    credentials: true,
  });

  await fastify.register(cookie);
  await fastify.register(authPlugin);

  // Register routes
  await fastify.register(authRoutes);
  await fastify.register(userRoutes);
  await fastify.register(packageRoutes);

  // Health check
  fastify.get('/health', async () => ({ status: 'ok' }));

  return fastify;
};

