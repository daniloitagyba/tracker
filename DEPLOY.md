# Guia de Deploy - Render.com

Este guia explica como fazer deploy da aplicação Tracker no Render.com gratuitamente.

## 📋 Pré-requisitos

1. Conta no [Render.com](https://render.com) (gratuita)
2. Repositório Git (GitHub, GitLab ou Bitbucket)
3. Credenciais do Google OAuth configuradas
4. Chave da RapidAPI

## 🚀 Passo a Passo

### 1. Preparar o Repositório

Certifique-se de que todos os arquivos estão commitados:

```bash
git add .
git commit -m "Preparar para deploy no Render"
git push origin main
```

### 2. Criar Conta no Render

1. Acesse [render.com](https://render.com)
2. Crie uma conta ou faça login
3. Conecte sua conta do GitHub/GitLab

### 3. Configurar Google OAuth

Antes do deploy, você precisa configurar as URIs autorizadas no Google Cloud Console:

1. Acesse o [Google Cloud Console](https://console.cloud.google.com)
2. Vá em "APIs & Services" > "Credentials"
3. Selecione seu OAuth 2.0 Client ID
4. Adicione as URIs autorizadas (você precisará fazer isso após criar os serviços no Render):
   - **Authorized JavaScript origins**:
     - `https://seu-frontend.onrender.com`
   - **Authorized redirect URIs**:
     - `https://seu-backend.onrender.com/auth/google/callback`

### 4. Deploy Usando Blueprint (Recomendado)

#### Opção A: Deploy Automático via Blueprint

1. No Render Dashboard, clique em **"New +"** > **"Blueprint"**
2. Conecte seu repositório
3. Selecione o branch (geralmente `main`)
4. O Render irá detectar automaticamente o arquivo `render.yaml`
5. Configure as variáveis de ambiente (veja seção abaixo)
6. Clique em **"Apply"**

#### Opção B: Deploy Manual

Se preferir criar os serviços manualmente:

##### Backend (Web Service)

1. No Dashboard, clique em **"New +"** > **"Web Service"**
2. Conecte o repositório
3. Configure:
   - **Name**: `tracker-backend`
   - **Runtime**: `Docker`
   - **Dockerfile Path**: `./backend/Dockerfile`
   - **Docker Context**: `./backend`
   - **Instance Type**: `Free`

4. Configure as variáveis de ambiente (veja seção abaixo)

5. Adicione um disco persistente:
   - Vá em **"Disks"**
   - Clique em **"Add Disk"**
   - **Name**: `tracker-db`
   - **Mount Path**: `/data`
   - **Size**: `1 GB`

##### Frontend (Static Site)

1. No Dashboard, clique em **"New +"** > **"Static Site"**
2. Conecte o repositório
3. Configure:
   - **Name**: `tracker-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`

4. Configure as variáveis de ambiente:
   - **VITE_API_URL**: URL do seu backend (ex: `https://tracker-backend.onrender.com`)

### 5. Configurar Variáveis de Ambiente

#### Backend

Configure as seguintes variáveis de ambiente no serviço backend:

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `NODE_ENV` | `production` | Ambiente de execução |
| `DATABASE_URL` | `file:/data/production.db` | Caminho do banco SQLite |
| `PORT` | `10000` | Porta do servidor (Render usa 10000) |
| `FRONTEND_URL` | `https://seu-frontend.onrender.com` | URL do frontend |
| `BACKEND_URL` | `https://seu-backend.onrender.com` | URL do backend |
| `GOOGLE_CLIENT_ID` | Seu Client ID | Obtido do Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Seu Client Secret | Obtido do Google Cloud Console |
| `JWT_SECRET` | (auto-gerado) | Clique em "Generate" no Render |
| `JWT_REFRESH_SECRET` | (auto-gerado) | Clique em "Generate" no Render |
| `RAPIDAPI_KEY` | Sua chave | Obtida do RapidAPI |

#### Frontend

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `VITE_API_URL` | `https://seu-backend.onrender.com` | URL do backend |

### 6. Atualizar Google OAuth (Pós-Deploy)

Depois que os serviços estiverem rodando e você tiver as URLs finais:

1. Anote as URLs:
   - Frontend: `https://tracker-frontend.onrender.com` (ou nome que você escolheu)
   - Backend: `https://tracker-backend.onrender.com` (ou nome que você escolheu)

2. Volte ao Google Cloud Console e atualize as URIs autorizadas com as URLs reais

3. Atualize as variáveis de ambiente `FRONTEND_URL` e `BACKEND_URL` no Render se necessário

### 7. Verificar Deploy

1. Acesse a URL do frontend
2. Teste o login com Google
3. Verifique se as funcionalidades estão funcionando

## 🔄 Atualizações Automáticas

O Render detecta automaticamente commits no branch principal e faz o redeploy:

```bash
git add .
git commit -m "Sua mensagem"
git push origin main
```

## 📊 Monitoramento

### Logs

Acesse os logs de cada serviço no Dashboard do Render:
- Backend: Veja requisições, erros e status
- Frontend: Veja logs de build

### Health Check

O backend tem um endpoint de health check em `/health` que o Render usa para monitorar a aplicação.

## ⚠️ Limitações do Plano Gratuito

- **Backend**: 750 horas/mês (suficiente para 1 serviço 24/7)
- **Hibernação**: Serviços gratuitos hibernam após 15 minutos de inatividade
- **Cold Start**: Primeira requisição após hibernação pode levar ~30 segundos
- **Disco**: 1 GB de armazenamento persistente
- **Builds**: 500 minutos de build/mês

## 🐛 Troubleshooting

### Erro: "Invalid environment variables"

- Verifique se todas as variáveis obrigatórias estão configuradas
- Certifique-se de que `JWT_SECRET` e `JWT_REFRESH_SECRET` têm pelo menos 32 caracteres

### Erro: "Google OAuth failed"

- Verifique se as URIs autorizadas estão corretas no Google Cloud Console
- Certifique-se de que `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` estão corretos
- A URI de callback deve ser exatamente: `https://seu-backend.onrender.com/auth/google/callback`

### Erro: "Database locked"

- Certifique-se de que o disco persistente está montado em `/data`
- Verifique se `DATABASE_URL` aponta para `/data/production.db`

### Frontend não carrega dados

- Verifique se `VITE_API_URL` no frontend aponta para a URL correta do backend
- Verifique os logs do backend para erros de CORS
- Certifique-se de que `FRONTEND_URL` no backend está correto

## 🔒 Segurança

### Antes de fazer o deploy:

1. ✅ Gere novas chaves JWT de produção (use "Generate" no Render)
2. ✅ Nunca commite o arquivo `.env` no Git
3. ✅ Use variáveis de ambiente para todas as credenciais
4. ✅ Configure CORS apenas para domínios conhecidos
5. ✅ Use HTTPS em produção (Render fornece automaticamente)

## 📚 Recursos Adicionais

- [Documentação do Render](https://render.com/docs)
- [Render Blueprint Spec](https://render.com/docs/blueprint-spec)
- [Fastify Deployment](https://www.fastify.io/docs/latest/Guides/Deployment/)
- [Vite Production Build](https://vitejs.dev/guide/build.html)

## 💡 Dicas

1. **Domínio Customizado**: Você pode adicionar um domínio personalizado no plano gratuito
2. **Monitoramento**: Configure notificações de falha no Dashboard
3. **Backups**: Faça backup regular do disco persistente (SQLite database)
4. **Performance**: Considere upgrade para plano pago se precisar evitar hibernação

## 🎉 Pronto!

Sua aplicação está no ar! Compartilhe a URL do frontend com seus usuários.

---

**Precisa de ajuda?** Abra uma issue no repositório ou consulte a documentação do Render.
