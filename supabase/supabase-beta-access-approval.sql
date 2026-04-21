-- Upgrade beta_access_requests table for approval workflow
-- Ejecutar este script si la tabla ya existe en tu proyecto

alter table if exists beta_access_requests
  add column if not exists approved_at timestamptz;

alter table if exists beta_access_requests
  add column if not exists approved_by_email text;

alter table if exists beta_access_requests
  add column if not exists invited_at timestamptz;

alter table if exists beta_access_requests
  drop constraint if exists beta_access_requests_status_check;

alter table if exists beta_access_requests
  add constraint beta_access_requests_status_check
  check (status in ('nuevo', 'contactado', 'aprobado', 'rechazado'));
