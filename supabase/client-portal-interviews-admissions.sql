-- Migração incremental: acompanhamento compartilhável de entrevistas e admissões.
-- Não executa o módulo antigo, não altera vagas públicas e não modifica policies administrativas.

alter table public.candidaturas
  add column if not exists data_admissao date;

-- O default 'interna' classifica entrevistas existentes sem alterar nenhum outro dado.
alter table public.entrevistas
  add column if not exists candidatura_id uuid references public.candidaturas(id) on delete cascade,
  add column if not exists tipo_entrevista text not null default 'interna',
  add column if not exists modalidade text,
  add column if not exists observacoes_cliente text;

alter table public.entrevistas
  drop constraint if exists entrevistas_tipo_entrevista_check;
alter table public.entrevistas
  add constraint entrevistas_tipo_entrevista_check
  check (tipo_entrevista in ('interna', 'cliente'));

-- Preserva cancelada, confirmada e realizada e acrescenta somente os estados necessários.
alter table public.entrevistas
  drop constraint if exists entrevistas_status_check;
alter table public.entrevistas
  add constraint entrevistas_status_check
  check (status in (
    'solicitada', 'agendada', 'confirmada', 'realizada',
    'reagendada', 'cancelada', 'nao_compareceu'
  ));

alter table public.entrevistas
  drop constraint if exists entrevistas_modalidade_check;
alter table public.entrevistas
  add constraint entrevistas_modalidade_check
  check (modalidade is null or modalidade in ('presencial', 'online'));

create index if not exists entrevistas_candidatura_tipo_idx
  on public.entrevistas(candidatura_id, tipo_entrevista, updated_at desc);
create index if not exists candidaturas_portal_atualizacoes_idx
  on public.candidaturas(vaga_id, updated_at desc)
  where portal_liberado;
create unique index if not exists entrevistas_cliente_candidatura_unique
  on public.entrevistas(candidatura_id)
  where tipo_entrevista = 'cliente' and candidatura_id is not null;

-- Remove somente as policies de leitura direta pertencentes ao Portal do Cliente.
-- As policies administrativas existentes não são alteradas.
drop policy if exists client_read_released_entrevistas on public.entrevistas;
drop policy if exists client_read_released_candidaturas on public.candidaturas;
drop policy if exists client_read_released_candidatos on public.candidatos;

create or replace function public.portal_list_client_applications(p_job_ids bigint[])
returns table (
  id uuid,
  candidato_id uuid,
  vaga_id bigint,
  etapa text,
  portal_liberado boolean,
  portal_liberado_em timestamptz,
  resumo_cliente text,
  pontos_positivos_cliente text,
  pontos_atencao_cliente text,
  curriculo_liberado boolean,
  data_admissao date,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select ca.id, ca.candidato_id, ca.vaga_id, ca.etapa, ca.portal_liberado,
    ca.portal_liberado_em, ca.resumo_cliente, ca.pontos_positivos_cliente,
    ca.pontos_atencao_cliente, ca.curriculo_liberado, ca.data_admissao,
    ca.created_at, ca.updated_at
  from public.candidaturas ca
  where ca.portal_liberado
    and ca.vaga_id = any(coalesce(p_job_ids, array[]::bigint[]))
    and public.portal_can_view_application(ca.id)
  order by ca.updated_at desc;
$$;

create or replace function public.portal_list_client_candidates(p_candidate_ids uuid[])
returns table (
  id uuid,
  nome text,
  cidade text,
  estado text,
  curriculo_url text,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select c.id, c.nome, c.cidade, c.estado,
    case when bool_or(ca.curriculo_liberado) then c.curriculo_url else null end,
    c.created_at, c.updated_at
  from public.candidatos c
  join public.candidaturas ca on ca.candidato_id = c.id
  where c.id = any(coalesce(p_candidate_ids, array[]::uuid[]))
    and ca.portal_liberado
    and public.portal_can_view_application(ca.id)
  group by c.id, c.nome, c.cidade, c.estado, c.curriculo_url, c.created_at, c.updated_at;
$$;

create or replace function public.portal_list_client_interviews(p_job_ids bigint[])
returns table (
  id uuid,
  candidatura_id uuid,
  tipo_entrevista text,
  modalidade text,
  data date,
  horario time,
  local text,
  status text,
  observacoes_cliente text,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select e.id, e.candidatura_id, e.tipo_entrevista, e.modalidade,
    e.data, e.horario, e.local, e.status, e.observacoes_cliente, e.updated_at
  from public.entrevistas e
  join public.candidaturas ca on ca.id = e.candidatura_id
  where e.tipo_entrevista = 'cliente'
    and ca.portal_liberado
    and ca.vaga_id = any(coalesce(p_job_ids, array[]::bigint[]))
    and public.portal_can_view_application(ca.id)
  order by e.updated_at desc;
$$;

revoke all on function public.portal_list_client_applications(bigint[]) from public;
revoke all on function public.portal_list_client_candidates(uuid[]) from public;
revoke all on function public.portal_list_client_interviews(bigint[]) from public;
grant execute on function public.portal_list_client_applications(bigint[]) to authenticated;
grant execute on function public.portal_list_client_candidates(uuid[]) to authenticated;
grant execute on function public.portal_list_client_interviews(bigint[]) to authenticated;

revoke all on table public.entrevistas, public.candidaturas, public.candidatos from anon;

-- Autorização booleana para leitura privada de currículo pelo Storage.
-- Não retorna dados da candidatura e não depende de SELECT do cliente na tabela base.
create or replace function public.portal_can_view_released_resume(p_candidate_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null and exists (
    select 1
    from public.candidaturas ca
    join public.vagas v on v.id = ca.vaga_id
    join public.empresa_usuarios eu on eu.empresa_id = v.empresa_id
    where ca.candidato_id = p_candidate_id
      and ca.portal_liberado
      and ca.curriculo_liberado
      and eu.user_id = auth.uid()
      and eu.ativo
  );
$$;

revoke all on function public.portal_can_view_released_resume(uuid) from public;
revoke all on function public.portal_can_view_released_resume(uuid) from anon;
grant execute on function public.portal_can_view_released_resume(uuid) to authenticated;

-- Substitui exclusivamente a policy de currículo do cliente.
-- admin_manage_private_files permanece inalterada.
drop policy if exists client_read_released_resumes on storage.objects;
create policy client_read_released_resumes
on storage.objects
for select
to authenticated
using (
  bucket_id = 'curriculos'
  and case
    when (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    then public.portal_can_view_released_resume(((storage.foldername(name))[1])::uuid)
    else false
  end
);

notify pgrst, 'reload schema';
