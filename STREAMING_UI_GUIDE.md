# Docr AI Agent - Streaming UI Guide

## Overview

The Docr AI Agent supports real-time streaming with animated UI updates. The agent always responds in natural language and provides status updates, confirmations, and step-by-step progress.

## Streaming API

### Endpoint

```bash
POST /api/v1/ai/chat/stream
Authorization: Bearer <access_token>
Content-Type: application/json
Accept: text/event-stream
```

### Request Body

```json
{
  "message": "Your request here",
  "context": {} // Optional
}
```

### Response Format (Server-Sent Events)

The API streams events in real-time:

```
data: {"type":"status","data":{"status":"thinking","message":"Let me understand your request..."},"timestamp":1234567890}

data: {"type":"thinking","data":{"message":"Analyzing your request..."},"timestamp":1234567890}

data: {"type":"step","data":{"step":1,"description":"Fetching your repositories...","status":"in_progress","totalSteps":3},"timestamp":1234567890}

data: {"type":"confirmation","data":{"type":"permission","message":"Are you sure?","tool":"update_github_file","args":{...},"step":2},"timestamp":1234567890}

data: {"type":"action","data":{"type":"list_repositories","status":"completed","description":"Fetched repositories","result":{...}},"timestamp":1234567890}

data: {"type":"message","data":{"message":"I've completed your request. Here's what I did..."},"timestamp":1234567890}

data: {"type":"result","data":{"message":"...","actions":[...],"steps":[...]},"timestamp":1234567890}

data: {"type":"done","data":{"message":"Stream completed"},"timestamp":1234567890}
```

## Event Types

### 1. `status` - Overall Status Updates

```json
{
  "type": "status",
  "data": {
    "status": "thinking" | "executing" | "asking" | "completed" | "error",
    "message": "Human-readable status message"
  },
  "timestamp": 1234567890
}
```

**Status Values:**
- `thinking` - AI is analyzing the request
- `executing` - AI is performing actions
- `asking` - AI is waiting for user confirmation
- `completed` - All actions completed
- `error` - An error occurred

### 2. `thinking` - AI Thought Process

```json
{
  "type": "thinking",
  "data": {
    "message": "I'm analyzing your request and determining the best approach..."
  },
  "timestamp": 1234567890
}
```

### 3. `step` - Step-by-Step Progress

```json
{
  "type": "step",
  "data": {
    "step": 1,
    "description": "Fetching your repositories...",
    "status": "pending" | "in_progress" | "completed" | "failed",
    "totalSteps": 3
  },
  "timestamp": 1234567890
}
```

### 4. `confirmation` - Permission Requests

```json
{
  "type": "confirmation",
  "data": {
    "type": "permission" | "choice" | "input",
    "message": "Are you sure you want to update this file?",
    "tool": "update_github_file",
    "args": {
      "owner": "username",
      "repo": "my-repo",
      "path": "README.md"
    },
    "step": 2
  },
  "timestamp": 1234567890
}
```

**Confirmation Types:**
- `permission` - Yes/No confirmation
- `choice` - Multiple choice selection
- `input` - Text input required

### 5. `action` - Tool Execution Updates

```json
{
  "type": "action",
  "data": {
    "type": "list_repositories",
    "status": "executing" | "completed" | "failed",
    "description": "Fetching your repositories...",
    "result": {} // Only present when completed
  },
  "timestamp": 1234567890
}
```

### 6. `message` - AI Natural Language Response

```json
{
  "type": "message",
  "data": {
    "message": "I've successfully fetched your repositories. You have 3 connected repos..."
  },
  "timestamp": 1234567890
}
```

### 7. `result` - Final Summary

```json
{
  "type": "result",
  "data": {
    "message": "Complete natural language summary",
    "actions": [
      {
        "type": "list_repositories",
        "description": "Fetched repositories",
        "status": "completed",
        "result": {}
      }
    ],
    "steps": [
      {
        "step": 1,
        "description": "Fetch repositories",
        "status": "completed"
      }
    ]
  },
  "timestamp": 1234567890
}
```

