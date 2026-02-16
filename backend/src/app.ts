import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
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

  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  await fastify.register(cors, {
    origin: (origin, cb) => {
      
      if (!origin) return cb(null, true);
      
      const allowedPatterns = [
        env.FRONTEND_URL,
        /\.onrender\.com$/,
        /\.fly\.dev$/,
        /^http:\/\/localhost(:\d+)?$/, 
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

  await fastify.register(authRoutes);
  await fastify.register(userRoutes);
  await fastify.register(packageRoutes);

  fastify.get('/health', async () => ({ status: 'ok' }));

  return fastify;
};
