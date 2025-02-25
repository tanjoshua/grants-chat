# RAG Implementation Plan

## Overview
Implement Retrieval Augmented Generation to enhance chat responses with relevant context from stored documents.

## Technical Stack
- Vercel AI SDK for AI interactions
- Neon PostgreSQL with pgvector for vector storage
- Local development setup with Docker for database

## Implementation Steps

1. Local Development Setup [COMPLETED]
   - Docker compose setup for local PostgreSQL + pgvector 
   - Testing and Verification 
     * Docker container running with pgvector extension
     * Database migrations successfully applied
     * Tables created and verified
     * Vector operations ready for use
     * Using `ankane/pgvector` image for vector similarity search
     * Exposed on port 5432
     * Persistent volume for data storage
   - Dependencies installation 
     * Using `drizzle-orm` for type-safe database operations
     * `@neondatabase/serverless` for optimized database connections
     * Vector operations supported through `pgvector`
   - Environment variables configuration 
     * Using Next.js built-in env support via `.env.local`
     * Local database URL configured
   - Database Configuration ✅
     * Schema defined with proper types and vector support
     * Added document management fields (filename, status, updatedAt)
     * Migration applied successfully
     * Drizzle configured for PostgreSQL dialect
     * Serverless-optimized database client setup
   - Local development documentation 

2. Vector Storage Implementation
   - Implement document ingestion pipeline
     * Document upload interface ✅
       - Created DocumentUpload component with shadcn/ui FileInput
       - Added form validation using react-hook-form and zod
       - Implemented file upload handling
       - Added success/error toast notifications
       - Improved loading states and user feedback
       - Enhanced error handling and display
     * Document management page ✅
       - Created /documents route with upload interface
       - Added navigation component for easy access
       - Prepared layout for document list view
     * API routes for document management
       - POST /api/documents/upload ✅
         * Implemented file content extraction
         * Added document storage in PostgreSQL
         * Integrated OpenAI embeddings generation
         * Added vector storage with pgvector
         * Implemented error handling and status updates
         * Added content chunking for better context
       - GET /api/documents ✅
         * Server-side document fetching
         * Sorted by creation date
         * Includes metadata and status
       - DELETE /api/documents/:id ✅
         * Implemented as server action
         * Cascading delete for embeddings
         * Status-aware deletion
         * Toast notifications
     * Document list view ✅
       - Shows filename, date, status
       - Displays file size with formatting
       - Shows relative upload time
       - Status-aware delete button
       - Processing state handling
     * Database integration ✅
       - Document storage implemented with status tracking
       - Content processing with chunking
       - Error handling for DB operations
       - Processing status updates
   - Create embedding generation using OpenAI embeddings ✅
   - Store embeddings in pgvector ✅

3. RAG Integration ✅
   - Implemented similarity search using pgvector
     * Using cosine similarity with HNSW index
     * Configurable similarity threshold (>0.5)
     * Returns top 4 most relevant chunks
   - Created context retrieval function
     * Implemented in `lib/ai/embedding.ts`
     * Generates embeddings for user queries
     * Finds similar content using vector search
   - Modified chat completion with tool-based RAG
     * Added `getInformation` tool for context retrieval
     * Implemented streaming tool calls
     * Set max steps to 3 for efficiency
     * Added tool call visualization in UI
   - Enhanced chat UI for RAG
     * Shows search status during retrieval
     * Displays found information inline
     * Maintains conversation flow

4. API Updates ✅
   - Extended chat API route with RAG
     * Added tool-based retrieval system
     * Integrated with Vercel AI SDK
     * Configured streaming responses
   - Added error handling
     * Similarity threshold filtering
     * Proper error states in UI
     * Fallback for no results
   - Optimized embedding generation
     * Using OpenAI's text-embedding-ada-002
     * Input text preprocessing
     * Efficient vector operations

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
   - `filename`: Text field for original filename
   - `content`: Text field for document content
   - `metadata`: JSONB field for flexible metadata storage
     * fileType: Original file type
     * size: File size in bytes
   - `status`: Text field for processing status (processing, ready, error)
   - `createdAt`: Timestamp with timezone for creation time
   - `updatedAt`: Timestamp with timezone for last update

2. `embeddings` table:
   - `id`: UUID primary key with auto-generation
   - `documentId`: UUID foreign key referencing documents.id (with CASCADE delete)
   - `content`: Text field for chunk content
   - `embedding`: Vector(1536) for OpenAI embeddings
   - `createdAt`: Timestamp with timezone for creation time
   - Added HNSW index for efficient vector similarity search

### Implementation Details

1. Document Management:
   - Server-side document fetching for better performance
   - Server actions for document operations
   - Optimistic updates with toast notifications
   - Proper error handling and status tracking
   - Cascade deletion of embeddings

2. UI Components:
   - Responsive document list with shadcn/ui Table
   - Status indicators with color-coded badges
   - Ghost buttons for actions
   - Processing state handling
   - User-friendly timestamps and file sizes

3. RAG System:
   - Vector Similarity Search:
     * Using pgvector with HNSW index
     * Cosine similarity for better matching
     * Configurable similarity threshold
     * Top-k retrieval (k=4)
   
   - Embedding Generation:
     * OpenAI's text-embedding-ada-002 model
     * Text preprocessing for better results
     * Efficient batch processing
     * Error handling and retries

   - Chat Integration:
     * Tool-based retrieval system
     * Streaming responses with progress
     * Max 3 steps per conversation
     * Real-time UI updates

   - Performance Optimizations:
     * Server-side similarity search
     * Efficient vector operations
     * Streaming tool calls
     * Minimal client-side processing
   - `documentId`: UUID foreign key to documents (with CASCADE delete)
   - `chunkIndex`: Integer for chunk order
   - `chunkContent`: Text field for the actual chunk content
   - `embedding`: Vector(1536) for OpenAI embeddings
   - `createdAt`: Timestamptz for creation time

This schema design supports:
- Document upload and processing
- Automatic cleanup of embeddings when documents are deleted
- Processing status tracking
- Efficient vector similarity search

## Future Enhancements

1. Direct Text Input Support
   - Add text input interface using shadcn/ui Textarea
   - Extend schema to support text content type
   - Add API endpoint for text input
   - Update UI to handle both document and text content
   - Modify processing pipeline for text input

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
