-- Applied as year2_tile_writing_progress through Supabase migration tooling.
create table public.y2_tile_writing_progress (
 student_id uuid not null references public.students(id),
 question_key text not null check (question_key ~ '^[123]-(8|9|10)-[0-6]$'),
 answer text not null default '',
 score integer not null default 0 check (score between 0 and 200),
 feedback jsonb not null default '{}'::jsonb,
 updated_at timestamptz not null default now(),
 primary key(student_id,question_key)
);
alter table public.y2_tile_writing_progress enable row level security;
revoke all on public.y2_tile_writing_progress from anon,authenticated;
grant all on public.y2_tile_writing_progress to service_role;
