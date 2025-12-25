# Docr AI Agent - Complete Guide

## Overview

The Docr AI Agent is an intelligent assistant that has **full access to all app capabilities** and can perform any action a user can do. It's similar to Axle's AI system - a powerful agent that can:

- Manage repositories
- Access GitHub API for urgent requests
- Trigger documentation generation
- Manage credits
- View analytics
- Monitor jobs
- And much more!

## Features

### 🎯 Full App Access
The AI agent can execute any user action through function calling:
- Repository management (connect, disconnect, configure)
- GitHub operations (read/write files, create PRs, view commits)
- Documentation generation
- Credits management
- Analytics viewing
- Job monitoring

### 🚀 Urgent GitHub Requests
The agent has direct GitHub API access for urgent requests:
- Update files immediately
- Create pull requests
- View commits and diffs
- Access any GitHub resource

### 🤖 Intelligent Decision Making
The agent uses OpenAI's function calling to:
- Understand user intent
- Choose appropriate tools
- Execute actions automatically
- Provide clear explanations

## API Endpoints

### Chat with AI Agent

```bash
POST /api/v1/ai/chat
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "message": "Your request here",
  "context": {} // Optional context
}
```

**Response:**
```json
{
  "message": "AI's response explaining what it did",
  "actions": [
    {
      "type": "get_credit_balance",
      "description": "Executed get_credit_balance",
      "result": {
        "balance": 1000,
        "isBelowThreshold": false
      }
    }
  ],
  "data": {} // Optional additional data
}
```

### Get Capabilities

```bash
GET /api/v1/ai/capabilities
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "capabilities": {
    "repositoryManagement": [
      "List connected repositories",
      "Get repository details",
      "Connect new repositories",
      "Disconnect repositories",
      "Update repository settings"
    ],
    "githubOperations": [
      "Get file content",
      "Update files directly",
      "Create pull requests",
      "View commits",
      "Access GitHub API for urgent requests"
    ],
    "documentation": [
      "Trigger documentation generation",
      "Monitor generation jobs",
      "View documentation history"
    ],
    "credits": [
      "Check credit balance",
      "Add credits",
      "View transaction history"
    ],
    "analytics": [
      "View usage statistics",
      "Get success rates",
      "View metrics over time"
    ],
    "jobs": [
      "Monitor job status",
      "Get job details",
      "View job history"
    ]
  }
}
```

## Available Tools

### Repository Management

#### 1. List Repositories
```json
{
  "message": "Show me all my connected repositories"
}
```

#### 2. Get Repository Details
```json
{
  "message": "Get details for repository abc123"
}
```

#### 3. Connect Repository
```json
{
  "message": "Connect the repository username/my-repo"
}
```

#### 4. Disconnect Repository
```json
{
  "message": "Disconnect repository abc123"
}
```

#### 5. Update Settings
```json
{
  "message": "Enable changelog generation for repository abc123"
}
```

### GitHub Operations (Urgent Requests)

#### 1. Get File Content
```json
{
  "message": "Get the content of README.md from username/my-repo"
}
```

#### 2. Update File
```json
{
  "message": "Update README.md in username/my-repo with: '# My Project\n\nUpdated content'"
}
```

#### 3. Create Pull Request
```json
{
  "message": "Create a PR from feature-branch to main in username/my-repo with title 'New Feature'"
}
```

#### 4. View Commits
```json
{
  "message": "Show me recent commits from username/my-repo"
}
```

### Documentation

#### Trigger Generation
```json
{
  "message": "Generate documentation for my latest commit in repository abc123"
}
```

### Credits

#### Check Balance
```json
{
  "message": "How many credits do I have?"
}
```

#### Add Credits
```json
{
  "message": "Add 5000 credits to my account"
}
```

### Analytics

#### View Analytics
```json
{
  "message": "Show me my analytics for the last 30 days"
}
```

### Jobs

#### Monitor Jobs
```json
{
  "message": "Show me all my active jobs"
}
```

#### Get Job Details
```json
{
  "message": "Get details for job abc123"
}
```

## Usage Examples

### Example 1: Quick Status Check

```bash
POST /api/v1/ai/chat
{
  "message": "Give me a quick status update: my credit balance, number of repos, and any active jobs"
}
```

**AI Response:**
```
You have 1,000 credits remaining (above the warning threshold). 
You have 3 connected repositories:
- username/repo1 (main branch)
- username/repo2 (main branch)
- username/repo3 (develop branch)

You have 2 active jobs:
- Job abc123: Processing commit (started 5 minutes ago)
- Job def456: Generating documentation (started 2 minutes ago)
```

### Example 2: Urgent File Update

```bash
POST /api/v1/ai/chat
{
  "message": "URGENT: Update the README.md in username/my-repo. Replace the entire content with: '# My Project\n\nThis is an urgent update to fix a critical issue.'"
}
```

