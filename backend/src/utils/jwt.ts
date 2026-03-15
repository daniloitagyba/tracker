import type { FastifyInstance } from 'fastify';
import { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } from '../config/constants.js';

export interface JwtPayload {
  userId: string;
  email: string;
}

export const generateTokens = async (
  fastify: FastifyInstance,
  payload: JwtPayload
): Promise<{ accessToken: string; refreshToken: string }> => {
  const accessToken = fastify.jwt.sign(payload, { expiresIn: ACCESS_TOKEN_EXPIRY });
  const refreshToken = fastify.jwt.sign(payload, { expiresIn: REFRESH_TOKEN_EXPIRY });

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
