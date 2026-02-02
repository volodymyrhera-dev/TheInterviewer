# APEX Implementation State: System Prompts Management

## Feature Summary
Управління системними промптами: збереження у MD файлах, CRUD операції через API, вибір зі списку у UI.

---

## Implementation Status: COMPLETE

### Files Created/Modified

| File | Action | Description |
|------|--------|-------------|
| `prompts/` | CREATE | Directory for MD prompt files |
| `prompts/interview-carol.md` | CREATE | Migrated from JSON |
| `prompts/support-agent.md` | CREATE | Migrated from JSON |
| `src/lib/prompt-parser.ts` | CREATE | Parse/serialize MD with frontmatter |
| `src/server/prompt-routes.ts` | CREATE | CRUD API endpoints |
| `src/server/token-server.ts` | MODIFY | Mount prompt routes |
| `frontend/index.html` | MODIFY | Dynamic dropdown + save/delete UI |

### Dependencies Added
- `gray-matter` - Parse YAML frontmatter from MD files

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/prompts` | List all prompts (id, name, description) |
| GET | `/api/prompts/:id` | Get full prompt by ID |
| POST | `/api/prompts` | Create new prompt |
| PUT | `/api/prompts/:id` | Update existing prompt |
| DELETE | `/api/prompts/:id` | Delete prompt |

---

## Prompt File Format

```markdown
---
name: "Prompt Name"
description: "Optional description"
greeting: "Hello message"
farewell: "Goodbye message"
voice: "cartesia/sonic-3:..."
llm: "openai/gpt-4.1-mini"
stt: "assemblyai/universal-streaming:en"
---

# System Prompt Content

Your system prompt markdown content here...
```

---

## UI Features

1. **Dropdown** - Select from saved prompts or "Custom Configuration"
2. **Save Prompt** - Opens modal to save current config as new/update existing
3. **Delete Prompt** - Delete selected prompt with confirmation
4. **Advanced Settings** - Toggle to show/hide voice, llm, stt fields

---

## How to Test

1. Start the server:
   ```bash
   npm run dev:server
   ```

2. Start the frontend:
   ```bash
   npm run dev:frontend
   ```

3. Open http://localhost:3000

4. Test features:
   - Select a prompt from dropdown → fields populate
   - Modify fields → click "Save Prompt" → enter name → save
   - Select saved prompt → click "Delete Prompt" → confirm

---

## Migration Notes

- Existing JSON scenarios in `scenarios/` folder are preserved
- New MD prompts are stored in `prompts/` folder
- Frontend now loads prompts from API instead of hardcoded values
