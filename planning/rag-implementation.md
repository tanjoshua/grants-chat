# RAG Implementation Plan

## Overview
Implement Retrieval Augmented Generation to enhance chat responses with relevant context from stored documents.

## Technical Stack
- Vercel AI SDK for AI interactions
- Neon PostgreSQL with pgvector for vector storage
- Local development setup with Docker for database

## Implementation Steps

1. Local Development Setup [COMPLETED]
   - Docker compose setup for local PostgreSQL + pgvector ✅
   - Testing and Verification ✅
     * Docker container running with pgvector extension
     * Database migrations successfully applied
     * Tables created and verified
     * Vector operations ready for use
     * Using `ankane/pgvector` image for vector similarity search
     * Exposed on port 5432
     * Persistent volume for data storage
   - Dependencies installation ✅
     * Using `drizzle-orm` for type-safe database operations
     * `@neondatabase/serverless` for optimized database connections
     * Vector operations supported through `pgvector`
   - Environment variables configuration ✅
     * Using Next.js built-in env support via `.env.local`
     * Local database URL configured
   - Database Configuration ✅
     * Schema defined with proper types and vector support
     * Drizzle configured for PostgreSQL dialect
     * Serverless-optimized database client setup
   - Local development documentation ✅

2. Vector Storage Implementation
   - Implement document ingestion pipeline
   - Create embedding generation using OpenAI embeddings
   - Store embeddings in pgvector
   - Add API routes for document upload

3. RAG Integration
   - Implement similarity search using pgvector
   - Create context retrieval function
   - Modify chat completion to include relevant context
   - Update prompt template to handle retrieved context

4. API Updates
   - Extend chat API route to include RAG
   - Add error handling for retrieval failures
   - Implement rate limiting for embedding generation

5. Production Database Setup
   - Set up Neon PostgreSQL instance
   - Enable pgvector extension
   - Apply database migrations
   - Update environment variables
   - Test production setup

## Database Setup Details

### Schema Design
The database schema consists of two main tables:

1. `documents` table:
   - `id`: UUID primary key with auto-generation
   - `content`: Text field for document content
   - `metadata`: JSONB field for flexible metadata storage
   - `createdAt`: Timestamptz for creation time

2. `embeddings` table:
   - `id`: UUID primary key with auto-generation
   - `documentId`: UUID foreign key to documents
   - `embedding`: Vector(1536) for OpenAI embeddings
   - `createdAt`: Timestamptz for creation time

### Database Configuration
1. Local Development:
   - Docker container running PostgreSQL with pgvector
   - Database: rag_dev
   - Default credentials for local dev
   - Persistent volume for data retention

2. Connection Setup:
   - Using Neon's serverless driver for optimal performance
   - Edge-compatible database client
   - Automatic connection management
   - No connection pooling needed

3. Type Safety:
   - Full TypeScript support via Drizzle ORM
   - Automatic type inference for queries
   - Vector operations type-safety
   - Runtime type checking enabled
```

## Database Tooling

Recommended option: Drizzle ORM
- Type-safe SQL queries and migrations
- First-class pgvector support
- Great developer experience with drizzle-kit
- Lightweight with no overhead
- Built-in seed data support

Alternatives considered:
- Prisma: Too heavy for this use case, no native pgvector support
- Kysely: Good but requires more boilerplate than Drizzle
- Raw SQL: Viable but lacks type safety and migration tools

## Dependencies
- `@neondatabase/serverless`: PostgreSQL serverless driver
- `drizzle-orm`: Database ORM
- `drizzle-kit`: Migration and development tools
- `pgvector`: Vector similarity search
- `postgres`: Local PostgreSQL
- Docker and docker-compose for local development
