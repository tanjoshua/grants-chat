FROM gdssingapore/airbase:node-22-builder AS builder

# Build arguments
ARG DATABASE_URL
ARG OPENAI_API_KEY

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV SKIP_ENV_VALIDATION=1
ENV DATABASE_URL=$DATABASE_URL
ENV OPENAI_API_KEY=$OPENAI_API_KEY

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy source code
COPY . ./
RUN npm run build

FROM gdssingapore/airbase:node-22
RUN mkdir .next && chown app:app .next
RUN mkdir .npm && chown app:app .npm
COPY --from=builder --chown=app:app /app/.next/standalone ./
COPY --from=builder --chown=app:app /app/.next/static ./.next/static
COPY --from=builder --chown=app:app /app/public ./public
USER app
CMD ["node", "server.js", "--port", "$PORT"]
