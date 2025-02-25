import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { settings } from '@/db/schema';

const SYSTEM_MESSAGE_KEY = 'system_message';

export async function getSystemMessage(): Promise<string> {
  const setting = await db
    .select()
    .from(settings)
    .where(eq(settings.key, SYSTEM_MESSAGE_KEY))
    .limit(1);

  return setting[0]?.value || 'You are a helpful assistant.';
}

export async function updateSystemMessage(message: string) {
  'use server';
  
  const existing = await db
    .select()
    .from(settings)
    .where(eq(settings.key, SYSTEM_MESSAGE_KEY))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(settings)
      .set({ 
        value: message,
        updatedAt: new Date()
      })
      .where(eq(settings.key, SYSTEM_MESSAGE_KEY));
  } else {
    await db.insert(settings).values({
      key: SYSTEM_MESSAGE_KEY,
      value: message
    });
  }

  return { success: true };
}
