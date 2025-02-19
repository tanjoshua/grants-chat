import { pgTable, uuid, text, jsonb, timestamp, vector } from 'drizzle-orm/pg-core';
import type { z } from 'zod';

export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  content: text('content').notNull(),
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

export const embeddings = pgTable('embeddings', {
  id: uuid('id').primaryKey().defaultRandom(),
  documentId: uuid('document_id').references(() => documents.id),
  embedding: vector('embedding', { dimensions: 1536 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

// Modern way to infer types in Drizzle
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;

export type Embedding = typeof embeddings.$inferSelect;
export type NewEmbedding = typeof embeddings.$inferInsert;
