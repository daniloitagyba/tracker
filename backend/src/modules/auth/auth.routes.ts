import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../lib/prisma.js';
import { env } from '../../config/env.js';
import { verifyRefreshToken } from '../../utils/jwt.js';
import { refreshTokenSchema } from '../../schemas/auth.schema.js';
import { getGoogleAuthUrl, getGoogleTokens, getGoogleUser } from '../../services/google-oauth.service.js';
import { upsertUserFromGoogle, rotateRefreshToken } from '../../services/auth.service.js';

export async function authRoutes(fastify: FastifyInstance) {

  fastify.get('/auth/google', async (_request: FastifyRequest, reply: FastifyReply) => {
    return reply.redirect(getGoogleAuthUrl());
  });

  fastify.get(
    '/auth/google/callback',
    async (request: FastifyRequest<{ Querystring: { code?: string; error?: string } }>, reply: FastifyReply) => {
      const { code, error } = request.query;

      if (error || !code) {
        return reply.redirect(`${env.FRONTEND_URL}/login?error=auth_failed`);
      }

      try {
        const googleTokens = await getGoogleTokens(code);
        const googleUser = await getGoogleUser(googleTokens.access_token);
        const user = await upsertUserFromGoogle(googleUser);
        const tokens = await rotateRefreshToken(fastify, user.id, user.email);

        const params = new URLSearchParams({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        });

        return reply.redirect(`${env.FRONTEND_URL}/auth/callback?${params.toString()}`);
      } catch (err) {
        console.error('Auth error:', err);
        const errorMessage = err instanceof Error ? err.message : 'auth_failed';
        const encodedError = encodeURIComponent(errorMessage);
        return reply.redirect(`${env.FRONTEND_URL}/login?error=${encodedError}`);
      }
    }
  );

  fastify.post(
    '/auth/refresh',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = refreshTokenSchema.safeParse(request.body);

      if (!body.success) {
        return reply.status(400).send({ error: 'Corpo da requisição inválido' });
      }

      const decoded = await verifyRefreshToken(fastify, body.data.refreshToken);

      if (!decoded) {
        return reply.status(401).send({ error: 'Token de atualização inválido' });
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user || user.refreshToken !== body.data.refreshToken) {
        return reply.status(401).send({ error: 'Token de atualização inválido' });
      }

      const tokens = await rotateRefreshToken(fastify, user.id, user.email);
      return reply.send(tokens);
    }
  );

  fastify.post(
    '/auth/logout',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { userId } = request.user;

      await prisma.user.update({
        where: { id: userId },
        data: { refreshToken: null },
      });

      return reply.send({ message: 'Logout realizado com sucesso' });
    }
  );
}
