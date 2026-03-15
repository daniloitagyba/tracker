import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { generateTokens } from '../utils/jwt.js';

interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export async function upsertUserFromGoogle(googleUser: GoogleUser) {
  return prisma.user.upsert({
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
}

export async function rotateRefreshToken(fastify: FastifyInstance, userId: string, email: string) {
  const tokens = await generateTokens(fastify, { userId, email });

  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: tokens.refreshToken },
  });

  return tokens;
}
