ALTER TABLE "documents" ADD COLUMN "filename" text NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "status" text NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now();