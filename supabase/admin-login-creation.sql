-- Fluxo seguro para recrutadores autorizados criarem ou definirem a senha do login.
-- Execute depois de criar a tabela public.perfis_usuarios e configurar o Supabase Auth.

create table if not exists public.admin_login_creation_challenges (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts integer not null default 0,
  code_used_at timestamptz,
  verification_token_hash text,
  verification_expires_at timestamptz,
  password_set_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists admin_login_creation_challenges_email_idx
  on public.admin_login_creation_challenges(lower(email), created_at desc);

alter table public.admin_login_creation_challenges enable row level security;
revoke all on table public.admin_login_creation_challenges from anon, authenticated;

-- Somente as Edge Functions, via service role, acessam essa tabela.
notify pgrst, 'reload schema';
