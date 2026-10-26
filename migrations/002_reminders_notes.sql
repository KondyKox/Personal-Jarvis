create table if not exists reminders (
  id int generated always as identity primary key,
  user_id text not null,
  channel_id text not null,
  text text not null,
  due_at timestamptz not null,
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists reminders_pending_due_idx on reminders (due_at)
where delivered_at is null;
create table if not exists notes (
  id int generated always as identity primary key,
  user_id text not null,
  content text not null,
  created_at timestamptz not null default now()
);