### 8. `error` - Error Events

```json
{
  "type": "error",
  "data": {
    "message": "I encountered an error: Repository not found",
    "error": "Repository not found"
  },
  "timestamp": 1234567890
}
```

### 9. `done` - Stream Completion

```json
{
  "type": "done",
  "data": {
    "message": "Stream completed"
  },
  "timestamp": 1234567890
}
```

## Handling Confirmations

When the AI needs confirmation, send a response:

```bash
POST /api/v1/ai/confirm
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "confirmationId": "conf_123",
  "action": "accept" | "reject" | "modify",
  "tool": "update_github_file",
  "args": {}, // Original args
  "modifiedArgs": {} // If action is "modify"
}
```

## Frontend Implementation

### React Example

```typescript
import { useState, useEffect } from 'react';

interface StreamEvent {
  type: string;
  data: any;
  timestamp: number;
}

export function useAIStream() {
  const [status, setStatus] = useState<string>('idle');
  const [message, setMessage] = useState<string>('');
  const [steps, setSteps] = useState<any[]>([]);
  const [confirmation, setConfirmation] = useState<any>(null);
  const [actions, setActions] = useState<any[]>([]);

  const sendMessage = async (message: string) => {
    setStatus('connecting');
    
    const response = await fetch('/api/v1/ai/chat/stream', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify({ message }),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) return;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const event: StreamEvent = JSON.parse(line.substring(6));
          handleEvent(event);
        }
      }
    }
  };

  const handleEvent = (event: StreamEvent) => {
    switch (event.type) {
      case 'status':
        setStatus(event.data.status);
        break;
      
      case 'thinking':
        // Show thinking indicator
        break;
      
      case 'step':
        setSteps(prev => {
          const updated = [...prev];
          const index = updated.findIndex(s => s.step === event.data.step);
          if (index >= 0) {
            updated[index] = event.data;
          } else {
            updated.push(event.data);
          }
          return updated;
        });
        break;
      
      case 'confirmation':
        setConfirmation(event.data);
        setStatus('asking');
        break;
      
      case 'action':
        setActions(prev => {
          const updated = [...prev];
          const index = updated.findIndex(a => a.type === event.data.type);
          if (index >= 0) {
            updated[index] = event.data;
          } else {
            updated.push(event.data);
          }
          return updated;
        });
        break;
      
      case 'message':
        setMessage(event.data.message);
        break;
      
      case 'result':
        setMessage(event.data.message);
        setActions(event.data.actions || []);
        setSteps(event.data.steps || []);
        setStatus('completed');
        break;
      
      case 'error':
        setStatus('error');
        setMessage(event.data.message);
        break;
      
      case 'done':
        setStatus('completed');
        break;
    }
  };

  return {
    status,
    message,
    steps,
    confirmation,
    actions,
    sendMessage,
  };
}
```

### UI Component Example