**AI Response:**
```
I've urgently updated the README.md file in username/my-repo.

✅ File updated successfully
Commit: abc123def456
URL: https://github.com/username/my-repo/commit/abc123def456

The file has been updated directly on the main branch.
```

### Example 3: Complex Multi-Step Request

```bash
POST /api/v1/ai/chat
{
  "message": "Check my credit balance. If it's below 500, add 2000 credits. Then trigger documentation generation for my repo abc123."
}
```

**AI Response:**
```
I've completed your request:

1. ✅ Checked credit balance: 1,000 credits (above threshold)
2. ⏭️ Skipped adding credits (not needed)
3. ✅ Triggered documentation generation for repository abc123
   Job ID: xyz789
   Status: Queued for processing

The documentation generation job has been queued and will process your latest commit.
```

### Example 4: Repository Configuration

```bash
POST /api/v1/ai/chat
{
  "message": "Configure repository abc123 to generate both README and CHANGELOG, use the develop branch, and enable email notifications"
}
```

**AI Response:**
```
I've updated the settings for repository abc123:

✅ Documentation types enabled:
   - README: ✓
   - CHANGELOG: ✓
   - API Docs: ✗
   - Architecture Docs: ✗

✅ Branch preference: develop
✅ Email notifications: Enabled

Your repository is now configured to automatically generate README and CHANGELOG documentation on the develop branch.
```

## Best Practices

### 1. Be Specific
✅ Good: "Update README.md in username/my-repo with content: '# Title'"
❌ Bad: "Update the readme"

### 2. Use Natural Language
The AI understands natural language, so you can ask naturally:
- "Show me my repos"
- "How many credits do I have?"
- "Generate docs for my latest commit"

### 3. Urgent Requests
For urgent GitHub requests, be explicit:
- "URGENT: Update file..."
- "I need to immediately..."
- "Critical: Create PR..."

### 4. Multi-Step Requests
You can chain multiple requests:
- "Check my balance and if low, add credits"
- "List my repos and show details for the first one"

## Error Handling

The AI agent handles errors gracefully:

```json
{
  "message": "I encountered an error: Repository not found. Please check the repository ID and try again.",
  "actions": [
    {
      "type": "get_repository_details",
      "description": "Executed get_repository_details",
      "result": {
        "error": "Repository not found"
      }
    }
  ]
}
```

## Security

- ✅ All requests require authentication
- ✅ User can only access their own resources
- ✅ GitHub operations use user's encrypted tokens
- ✅ Actions are logged for audit
- ✅ No access to other users' data

## Limitations

1. **Model Dependency**: Uses OpenAI GPT-4 (or configured model)
2. **Rate Limits**: Subject to OpenAI API rate limits
3. **Credit Costs**: Each AI request consumes credits
4. **Context Window**: Limited by model's context window

## Troubleshooting

### AI Not Understanding Request

Try being more specific:
```json
{
  "message": "Use the tool 'list_repositories' to show all my connected repositories"
}
```

### Tool Execution Fails

Check the error in the response:
```json
{
  "actions": [
    {
      "type": "update_github_file",
      "result": {
        "error": "Write access denied"
      }
    }
  ]
}
```

### No Response

- Check authentication token
- Verify OpenAI API key is valid
- Check credit balance
- Review server logs

## Advanced Usage

### Context Passing

You can pass context for better responses:

```json
{
  "message": "Update the file I was just looking at",
  "context": {
    "lastFile": {
      "owner": "username",
      "repo": "my-repo",
      "path": "README.md"
    }
  }
}
```

### Chaining Requests

The AI can handle complex workflows:

```json
{
  "message": "Get my repo list, then for each repo check if documentation is up to date, and if not, trigger generation"
}
```

## Integration Examples

### Frontend Integration

```typescript
async function chatWithAI(message: string) {
  const response = await fetch('/api/v1/ai/chat', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });
  
  const data = await response.json();
  return data;
}

// Usage
const result = await chatWithAI('Show me my credit balance');
console.log(result.message);
result.actions?.forEach(action => {
  console.log(`Executed: ${action.type}`, action.result);
});
```

### CLI Integration

```bash
# Using curl
curl -X POST http://localhost:9000/api/v1/ai/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "List my repositories"}'
```

## Performance

- **Response Time**: Typically 2-5 seconds (depends on tool execution)
- **Concurrent Requests**: Supported (limited by OpenAI rate limits)
- **Caching**: Not implemented (each request is fresh)

## Future Enhancements

Potential improvements:
- Conversation history
- Multi-turn conversations
- Custom tool definitions
- Streaming responses
- Voice interface
- Mobile app integration

## Support

For issues or questions:
1. Check the error message in the response
2. Review server logs
3. Verify your authentication token
4. Check credit balance
5. Ensure OpenAI API key is valid

---

**The AI Agent is your intelligent assistant for Docr. Use it to automate workflows, handle urgent requests, and manage your documentation effortlessly!**

