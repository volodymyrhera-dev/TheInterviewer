import { Router, type Request, type Response } from 'express';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  parsePromptFile,
  serializePromptFile,
  slugify,
  type PromptFile,
  type PromptListItem,
} from '../lib/prompt-parser.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROMPTS_DIR = path.resolve(__dirname, '../../prompts');

const router = Router();

async function ensurePromptsDir(): Promise<void> {
  try {
    await fs.access(PROMPTS_DIR);
  } catch {
    await fs.mkdir(PROMPTS_DIR, { recursive: true });
  }
}

async function getPromptFiles(): Promise<string[]> {
  await ensurePromptsDir();
  const files = await fs.readdir(PROMPTS_DIR);
  return files.filter((f) => f.endsWith('.md'));
}

// GET /api/prompts - List all prompts
router.get('/', async (_req: Request, res: Response) => {
  try {
    const files = await getPromptFiles();
    const prompts: PromptListItem[] = [];

    for (const file of files) {
      const id = file.replace('.md', '');
      const content = await fs.readFile(path.join(PROMPTS_DIR, file), 'utf-8');
      try {
        const prompt = parsePromptFile(id, content);
        prompts.push({
          id: prompt.id,
          name: prompt.name,
          description: prompt.description,
        });
      } catch (error) {
        console.warn(`Failed to parse prompt ${file}:`, error);
      }
    }

    res.json(prompts);
  } catch (error) {
    console.error('Error listing prompts:', error);
    res.status(500).json({ error: 'Failed to list prompts' });
  }
});

// GET /api/prompts/:id - Get single prompt
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const filePath = path.join(PROMPTS_DIR, `${id}.md`);

    try {
      await fs.access(filePath);
    } catch {
      res.status(404).json({ error: 'Prompt not found' });
      return;
    }

    const content = await fs.readFile(filePath, 'utf-8');
    const prompt = parsePromptFile(id, content);
    res.json(prompt);
  } catch (error) {
    console.error('Error getting prompt:', error);
    res.status(500).json({ error: 'Failed to get prompt' });
  }
});

// POST /api/prompts - Create new prompt
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description, systemPrompt, greeting, farewell, voice, llm, stt } = req.body;

    if (!name || !systemPrompt || !greeting || !farewell) {
      res.status(400).json({ error: 'name, systemPrompt, greeting, and farewell are required' });
      return;
    }

    await ensurePromptsDir();

    const id = slugify(name);
    const filePath = path.join(PROMPTS_DIR, `${id}.md`);

    // Check if file already exists
    try {
      await fs.access(filePath);
      res.status(409).json({ error: 'Prompt with this name already exists' });
      return;
    } catch {
      // File doesn't exist, we can create it
    }

    const content = serializePromptFile({
      name,
      description,
      systemPrompt,
      greeting,
      farewell,
      voice: voice || 'cartesia/sonic-3:9626c31c-bec5-4cca-baa8-f8ba9e84c8bc',
      llm: llm || 'openai/gpt-4.1-mini',
      stt: stt || 'assemblyai/universal-streaming:en',
    });

    await fs.writeFile(filePath, content, 'utf-8');

    const prompt = parsePromptFile(id, content);
    res.status(201).json(prompt);
  } catch (error) {
    console.error('Error creating prompt:', error);
    res.status(500).json({ error: 'Failed to create prompt' });
  }
});

// PUT /api/prompts/:id - Update prompt
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, systemPrompt, greeting, farewell, voice, llm, stt } = req.body;

    if (!name || !systemPrompt || !greeting || !farewell) {
      res.status(400).json({ error: 'name, systemPrompt, greeting, and farewell are required' });
      return;
    }

    const filePath = path.join(PROMPTS_DIR, `${id}.md`);

    try {
      await fs.access(filePath);
    } catch {
      res.status(404).json({ error: 'Prompt not found' });
      return;
    }

    const content = serializePromptFile({
      name,
      description,
      systemPrompt,
      greeting,
      farewell,
      voice: voice || 'cartesia/sonic-3:9626c31c-bec5-4cca-baa8-f8ba9e84c8bc',
      llm: llm || 'openai/gpt-4.1-mini',
      stt: stt || 'assemblyai/universal-streaming:en',
    });

    await fs.writeFile(filePath, content, 'utf-8');

    const prompt = parsePromptFile(id, content);
    res.json(prompt);
  } catch (error) {
    console.error('Error updating prompt:', error);
    res.status(500).json({ error: 'Failed to update prompt' });
  }
});

// DELETE /api/prompts/:id - Delete prompt
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const filePath = path.join(PROMPTS_DIR, `${id}.md`);

    try {
      await fs.access(filePath);
    } catch {
      res.status(404).json({ error: 'Prompt not found' });
      return;
    }

    await fs.unlink(filePath);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting prompt:', error);
    res.status(500).json({ error: 'Failed to delete prompt' });
  }
});

export default router;
