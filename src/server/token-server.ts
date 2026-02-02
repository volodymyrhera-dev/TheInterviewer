import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { AccessToken, VideoGrant, RoomServiceClient, AgentDispatchClient } from 'livekit-server-sdk';
import { env } from '../config/env.js';
import { AgentConfigSchema, type AgentConfig } from '../config/types.js';
import promptRoutes from './prompt-routes.js';

const app = express();
app.use(cors());
app.use(express.json());

// Mount prompt routes
app.use('/api/prompts', promptRoutes);

const roomService = new RoomServiceClient(env.LIVEKIT_URL, env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET);
const agentDispatch = new AgentDispatchClient(env.LIVEKIT_URL, env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET);

interface TokenRequest {
  roomName: string;
  participantName: string;
  agentConfig?: Partial<AgentConfig>;
}

app.post('/api/token', async (req: Request, res: Response) => {
  try {
    const { roomName, participantName, agentConfig } = req.body as TokenRequest;

    if (!roomName || !participantName) {
      res.status(400).json({ error: 'roomName and participantName required' });
      return;
    }

    const config = agentConfig
      ? AgentConfigSchema.parse({
          systemPrompt: agentConfig.systemPrompt ?? 'You are a helpful assistant.',
          greeting: agentConfig.greeting ?? 'Hello!',
          farewell: agentConfig.farewell ?? 'Goodbye!',
          voice: agentConfig.voice,
          llm: agentConfig.llm,
          stt: agentConfig.stt,
        })
      : null;

    const at = new AccessToken(env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET, {
      identity: participantName,
    });

    const grant: VideoGrant = {
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    };

    at.addGrant(grant);

    const token = await at.toJwt();

    await roomService.createRoom({ name: roomName });

    if (config) {
      console.log('[Dispatch] Creating dispatch with config:', JSON.stringify(config));
      const dispatch = await agentDispatch.createDispatch(roomName, 'interview-agent', {
        metadata: JSON.stringify(config),
      });
      console.log('[Dispatch] Result:', dispatch);
    } else {
      console.log('[Dispatch] No config provided, skipping explicit dispatch');
    }

    res.json({
      token,
      url: env.LIVEKIT_URL,
    });
  } catch (error) {
    console.error('Token generation error:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.listen(env.PORT, () => {
  console.log(`Token server running on port ${env.PORT}`);
});
