create extension if not exists pgcrypto;

create table if not exists public.candidatos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  telefone text,
  cidade text,
  estado text,
  linkedin text,
  observacoes text,
  curriculo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.candidaturas (
  id uuid primary key default gen_random_uuid(),
  candidato_id uuid not null references public.candidatos(id) on delete cascade,
  vaga_id bigint references public.vagas(id) on delete set null,
  etapa text not null default 'novo' check (etapa in (
    'novo', 'triagem', 'entrevista_agendada', 'entrevista_reagendada',
    'nao_compareceu', 'entrevista_cancelada', 'entrevistado',
    'encaminhado_cliente', 'aprovado', 'reprovado', 'desistente', 'banco_talentos'
  )),
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists candidatos_nome_idx on public.candidatos (nome);
create index if not exists candidatos_cidade_idx on public.candidatos (cidade);
create index if not exists candidaturas_candidato_id_idx on public.candidaturas (candidato_id);
create index if not exists candidaturas_vaga_id_idx on public.candidaturas (vaga_id);
create index if not exists candidaturas_etapa_idx on public.candidaturas (etapa);

alter table public.candidatos enable row level security;
alter table public.candidaturas enable row level security;

revoke all on table public.candidatos from anon;
revoke all on table public.candidaturas from anon;
grant select, insert, update, delete on table public.candidatos to authenticated;
grant select, insert, update, delete on table public.candidaturas to authenticated;

drop policy if exists "authenticated_manage_candidates" on public.candidatos;
create policy "authenticated_manage_candidates"
on public.candidatos for all to authenticated
using ((select auth.uid()) is not null)
with check ((select auth.uid()) is not null);

drop policy if exists "authenticated_manage_applications" on public.candidaturas;
create policy "authenticated_manage_applications"
on public.candidaturas for all to authenticated
using ((select auth.uid()) is not null)
with check ((select auth.uid()) is not null);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'curriculos',
  'curriculos',
  false,
  10485760,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "authenticated_read_resumes" on storage.objects;
create policy "authenticated_read_resumes"
on storage.objects for select to authenticated
using (bucket_id = 'curriculos' and (select auth.uid()) is not null);

drop policy if exists "authenticated_upload_resumes" on storage.objects;
create policy "authenticated_upload_resumes"
on storage.objects for insert to authenticated
with check (bucket_id = 'curriculos' and (select auth.uid()) is not null);

drop policy if exists "authenticated_update_resumes" on storage.objects;
create policy "authenticated_update_resumes"
on storage.objects for update to authenticated
using (bucket_id = 'curriculos' and (select auth.uid()) is not null)
with check (bucket_id = 'curriculos' and (select auth.uid()) is not null);

drop policy if exists "authenticated_delete_resumes" on storage.objects;
create policy "authenticated_delete_resumes"
on storage.objects for delete to authenticated
using (bucket_id = 'curriculos' and (select auth.uid()) is not null);
