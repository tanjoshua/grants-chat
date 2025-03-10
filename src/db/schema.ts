import { pgTable, uuid, text, jsonb, timestamp, vector,index } from 'drizzle-orm/pg-core';

export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  content: text('content').notNull(),
  url: text('url'), // Optional field to store URL if document is from a website
  sourceType: text('source_type').default('upload').notNull(), // 'upload' or 'website'
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  status: text('status').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow() // Also used to track when a website was last scraped
});

export const embeddings = pgTable('embeddings', {
  id: uuid('id').primaryKey().defaultRandom(),
  documentId: uuid('document_id').references(() => documents.id),
  content: text('content').notNull(),
  embedding: vector('embedding', { dimensions: 1536 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
},
table => ({
  embeddingIndex: index('embeddingIndex').using(
    'hnsw',
    table.embedding.op('vector_cosine_ops'),
  ),
}),
);

// Modern way to infer types in Drizzle
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;

export type Embedding = typeof embeddings.$inferSelect;
export type NewEmbedding = typeof embeddings.$inferInsert;

export const settings = pgTable('settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

export type Setting = typeof settings.$inferSelect;
export type NewSetting = typeof settings.$inferInsert;

export const suggestedQuestions = pgTable('suggested_questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  question: text('question').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

export type SuggestedQuestion = typeof suggestedQuestions.$inferSelect;
export type NewSuggestedQuestion = typeof suggestedQuestions.$inferInsert;
