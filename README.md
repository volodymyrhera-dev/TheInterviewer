# LiveKit Interview Agent

Voice AI agent for testing different call scenarios.

## Setup

```bash
pnpm install
cp .env.example .env.local
# Edit .env.local with your credentials
```

## Running

Start all services in separate terminals:

```bash
# Terminal 1: Agent
pnpm dev:agent

# Terminal 2: Token Server
pnpm dev:server

# Terminal 3: Frontend
pnpm dev:frontend
```

Open http://localhost:3000 in browser.

## Configuration

Pass agent config via metadata when dispatching:

```json
{
  "systemPrompt": "You are...",
  "greeting": "Hello!",
  "farewell": "Goodbye!",
  "voice": "cartesia/sonic-3:...",
  "llm": "openai/gpt-4.1-mini",
  "stt": "assemblyai/universal-streaming:en"
}
```

## Scenarios

Pre-configured scenarios in `scenarios/` folder:
- `interview-carol.json` - Interview agent
- `support-agent.json` - Customer support
