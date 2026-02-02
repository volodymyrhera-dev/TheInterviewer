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
      preemptiveGeneration: true,
      allowInterruptions: true,
    });

    ctx.room.on('participantDisconnected', async (participant) => {
      if (participant.identity !== ctx.room.localParticipant?.identity) {
        await session.say(agent.farewell);
      }
    });

    await session.start({
      agent,
      room: ctx.room,
      inputOptions: {
        noiseCancellation: BackgroundVoiceCancellation(),
      },
    });

    await ctx.connect();

    await session.say(agent.greeting, { allowInterruptions: false });
  },
});

cli.runApp(
  new WorkerOptions({
    agent: fileURLToPath(import.meta.url),
    agentName: 'interview-agent',
  })
);
