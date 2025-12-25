# Docr Backend - Complete Usage Guide

## Table of Contents

1. [Setup & Installation](#setup--installation)
2. [Configuration](#configuration)
3. [API Usage](#api-usage)
4. [Workflow Examples](#workflow-examples)
5. [Troubleshooting](#troubleshooting)
6. [Production Checklist](#production-checklist)

## Setup & Installation

### Step 1: Install Dependencies

```bash
cd docr-api
pnpm install
```

### Step 2: Set Up Services

#### MongoDB

```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or install locally
# macOS: brew install mongodb-community
# Ubuntu: sudo apt-get install mongodb
```

#### Redis

```bash
# Using Docker
docker run -d -p 6379:6379 --name redis redis:latest

# Or install locally
# macOS: brew install redis
# Ubuntu: sudo apt-get install redis-server
```

### Step 3: Create GitHub OAuth App

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: Docr
   - **Homepage URL**: `http://localhost:3000` (your frontend)
   - **Authorization callback URL**: `http://localhost:9000/api/v1/auth/github/callback`
4. Save and note the **Client ID** and **Client Secret**

### Step 4: Get API Keys

#### OpenAI

1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key (starts with `sk-`)

#### Resend

1. Go to https://resend.com/api-keys
2. Create a new API key
3. Copy the key (starts with `re_`)

### Step 5: Configure Environment

Create `.env` file:

```env
# Server
PORT=9000
NODE_ENV=development
API_VERSION=v1
ALLOWED_ORIGINS=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/docr

# Redis
REDIS_URL=redis://localhost:6379

# JWT (generate strong random strings)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_REDIRECT_URI=http://localhost:9000/api/v1/auth/github/callback
GITHUB_WEBHOOK_SECRET=generate-random-secret-here

# OpenAI
OPENAI_KEY=sk-your-openai-api-key
MODEL=gpt-4o-mini

# Resend
RESEND_API_KEY=re_your-resend-api-key
```

### Step 6: Start the Server

```bash
# Development (with auto-reload)
pnpm dev

# Production
pnpm start
```

Server runs on `http://localhost:9000`

## Configuration

### Repository Settings

Each repository can be configured with:

```json
{
  "autoUpdate": true,
  "docTypes": {
    "readme": true,
    "changelog": false,
    "apiDocs": false,
    "architectureDocs": false
  },
  "branchPreference": "main",
  "emailNotifications": true
}
```

### Credits Configuration

Default credit costs:

- Base: 10 credits
- Per 1000 repo lines: 1 credit
- Per file touched: 2 credits
- Per 1000 AI tokens: 1 credit

Free tier: 1000 credits/month

## API Usage

### Authentication Flow

#### 1. Initiate OAuth

Redirect user to:

```
GET http://localhost:9000/api/v1/auth/github
```

#### 2. Handle Callback

After GitHub OAuth, user is redirected to:

```
http://localhost:3000/auth/callback?token=<access_token>&refresh=<refresh_token>
```

#### 3. Use Access Token

Include in all requests:

```bash
Authorization: Bearer <access_token>
```

#### 4. Refresh Token

When access token expires (15 min):

```bash
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "<refresh_token>"
}

# Response
{
  "accessToken": "<new_access_token>"
}
```

### Repository Management

#### List Available Repositories

```bash
GET /api/v1/repos/list
Authorization: Bearer <token>

# Response
{
  "repos": [
    {
      "id": 123456789,
      "name": "my-repo",
      "full_name": "username/my-repo",
      "private": false,
      ...
    }
  ]
}
```

#### Connect Repository

```bash
POST /api/v1/repos/connect
Authorization: Bearer <token>
Content-Type: application/json

{
  "repoId": 123456789,
  "owner": "username",
  "name": "my-repo"
}

# Response
{
  "repo": {
    "_id": "...",
    "name": "my-repo",
    "fullName": "username/my-repo",
    "webhookId": 123456,
    "settings": { ... }
  }
}
```

#### Get Connected Repositories

```bash
GET /api/v1/repos
Authorization: Bearer <token>

# Response
{
  "repos": [
    {
      "_id": "...",
      "name": "my-repo",
      "fullName": "username/my-repo",
      "isActive": true,
      "settings": { ... }
    }
  ]
}
```

#### Update Repository Settings

```bash
PATCH /api/v1/repos/:repoId/settings
Authorization: Bearer <token>
Content-Type: application/json

{
  "settings": {
    "autoUpdate": true,
    "docTypes": {
      "readme": true,
      "changelog": true
    },
    "branchPreference": "main",
    "emailNotifications": true
  }
}
```

#### Disconnect Repository

```bash
DELETE /api/v1/repos/:repoId
Authorization: Bearer <token>
```

### Credits Management

#### Check Balance

```bash
GET /api/v1/credits
Authorization: Bearer <token>

# Response
{
  "balance": 1000,
  "isBelowThreshold": false
}
```

#### Add Credits

```bash
POST /api/v1/credits/add
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 5000
}

# Response
{
  "balance": 6000,
  "message": "Credits added successfully"
}
```

### Analytics

#### Get Analytics

```bash
GET /api/v1/analytics?days=30
Authorization: Bearer <token>

# Response
{
  "analytics": [
    {
      "date": "2024-01-01",
      "metrics": {
        "reposConnected": 5,
        "docsGenerated": 12,
        "creditsUsed": 150,
        "successRate": 0.95,
        ...
      }
    }
  ]
}
```

### AI Agent

The AI Agent is an intelligent assistant that has access to all app capabilities and can perform actions on your behalf.

#### Chat with AI Agent

```bash
POST /api/v1/ai/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "Check my credit balance and list my repositories"
}

# Response
{
  "message": "You have 1,000 credits remaining. You have 3 connected repositories:...",
  "actions": [
    {
      "type": "get_credit_balance",
      "description": "Executed get_credit_balance",
      "result": { "balance": 1000, "isBelowThreshold": false }
    },
    {
      "type": "list_repositories",
      "description": "Executed list_repositories",
      "result": { "repos": [...] }
    }
  ]
}
```

#### Get AI Capabilities

```bash
GET /api/v1/ai/capabilities
Authorization: Bearer <token>

# Response
{
  "capabilities": {
    "repositoryManagement": [...],
    "githubOperations": [...],
    "documentation": [...],
    "credits": [...],
    "analytics": [...],
    "jobs": [...]
  }
}
```

#### Example: Urgent GitHub Request

```bash
POST /api/v1/ai/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "I need to urgently update the README.md file in my-repo. The content should be: '# My Project\n\nThis is an urgent update.'"
}

# AI will:
# 1. Get the current file
# 2. Update it directly via GitHub API
# 3. Return the commit details
```

#### Example: Trigger Documentation

```bash
POST /api/v1/ai/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "Generate documentation for my latest commit in repo abc123"
}
```

### Job Monitoring

#### List Jobs

```bash
GET /api/v1/jobs?repoId=<repoId>&status=processing&limit=50
Authorization: Bearer <token>

# Response
{
  "jobs": [
    {
      "jobId": "123",
      "jobType": "process_commit",
      "status": "completed",
      "createdAt": "2024-01-01T00:00:00Z",
      "duration": 1500
    }
  ]
}
```

#### Get Job Details

```bash
GET /api/v1/jobs/:jobId
Authorization: Bearer <token>

# Response
{
  "job": {
    "jobId": "123",
    "jobType": "generate_docs",
    "status": "completed",
    "input": { ... },
    "output": { ... },
    "duration": 5000
  }
}
```

## Workflow Examples

### Complete Flow: Push → Documentation Update

1. **User pushes to GitHub**

   ```
   git push origin main
   ```

2. **GitHub sends webhook**

   - Webhook received at `/api/v1/webhooks/github`
   - Event saved to database
   - Job queued: `process_commit`

3. **Process Commit Worker**

   - Fetches commit diff
   - Extracts file changes
   - Queues: `generate_docs`

4. **Generate Docs Worker**

   - Builds context from changes
   - Calls OpenAI API
   - Validates patches
   - Deducts credits
   - Queues: `apply_patch`

5. **Apply Patch Worker**

   - Applies patches to files
   - Writes to GitHub (or creates PR)
   - Updates repository metadata
   - Queues: `send_email`

6. **Send Email Worker**
   - Builds email template
   - Sends via Resend
   - Logs completion

### Manual Documentation Generation

You can trigger documentation generation manually by:

1. Creating a webhook event manually (for testing)
2. Using GitHub API to trigger workflow_dispatch
3. Calling the process_commit queue directly

### Testing Webhook Locally

Use ngrok to expose local server:

```bash
# Install ngrok
brew install ngrok  # macOS
# or download from https://ngrok.com

# Expose local server
ngrok http 9000

# Use ngrok URL in GitHub webhook settings
# https://xxxx.ngrok.io/api/v1/webhooks/github
```

## Troubleshooting

### Issue: Webhooks not received

**Check:**

1. Webhook URL is accessible (use ngrok for local dev)
2. Webhook secret matches `GITHUB_WEBHOOK_SECRET`
3. Repository is connected and `isActive: true`
4. `autoUpdate` setting is enabled

**Debug:**

```bash
# Check webhook events in MongoDB
db.webhookevents.find().sort({createdAt: -1}).limit(10)
```

### Issue: Jobs stuck in queue

**Check:**

1. Redis is running: `redis-cli ping` (should return PONG)
2. Workers are initialized (check logs)
3. Job status in MongoDB: `db.jobs.find({status: "processing"})`

**Fix:**

```bash
# Restart workers
# Workers auto-start with server, restart server
pnpm dev
```

### Issue: AI generation failing

**Check:**

1. OpenAI API key is valid
2. Credit balance is sufficient
3. Input size within limits
4. API rate limits not exceeded

**Debug:**

```bash
# Check job errors
GET /api/v1/jobs?status=failed

# Check credits
GET /api/v1/credits
```

### Issue: GitHub write access denied

**Check:**

1. User has write access to repository
2. GitHub token hasn't expired
3. Repository isn't archived

**Fix:**

- System automatically falls back to PR creation
- Check job output for `prUrl`

### Issue: Email not sending

**Check:**

1. Resend API key is valid
2. Email notifications enabled in repo settings
3. User email is valid

**Debug:**

```bash
# Check email queue jobs
GET /api/v1/jobs?jobType=send_email
```

## Production Checklist

### Before Deployment

- [ ] Set `NODE_ENV=production`
- [ ] Use strong, random secrets (min 32 chars)
- [ ] Configure production MongoDB (replica set)
- [ ] Configure production Redis (cluster)
- [ ] Update `ALLOWED_ORIGINS` with production domain
- [ ] Update `GITHUB_REDIRECT_URI` with production URL
- [ ] Set up webhook URL in GitHub (production domain)
- [ ] Configure SSL/TLS certificates
- [ ] Set up monitoring (logs, metrics, alerts)
- [ ] Configure log aggregation
- [ ] Set up backup strategy for MongoDB
- [ ] Configure Redis persistence
- [ ] Set up rate limiting
- [ ] Configure CORS properly
- [ ] Review security settings

### Environment Variables (Production)

```env
NODE_ENV=production
PORT=9000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/docr
REDIS_URL=redis://production-redis:6379
ALLOWED_ORIGINS=https://docr.app,https://www.docr.app
GITHUB_REDIRECT_URI=https://api.docr.app/api/v1/auth/github/callback
# ... use strong secrets
```

### Monitoring

Set up monitoring for:

- API response times
- Queue job durations
- Error rates
- Credit usage
- Webhook processing times
- Database connection health
- Redis connection health

### Scaling

For high traffic:

- Run multiple worker instances
- Use Redis cluster
- Use MongoDB replica set
- Load balance API servers
- Monitor queue depths
- Scale workers based on queue size

## Support

For issues or questions:

1. Check logs: `logs/error.log` and MongoDB `Log` collection
2. Review job status: `/api/v1/jobs`
3. Check analytics: `/api/v1/analytics`
4. Review webhook events in MongoDB

## Additional Resources

- [GitHub Webhooks Documentation](https://docs.github.com/en/developers/webhooks-and-events/webhooks)
- [BullMQ Documentation](https://docs.bullmq.io/)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Resend Documentation](https://resend.com/docs)
