import matter from 'gray-matter';
import { z } from 'zod';

export const PromptFrontmatterSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  greeting: z.string().min(1),
  farewell: z.string().min(1),
  voice: z.string().default('cartesia/sonic-3:9626c31c-bec5-4cca-baa8-f8ba9e84c8bc'),
  llm: z.string().default('openai/gpt-4.1-mini'),
  stt: z.string().default('assemblyai/universal-streaming:en'),
});

export type PromptFrontmatter = z.infer<typeof PromptFrontmatterSchema>;

export interface PromptFile {
  id: string;
  name: string;
  description?: string;
  systemPrompt: string;
  greeting: string;
  farewell: string;
  voice: string;
  llm: string;
  stt: string;
}

export interface PromptListItem {
  id: string;
  name: string;
  description?: string;
}

export function parsePromptFile(id: string, content: string): PromptFile {
  const { data, content: markdownContent } = matter(content);
  const frontmatter = PromptFrontmatterSchema.parse(data);

  return {
    id,
    name: frontmatter.name,
    description: frontmatter.description,
    systemPrompt: markdownContent.trim(),
    greeting: frontmatter.greeting,
    farewell: frontmatter.farewell,
    voice: frontmatter.voice,
    llm: frontmatter.llm,
    stt: frontmatter.stt,
  };
}

export function serializePromptFile(prompt: Omit<PromptFile, 'id'>): string {
  const frontmatter: PromptFrontmatter = {
    name: prompt.name,
    description: prompt.description,
    greeting: prompt.greeting,
    farewell: prompt.farewell,
    voice: prompt.voice,
    llm: prompt.llm,
    stt: prompt.stt,
  };

  // Remove undefined values
  const cleanFrontmatter = Object.fromEntries(
    Object.entries(frontmatter).filter(([_, v]) => v !== undefined)
  );

  return matter.stringify(prompt.systemPrompt, cleanFrontmatter);
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
