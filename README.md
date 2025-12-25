# Docr Backend API

Complete event-driven backend for automated documentation generation from GitHub repositories.

## Features

- ✅ GitHub OAuth authentication
- ✅ Repository management and webhook installation
- ✅ Event-driven webhook processing
- ✅ AI-powered documentation generation
- ✅ Safe diff/patch application
- ✅ Credits system
- ✅ Email notifications
- ✅ Analytics and logging
- ✅ Queue-based job processing with BullMQ
- ✅ Automatic PR fallback for failed direct writes
- ✅ **AI Agent with full app access** - Intelligent assistant that can perform any user action
- ✅ **Streaming AI responses** - Real-time updates with animated UI support
- ✅ **Natural language communication** - AI always speaks in conversational language

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Queue**: BullMQ + Redis
- **AI**: OpenAI GPT-4
- **Email**: Resend
- **GitHub**: Octokit REST API

## Prerequisites

- Node.js 18+ and pnpm
- MongoDB 6+
- Redis 6+
- GitHub OAuth App
- OpenAI API Key
- Resend API Key

## Installation

1. **Clone and install dependencies:**

```bash
cd docr-api
pnpm install
```

2. **Set up environment variables:**

Copy `.env.example` to `.env` and fill in all values:

```bash
cp .env.example .env
```

Required environment variables:

- `MONGODB_URI` - MongoDB connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - Secret for JWT tokens
- `REFRESH_SECRET` - Secret for refresh tokens
- `GITHUB_CLIENT_ID` - GitHub OAuth app client ID
- `GITHUB_CLIENT_SECRET` - GitHub OAuth app client secret
- `GITHUB_REDIRECT_URI` - OAuth callback URL
- `OPENAI_KEY` - OpenAI API key
- `RESEND_API_KEY` - Resend API key

3. **Start MongoDB and Redis:**

```bash
# MongoDB (if running locally)
mongod

# Redis (if running locally)
redis-server
```

4. **Run the server:**

```bash
# Development
pnpm dev

# Production
pnpm start
```

The server will start on `http://localhost:9000` (or your configured PORT).

## API Endpoints

### Authentication

- `GET /api/v1/auth/github` - Redirect to GitHub OAuth
- `GET /api/v1/auth/github/callback` - OAuth callback
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout

### Repositories

- `GET /api/v1/repos/list` - List user's GitHub repositories
- `GET /api/v1/repos` - Get connected repositories
- `POST /api/v1/repos/connect` - Connect a repository
- `DELETE /api/v1/repos/:repoId` - Disconnect a repository
- `PATCH /api/v1/repos/:repoId/settings` - Update repository settings

### Webhooks

- `POST /api/v1/webhooks/github` - GitHub webhook endpoint

### Credits

- `GET /api/v1/credits` - Get credit balance
- `POST /api/v1/credits/add` - Add credits

### Analytics

- `GET /api/v1/analytics` - Get analytics data

### Jobs

- `GET /api/v1/jobs` - List jobs
- `GET /api/v1/jobs/:jobId` - Get job details

### AI Agent

- `POST /api/v1/ai/chat` - Chat with AI agent (has access to all tools)
- `POST /api/v1/ai/chat/stream` - Stream chat with real-time updates (SSE)
- `POST /api/v1/ai/confirm` - Handle confirmation responses (accept/reject/modify)
- `GET /api/v1/ai/capabilities` - Get list of AI agent capabilities

**Features:**

- ✅ Always responds in natural language
- ✅ Real-time streaming with status updates
- ✅ Step-by-step progress tracking
- ✅ Permission confirmations
- ✅ Animated UI support

## Architecture

### Event Flow

1. **Webhook Received** → Saved to DB → Job queued
2. **Process Commit** → Fetches diff → Queues doc generation
3. **Generate Docs** → AI generates patches → Queues patch application
4. **Apply Patch** → Writes to GitHub → Queues email notification
5. **Send Email** → Sends notification email

### Queue System

The backend uses BullMQ with Redis for job processing:

- `process_commit` - Processes GitHub webhook events
- `generate_docs` - Generates documentation via AI
- `apply_patch` - Applies patches to GitHub
- `send_email` - Sends email notifications
- `recompute_coverage` - Recomputes documentation coverage

### Database Models

