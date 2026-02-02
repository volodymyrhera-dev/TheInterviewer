import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const EnvSchema = z.object({
  LIVEKIT_API_KEY: z.string().min(1),
  LIVEKIT_API_SECRET: z.string().min(1),
  LIVEKIT_URL: z.string().url(),
  OPENAI_API_KEY: z.string().min(1),
  PORT: z.coerce.number().default(3001),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Environment validation failed:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
