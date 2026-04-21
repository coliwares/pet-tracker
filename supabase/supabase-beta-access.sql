-- Beta access requests (signup closed flow)
-- Ejecutar este script en Supabase SQL Editor

create table if not exists beta_access_requests (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  email_normalized text not null unique,
  full_name text not null,
  reason text not null,
  source text not null default 'signup_closed',
  status text not null default 'nuevo' check (status in ('nuevo', 'contactado', 'aprobado', 'rechazado')),
  request_count integer not null default 1,
  ip_hash text,
  user_agent text,
  approved_at timestamptz,
  approved_by_email text,
  invited_at timestamptz,
  last_requested_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_beta_access_requests_status
  on beta_access_requests(status);

create index if not exists idx_beta_access_requests_created_at
  on beta_access_requests(created_at desc);

create index if not exists idx_beta_access_requests_last_requested_at
  on beta_access_requests(last_requested_at desc);

alter table beta_access_requests enable row level security;

-- No se crean policies para usuarios anon/autenticados.
-- El acceso se realiza desde backend con service role key.
