import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../lib/prisma.js';
import { env } from '../../config/env.js';
import { generateTokens, verifyRefreshToken } from '../../utils/jwt.js';
import { refreshTokenSchema, googleUserSchema } from '../../schemas/auth.schema.js';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

const getGoogleAuthUrl = (): string => {
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: `${env.BACKEND_URL}/auth/google/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
};

interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

const getGoogleTokens = async (code: string): Promise<GoogleTokenResponse> => {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${env.BACKEND_URL}/auth/google/callback`,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to get Google tokens');
  }

  return response.json() as Promise<GoogleTokenResponse>;
};

const getGoogleUser = async (accessToken: string) => {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error('Failed to get Google user info');
  }

  const data = await response.json();
  return googleUserSchema.parse(data);
};

export const authRoutes = async (fastify: FastifyInstance) => {
  // Redirect to Google OAuth
  fastify.get('/auth/google', async (_request: FastifyRequest, reply: FastifyReply) => {
    const url = getGoogleAuthUrl();
    return reply.redirect(url);
  });

  // Google OAuth callback
  fastify.get(
    '/auth/google/callback',
    async (request: FastifyRequest<{ Querystring: { code?: string; error?: string } }>, reply: FastifyReply) => {
      const { code, error } = request.query;

      if (error || !code) {
        return reply.redirect(`${env.FRONTEND_URL}/login?error=auth_failed`);
      }

      try {
        // Exchange code for tokens
        const googleTokens = await getGoogleTokens(code);
        
        // Get user info from Google
        const googleUser = await getGoogleUser(googleTokens.access_token);

        // Create or update user in database
        const user = await prisma.user.upsert({
          where: { googleId: googleUser.id },
          update: {
            email: googleUser.email,
            name: googleUser.name,
            avatar: googleUser.picture,
          },
          create: {
            googleId: googleUser.id,
            email: googleUser.email,
            name: googleUser.name,
            avatar: googleUser.picture,
          },
        });

        // Generate JWT tokens
        const tokens = await generateTokens(fastify, {
          userId: user.id,
          email: user.email,
        });

        // Save refresh token
        await prisma.user.update({
          where: { id: user.id },
          data: { refreshToken: tokens.refreshToken },
        });

        // Redirect to frontend with tokens
        const params = new URLSearchParams({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        });

        return reply.redirect(`${env.FRONTEND_URL}/auth/callback?${params.toString()}`);
      } catch (err) {
        console.error('Auth error:', err);
        return reply.redirect(`${env.FRONTEND_URL}/login?error=auth_failed`);
      }
    }
  );

  // Refresh token endpoint
  fastify.post(
    '/auth/refresh',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = refreshTokenSchema.safeParse(request.body);

      if (!body.success) {
        return reply.status(400).send({ error: 'Invalid request body' });
      }

      const decoded = await verifyRefreshToken(fastify, body.data.refreshToken);

      if (!decoded) {
        return reply.status(401).send({ error: 'Invalid refresh token' });
      }

      // Verify refresh token exists in database
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user || user.refreshToken !== body.data.refreshToken) {
        return reply.status(401).send({ error: 'Invalid refresh token' });
      }

      // Generate new tokens
      const tokens = await generateTokens(fastify, {
        userId: user.id,
        email: user.email,
      });

      // Update refresh token in database
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: tokens.refreshToken },
      });

      return reply.send(tokens);
    }
  );

  // Logout endpoint
  fastify.post(
    '/auth/logout',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { userId } = request.user;

      await prisma.user.update({
        where: { id: userId },
        data: { refreshToken: null },
      });

      return reply.send({ message: 'Logged out successfully' });
    }
  );
};

