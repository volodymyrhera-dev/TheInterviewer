import type { voice } from '@livekit/agents';

export interface GreetingOptions {
  message: string;
  allowInterruptions?: boolean;
}

/**
 * Handles the initial greeting when a session starts.
 * The greeting is non-interruptible by default to ensure the user hears it completely.
 */
export async function sendGreeting(
  session: voice.AgentSession,
  options: GreetingOptions
): Promise<void> {
  const { message, allowInterruptions = false } = options;

  console.log('[Greeting] Sending greeting message:', message);

  await session.say(message, { allowInterruptions });

  console.log('[Greeting] Greeting completed');
}
