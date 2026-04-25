create table if not exists public.tutor_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text not null,
  city text,
  address text,
  emergency_contact_name text,
  emergency_contact_phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tutor_profiles_full_name_length
    check (char_length(trim(full_name)) between 2 and 80),
  constraint tutor_profiles_phone_length
    check (char_length(trim(phone)) between 7 and 25),
  constraint tutor_profiles_city_length
    check (city is null or char_length(trim(city)) between 2 and 80),
  constraint tutor_profiles_address_length
    check (address is null or char_length(trim(address)) between 5 and 160),
  constraint tutor_profiles_emergency_name_length
    check (
      emergency_contact_name is null
      or char_length(trim(emergency_contact_name)) between 2 and 80
    ),
  constraint tutor_profiles_emergency_phone_length
    check (
      emergency_contact_phone is null
      or char_length(trim(emergency_contact_phone)) between 7 and 25
    ),
  constraint tutor_profiles_notes_length
    check (notes is null or char_length(trim(notes)) <= 500),
  constraint tutor_profiles_emergency_pair
    check (
      (emergency_contact_name is null and emergency_contact_phone is null)
      or (emergency_contact_name is not null and emergency_contact_phone is not null)
    )
);

alter table public.tutor_profiles enable row level security;

create policy "Users can view own tutor profile"
  on public.tutor_profiles
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own tutor profile"
  on public.tutor_profiles
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own tutor profile"
  on public.tutor_profiles
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
