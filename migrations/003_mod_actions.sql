create table if not exists mod_actions (
  id int generated always as identity primary key,
  guild_id text not null,
  action text not null check (
    action in ('warn', 'timeout', 'kick', 'ban', 'purge')
  ),
  target_id text not null,
  moderator_id text not null,
  reason text,
  duration_seconds int check (
    duration_seconds is null
    or duration_seconds > 0
  ),
  created_at timestamptz not null default now()
);
create index if not exists mod_actions_target_idx on mod_actions (guild_id, target_id, created_at desc);