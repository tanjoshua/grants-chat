ALTER TABLE "documents" RENAME COLUMN "filename" TO "name";--> statement-breakpoint
ALTER TABLE "embeddings" DROP CONSTRAINT "embeddings_document_id_documents_id_fk";
--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "url" text;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "source_type" text DEFAULT 'upload' NOT NULL;--> statement-breakpoint
ALTER TABLE "embeddings" ADD CONSTRAINT "embeddings_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;