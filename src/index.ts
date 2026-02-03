import {
  defineAgent,
  type JobContext,
  type JobProcess,
  WorkerOptions,
  cli,
  voice,
} from '@livekit/agents';
import * as silero from '@livekit/agents-plugin-silero';
import * as livekit from '@livekit/agents-plugin-livekit';
import { BackgroundVoiceCancellation } from '@livekit/noise-cancellation-node';
import { fileURLToPath } from 'node:url';
import { InterviewAgent } from './agent/interview-agent.js';
import { parseAgentConfig } from './agent/config-parser.js';
import { sendFarewell } from './features/farewell/index.js';
import './config/env.js';

export default defineAgent({
  prewarm: async (proc: JobProcess) => {
    proc.userData.vad = await silero.VAD.load();
  },

  entry: async (ctx: JobContext) => {
    const vad = ctx.proc.userData.vad as silero.VAD;
    const config = parseAgentConfig(ctx.job.metadata);
    const agent = new InterviewAgent(config);

    const session = new voice.AgentSession({
      vad,
      stt: config.stt,
      llm: config.llm,
      tts: config.voice,
      turnDetection: new livekit.turnDetector.MultilingualModel(),
      voiceOptions: {
        preemptiveGeneration: true,
        allowInterruptions: true,
      },
    });

    // Set the context for agent tools (needed for end_call)
    agent.setContext(session, ctx.room);

    // Handle unexpected participant disconnect
    ctx.room.on('participantDisconnected', async (participant) => {
      if (participant.identity !== ctx.room.localParticipant?.identity) {
        await sendFarewell(session, agent.farewell);
      }
    });

    await ctx.connect();

    // Start session - greeting is sent via agent's onEnter lifecycle hook
    await session.start({
      agent,
      room: ctx.room,
      inputOptions: {
        noiseCancellation: BackgroundVoiceCancellation(),
      },
    });
  },
});

cli.runApp(
  new WorkerOptions({
    agent: fileURLToPath(import.meta.url),
    agentName: 'interview-agent',
  })
);