- **User** - User accounts with encrypted GitHub tokens
- **Repo** - Connected repositories with settings
- **WebhookEvent** - Webhook event logs
- **Job** - Job execution records
- **Credit** - User credit balances and transactions
- **Log** - Application logs (auto-expires after 90 days)
- **Analytics** - Daily analytics metrics

## Usage Guide

### 1. Authentication

Start by authenticating with GitHub:

```bash
# Redirect user to:
GET http://localhost:9000/api/v1/auth/github

# After OAuth, user is redirected to frontend with tokens
```

### 2. Connect a Repository

```bash
POST /api/v1/repos/connect
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "repoId": 123456789,
  "owner": "username",
  "name": "repo-name"
}
```

This will:

- Verify write access
- Create a webhook
- Save repository settings

### 3. Repository Settings

Configure what documentation to generate:

```bash
PATCH /api/v1/repos/:repoId/settings
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "settings": {
    "autoUpdate": true,
    "docTypes": {
      "readme": true,
      "changelog": true,
      "apiDocs": false,
      "architectureDocs": false
    },
    "branchPreference": "main",
    "emailNotifications": true
  }
}
```

### 4. Webhook Processing

When you push to your repository, GitHub sends a webhook:

1. Webhook is validated and saved
2. Commit is processed
3. Documentation is generated via AI
4. Patches are applied to GitHub
5. Email notification is sent

### 5. Monitor Jobs

Check job status:

```bash
GET /api/v1/jobs?repoId=<repoId>&status=processing
Authorization: Bearer <access_token>
```

### 6. Credits

Check your credit balance:

```bash
GET /api/v1/credits
Authorization: Bearer <access_token>
```

Add credits:

```bash
POST /api/v1/credits/add
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "amount": 1000
}
```

## Credits System

Every operation costs credits:

- Base cost: 10 credits
- Repo size multiplier: 1 credit per 1000 lines
- Files touched: 2 credits per file
- AI tokens: 1 credit per 1000 tokens

Free tier starts with 1000 credits and resets monthly.

## Error Handling

The system includes comprehensive error handling:

- **Token expired** → Job fails → User notified
- **Write access denied** → Falls back to PR creation
- **Unsafe patch** → Blocked → PR created instead
- **Queue failure** → Dead-letter queue → Alert logged
- **Rate limit hit** → Exponential backoff → Retry

## Security

- GitHub tokens encrypted with AES-256
- Webhook signature validation (HMAC SHA256)
- JWT-based authentication
- Rate limiting ready
- Input validation
- Logs auto-purge after 90 days

## Development

### Project Structure

```
docr-api/
├── src/
│   ├── config/          # Configuration
│   ├── controllers/     # Request handlers
│   ├── lib/            # Core libraries (DB, Redis, Queue)
│   ├── middleware/     # Express middleware
│   ├── models/         # MongoDB models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Utilities
│   └── workers/        # BullMQ workers
├── index.ts            # Server entry point
└── package.json
```

### Running in Development

```bash
pnpm dev  # Uses tsx watch mode
```

### Building for Production

```bash
pnpm build  # Compiles TypeScript
pnpm start  # Runs compiled code
```

## Monitoring

### Logs

Logs are stored in:

- `logs/error.log` - Error logs
- `logs/combined.log` - All logs

Also stored in MongoDB (`Log` model) with 90-day TTL.

### Analytics

Daily metrics tracked:

- Repos connected
- Docs generated
- Credits used
- Success/failure rates
- Webhooks received
- Patches applied
- PRs created

## Troubleshooting

### Webhooks not working

1. Check webhook URL is accessible
2. Verify webhook secret matches
3. Check repository is connected and active
4. Verify auto-update is enabled

### Jobs stuck in queue

1. Check Redis connection
2. Verify workers are running
3. Check job logs in MongoDB
4. Review error messages

### AI generation failing

1. Verify OpenAI API key is valid
2. Check credit balance
3. Review input size limits
4. Check API rate limits

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong secrets for JWT and encryption
3. Configure proper CORS origins
4. Set up MongoDB replica set
5. Use Redis cluster for high availability
6. Configure webhook URL to production domain
7. Set up monitoring and alerts
8. Configure log aggregation

## License

ISC
#   d o c r - a p i  
 