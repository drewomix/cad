FROM node:20-alpine AS base
WORKDIR /app
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --filter @cad/api... --filter @cad/shared...

COPY . .
RUN pnpm --filter @cad/shared build && pnpm --filter @cad/api build

CMD ["pnpm", "--filter", "@cad/api", "start"]
