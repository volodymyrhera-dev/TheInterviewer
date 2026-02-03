import { voice } from '@livekit/agents';
import type { Room } from '@livekit/rtc-node';
import type { AgentConfig } from '../config/types.js';
import { createEndCallTool, type FarewellContext } from '../features/farewell/index.js';

interface InterviewAgentContext {
  session?: voice.AgentSession;
  room?: Room;
}

export class InterviewAgent extends voice.Agent {
  readonly greeting: string;
  readonly farewell: string;
  private context: InterviewAgentContext = {};

  constructor(config: AgentConfig) {
    // Create tools with a getter that accesses the context
    const tools = createEndCallTool(() => ({
      session: this.context.session!,
      room: this.context.room!,
      farewellMessage: this.farewell,
    }));

    super({
      instructions: config.systemPrompt,
      tools,
    });

    this.greeting = config.greeting;
    this.farewell = config.farewell;
  }

  /**
   * Sets the session and room context for the agent tools.
   * This must be called after the session is created.
   */
  setContext(session: voice.AgentSession, room: Room): void {
    this.context.session = session;
    this.context.room = room;
    console.log('[Agent] Context set with session and room');
  }

  /**
   * Lifecycle hook: Called when agent becomes active in session.
   * Sends greeting message immediately when agent enters.
   */
  override async onEnter(): Promise<void> {
    console.log('[Agent] onEnter - sending greeting:', this.greeting);
    // Allow interruptions so user can respond immediately without waiting
    // for full greeting to complete - reduces perceived latency
    this.session.say(this.greeting, { allowInterruptions: true });
  }
}
