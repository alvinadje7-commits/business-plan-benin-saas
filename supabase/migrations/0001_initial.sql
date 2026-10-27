
-- EXTENSIONS
create extension if not exists "uuid-ossp";

-- PROFILES
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text, full_name text, phone text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

-- ORGANIZATIONS
create table organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type text check (type in ('entreprise','cabinet','banque','investisseur')),
  country text default 'BJ',
  currency text default 'XOF',
  created_at timestamptz default now()
);
create table organization_members (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  role text check (role in ('owner','consultant','analyste','invite')) not null,
  created_at timestamptz default now(),
  unique(organization_id,user_id)
);

-- SECTORS (config dynamique)
create table sectors (
  id uuid primary key default uuid_generate_v4(),
  sector_code text unique not null,
  sector_name text not null,
  definition jsonb not null,
  is_active boolean default true,
  created_at timestamptz default now()
);
create table sub_sectors (
  id uuid primary key default uuid_generate_v4(),
  sector_id uuid references sectors(id),
  code text not null, label text not null,
  config jsonb
);

-- PROJECTS
create table projects (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) on delete cascade,
  owner_id uuid references profiles(id),
  name text not null,
  sector_id uuid references sectors(id),
  sector_code text not null,
  sub_sector_code text,
  currency text default 'XOF',
  duration_months int default 36,
  start_date date default current_date,
  objective text,
  status text default 'brouillon',
  current_version_id uuid,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create table project_versions (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  version_number int not null,
  label text,
  is_current boolean default false,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);
create table project_assumptions (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  project_version_id uuid references project_versions(id) on delete cascade,
  sector_id uuid references sectors(id),
  key text not null,
  value jsonb not null,
  currency text default 'XOF',
  created_at timestamptz default now(), updated_at timestamptz default now(),
  unique(project_version_id,key)
);
create table investment_items (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  project_version_id uuid references project_versions(id) on delete cascade,
  label text not null, category text not null,
  amount numeric(18,2) not null,
  vat_rate numeric(5,2) default 0,
  depreciation_duration int not null,
  method text default 'lineaire',
  start_date date,
  residual_value numeric(18,2) default 0,
  scenario_id uuid,
  currency text default 'XOF',
  created_at timestamptz default now()
);
create table financing_sources (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  project_version_id uuid references project_versions(id) on delete cascade,
  type text not null,
  amount numeric(18,2) not null,
  interest_rate numeric(6,4) default 0,
  duration_months int default 0,
  defer_months int default 0,
  frequency text default 'mensuelle',
  scenario_id uuid,
  currency text default 'XOF',
  created_at timestamptz default now()
);
create table revenue_lines (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  project_version_id uuid references project_versions(id) on delete cascade,
  key text, label text, monthly_amounts numeric[] ,
  scenario_id uuid, currency text default 'XOF'
);
create table cost_lines (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  project_version_id uuid references project_versions(id) on delete cascade,
  key text, label text, type text, monthly_amounts numeric[],
  scenario_id uuid, currency text default 'XOF'
);
create table financial_results (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  project_version_id uuid references project_versions(id) on delete cascade,
  scenario_id uuid,
  sector_id uuid references sectors(id),
  result jsonb not null,
  currency text default 'XOF',
  created_at timestamptz default now()
);
create table scenarios (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  code text check (code in ('prudent','central','optimiste','personnalise')),
  adjustments jsonb,
  created_at timestamptz default now()
);
create table project_shares (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  token text unique not null,
  password_hash text,
  expires_at timestamptz,
  role text default 'lecture',
  created_at timestamptz default now()
);
create table project_activity_logs (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  user_id uuid references profiles(id),
  action text not null,
  details jsonb,
  created_at timestamptz default now()
);
create table exports (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  project_version_id uuid references project_versions(id) on delete cascade,
  type text check (type in ('pdf','excel')),
  url text,
  status text default 'pending',
  created_at timestamptz default now()
);
create table tax_parameters (
  id uuid primary key default uuid_generate_v4(),
  country text default 'BJ',
  vat_rate numeric(5,2) default 18,
  is_rate numeric(5,2) default 30,
  cnss_rate numeric(5,2) default 6.4,
  its_rate numeric(5,2) default 0,
  created_at timestamptz default now()
);

-- RLS
alter table profiles enable row level security;
alter table organizations enable row level security;
alter table organization_members enable row level security;
alter table projects enable row level security;
alter table project_versions enable row level security;
alter table project_assumptions enable row level security;
alter table investment_items enable row level security;
alter table financing_sources enable row level security;
alter table financial_results enable row level security;
alter table project_shares enable row level security;

-- Policies exemple (simplifié)
create policy "users can view own org" on organization_members for select using (auth.uid()=user_id);
create policy "members can view projects" on projects for select using (
  exists (select 1 from organization_members where organization_members.organization_id=projects.organization_id and organization_members.user_id=auth.uid())
);
create policy "owners can manage projects" on projects for all using (
  exists (select 1 from organization_members where organization_members.organization_id=projects.organization_id and organization_members.user_id=auth.uid() and organization_members.role='owner')
);
