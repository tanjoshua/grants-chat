FROM gdssingapore/airbase:node-22-builder AS builder
ENV NEXT_TELEMETRY_DISABLED=1
ENV SKIP_ENV_VALIDATION=1

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
