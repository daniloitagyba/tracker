# Tracker - Rastreamento de Encomendas

Aplicação fullstack para rastreamento de encomendas postais com autenticação via Google OAuth.

## Tecnologias

### Frontend
- React 18+
- Vite
- Refine (Simple REST)
- Material UI
- TypeScript

### Backend
- Node.js 18+
- Fastify
- Prisma (SQLite)
- Zod
- JWT + Refresh Token

### Infraestrutura
- Docker
- Docker Compose

---

## Pré-requisitos

- Node.js 18+
- npm ou yarn
- Docker e Docker Compose (opcional, para deploy)

---

## Configuração do Google OAuth

### 1. Criar projeto no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. No menu lateral, vá em **APIs e Serviços** > **Tela de consentimento OAuth**
4. Configure a tela de consentimento:
   - Tipo de usuário: **Externo** (ou Interno se for G Suite)
   - Nome do app: `Tracker`
   - Email de suporte: seu email
   - Adicione os escopos: `email`, `profile`, `openid`

### 2. Criar credenciais OAuth 2.0

1. Vá em **APIs e Serviços** > **Credenciais**
2. Clique em **Criar credenciais** > **ID do cliente OAuth**
3. Tipo de aplicativo: **Aplicativo da Web**
4. Nome: `Tracker Web Client`
5. URIs de redirecionamento autorizados:
   - `http://localhost:3001/auth/google/callback` (desenvolvimento)
6. Clique em **Criar**
7. Copie o **Client ID** e **Client Secret**

---

## Instalação

### 1. Clonar o repositório

```bash
git clone <repo-url>
cd tracker
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

#### Backend

Crie o arquivo `backend/.env`:

```env
# Database
DATABASE_URL="file:./dev.db"

# Google OAuth
GOOGLE_CLIENT_ID="seu_client_id_aqui"
GOOGLE_CLIENT_SECRET="seu_client_secret_aqui"

# JWT (gere strings aleatórias de pelo menos 32 caracteres)
JWT_SECRET="sua_chave_secreta_jwt_min_32_chars"
JWT_REFRESH_SECRET="sua_chave_refresh_jwt_min_32_chars"

# RapidAPI (Correios Tracking)
RAPIDAPI_KEY="sua_rapidapi_key_aqui"

# App
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

#### Frontend

Crie o arquivo `frontend/.env`:

```env
VITE_API_URL="http://localhost:3001"
```

### 4. Configurar banco de dados

```bash
cd backend
npx prisma generate
npx prisma db push
```

---

## Executando em Desenvolvimento

### Opção 1: Executar separadamente

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Opção 2: Executar com concurrently (na raiz)

```bash
npm run dev
```

O frontend estará disponível em `http://localhost:3000` e o backend em `http://localhost:3001`.

---

## Executando com Docker

### 1. Criar arquivo de variáveis de ambiente

Crie o arquivo `.env` na raiz do projeto:

```env
GOOGLE_CLIENT_ID="seu_client_id_aqui"
GOOGLE_CLIENT_SECRET="seu_client_secret_aqui"
JWT_SECRET="sua_chave_secreta_jwt_min_32_chars"
JWT_REFRESH_SECRET="sua_chave_refresh_jwt_min_32_chars"
RAPIDAPI_KEY="sua_rapidapi_key_aqui"
```

### 2. Build e execução

```bash
# Build
docker-compose build

# Executar
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down
```

---

## Estrutura do Projeto

```
tracker/
├── frontend/                 # Aplicação React
│   ├── src/
│   │   ├── components/       # Componentes reutilizáveis
│   │   ├── pages/            # Páginas da aplicação
│   │   ├── providers/        # Providers (auth, data)
│   │   ├── services/         # Serviços de API
│   │   └── types/            # Definições de tipos
│   ├── package.json
│   └── vite.config.ts
├── backend/                  # API Fastify
│   ├── src/
│   │   ├── config/           # Configurações
│   │   ├── lib/              # Instâncias de libs
│   │   ├── modules/          # Módulos de domínio
│   │   │   ├── auth/         # Autenticação
│   │   │   ├── user/         # Usuários
│   │   │   └── package/      # Encomendas
│   │   ├── plugins/          # Plugins Fastify
│   │   ├── schemas/          # Schemas Zod
│   │   ├── services/         # Serviços externos
│   │   └── utils/            # Utilitários
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
├── docker-compose.yml
├── agents.md                 # Decisões arquiteturais
└── README.md
```

---

## API Endpoints

| Método | Rota | Autenticação | Descrição |
|--------|------|--------------|-----------|
| GET | `/auth/google` | Não | Inicia fluxo OAuth |
| GET | `/auth/google/callback` | Não | Callback OAuth |
| POST | `/auth/refresh` | Não | Renova token |
| POST | `/auth/logout` | Sim | Logout |
| GET | `/users/me` | Sim | Dados do usuário |
| GET | `/packages` | Sim | Lista encomendas |
| POST | `/packages` | Sim | Cria encomenda |
| GET | `/packages/:id` | Sim | Detalhes |
| PUT | `/packages/:id` | Sim | Atualiza |
| DELETE | `/packages/:id` | Sim | Remove |
| GET | `/packages/:id/track` | Sim | Rastreia |
| GET | `/health` | Não | Health check |

---

## Funcionalidades

- [x] Autenticação com Google OAuth
- [x] CRUD de encomendas
- [x] Rastreamento via RapidAPI (Correios)
- [x] Interface responsiva
- [x] Timeline de rastreamento
- [x] JWT com Refresh Token

---

## Licença

MIT

