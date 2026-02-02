import { voice } from '@livekit/agents';
import type { AgentConfig } from '../config/types.js';

export class InterviewAgent extends voice.Agent {
  readonly greeting: string;
  readonly farewell: string;

  constructor(config: AgentConfig) {
    super({ instructions: config.systemPrompt });
    this.greeting = config.greeting;
    this.farewell = config.farewell;
  }
}
