FROM node:20-alpine AS base
WORKDIR /app
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --filter @cad/web... --filter @cad/shared...

COPY . .
RUN pnpm --filter @cad/shared build && pnpm --filter @cad/web build

CMD ["pnpm", "--filter", "@cad/web", "preview", "--host", "0.0.0.0", "--port", "4173"]
