-- Rename filename column to name
ALTER TABLE "documents" RENAME COLUMN "filename" TO "name";

-- Add URL and source_type fields to the documents table
ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "url" text;
ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "source_type" text NOT NULL DEFAULT 'upload';
