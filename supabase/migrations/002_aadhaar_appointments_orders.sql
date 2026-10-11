-- CareThread: Phase 4 - Aadhaar, Staff Registrations, Appointments, Online Medicine Orders
-- Run via: npx supabase db push or Supabase SQL Editor

-- 1. Extend user_role enum
alter type user_role add value if not exists 'pharmacist';
alter type user_role add value if not exists 'lab_technician';

-- 2. Extend profiles with Aadhaar, Gov Reg Number, Department, and Admin Approval Status
alter table profiles 
  add column if not exists phone text,
  add column if not exists address text,
  add column if not exists aadhaar_number text,
  add column if not exists gov_reg_number text,
  add column if not exists department text,
  add column if not exists approval_status text not null default 'approved';

-- 3. Extend patients with Aadhaar number and approval status
alter table patients 
  add column if not exists aadhaar_number text,
  add column if not exists approval_status text not null default 'approved';

-- 4. Create appointments table
create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  doctor_id uuid references profiles(id) on delete set null,
  department text not null,
  appointment_date date not null,
  appointment_time text not null,
  symptoms text not null,
  status text not null default 'pending', -- 'pending', 'confirmed', 'rejected', 'completed', 'cancelled'
  doctor_notes text,
  created_at timestamptz not null default now()
);

-- 5. Create medicine_orders table
create table if not exists medicine_orders (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  items jsonb not null default '[]'::jsonb,
  total_amount numeric(10,2) not null default 0.00,
  delivery_address text not null,
  phone text not null,
  status text not null default 'order_placed', -- 'order_placed', 'confirmed', 'dispensed', 'out_for_delivery', 'delivered', 'cancelled'
  pharmacist_notes text,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_appointments_patient on appointments(patient_id);
create index if not exists idx_appointments_doctor on appointments(doctor_id);
create index if not exists idx_appointments_date on appointments(appointment_date);
create index if not exists idx_medicine_orders_patient on medicine_orders(patient_id);
create index if not exists idx_medicine_orders_status on medicine_orders(status);

-- Enable RLS
alter table appointments enable row level security;
alter table medicine_orders enable row level security;

-- Appointments RLS policies
create policy appointments_read on appointments for select to authenticated
  using (
    app_role() in ('admin', 'receptionist', 'doctor', 'nurse') 
    or can_view_patient(patient_id)
  );

create policy appointments_insert on appointments for insert to authenticated
  with check (
    app_role() in ('admin', 'receptionist')
    or can_view_patient(patient_id)
  );

create policy appointments_update on appointments for update to authenticated
  using (
    app_role() in ('admin', 'doctor', 'receptionist')
    or can_view_patient(patient_id)
  )
  with check (
    app_role() in ('admin', 'doctor', 'receptionist')
    or can_view_patient(patient_id)
  );

-- Medicine orders RLS policies
create policy orders_read on medicine_orders for select to authenticated
  using (
    app_role() in ('admin', 'pharmacist', 'doctor', 'nurse')
    or can_view_patient(patient_id)
  );

create policy orders_insert on medicine_orders for insert to authenticated
  with check (
    can_view_patient(patient_id)
    or app_role() in ('admin', 'pharmacist')
  );

create policy orders_update on medicine_orders for update to authenticated
  using (
    app_role() in ('admin', 'pharmacist')
  )
  with check (
    app_role() in ('admin', 'pharmacist')
  );

-- Allow patients to add family history for themselves
create policy fh_patient_insert on family_history for insert to authenticated
  with check (
    can_view_patient(patient_id)
  );

-- Add to Realtime
alter publication supabase_realtime add table appointments, medicine_orders;
