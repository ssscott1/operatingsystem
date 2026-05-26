-- ============================================================
-- Personal Operating System — Supabase Schema & RLS Policies
-- Paste this entire file into the Supabase SQL Editor and Run
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── todos ──────────────────────────────────────────────────
create table if not exists public.todos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  text text not null,
  category text not null check (category in ('daily', 'weekly')),
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  sort_order integer not null default 0
);

alter table public.todos enable row level security;

create policy "Users manage own todos"
  on public.todos for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── goals ──────────────────────────────────────────────────
create table if not exists public.goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  text text not null,
  category text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.goals enable row level security;

create policy "Users manage own goals"
  on public.goals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── journal_entries ────────────────────────────────────────
create table if not exists public.journal_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  prompt text,
  entry text not null default '',
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

alter table public.journal_entries enable row level security;

create policy "Users manage own journal entries"
  on public.journal_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── habit_log ──────────────────────────────────────────────
create table if not exists public.habit_log (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  trained_gym boolean not null default false,
  drank_alcohol boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

alter table public.habit_log enable row level security;

create policy "Users manage own habit log"
  on public.habit_log for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── telegram_notes ─────────────────────────────────────────
create table if not exists public.telegram_notes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  category text not null check (category in ('business_idea', 'thought', 'idea', 'note')),
  content text not null,
  source text not null default 'telegram',
  created_at timestamptz not null default now()
);

alter table public.telegram_notes enable row level security;

create policy "Users manage own telegram notes"
  on public.telegram_notes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── reading_list ───────────────────────────────────────────
create table if not exists public.reading_list (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  author text,
  status text not null check (status in ('want_to_read', 'reading', 'finished')),
  date_added timestamptz not null default now(),
  date_finished timestamptz
);

alter table public.reading_list enable row level security;

create policy "Users manage own reading list"
  on public.reading_list for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Enable realtime for todos ───────────────────────────────
-- Run this separately if the above succeeds:
-- alter publication supabase_realtime add table public.todos;
