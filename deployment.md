# Deployment (quick)

- Provision Postgres with pgvector (e.g., Supabase). Run `schema.sql`.
- Deploy the Node server (Railway/Render/Fly/Heroku). Set env vars from `.env.example`.
- Import `sample_sources.csv` then `sample_chunks.csv` into your DB (as a starting shape).
- Wire your chosen LLM + embeddings provider in `server.js` (LLM_ENDPOINT/EMBED_ENDPOINT).
- Point Bubble API Connector to your deployed backend.
- Add rate limits at the reverse proxy (e.g., Nginx/Cloudflare): 60 rpm per IP.
- Set up logs + alerts. Review "Report an answer" submissions daily in early weeks.
