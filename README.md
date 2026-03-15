# Tracker

Aplicacao web para rastreamento de encomendas dos Correios com autenticacao Google OAuth.

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Material-UI, React Query
- **Backend:** Fastify, Prisma ORM, SQLite, Zod
- **Autenticacao:** Google OAuth 2.0 + JWT (access + refresh token)
- **API de Rastreamento:** RapidAPI (Correios)
- **Deploy:** GitHub Actions, PM2, Nginx, Cloudflare Tunnel

## Pre-requisitos

- Node.js >= 18
- pnpm 9

## Configuracao

### Backend

Crie o arquivo `backend/.env`:

```env
DATABASE_URL="file:./prisma/dev.db"
GOOGLE_CLIENT_ID="seu_google_client_id"
GOOGLE_CLIENT_SECRET="seu_google_client_secret"
JWT_SECRET="string_aleatoria_com_pelo_menos_32_caracteres"
JWT_REFRESH_SECRET="string_aleatoria_com_pelo_menos_32_caracteres"
RAPIDAPI_KEY="sua_chave_rapidapi"
PORT=3007
FRONTEND_URL="http://localhost:3006"
BACKEND_URL="http://localhost:3007"
```

### Frontend

Crie o arquivo `frontend/.env`:

```env
VITE_API_URL="http://localhost:3007"
```

## Desenvolvimento

```bash
# Instalar dependencias
pnpm install

# Gerar Prisma Client e criar banco
pnpm --filter tracker-backend db:generate
pnpm --filter tracker-backend db:push

# Rodar frontend e backend juntos
pnpm dev

# Ou separadamente
pnpm dev:backend   # http://localhost:3007
pnpm dev:frontend  # http://localhost:3006
```

## Build

```bash
pnpm build           # Build completo
pnpm build:backend   # Apenas backend
pnpm build:frontend  # Apenas frontend
```

## Deploy

O deploy e automatico via GitHub Actions ao fazer push na branch `main`. O workflow:

1. Builda backend e frontend
2. Envia os arquivos para a VPS via SSH (Cloudflare Tunnel)
3. Instala dependencias de producao
4. Sincroniza o schema do banco (Prisma)
5. Configura Nginx e reinicia o PM2

### Secrets necessarios no GitHub

| Secret | Descricao |
|---|---|
| `VPS_SSH_KEY` | Chave SSH privada para acesso a VPS |
| `VPS_HOST` | Hostname da VPS (Cloudflare Tunnel) |
| `VPS_USER` | Usuario SSH |
| `APP_DIR` | Diretorio da aplicacao na VPS |
| `GOOGLE_CLIENT_ID` | Client ID do Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Client Secret do Google OAuth |
| `JWT_SECRET` | Secret para tokens de acesso |
| `JWT_REFRESH_SECRET` | Secret para refresh tokens |
| `RAPIDAPI_KEY` | Chave da API RapidAPI |
| `FRONTEND_URL` | URL publica do frontend |
| `BACKEND_URL` | URL publica do backend |

## Endpoints da API

| Metodo | Rota | Auth | Descricao |
|---|---|---|---|
| GET | `/health` | Nao | Health check |
| GET | `/auth/google` | Nao | Inicio do fluxo OAuth |
| GET | `/auth/google/callback` | Nao | Callback do OAuth |
| POST | `/auth/refresh` | Nao | Renovar access token |
| POST | `/auth/logout` | Sim | Logout |
| GET | `/users/me` | Sim | Dados do usuario logado |
| GET | `/packages` | Sim | Listar encomendas |
| POST | `/packages` | Sim | Cadastrar encomenda |
| GET | `/packages/:id` | Sim | Detalhes da encomenda |
| PUT | `/packages/:id` | Sim | Atualizar encomenda |
| DELETE | `/packages/:id` | Sim | Remover encomenda |
| GET | `/packages/:id/track` | Sim | Rastrear encomenda |

## Estrutura do Projeto

```
tracker/
├── backend/
│   ├── prisma/           # Schema e banco SQLite
│   └── src/
│       ├── config/       # Variaveis de ambiente e constantes
│       ├── controllers/  # Handlers HTTP
│       ├── modules/      # Rotas por modulo
│       ├── plugins/      # Plugins Fastify (auth)
│       ├── schemas/      # Validacao com Zod
│       ├── services/     # Logica de negocio e integracao RapidAPI
│       └── utils/        # Utilitarios
├── frontend/
│   └── src/
│       ├── components/   # Componentes React
│       ├── config/       # Constantes
│       ├── hooks/        # Custom hooks
│       ├── pages/        # Paginas
│       ├── services/     # Cliente HTTP
│       └── types/        # Tipos TypeScript
├── deploy/
│   └── nginx.conf        # Configuracao Nginx
└── .github/
    └── workflows/
        └── deploy.yml    # CI/CD
```
