-- Postgres + pgvector schema
create extension if not exists vector;

-- Sources: books/collections you are legally allowed to store
create table sources (
  id text primary key,
  title text not null,
  author text,
  edition text,
  language text default 'en',
  license text,
  uri text,
  created_at timestamptz default now()
);

-- Chunks: small passages for retrieval (200–800 chars)
create table chunks (
  id text primary key,
  source_id text references sources(id) on delete cascade,
  locator text, -- e.g., "Qur'an 4:103", "Bukhari 1234"
  content text not null,
  embedding vector(1024), -- adjust to your embedding size
  created_at timestamptz default now()
);
create index on chunks using ivfflat (embedding vector_cosine_ops);

-- Query log + cache (for analytics and cost control)
create table queries (
  id bigserial primary key,
  user_hash text,
  question text,
  normalized text,
  madhhab text,
  locale text,
  answer text,
  citations jsonb,
  confidence numeric,
  created_at timestamptz default now()
);

-- Simple cache: identical normalized question → latest good answer
create table answer_cache (
  key text primary key,
  answer text,
  citations jsonb,
  confidence numeric,
  updated_at timestamptz default now()
);
