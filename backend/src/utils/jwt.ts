import type { FastifyInstance } from 'fastify';

export interface JwtPayload {
  userId: string;
  email: string;
}

export const generateTokens = async (
  fastify: FastifyInstance,
  payload: JwtPayload
): Promise<{ accessToken: string; refreshToken: string }> => {
  const accessToken = fastify.jwt.sign(payload, { expiresIn: '15m' });
  const refreshToken = fastify.jwt.sign(payload, { expiresIn: '7d' });

  return { accessToken, refreshToken };
};

export const verifyRefreshToken = async (
  fastify: FastifyInstance,
  token: string
): Promise<JwtPayload | null> => {
  try {
    const decoded = fastify.jwt.verify<JwtPayload>(token);
    return decoded;
  } catch {
    return null;
  }
};