```tsx
function AIAgentChat() {
  const { status, message, steps, confirmation, actions, sendMessage } = useAIStream();
  const [input, setInput] = useState('');

  const handleConfirm = async (action: 'accept' | 'reject' | 'modify', modifiedArgs?: any) => {
    await fetch('/api/v1/ai/confirm', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        confirmationId: confirmation.id,
        action,
        tool: confirmation.tool,
        args: confirmation.args,
        modifiedArgs,
      }),
    });
  };

  return (
    <div className="ai-chat">
      {/* Status Indicator */}
      <div className={`status status-${status}`}>
        {status === 'thinking' && <Spinner />}
        {status === 'executing' && <ProgressBar />}
        {status === 'asking' && <QuestionMark />}
        {status === 'completed' && <Checkmark />}
      </div>

      {/* Steps Progress */}
      {steps.length > 0 && (
        <div className="steps">
          {steps.map(step => (
            <div key={step.step} className={`step step-${step.status}`}>
              <span className="step-number">{step.step}</span>
              <span className="step-description">{step.description}</span>
              {step.status === 'in_progress' && <Spinner size="small" />}
              {step.status === 'completed' && <Checkmark size="small" />}
              {step.status === 'failed' && <ErrorIcon size="small" />}
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmation && (
        <div className="confirmation-dialog">
          <p>{confirmation.message}</p>
          <div className="confirmation-actions">
            <button onClick={() => handleConfirm('accept')}>Accept</button>
            <button onClick={() => handleConfirm('reject')}>Reject</button>
            <button onClick={() => handleConfirm('modify', {})}>Modify</button>
          </div>
        </div>
      )}

      {/* AI Message */}
      {message && (
        <div className="ai-message">
          <p>{message}</p>
        </div>
      )}

      {/* Actions List */}
      {actions.length > 0 && (
        <div className="actions">
          {actions.map((action, i) => (
            <div key={i} className={`action action-${action.status}`}>
              <span>{action.description}</span>
              {action.status === 'executing' && <Spinner />}
              {action.status === 'completed' && <Checkmark />}
              {action.status === 'failed' && <ErrorIcon />}
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              sendMessage(input);
              setInput('');
            }
          }}
          placeholder="Ask the AI agent..."
        />
        <button onClick={() => {
          sendMessage(input);
          setInput('');
        }}>
          Send
        </button>
      </div>
    </div>
  );
}
```

## CSS Animations

```css
/* Status animations */
.status-thinking {
  animation: pulse 1.5s ease-in-out infinite;
}

.status-executing {
  animation: spin 1s linear infinite;
}

.step-in_progress {
  animation: slideIn 0.3s ease-out;
}

.action-executing {
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Step progress bar */
.steps {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.step {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: var(--bg-secondary);
  transition: all 0.3s ease;
}

.step-in_progress {
  background: var(--bg-accent);
  border-left: 3px solid var(--color-primary);
}

.step-completed {
  background: var(--bg-success);
  border-left: 3px solid var(--color-success);
}

.step-failed {
  background: var(--bg-error);
  border-left: 3px solid var(--color-error);
}
```

## Natural Language Responses

The AI always responds in natural, conversational language:

**Examples:**

- ✅ "I've successfully fetched your repositories. You have 3 connected repos: username/repo1, username/repo2, and username/repo3."

- ✅ "I'm about to update the README.md file in your repository. This will create a new commit. Would you like me to proceed?"

- ✅ "I encountered an error while trying to connect the repository. It seems you don't have write access. Would you like me to try a different approach?"

- ✅ "Great! I've updated the file and created commit abc123. You can view it here: [link]. Is there anything else you'd like me to do?"

## Best Practices

1. **Show Status Indicators**: Always display the current status (thinking, executing, etc.)

2. **Animate Progress**: Use smooth animations for step updates and action status changes

3. **Handle Confirmations**: Show confirmation dialogs prominently with clear Accept/Reject/Modify options

4. **Display Steps**: Show a progress list of all steps being executed

5. **Natural Language**: Always display the AI's natural language responses

6. **Error Handling**: Show errors clearly with suggestions for next steps

7. **Streaming UX**: Use loading states, spinners, and progress indicators

## Example Flow

1. User sends: "Update my README"
2. UI shows: "Thinking..." (animated spinner)
3. AI streams: `status: thinking`
4. UI shows: "I'll help you update your README. Let me first check which repository you'd like to update..."
5. AI streams: `confirmation: permission` (if multiple repos)
6. UI shows: Confirmation dialog with repo selection
7. User accepts
8. AI streams: `step: 1, status: in_progress` - "Reading current README..."
9. UI shows: Step 1 with animated progress
10. AI streams: `action: completed` - "Successfully read README"
11. AI streams: `step: 2, status: in_progress` - "Updating README..."
12. UI shows: Step 2 with animated progress
13. AI streams: `message: "I've updated your README! Commit: abc123"`
14. UI shows: Final message with success indicator

This creates a smooth, animated, real-time experience!

