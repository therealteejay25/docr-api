# Quick Setup Guide

## Prerequisites

- Node.js 18+
- pnpm
- MongoDB 6+
- Redis 6+

## 1. Install Dependencies

```bash
pnpm install
```

## 2. Set Up Environment

Copy `.env.example` to `.env` and configure:

```bash
# Server
PORT=9000
API_URL=http://localhost:9000  # Backend API URL (used for GitHub webhooks)

# Frontend
ALLOWED_ORIGINS=http://localhost:3000  # Frontend URL for CORS

# Database
MONGODB_URI=mongodb://localhost:27017/docr
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=<generate-random-32-chars>
REFRESH_SECRET=<generate-random-32-chars>

# GitHub OAuth
GITHUB_CLIENT_ID=<from-github-oauth-app>
GITHUB_CLIENT_SECRET=<from-github-oauth-app>
GITHUB_REDIRECT_URI=http://localhost:3000/auth/callback

# AI & Email
OPENAI_KEY=sk-<your-openai-key>
RESEND_API_KEY=re_<your-resend-key>
```

**Important for Webhooks:**
- `API_URL` must be publicly accessible if using GitHub webhooks (GitHub needs to reach your webhook endpoint)
- For local development with ngrok: `API_URL=https://<your-ngrok-url>.ngrok.io`
- For production: `API_URL=https://api.yourdomain.com`


## 3. Start Services

```bash
# MongoDB (Docker)
docker run -d -p 27017:27017 --name mongodb mongo

# Redis (Docker)
docker run -d -p 6379:6379 --name redis redis

# Or use local installations
```

## 4. Run Server

```bash
pnpm dev
```

Server runs on `http://localhost:9000`

## 5. Test API

```bash
# Health check
curl http://localhost:9000/health/live

# API info
curl http://localhost:9000/api/v1/
```

## Next Steps

1. Create GitHub OAuth App (see USAGE_GUIDE.md)
2. Configure webhook URL in GitHub
3. Start using the API (see USAGE_GUIDE.md)

