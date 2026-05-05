-- Daily care logs for gamification and habit tracking.
-- This migration is additive and does not alter existing tables.

create table if not exists daily_care_logs (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references pets(id) on delete cascade,
  log_date date not null,
  meals_logged boolean not null default false,
  breakfast_completed boolean not null default false,
  lunch_completed boolean not null default false,
  dinner_completed boolean not null default false,
  hydration_logged boolean not null default false,
  hydration_ml integer not null default 0 check (hydration_ml >= 0),
  exercise_logged boolean not null default false,
  exercise_minutes integer not null default 0 check (exercise_minutes >= 0),
  health_logged boolean not null default false,
  symptoms_severity text not null default 'none'
    check (symptoms_severity in ('none', 'minor', 'severe')),
  care_logged boolean not null default false,
  medicines_on_time boolean not null default false,
  grooming_completed boolean not null default false,
  ears_eyes_cleaning_completed boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (pet_id, log_date)
);

create index if not exists idx_daily_care_logs_pet_id on daily_care_logs(pet_id);
create index if not exists idx_daily_care_logs_log_date on daily_care_logs(log_date desc);

alter table daily_care_logs enable row level security;

create policy "Users can view own daily care logs"
  on daily_care_logs for select
  using (
    pet_id in (
      select id from pets where user_id = auth.uid()
    )
  );

create policy "Users can insert own daily care logs"
  on daily_care_logs for insert
  with check (
    pet_id in (
      select id from pets where user_id = auth.uid()
    )
  );

create policy "Users can update own daily care logs"
  on daily_care_logs for update
  using (
    pet_id in (
      select id from pets where user_id = auth.uid()
    )
  );

create policy "Users can delete own daily care logs"
  on daily_care_logs for delete
  using (
    pet_id in (
      select id from pets where user_id = auth.uid()
    )
  );
