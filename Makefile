.PHONY: up down restart logs ps clean db-generate db-push db-studio

# Start the database
up:
	docker-compose up -d

# Stop the database
down:
	docker-compose down

# Restart the database
restart: down up

# View database logs
logs:
	docker-compose logs -f db

# Show running containers
ps:
	docker-compose ps

# Clean up volumes (WARNING: this will delete all data)
clean:
	docker-compose down -v

# Generate migration files from schema changes
db-generate:
	npx drizzle-kit generate

# Push schema changes to database
db-push:
	npx drizzle-kit push

# Open Drizzle Studio
db-studio:
	npx drizzle-kit studio
