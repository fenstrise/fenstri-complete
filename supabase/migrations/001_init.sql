-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Create custom types
create type user_role as enum ('admin', 'dispatcher', 'technician', 'customer');
create type work_order_status as enum ('draft', 'scheduled', 'in_progress', 'done', 'qa_hold', 'cancelled');
create type work_order_service as enum ('maintenance', 'repair', 'inspection');
create type work_order_priority as enum ('low', 'medium', 'high', 'urgent');
create type invoice_status as enum ('draft', 'sent', 'paid', 'overdue', 'cancelled');
create type subscription_status as enum ('active', 'cancelled', 'past_due');

-- Organizations table
create table public.organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  address_line1 text,
  address_line2 text,
  city text,
  postal_code text,
  country text default 'DE',
  phone text,
  email text,
  website text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  org_id uuid references public.organizations(id) on delete cascade,
  email text not null,
  full_name text,
  role user_role not null default 'customer',
  phone text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Properties table
create table public.properties (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references public.organizations(id) on delete cascade not null,
  name text not null,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  postal_code text not null,
  country text default 'DE',
  contact_name text,
  contact_phone text,
  contact_email text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Windows table
create table public.windows (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid references public.properties(id) on delete cascade not null,
  identifier text not null, -- e.g., "Building A - Floor 2 - Room 201 - Window 1"
  type text, -- e.g., "double-hung", "casement", "sliding"
  material text, -- e.g., "wood", "aluminum", "vinyl"
  size_width numeric,
  size_height numeric,
  installation_date date,
  last_maintenance_date date,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Work orders table
create table public.work_orders (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references public.organizations(id) on delete cascade not null,
  property_id uuid references public.properties(id) on delete cascade not null,
  assigned_to uuid references public.profiles(id) on delete set null,
  status work_order_status not null default 'draft',
  service work_order_service not null,
  priority work_order_priority not null default 'medium',
  title text,
  description text not null,
  scheduled_at timestamp with time zone,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  work_performed text,
  materials_used text,
  time_spent numeric, -- hours
  issues_found text,
  recommendations text,
  customer_signature boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Work order items table (for detailed billing)
create table public.work_order_items (
  id uuid primary key default uuid_generate_v4(),
  work_order_id uuid references public.work_orders(id) on delete cascade not null,
  description text not null,
  quantity numeric not null default 1,
  unit_price numeric not null default 0,
  total_price numeric generated always as (quantity * unit_price) stored,
  completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Photos table
create table public.photos (
  id uuid primary key default uuid_generate_v4(),
  work_order_id uuid references public.work_orders(id) on delete cascade not null,
  file_path text not null,
  file_name text,
  file_size integer,
  mime_type text,
  description text,
  taken_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Invoices table
create table public.invoices (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references public.organizations(id) on delete cascade not null,
  work_order_id uuid references public.work_orders(id) on delete set null,
  invoice_number text not null,
  status invoice_status not null default 'draft',
  amount numeric not null default 0,
  tax_amount numeric not null default 0,
  total_amount numeric generated always as (amount + tax_amount) stored,
  due_date date,
  paid_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Subscriptions table (for recurring services)
create table public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references public.organizations(id) on delete cascade not null,
  property_id uuid references public.properties(id) on delete cascade not null,
  service work_order_service not null,
  status subscription_status not null default 'active',
  frequency_months integer not null default 6, -- every 6 months
  next_service_date date,
  price_per_service numeric,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Audit log table
create table public.audit_log (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references public.organizations(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete set null,
  table_name text not null,
  record_id uuid not null,
  action text not null, -- INSERT, UPDATE, DELETE
  old_values jsonb,
  new_values jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Helper function to get current user's org_id
create or replace function public.current_org_id()
returns uuid language sql stable as $$
  select org_id from public.profiles where id = auth.uid()
$$;

-- Row Level Security (RLS) policies
alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.windows enable row level security;
alter table public.work_orders enable row level security;
alter table public.work_order_items enable row level security;
alter table public.photos enable row level security;
alter table public.invoices enable row level security;
alter table public.subscriptions enable row level security;
alter table public.audit_log enable row level security;

-- Organizations policies
create policy "Users can view their own organization" on public.organizations
  for select using (id = current_org_id());

create policy "Admins can update their organization" on public.organizations
  for update using (
    id = current_org_id() and 
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Profiles policies
create policy "Users can view profiles in their org" on public.profiles
  for select using (org_id = current_org_id());

create policy "Users can update their own profile" on public.profiles
  for update using (id = auth.uid());

create policy "Admins can insert profiles in their org" on public.profiles
  for insert with check (org_id = current_org_id() and 
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update profiles in their org" on public.profiles
  for update using (
    org_id = current_org_id() and 
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Properties policies
create policy "Users can view properties in their org" on public.properties
  for select using (org_id = current_org_id());

create policy "Customers and admins can manage properties" on public.properties
  for all using (
    org_id = current_org_id() and 
    exists (select 1 from public.profiles where id = auth.uid() and role in ('customer', 'admin'))
  );

-- Windows policies
create policy "Users can view windows in their org" on public.windows
  for select using (
    exists (select 1 from public.properties where id = windows.property_id and org_id = current_org_id())
  );

create policy "Customers and admins can manage windows" on public.windows
  for all using (
    exists (
      select 1 from public.properties p 
      join public.profiles pr on pr.org_id = p.org_id 
      where p.id = windows.property_id and pr.id = auth.uid() and pr.role in ('customer', 'admin')
    )
  );

-- Work orders policies
create policy "Users can view work orders in their org" on public.work_orders
  for select using (org_id = current_org_id());

create policy "Customers can create work orders" on public.work_orders
  for insert with check (
    org_id = current_org_id() and 
    exists (select 1 from public.profiles where id = auth.uid() and role = 'customer')
  );

create policy "Staff can update work orders" on public.work_orders
  for update using (
    org_id = current_org_id() and 
    exists (select 1 from public.profiles where id = auth.uid() and role in ('dispatcher', 'technician', 'admin'))
  );

-- Work order items policies
create policy "Users can view work order items in their org" on public.work_order_items
  for select using (
    exists (select 1 from public.work_orders wo where wo.id = work_order_items.work_order_id and wo.org_id = current_org_id())
  );

create policy "Technicians can manage work order items" on public.work_order_items
  for all using (
    exists (
      select 1 from public.work_orders wo 
      join public.profiles p on p.id = auth.uid()
      where wo.id = work_order_items.work_order_id and wo.org_id = current_org_id() 
      and (wo.assigned_to = auth.uid() or p.role in ('dispatcher', 'admin'))
    )
  );

-- Photos policies
create policy "Users can view photos in their org" on public.photos
  for select using (
    exists (select 1 from public.work_orders wo where wo.id = photos.work_order_id and wo.org_id = current_org_id())
  );

create policy "Technicians can manage photos" on public.photos
  for all using (
    exists (
      select 1 from public.work_orders wo 
      join public.profiles p on p.id = auth.uid()
      where wo.id = photos.work_order_id and wo.org_id = current_org_id() 
      and (wo.assigned_to = auth.uid() or p.role in ('dispatcher', 'admin'))
    )
  );

-- Invoices policies
create policy "Users can view invoices in their org" on public.invoices
  for select using (org_id = current_org_id());

create policy "Admins can manage invoices" on public.invoices
  for all using (
    org_id = current_org_id() and 
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Subscriptions policies
create policy "Users can view subscriptions in their org" on public.subscriptions
  for select using (org_id = current_org_id());

create policy "Customers and admins can manage subscriptions" on public.subscriptions
  for all using (
    org_id = current_org_id() and 
    exists (select 1 from public.profiles where id = auth.uid() and role in ('customer', 'admin'))
  );

-- Audit log policies
create policy "Admins can view audit log" on public.audit_log
  for select using (
    org_id = current_org_id() and 
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Triggers for updated_at timestamps
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

create trigger handle_updated_at before update on public.organizations
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.properties
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.windows
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.work_orders
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.work_order_items
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.invoices
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.subscriptions
  for each row execute procedure public.handle_updated_at();

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end; $$;

-- Trigger for new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Audit log trigger function
create or replace function public.handle_audit_log()
returns trigger language plpgsql security definer as $$
declare
  org_id_val uuid;
begin
  -- Get org_id for the current user
  select current_org_id() into org_id_val;
  
  if org_id_val is not null then
    insert into public.audit_log (org_id, user_id, table_name, record_id, action, old_values, new_values)
    values (
      org_id_val,
      auth.uid(),
      TG_TABLE_NAME,
      coalesce(new.id, old.id),
      TG_OP,
      case when TG_OP = 'DELETE' then to_jsonb(old) else null end,
      case when TG_OP in ('INSERT', 'UPDATE') then to_jsonb(new) else null end
    );
  end if;
  
  return coalesce(new, old);
end;
$$;

-- Create audit triggers for key tables
create trigger audit_work_orders after insert or update or delete on public.work_orders
  for each row execute procedure public.handle_audit_log();

create trigger audit_properties after insert or update or delete on public.properties
  for each row execute procedure public.handle_audit_log();

create trigger audit_profiles after insert or update or delete on public.profiles
  for each row execute procedure public.handle_audit_log();

-- Storage bucket for work order photos
insert into storage.buckets (id, name, public) values ('workorder-photos', 'workorder-photos', false);

-- Storage policies
create policy "Users can view photos in their org" on storage.objects
  for select using (
    bucket_id = 'workorder-photos' and
    exists (
      select 1 from public.photos p
      join public.work_orders wo on wo.id = p.work_order_id
      where p.file_path = name and wo.org_id = current_org_id()
    )
  );

create policy "Authenticated users can upload photos" on storage.objects
  for insert with check (
    bucket_id = 'workorder-photos' and
    auth.role() = 'authenticated'
  );

create policy "Users can update their org photos" on storage.objects
  for update using (
    bucket_id = 'workorder-photos' and
    exists (
      select 1 from public.photos p
      join public.work_orders wo on wo.id = p.work_order_id
      where p.file_path = name and wo.org_id = current_org_id()
    )
  );

create policy "Users can delete their org photos" on storage.objects
  for delete using (
    bucket_id = 'workorder-photos' and
    exists (
      select 1 from public.photos p
      join public.work_orders wo on wo.id = p.work_order_id
      where p.file_path = name and wo.org_id = current_org_id()
    )
  );
