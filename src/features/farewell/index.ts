import { llm, type voice } from '@livekit/agents';
import type { Room } from '@livekit/rtc-node';
import { RoomServiceClient } from 'livekit-server-sdk';
import { z } from 'zod';
import { env } from '../../config/env.js';

export interface FarewellContext {
  session: voice.AgentSession;
  room: Room;
  farewellMessage: string;
}

// Create RoomService client for server-side room management
const roomService = new RoomServiceClient(
  env.LIVEKIT_URL,
  env.LIVEKIT_API_KEY,
  env.LIVEKIT_API_SECRET
);

/**
 * Creates the end_call tool that allows the agent to terminate the call.
 * The tool says the farewell message and waits for playout before disconnecting.
 */
export function createEndCallTool(getContext: () => FarewellContext) {
  return {
    end_call: llm.tool({
      description: `End the call and terminate the session. The system will automatically say a farewell message.

Use this tool in these situations:
1. When the user wants to end the conversation (says "goodbye", "bye", "I have to go", etc.)
2. After completing all interview questions
3. After informing a wrong person that records will be updated
4. After apologizing to a hostile/refusing user
5. After scheduling a follow-up call

Do NOT say goodbye yourself - the system will handle the farewell message automatically.`,
      parameters: z.object({
        reason: z.string().optional().describe('Brief reason for ending the call'),
      }),
      execute: async ({ reason }) => {
        const context = getContext();
        const roomName = context.room.name;
        console.log('[Farewell] end_call tool invoked, reason:', reason || 'user requested');

        // Say farewell message using session.say() and wait for playout
        try {
          console.log('[Farewell] Saying farewell message:', context.farewellMessage);
          const speechHandle = context.session.say(context.farewellMessage, {
            allowInterruptions: false,
          });
          await speechHandle.waitForPlayout();
          console.log('[Farewell] Farewell playout completed');
        } catch (error) {
          console.error('[Farewell] Error during farewell speech:', error);
          // Fallback delay if say() fails
          await new Promise(resolve => setTimeout(resolve, 3000));
        }

        // Delete the room via server API - this cleanly disconnects all participants
        if (roomName) {
          try {
            console.log('[Farewell] Deleting room:', roomName);
            await roomService.deleteRoom(roomName);
            console.log('[Farewell] Room deleted successfully');
          } catch (error) {
            console.error('[Farewell] Error deleting room:', error);
            // Fallback to local disconnect
            context.room.disconnect();
          }
        } else {
          console.log('[Farewell] No room name, disconnecting locally');
          context.room.disconnect();
        }

        return 'Call ended successfully.';
      },
    }),
  };
}

/**
 * Sends farewell message when participant disconnects unexpectedly.
 */
export async function sendFarewell(
  session: voice.AgentSession,
  message: string
): Promise<void> {
  console.log('[Farewell] Sending farewell message:', message);

  try {
    const speechHandle = session.say(message, { allowInterruptions: false });
    await speechHandle.waitForPlayout();
    console.log('[Farewell] Farewell playout completed');
  } catch (error) {
    console.error('[Farewell] Error sending farewell:', error);
  }
}
