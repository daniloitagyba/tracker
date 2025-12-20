# Deploy no Fly.io

Guia para fazer deploy da aplicação Tracker no Fly.io.

## Pré-requisitos

1. Conta no [Fly.io](https://fly.io)
2. CLI do Fly instalado:

```bash
# macOS
brew install flyctl

# Linux
curl -L https://fly.io/install.sh | sh

# Windows
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

3. Login no Fly:

```bash
fly auth login
```

---

## 1. Deploy do Backend

### 1.1 Criar a aplicação

```bash
cd backend

# Criar app (escolha um nome único)
fly apps create tracker-backend

# Criar volume para SQLite (1GB gratuito)
fly volumes create tracker_data --region gru --size 1
```

### 1.2 Configurar secrets (variáveis de ambiente)

```bash
fly secrets set \
  GOOGLE_CLIENT_ID="seu_google_client_id" \
  GOOGLE_CLIENT_SECRET="seu_google_client_secret" \
  JWT_SECRET="sua_chave_jwt_minimo_32_caracteres" \
  JWT_REFRESH_SECRET="sua_chave_refresh_minimo_32_caracteres" \
  RAPIDAPI_KEY="sua_rapidapi_key" \
  FRONTEND_URL="https://tracker-frontend.fly.dev"
```

### 1.3 Deploy

```bash
fly deploy
```

### 1.4 Verificar

```bash
# Ver logs
fly logs

# Verificar status
fly status

# Abrir no navegador
fly open /health
```

---

## 2. Deploy do Frontend

### 2.1 Criar a aplicação

```bash
cd ../frontend

# Criar app
fly apps create tracker-frontend
```

### 2.2 Deploy com URL do backend

```bash
# Deploy passando a URL do backend
fly deploy --build-arg VITE_API_URL=https://tracker-backend.fly.dev
```

### 2.3 Verificar

```bash
fly logs
fly status
fly open
```

---

## 3. Configuração do Google OAuth

Após o deploy, atualize as URLs de redirecionamento no Google Cloud Console:

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Vá em **APIs e Serviços** > **Credenciais**
3. Edite o cliente OAuth
4. Adicione às **URIs de redirecionamento autorizados**:
   - `https://tracker-backend.fly.dev/auth/google/callback`

---

## Comandos Úteis

```bash
# Ver todas as apps
fly apps list

# Ver logs em tempo real
fly logs -a tracker-backend

# Acessar console da máquina
fly ssh console -a tracker-backend

# Ver métricas
fly dashboard -a tracker-backend

# Escalar (mais recursos)
fly scale memory 512 -a tracker-backend

# Ver volumes
fly volumes list -a tracker-backend

# Reiniciar app
fly apps restart tracker-backend
```

---

## Estrutura de Custos (Estimativa)

| Recurso | Free Tier | Custo Extra |
|---------|-----------|-------------|
| 3 VMs shared-cpu-1x | ✅ Incluído | - |
| 256MB RAM por VM | ✅ Incluído | $0.00567/GB/hora |
| 1GB Volume (SQLite) | ✅ Incluído | $0.15/GB/mês |
| Outbound data | 100GB grátis | $0.02/GB |
| SSL/HTTPS | ✅ Incluído | - |

**Estimativa mensal**: $0 - $5 (uso leve)

---

## Troubleshooting

### Erro de conexão com banco

```bash
# Verificar se volume está montado
fly ssh console -a tracker-backend
ls -la /data
```

### Erro de CORS

Verifique se `FRONTEND_URL` está correto nos secrets:

```bash
fly secrets list -a tracker-backend
fly secrets set FRONTEND_URL="https://tracker-frontend.fly.dev" -a tracker-backend
```

### App não inicia

```bash
# Ver logs detalhados
fly logs -a tracker-backend

# Ver eventos da máquina
fly machine list -a tracker-backend
```

---

## Deploy Rápido (Script)

Execute na raiz do projeto:

```bash
#!/bin/bash

# Backend
cd backend
fly apps create tracker-backend --org personal
fly volumes create tracker_data --region gru --size 1 -y
fly secrets set \
  GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID" \
  GOOGLE_CLIENT_SECRET="$GOOGLE_CLIENT_SECRET" \
  JWT_SECRET="$JWT_SECRET" \
  JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET" \
  RAPIDAPI_KEY="$RAPIDAPI_KEY" \
  FRONTEND_URL="https://tracker-frontend.fly.dev"
fly deploy

# Frontend
cd ../frontend
fly apps create tracker-frontend --org personal
fly deploy --build-arg VITE_API_URL=https://tracker-backend.fly.dev

echo "✅ Deploy concluído!"
echo "Frontend: https://tracker-frontend.fly.dev"
echo "Backend: https://tracker-backend.fly.dev"
```

