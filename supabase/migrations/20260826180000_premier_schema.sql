-- Official Premier Brooklyn schema (Ford + Lincoln). Do not apply to other projects.

create extension if not exists "pgcrypto";

create type public.vehicle_brand as enum ('ford', 'lincoln', 'other');
create type public.vehicle_condition as enum ('new', 'used', 'cpo');
create type public.vehicle_status as enum ('in_stock', 'in_transit', 'sold', 'hidden');
create type public.staff_role as enum ('admin', 'sales', 'service');
create type public.lead_type as enum ('sales', 'service', 'finance', 'trade');
create type public.lead_stage as enum ('new', 'contacted', 'appointment', 'proposal', 'sold', 'lost');
create type public.lead_source as enum ('web_form', 'phone', 'walk_in', 'service', 'other');
create type public.activity_type as enum ('note', 'call', 'email', 'sms', 'status_change');
create type public.appointment_type as enum ('test_drive', 'service', 'delivery');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role public.staff_role not null default 'sales',
  created_at timestamptz not null default now()
);

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  vin text unique,
  stock_number text,
  brand public.vehicle_brand not null default 'other',
  condition public.vehicle_condition not null default 'used',
  year int,
  make text,
  model text,
  trim text,
  body_style text,
  drivetrain text,
  engine text,
  transmission text,
  fuel text,
  mpg_city int,
  mpg_hwy int,
  mileage int,
  exterior_color text,
  interior_color text,
  status public.vehicle_status not null default 'in_stock',
  msrp numeric,
  internet_price numeric,
  discount numeric,
  incentives jsonb not null default '[]'::jsonb,
  features jsonb not null default '[]'::jsonb,
  description text,
  source_url text,
  source_site text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index vehicles_brand_status_idx on public.vehicles (brand, status);
create index vehicles_condition_idx on public.vehicles (condition);
create index vehicles_model_idx on public.vehicles (model);

create table public.vehicle_images (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  url text not null,
  alt text,
  sort_order int not null default 0
);

create index vehicle_images_vehicle_idx on public.vehicle_images (vehicle_id, sort_order);

create table public.vehicle_ratings (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  source text not null,
  score numeric,
  rating_count int,
  payload jsonb not null default '{}'::jsonb
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  first_name text,
  last_name text,
  email text,
  phone text,
  address text,
  city text,
  state text,
  zip text,
  email_consent boolean not null default false,
  sms_consent boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  vehicle_id uuid references public.vehicles (id) on delete set null,
  brand public.vehicle_brand,
  source public.lead_source not null default 'web_form',
  type public.lead_type not null default 'sales',
  stage public.lead_stage not null default 'new',
  assigned_to uuid references public.profiles (id) on delete set null,
  value numeric,
  message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index leads_stage_idx on public.leads (stage);
create index leads_assigned_idx on public.leads (assigned_to);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads (id) on delete cascade,
  customer_id uuid references public.customers (id) on delete cascade,
  author_id uuid references public.profiles (id) on delete set null,
  type public.activity_type not null default 'note',
  body text not null,
  created_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  due_at timestamptz,
  completed_at timestamptz,
  assigned_to uuid references public.profiles (id) on delete set null,
  lead_id uuid references public.leads (id) on delete set null,
  customer_id uuid references public.customers (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers (id) on delete set null,
  vehicle_id uuid references public.vehicles (id) on delete set null,
  assigned_to uuid references public.profiles (id) on delete set null,
  type public.appointment_type not null default 'test_drive',
  starts_at timestamptz not null,
  notes text,
  created_at timestamptz not null default now()
);

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
  );
$$;

create or replace function public.submit_lead(
  p_first_name text,
  p_last_name text,
  p_email text,
  p_phone text,
  p_message text,
  p_type public.lead_type default 'sales',
  p_brand public.vehicle_brand default null,
  p_vehicle_id uuid default null,
  p_email_consent boolean default false,
  p_sms_consent boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer_id uuid;
  v_lead_id uuid;
begin
  insert into public.customers (first_name, last_name, email, phone, email_consent, sms_consent)
  values (p_first_name, p_last_name, p_email, p_phone, p_email_consent, p_sms_consent)
  returning id into v_customer_id;

  insert into public.leads (customer_id, vehicle_id, brand, source, type, message)
  values (v_customer_id, p_vehicle_id, p_brand, 'web_form', p_type, p_message)
  returning id into v_lead_id;

  return v_lead_id;
end;
$$;

alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.vehicle_images enable row level security;
alter table public.vehicle_ratings enable row level security;
alter table public.customers enable row level security;
alter table public.leads enable row level security;
alter table public.activities enable row level security;
alter table public.tasks enable row level security;
alter table public.appointments enable row level security;

create policy "staff read profiles" on public.profiles for select using (public.is_staff());
create policy "staff update own profile" on public.profiles for update using (id = auth.uid());

create policy "public read live vehicles" on public.vehicles
  for select using (status in ('in_stock', 'in_transit'));
create policy "staff all vehicles" on public.vehicles
  for all using (public.is_staff()) with check (public.is_staff());

create policy "public read live vehicle images" on public.vehicle_images
  for select using (
    exists (
      select 1 from public.vehicles v
      where v.id = vehicle_id and v.status in ('in_stock', 'in_transit')
    )
  );
create policy "staff all vehicle images" on public.vehicle_images
  for all using (public.is_staff()) with check (public.is_staff());

create policy "public read live ratings" on public.vehicle_ratings
  for select using (
    exists (
      select 1 from public.vehicles v
      where v.id = vehicle_id and v.status in ('in_stock', 'in_transit')
    )
  );
create policy "staff all ratings" on public.vehicle_ratings
  for all using (public.is_staff()) with check (public.is_staff());

create policy "staff crm customers" on public.customers
  for all using (public.is_staff()) with check (public.is_staff());
create policy "staff crm leads" on public.leads
  for all using (public.is_staff()) with check (public.is_staff());
create policy "staff crm activities" on public.activities
  for all using (public.is_staff()) with check (public.is_staff());
create policy "staff crm tasks" on public.tasks
  for all using (public.is_staff()) with check (public.is_staff());
create policy "staff crm appointments" on public.appointments
  for all using (public.is_staff()) with check (public.is_staff());

grant execute on function public.submit_lead(
  text, text, text, text, text, public.lead_type, public.vehicle_brand, uuid, boolean, boolean
) to anon, authenticated;
grant execute on function public.is_staff() to anon, authenticated;

insert into storage.buckets (id, name, public)
values ('vehicle-photos', 'vehicle-photos', true)
on conflict (id) do nothing;

create policy "public read vehicle photos"
on storage.objects for select
using (bucket_id = 'vehicle-photos');

create policy "staff write vehicle photos"
on storage.objects for all
using (bucket_id = 'vehicle-photos' and public.is_staff())
with check (bucket_id = 'vehicle-photos' and public.is_staff());
