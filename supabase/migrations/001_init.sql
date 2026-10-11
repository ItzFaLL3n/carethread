-- CareThread: initial schema
-- Run via: npx supabase db push

create type user_role as enum ('admin','receptionist','doctor','nurse','patient');
create type relationship_type as enum ('parent','child','spouse','sibling','guardian','ward','other');
create type medicine_status as enum ('active','completed','stopped');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role user_role not null default 'patient',
  created_at timestamptz not null default now()
);

create table patients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  name text not null,
  dob date not null,
  gender text,
  phone text,
  address text,
  allergies text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  phone text,
  created_at timestamptz not null default now()
);

create table family_members (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  is_emergency_contact boolean not null default false,
  removed_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index family_members_one_active on family_members(patient_id) where removed_at is null;

create table patient_relationships (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  related_patient_id uuid not null references patients(id) on delete cascade,
  relationship relationship_type not null,
  created_at timestamptz not null default now(),
  check (patient_id <> related_patient_id),
  unique (patient_id, related_patient_id)
);

create table family_history (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  condition text not null,
  relative text,
  notes text,
  recorded_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table visits (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  doctor_id uuid not null references profiles(id),
  visit_date timestamptz not null default now(),
  symptoms text, diagnosis text, notes text,
  created_at timestamptz not null default now()
);

create table vitals (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  recorded_by uuid not null references profiles(id),
  bp_systolic int, bp_diastolic int, pulse int,
  temp_c numeric(4,1), weight_kg numeric(5,1),
  recorded_at timestamptz not null default now()
);

create table medicine_cycles (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  prescribed_by uuid references profiles(id),
  drug text not null, dose text not null, frequency text not null,
  start_date date not null, end_date date,
  status medicine_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table summaries (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  content text not null,
  model text,
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now()
);

create index on visits(patient_id);
create index on vitals(patient_id, recorded_at desc);
create index on medicine_cycles(patient_id);
create index on family_history(patient_id);
create index on patient_relationships(related_patient_id);

create function add_inverse_relationship() returns trigger language plpgsql as $$
declare inv relationship_type;
begin
  inv := case new.relationship
    when 'parent' then 'child'::relationship_type
    when 'child' then 'parent'::relationship_type
    when 'guardian' then 'ward'::relationship_type
    when 'ward' then 'guardian'::relationship_type
    else new.relationship end;
  insert into patient_relationships(patient_id, related_patient_id, relationship)
  values (new.related_patient_id, new.patient_id, inv)
  on conflict (patient_id, related_patient_id) do nothing;
  return new;
end $$;
create trigger trg_inverse_relationship after insert on patient_relationships
  for each row execute function add_inverse_relationship();

create function app_role() returns user_role language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = (select auth.uid()) $$;

create function my_patient_id() returns uuid language sql stable security definer set search_path = public as $$
  select id from public.patients where user_id = (select auth.uid()) $$;

create function can_view_patient(pid uuid) returns boolean language sql stable security definer set search_path = public as $$
  select pid = public.my_patient_id()
      or exists (select 1 from public.patient_relationships r
                 where r.patient_id = pid
                   and r.related_patient_id = public.my_patient_id()
                   and r.relationship = 'guardian') $$;

alter table profiles enable row level security;
alter table patients enable row level security;
alter table families enable row level security;
alter table family_members enable row level security;
alter table patient_relationships enable row level security;
alter table family_history enable row level security;
alter table visits enable row level security;
alter table vitals enable row level security;
alter table medicine_cycles enable row level security;
alter table summaries enable row level security;

create policy profiles_read on profiles for select to authenticated
  using (id = (select auth.uid()) or app_role() in ('admin','receptionist','doctor','nurse'));
create policy profiles_admin on profiles for all to authenticated
  using (app_role() = 'admin') with check (app_role() = 'admin');

create policy patients_read on patients for select to authenticated
  using (app_role() in ('admin','receptionist','doctor','nurse') or can_view_patient(id));
create policy patients_insert on patients for insert to authenticated
  with check (app_role() in ('admin','receptionist'));
create policy patients_update on patients for update to authenticated
  using (app_role() in ('admin','receptionist')) with check (app_role() in ('admin','receptionist'));

create policy families_read on families for select to authenticated using (app_role() in ('admin','receptionist','doctor','nurse'));
create policy families_write on families for all to authenticated
  using (app_role() in ('admin','receptionist')) with check (app_role() in ('admin','receptionist'));
create policy fm_read on family_members for select to authenticated using (app_role() in ('admin','receptionist','doctor','nurse'));
create policy fm_write on family_members for all to authenticated
  using (app_role() in ('admin','receptionist')) with check (app_role() in ('admin','receptionist'));
create policy rel_read on patient_relationships for select to authenticated
  using (app_role() in ('admin','receptionist','doctor','nurse') or patient_id = my_patient_id());
create policy rel_write on patient_relationships for all to authenticated
  using (app_role() in ('admin','receptionist')) with check (app_role() in ('admin','receptionist'));

create policy fh_read on family_history for select to authenticated
  using (app_role() in ('doctor','nurse') or can_view_patient(patient_id));
create policy fh_write on family_history for all to authenticated
  using (app_role() = 'doctor') with check (app_role() = 'doctor');

create policy visits_read on visits for select to authenticated
  using (app_role() in ('doctor','nurse') or can_view_patient(patient_id));
create policy visits_insert on visits for insert to authenticated
  with check (app_role() = 'doctor' and doctor_id = (select auth.uid()));
create policy visits_update on visits for update to authenticated
  using (app_role() = 'doctor' and doctor_id = (select auth.uid()))
  with check (app_role() = 'doctor' and doctor_id = (select auth.uid()));

create policy vitals_read on vitals for select to authenticated
  using (app_role() in ('doctor','nurse') or can_view_patient(patient_id));
create policy vitals_insert on vitals for insert to authenticated
  with check (app_role() in ('doctor','nurse') and recorded_by = (select auth.uid()));
create policy vitals_update on vitals for update to authenticated
  using (app_role() = 'nurse' and recorded_by = (select auth.uid()))
  with check (app_role() = 'nurse' and recorded_by = (select auth.uid()));

create policy meds_read on medicine_cycles for select to authenticated
  using (app_role() in ('doctor','nurse') or can_view_patient(patient_id));
create policy meds_write on medicine_cycles for all to authenticated
  using (app_role() in ('doctor','nurse')) with check (app_role() in ('doctor','nurse'));

create policy sum_read on summaries for select to authenticated using (app_role() in ('doctor','nurse'));
create policy sum_insert on summaries for insert to authenticated
  with check (app_role() in ('doctor','nurse') and created_by = (select auth.uid()));

alter publication supabase_realtime add table visits, vitals, medicine_cycles;
