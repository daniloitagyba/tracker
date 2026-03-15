import { env } from '../config/env.js';
import { googleUserSchema } from '../schemas/auth.schema.js';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

export interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

interface GoogleErrorResponse {
  error?: string;
  error_description?: string;
}

export function getGoogleAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: `${env.BACKEND_URL}/auth/google/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export async function getGoogleTokens(code: string): Promise<GoogleTokenResponse> {
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
    const errorData = (await response.json().catch(() => ({}))) as GoogleErrorResponse;
    const errorMessage = errorData.error_description || errorData.error || 'Falha ao obter tokens do Google';

    if (errorData.error === 'deleted_client') {
      throw new Error('Cliente OAuth foi excluído. Crie um novo cliente OAuth no Google Cloud Console e atualize o arquivo .env.');
    }
    if (errorData.error === 'invalid_client') {
      throw new Error('Credenciais OAuth inválidas. Verifique GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET no arquivo .env.');
    }
    if (errorData.error === 'redirect_uri_mismatch') {
      throw new Error(`URI de redirecionamento incompatível. Certifique-se de que '${env.BACKEND_URL}/auth/google/callback' está nas URIs autorizadas no Google Cloud Console.`);
    }

    throw new Error(`Erro OAuth do Google: ${errorMessage}`);
  }

  return response.json() as Promise<GoogleTokenResponse>;
}

export async function getGoogleUser(accessToken: string) {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error('Falha ao obter informações do usuário Google');
  }

  const data = await response.json();
  return googleUserSchema.parse(data);
}
