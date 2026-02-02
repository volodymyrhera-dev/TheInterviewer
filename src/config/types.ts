import { z } from 'zod';

export const AgentConfigSchema = z.object({
  systemPrompt: z.string().min(1),
  greeting: z.string().min(1),
  farewell: z.string().min(1),
  voice: z.string().default('cartesia/sonic-3:9626c31c-bec5-4cca-baa8-f8ba9e84c8bc'),
  llm: z.string().default('openai/gpt-4.1-mini'),
  stt: z.string().default('assemblyai/universal-streaming:en'),
});

export type AgentConfig = z.infer<typeof AgentConfigSchema>;

export const ScenarioSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  config: AgentConfigSchema,
});

export type Scenario = z.infer<typeof ScenarioSchema>;

export interface SessionContext {
  roomName: string;
  participantIdentity: string;
  scenario: Scenario;
}
