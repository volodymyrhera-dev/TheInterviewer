import { AgentConfigSchema, type AgentConfig } from '../config/types.js';

const DEFAULT_CONFIG: AgentConfig = {
  systemPrompt: 'You are a helpful voice assistant.',
  greeting: 'Hello! How can I help you today?',
  farewell: 'Goodbye! Have a great day!',
  voice: 'cartesia/sonic-3:9626c31c-bec5-4cca-baa8-f8ba9e84c8bc',
  llm: 'openai/gpt-4.1-mini',
  stt: 'assemblyai/universal-streaming:en',
};

export function parseAgentConfig(metadata: string | undefined): AgentConfig {
  console.log('[Config] Raw metadata:', metadata);

  if (!metadata) {
    console.log('[Config] No metadata, using defaults');
    return DEFAULT_CONFIG;
  }

  try {
    const parsed = JSON.parse(metadata);
    console.log('[Config] Parsed config:', parsed);
    const config = AgentConfigSchema.parse({
      ...DEFAULT_CONFIG,
      ...parsed,
    });
    console.log('[Config] Final config greeting:', config.greeting);
    return config;
  } catch (error) {
    console.warn('[Config] Invalid agent config in metadata, using defaults:', error);
    return DEFAULT_CONFIG;
  }
}
