-- ============================================================
-- Question Paper Tracker — Supabase Schema
-- school_id day 1 se hi har table mein
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. schools
-- ============================================================
create table schools (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  created_at timestamptz default now()
);

-- Seed: Royal Global School
insert into schools (id, name, slug) values
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Royal Global School', 'royal-global-school');

-- ============================================================
-- 2. users (linked to Supabase Auth)
-- ============================================================
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  school_id uuid not null references schools(id),
  email text not null,
  role text not null default 'admin',
  created_at timestamptz default now()
);

-- ============================================================
-- 3. trackers (exam profiles: Half Yearly, Term II, etc.)
-- ============================================================
create table trackers (
  id uuid primary key default uuid_generate_v4(),
  school_id uuid not null references schools(id),
  name text not null,
  subtitle text default '',
  note_banner text default '',
  created_at timestamptz default now()
);

-- ============================================================
-- 4. classes (grades/groups within a tracker)
-- ============================================================
create table classes (
  id uuid primary key default uuid_generate_v4(),
  tracker_id uuid not null references trackers(id) on delete cascade,
  label text not null,
  track_items jsonb not null default '["qp","bp","ms","edited","proofread","corrected","final"]',
  sort_order int default 0,
  created_at timestamptz default now()
);

-- ============================================================
-- 5. exam_dates
-- ============================================================
create table exam_dates (
  id uuid primary key default uuid_generate_v4(),
  tracker_id uuid not null references trackers(id) on delete cascade,
  date date not null,
  day text not null,
  unique(tracker_id, date)
);

-- ============================================================
-- 6. subjects
-- ============================================================
create table subjects (
  id uuid primary key default uuid_generate_v4(),
  class_id uuid not null references classes(id) on delete cascade,
  name text not null,
  category text default 'Main Subject',
  exam_date date,
  contact text default '',
  sort_order int default 0,
  created_at timestamptz default now()
);

-- ============================================================
-- 7. paper_status (checklist per subject)
-- ============================================================
create table paper_status (
  id uuid primary key default uuid_generate_v4(),
  subject_id uuid not null references subjects(id) on delete cascade,
  item_type text not null,
  checked boolean default false,
  received_date date,
  updated_by uuid references users(id),
  updated_at timestamptz default now(),
  unique(subject_id, item_type)
);

-- ============================================================
-- Indexes
-- ============================================================
create index idx_users_school on users(school_id);
create index idx_trackers_school on trackers(school_id);
create index idx_classes_tracker on classes(tracker_id);
create index idx_exam_dates_tracker on exam_dates(tracker_id);
create index idx_subjects_class on subjects(class_id);
create index idx_subjects_exam_date on subjects(exam_date);
create index idx_paper_status_subject on paper_status(subject_id);

-- ============================================================
-- RLS Policies
-- ============================================================
alter table schools enable row level security;
alter table users enable row level security;
alter table trackers enable row level security;
alter table classes enable row level security;
alter table exam_dates enable row level security;
alter table subjects enable row level security;
alter table paper_status enable row level security;

-- Helper: get current user's school_id
create or replace function auth.user_school_id()
returns uuid as $$
  select school_id from users where id = auth.uid()
$$ language sql security definer stable;

-- schools: users can only read their own school
create policy "Users can read own school" on schools
  for select using (id = auth.user_school_id());

-- users: users can read/update their own row
create policy "Users can read own profile" on users
  for select using (id = auth.uid());

create policy "Users can update own profile" on users
  for update using (id = auth.uid());

-- trackers: full CRUD within school
create policy "School trackers access" on trackers
  for all using (school_id = auth.user_school_id());

-- classes: access via tracker's school
create policy "School classes access" on classes
  for all using (
    tracker_id in (select id from trackers where school_id = auth.user_school_id())
  );

-- exam_dates: access via tracker's school
create policy "School exam_dates access" on exam_dates
  for all using (
    tracker_id in (select id from trackers where school_id = auth.user_school_id())
  );

-- subjects: access via class -> tracker -> school
create policy "School subjects access" on subjects
  for all using (
    class_id in (
      select c.id from classes c
      join trackers t on c.tracker_id = t.id
      where t.school_id = auth.user_school_id()
    )
  );

-- paper_status: access via subject -> class -> tracker -> school
create policy "School paper_status access" on paper_status
  for all using (
    subject_id in (
      select s.id from subjects s
      join classes c on s.class_id = c.id
      join trackers t on c.tracker_id = t.id
      where t.school_id = auth.user_school_id()
    )
  );

-- ============================================================
-- Trigger: auto-update updated_at on paper_status
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger paper_status_updated_at
  before update on paper_status
  for each row execute function update_updated_at();
