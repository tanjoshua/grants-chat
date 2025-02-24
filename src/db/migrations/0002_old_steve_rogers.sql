ALTER TABLE "embeddings" ALTER COLUMN "embedding" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "embeddings" ADD COLUMN "content" text NOT NULL;--> statement-breakpoint
CREATE INDEX "embeddingIndex" ON "embeddings" USING hnsw ("embedding" vector_cosine_ops);