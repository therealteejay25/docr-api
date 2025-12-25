# GitHub Webhook Creation Fix

## Problem

GitHub webhook creation was failing with error: `Failed to create webhook`

The root cause was that webhook URLs were being constructed using `ALLOWED_ORIGINS` (the frontend URL like `http://localhost:3000`), but:

1. GitHub needs to send webhook events to an **API endpoint** it can reach
2. Localhost is not accessible from GitHub's servers
3. The webhook URL was pointing to the frontend instead of the backend API

## Solution

### 1. Added `API_URL` Environment Variable

**File:** `src/config/env.ts`

Added a new env var to separate backend API URL from frontend CORS origins:

```typescript
API_URL: process.env.API_URL || "http://localhost:9000",
```

### 2. Updated Webhook URL Construction

**File:** `src/controllers/repos.controller.ts`

Changed from:

```typescript
const webhookUrl = `${env.ALLOWED_ORIGINS.split(",")[0]}/api/${
  env.API_VERSION
}/webhooks/github`;
```

To:

```typescript
const webhookUrl = `${env.API_URL}/api/${env.API_VERSION}/webhooks/github`;
```

### 3. Enhanced Error Logging

**Files:**

- `src/services/github.service.ts` - Now logs full error details including status, message, and response data
- `src/controllers/repos.controller.ts` - Now returns specific error messages for auth failures and webhook issues

## Environment Setup

### Development (Local)

```
API_URL=http://localhost:9000
ALLOWED_ORIGINS=http://localhost:3000
```

### Development with ngrok (for GitHub webhooks)

```
API_URL=https://<your-ngrok-url>.ngrok.io
ALLOWED_ORIGINS=http://localhost:3000
```

### Production

```
API_URL=https://api.yourdomain.com
ALLOWED_ORIGINS=https://yourdomain.com
```

## Testing

1. Set correct `API_URL` in `.env`
2. Restart the backend server
3. Ensure GitHub OAuth token has:
   - `repo` scope (read/write access to repos)
   - `admin:repo_hook` scope (webhook management)
4. Try connecting a repository again
5. Check logs for detailed error messages if webhook creation still fails

## GitHub Token Scopes

If webhook creation continues to fail, verify your GitHub OAuth app has these scopes:

- ✅ `repo` - Full control of private repositories
- ✅ `admin:repo_hook` - Full control of repository webhooks

Regenerate your GitHub token after updating scopes in the OAuth app.
