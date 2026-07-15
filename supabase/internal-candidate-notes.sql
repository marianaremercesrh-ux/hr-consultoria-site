-- Migração incremental: observações internas de candidatos.
-- Não executar novamente os módulos antigos para aplicar esta funcionalidade.

create extension if not exists pgcrypto;

create table if not exists public.observacoes_internas (
  id uuid primary key default gen_random_uuid(),
  candidato_id uuid not null references public.candidatos(id) on delete cascade,
  usuario_id uuid references auth.users(id) on delete set null,
  texto text not null,
  created_at timestamptz not null default now()
);

create index if not exists observacoes_internas_candidato_created_at_idx
  on public.observacoes_internas (candidato_id, created_at desc);

alter table public.observacoes_internas enable row level security;

revoke all on table public.observacoes_internas from public;
revoke all on table public.observacoes_internas from anon;
revoke all on table public.observacoes_internas from authenticated;

grant select, insert on table public.observacoes_internas to authenticated;

drop policy if exists internal_notes_admin_select
  on public.observacoes_internas;

create policy internal_notes_admin_select
  on public.observacoes_internas
  for select
  to authenticated
  using (public.portal_is_admin());

drop policy if exists internal_notes_admin_insert
  on public.observacoes_internas;

create policy internal_notes_admin_insert
  on public.observacoes_internas
  for insert
  to authenticated
  with check (
    public.portal_is_admin()
    and usuario_id = auth.uid()
  );

notify pgrst, 'reload schema';
