# Free Deen Assistant – Starter Kit (Bubble + RAG backend)

This starter kit gives you a minimal, swappable backend plus API specs to plug into Bubble's API Connector.
It focuses on: low cost, citations-first answers, and easy swapping of LLM providers.

## What's inside
- `openapi.yaml` — OpenAPI 3.1 spec for `/answer`, `/ayah-of-day`, `/prayertimes`.
- `server.js` — Node.js (Express) reference backend with RAG pipeline stubs.
- `schema.sql` — Postgres + pgvector schema for sources, chunks, queries, and caches.
- `prompts.md` — Safe prompt templates (fiqh-aware, citations-only, refusal rules).
- `.env.example` — Example environment variables.
- `sample_sources.csv` — CSV template to import your licensed sources metadata.
- `sample_chunks.csv` — CSV template for chunked passages (IDs must match `sample_sources.csv`).
- `terms_checklist.md` — Licensing & attribution checklist.
- `bubble_integration.md` — Step-by-step instructions to connect Bubble UI to the backend.
- `deployment.md` — One-page deploy guide (Railway/Render/Fly.io/Heroku-like).

> Important: You **must** verify licenses for any text you import (translations/tafsir/hadith). Use public-domain or properly licensed sources and include attribution where required.
