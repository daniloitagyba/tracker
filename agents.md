# Tracker App - Decisões Arquiteturais

## Visão Geral

Aplicação fullstack para rastreamento de encomendas postais, com autenticação via Google OAuth.

---

## Stack Tecnológica

### Frontend
| Tecnologia | Versão | Justificativa |
|------------|--------|---------------|
| React | 18+ | Biblioteca UI moderna com hooks e Suspense |
| Vite | 5+ | Build tool rápido com HMR nativo |
| Refine | 4+ | Framework para aplicações CRUD com data providers |
| Material UI | 5+ | Design system completo e responsivo |
| TypeScript | 5+ | Tipagem estática para maior segurança |

### Backend
| Tecnologia | Versão | Justificativa |
|------------|--------|---------------|
| Node.js | 18+ | Runtime JavaScript server-side |
| Fastify | 4+ | Framework HTTP de alta performance |
| Prisma | 5+ | ORM type-safe com migrations |
| SQLite | - | Banco de dados leve e sem dependências |
| Zod | 3+ | Validação de schemas em runtime |

### Infraestrutura
| Tecnologia | Justificativa |
|------------|---------------|
| Docker | Containerização para deploy consistente |
| Docker Compose | Orquestração de múltiplos containers |

---

## Padrões de Código

### TypeScript
- Strict mode habilitado
- Interfaces para definição de tipos
- Type inference quando possível
- Evitar `any` - usar `unknown` quando necessário

### Async/Await
- Padrão principal para operações assíncronas
- Evitar callback hell
- Promises apenas para compatibilidade com libs

### Arrow Functions
- Preferir arrow functions para código compacto
- Funções nomeadas para melhor stack trace em erros críticos

### Componentes React
- Componentes funcionais com hooks
- Suspense para loading states
- Lazy loading para componentes não-críticos
- Minimizar uso de `useState` e `useEffect`

---

## Arquitetura

### Estrutura do Backend (Modular)

```
backend/src/
├── config/        # Configurações e variáveis de ambiente
├── lib/           # Instâncias de libs (prisma, etc)
├── modules/       # Módulos de domínio
│   ├── auth/      # Autenticação
│   ├── user/      # Usuários
│   └── package/   # Encomendas
├── plugins/       # Plugins Fastify
├── schemas/       # Schemas Zod
├── services/      # Serviços externos
└── utils/         # Utilitários
```

### Estrutura do Frontend (Feature-based)

```
frontend/src/
├── components/    # Componentes reutilizáveis
├── pages/         # Páginas da aplicação
├── providers/     # Context providers
├── services/      # Serviços de API
└── types/         # Definições de tipos
```

---

## Autenticação

### Fluxo OAuth 2.0 com Google

1. Usuário clica em "Login com Google"
2. Frontend redireciona para `/auth/google`
3. Backend redireciona para Google OAuth
4. Google autentica e retorna callback
5. Backend cria/atualiza usuário no banco
6. Backend gera JWT + Refresh Token
7. Backend redireciona para frontend com tokens

### Tokens JWT

| Tipo | Duração | Uso |
|------|---------|-----|
| Access Token | 15 min | Autenticação de requests |
| Refresh Token | 7 dias | Renovação de access token |

### Segurança

- Refresh token salvo no banco (revogável)
- Access token em memória no frontend
- CORS configurado para frontend específico
- Validação de usuário em cada refresh

---

## API REST

### Endpoints

| Método | Rota | Autenticação | Descrição |
|--------|------|--------------|-----------|
| GET | `/auth/google` | Não | Inicia OAuth |
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

### Formato de Resposta

```typescript
// Sucesso
{ data: T }

// Erro
{ error: string, details?: object }
```

---

## Modelo de Dados

### User

```typescript
interface User {
  id: string;          // UUID
  googleId: string;    // ID do Google
  email: string;       // Email único
  name: string;        // Nome
  avatar?: string;     // URL do avatar
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Package

```typescript
interface Package {
  id: string;          // UUID
  description: string; // Descrição da encomenda
  trackingCode: string;// Código de rastreio
  userId: string;      // FK para User
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Integrações

### API Wonca (Rastreamento)

- **Endpoint**: `https://api-labs.wonca.com.br/wonca.labs.v1.LabsService/Track`
- **Método**: POST
- **Autenticação**: API Key via header
- **Payload**: `{ "code": "TRACKING_CODE" }`

---

## Performance

### Frontend
- Lazy loading de rotas
- Suspense boundaries
- Otimização de imagens (WebP, lazy loading)
- Bundle splitting automático pelo Vite

### Backend
- Connection pooling (Prisma)
- Índices no banco para queries frequentes
- Logging apropriado por ambiente

---

## Variáveis de Ambiente

### Backend (.env)
- `DATABASE_URL` - URL do banco SQLite
- `GOOGLE_CLIENT_ID` - Client ID OAuth
- `GOOGLE_CLIENT_SECRET` - Client Secret OAuth
- `JWT_SECRET` - Segredo para access token
- `JWT_REFRESH_SECRET` - Segredo para refresh token
- `WONCA_API_KEY` - Chave da API de rastreamento
- `PORT` - Porta do servidor
- `FRONTEND_URL` - URL do frontend

### Frontend (.env)
- `VITE_API_URL` - URL da API backend

---

## Decisões Técnicas

### Por que SQLite?
- Zero configuração
- Portabilidade (arquivo único)
- Suficiente para aplicação de pequeno/médio porte
- Fácil backup e restauração

### Por que Refine?
- Abstração de CRUD operations
- Data providers prontos
- Integração nativa com Material UI
- Menos boilerplate

### Por que Fastify?
- Alta performance
- Ecosystem rico de plugins
- TypeScript first
- Schema-based validation

### Por que Docker?
- Ambiente consistente
- Deploy simplificado
- Isolamento de dependências
- Fácil escalonamento futuro

