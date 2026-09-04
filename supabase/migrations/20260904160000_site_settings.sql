-- Settings storage for Premier CRM

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.site_socials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  href text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists site_socials_sort_idx on public.site_socials (sort_order, created_at);

alter table public.site_settings enable row level security;
alter table public.site_socials enable row level security;

drop policy if exists "staff all site settings" on public.site_settings;
create policy "staff all site settings" on public.site_settings
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "public read site socials" on public.site_socials;
create policy "public read site socials" on public.site_socials
  for select using (true);

drop policy if exists "staff all site socials" on public.site_socials;
create policy "staff all site socials" on public.site_socials
  for all using (public.is_staff()) with check (public.is_staff());

insert into public.site_socials (name, href, sort_order)
select * from (values
  ('Facebook', 'https://www.facebook.com/PremierFordLincoln', 0),
  ('X', 'https://twitter.com/premierfordlinc', 1),
  ('YouTube', 'https://www.youtube.com/channel/UCwB4j5jJ3g000wNIj_Ce5Tg', 2),
  ('LinkedIn', 'https://www.linkedin.com/company/premier-ford-lincoln', 3)
) as seed(name, href, sort_order)
where not exists (select 1 from public.site_socials);

insert into public.site_settings (key, value)
values (
  'api_connectors',
  '[
    {"id":"ford-inventory","name":"Ford inventory feed","kind":"inventory","endpoint":"https://www.premierfordinc.com/new-inventory/new-ford-inventory-brooklyn-ny/index.htm","apiKey":""},
    {"id":"lincoln-inventory","name":"Lincoln inventory feed","kind":"inventory","endpoint":"https://www.premierlincolnbrooklyn.com/new-inventory/new-lincoln-inventory-brooklyn-ny/index.htm","apiKey":""}
  ]'::jsonb
)
on conflict (key) do nothing;
