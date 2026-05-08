# Minecraft Bot Manager (MC_BOT_MGR)

A full-stack web application for managing multiple AI-powered Minecraft bots. Features Mineflayer integration for bot control, Ollama/API AI support, real-time monitoring, multi-bot management, and bilingual interface (Russian/English).

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/minecraft-bot run dev` — run the frontend (port 23418)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 + WebSocket (ws)
- DB: PostgreSQL + Drizzle ORM
- Minecraft: Mineflayer
- AI: Ollama (localhost:11434) + OpenAI API
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Frontend: React + Vite + TailwindCSS + shadcn/ui + Framer Motion

## Where things live

- **API spec**: `lib/api-spec/openapi.yaml`
- **DB schema**: `lib/db/src/schema/` (bots.ts, messages.ts, settings.ts)
- **API routes**: `artifacts/api-server/src/routes/` (bots, models, chat, settings)
- **Mineflayer logic**: `artifacts/api-server/src/lib/mineflayer.ts`
- **Frontend**: `artifacts/minecraft-bot/src/`
- **i18n**: `artifacts/minecraft-bot/src/i18n/translations.ts`

## Architecture decisions

- Mineflayer and ws are externalized from esbuild bundle (too large / native deps)
- WebSocket server runs on same HTTP server at `/ws` path for real-time bot state
- Ollama communicates via localhost:11434 — user must have Ollama installed locally
- Global settings stored as a single row in `global_settings` table
- Language (RU/EN) is stored in global settings and fetched via API on load

## Product

- **Dashboard**: View all bots, status counters, quick connect/disconnect
- **Bot Control Panel**: 3-panel layout — AI settings, live monitoring (HP/hunger/XP/armor/inventory/coords), chat
- **Model Catalog**: Browse and download Ollama models with RAM/VRAM requirements
- **Multi-bot**: Create and manage multiple bots, each with own AI/proxy/server settings
- **Offline AI Chat**: Chat with Ollama/API without connecting to a Minecraft server
- **Survivor Mode**: Autonomous AI-driven survival gameplay via LLM decisions
- **Help Page**: Installation guides for Ollama in Russian and English

## User preferences

- Interface is bilingual: Russian (default) and English, switchable via language button
- No emojis in UI

## Gotchas

- After changing OpenAPI spec, always run `pnpm --filter @workspace/api-spec codegen && echo 'export * from "./generated/api";' > lib/api-zod/src/index.ts`
- Mineflayer must be in esbuild `external` list — do NOT remove it
- Ollama must be running on localhost:11434 for AI features to work

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
