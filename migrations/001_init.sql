create table if not exists bot_meta (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);
insert into bot_meta (key, value)
values ('schema_created_by', 'sigma-jarvis') on conflict (key) do nothing;
