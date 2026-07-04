alter table public.education_contents
  add column if not exists origin text not null default 'office',
  add column if not exists status text not null default 'published',
  add column if not exists scheduled_at timestamptz,
  add column if not exists published_at timestamptz,
  add column if not exists expires_at timestamptz;

create index if not exists idx_education_contents_status on public.education_contents(status);
create index if not exists idx_education_contents_scheduled_at on public.education_contents(scheduled_at);
create index if not exists idx_education_contents_origin on public.education_contents(origin);
