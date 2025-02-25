'use server';

import { db } from '@/db';
import { suggestedQuestions } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getSuggestedQuestions() {
  const questions = await db
    .select()
    .from(suggestedQuestions)
    .orderBy(desc(suggestedQuestions.createdAt));

  return questions;
}

export async function addSuggestedQuestion(question: string) {
  await db.insert(suggestedQuestions).values({
    question
  });

  revalidatePath('/settings');
  revalidatePath('/');
  return { success: true };
}

export async function deleteSuggestedQuestion(id: string) {
  await db
    .delete(suggestedQuestions)
    .where(eq(suggestedQuestions.id, id));

  revalidatePath('/settings');
  revalidatePath('/');
  return { success: true };
}
