# Tracker - Package Tracking

Fullstack application for tracking postal packages with Google OAuth authentication.

## Technologies

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

### Infrastructure
- Docker
- Docker Compose

---

## Prerequisites

- Node.js 18+
- npm, yarn or pnpm
- Docker and Docker Compose (optional, for deployment)

---

## Google OAuth Configuration

⚠️ **IMPORTANT**: For local development, you need to create an OAuth client in the Google Cloud Console.

### 1. Create a project in Google Cloud Console

1. Access [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. In the side menu, go to **APIs & Services** > **OAuth consent screen**
4. Configure the consent screen:
   - User Type: **External** (or Internal if G Suite)
   - App name: `Tracker`
   - Support email: your email
   - Add scopes: `email`, `profile`, `openid`
   - Save and continue

### 2. Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Application type: **Web application**
4. Name: `Tracker Web Client` (or any name)
5. **Authorized redirect URIs** (CRITICAL - must be exactly like this):
   - `http://localhost:3001/auth/google/callback`
   - ⚠️ **Do not use** `https://` or a different port
   - ⚠️ **Do not add** a trailing slash
6. Click **Create**
7. Copy the **Client ID** and **Client Secret**
8. Paste them into the `backend/.env` file (see installation section below)

### 3. Verify Configuration

If you receive a "deleted_client" or "invalid_client" error:
- Check if Client ID and Secret are correct in the `backend/.env` file
- Verify that the redirect URI is **exactly** `http://localhost:3001/auth/google/callback` in Google Cloud Console
- Ensure there are no extra spaces or special characters in the credentials

---

## Installation

### 1. Clone the repository

```bash
git clone <repo-url>
cd tracker
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

#### Backend

1. Copy the example file:
   ```bash
   cp backend/.env.example backend/.env
   ```

2. Edit the `backend/.env` file and fill in your credentials:
   ```env
   # Database
   DATABASE_URL="file:./prisma/dev.db"

   # Google OAuth (required - see configuration section above)
   GOOGLE_CLIENT_ID="your_client_id_here"
   GOOGLE_CLIENT_SECRET="your_client_secret_here"

   # JWT (generate random strings of at least 32 characters)
   # You can generate one with: openssl rand -base64 32
   JWT_SECRET="your_jwt_secret_key_min_32_chars"
   JWT_REFRESH_SECRET="your_jwt_refresh_secret_key_min_32_chars"

   # RapidAPI (Correios Tracking)
   RAPIDAPI_KEY="your_rapidapi_key_here"

   # App
   PORT=3001
   FRONTEND_URL="http://localhost:3000"
   BACKEND_URL="http://localhost:3001"
   ```

#### Frontend

1. Copy the example file:
   ```bash
   cp frontend/.env.example frontend/.env
   ```

2. The `frontend/.env` file is already correctly configured for localhost:
   ```env
   VITE_API_URL="http://localhost:3001"
   ```

### 4. Configure database

```bash
cd backend
npx prisma generate
npx prisma db push
```

---

## Running in Development

The project uses `pnpm` workspaces and `concurrently` for easier local execution.

### Start Frontend and Backend simultaneously (Recommended)

In the project root, run:
```bash
pnpm dev
```
This command will start both services with prefixed and colored logs (`BACKEND` in magenta and `FRONTEND` in cyan).

The frontend will be available at `http://localhost:3000` and the backend at `http://localhost:3001`.

---

## Running with Docker

### 1. Create environment variables file

Create the `.env` file in the project root:

```env
GOOGLE_CLIENT_ID="your_client_id_here"
GOOGLE_CLIENT_SECRET="your_client_secret_here"
JWT_SECRET="your_jwt_secret_key_min_32_chars"
JWT_REFRESH_SECRET="your_jwt_refresh_secret_key_min_32_chars"
RAPIDAPI_KEY="your_rapidapi_key_here"
```

### 2. Build and execution

```bash
# Build
docker-compose build

# Run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## Project Structure

```
tracker/
├── frontend/                 # React Application
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/            # Application pages
│   │   ├── providers/        # Providers (auth, data)
│   │   ├── services/         # API services
│   │   └── types/            # Type definitions
│   ├── package.json
│   └── vite.config.ts
├── backend/                  # Fastify API
│   ├── src/
│   │   ├── config/           # Configurations
│   │   ├── lib/              # Library instances
│   │   ├── modules/          # Domain modules
│   │   │   ├── auth/         # Authentication
│   │   │   ├── user/         # Users
│   │   │   └── package/      # Packages
│   │   ├── plugins/          # Fastify plugins
│   │   ├── schemas/          # Zod schemas
│   │   ├── services/         # External services
│   │   └── utils/            # Utilities
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
├── docker-compose.yml
├── agents.md                 # Architectural decisions
└── README.md
```

---

## API Endpoints

| Method | Route | Authentication | Description |
|--------|------|--------------|-----------|
| GET | `/auth/google` | No | Starts OAuth flow |
| GET | `/auth/google/callback` | No | OAuth callback |
| POST | `/auth/refresh` | No | Renews token |
| POST | `/auth/logout` | Yes | Logout |
| GET | `/users/me` | Yes | User data |
| GET | `/packages` | Yes | List packages |
| POST | `/packages` | Yes | Create package |
| GET | `/packages/:id` | Yes | Details |
| PUT | `/packages/:id` | Yes | Update |
| DELETE | `/packages/:id` | Yes | Remove |
| GET | `/packages/:id/track` | Yes | Track package |
| GET | `/health` | No | Health check |

---

## Features

- [x] Google OAuth Authentication
- [x] Package CRUD
- [x] Tracking via RapidAPI (Correios)
- [x] Responsive Interface
- [x] Tracking Timeline
- [x] JWT with Refresh Token

---

## License

MIT
