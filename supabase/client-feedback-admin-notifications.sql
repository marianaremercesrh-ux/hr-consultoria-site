-- Migração incremental: acompanhamento administrativo dos feedbacks do cliente.
-- Não altera candidaturas, etapas, vagas públicas ou policies administrativas existentes.

alter table public.feedbacks_cliente
  add column if not exists lido_em timestamptz,
  add column if not exists lido_por uuid references auth.users(id) on delete set null,
  add column if not exists status_atendimento text not null default 'pendente',
  add column if not exists atendimento_iniciado_em timestamptz,
  add column if not exists concluido_em timestamptz,
  add column if not exists tratado_por uuid references auth.users(id) on delete set null;

alter table public.feedbacks_cliente drop constraint if exists feedbacks_cliente_status_atendimento_check;
alter table public.feedbacks_cliente add constraint feedbacks_cliente_status_atendimento_check
  check (status_atendimento in ('pendente','em_andamento','concluido'));

-- O default aplicado pela coluna nova inclui feedbacks anteriores como pendentes.
-- Como lido_em e lido_por nascem nulos, eles entram na fila como não lidos.
-- Não há UPDATE de normalização: uma reaplicação não reabre itens concluídos.

create index if not exists feedbacks_cliente_admin_queue_idx
  on public.feedbacks_cliente(status_atendimento, lido_em, updated_at desc);

create or replace function public.portal_submit_client_feedback(
  p_candidatura_id uuid,
  p_decisao text,
  p_comentario text default null
)
returns uuid
language plpgsql
security definer
set search_path=public
as $$
declare
  v_user_id uuid := auth.uid();
  v_empresa_id uuid;
  v_feedback_id uuid;
begin
  if v_user_id is null then raise exception 'Autenticação necessária' using errcode='42501'; end if;
  if p_decisao not in ('quero_entrevistar','aprovado_empresa','nao_aprovado','solicitar_informacoes') then
    raise exception 'Decisão inválida' using errcode='22023';
  end if;
  if char_length(coalesce(p_comentario,'')) > 2000 then
    raise exception 'O comentário deve ter no máximo 2.000 caracteres' using errcode='22023';
  end if;

  select v.empresa_id into v_empresa_id
  from public.candidaturas ca
  join public.vagas v on v.id=ca.vaga_id
  join public.empresa_usuarios eu on eu.empresa_id=v.empresa_id
  where ca.id=p_candidatura_id and ca.portal_liberado
    and eu.user_id=v_user_id and eu.ativo
  limit 1;

  if v_empresa_id is null then raise exception 'Candidatura não autorizada' using errcode='42501'; end if;

  insert into public.feedbacks_cliente
    (candidatura_id,empresa_id,user_id,decisao,comentario,status_atendimento,lido_em,lido_por,atendimento_iniciado_em,concluido_em,tratado_por,updated_at)
  values
    (p_candidatura_id,v_empresa_id,v_user_id,p_decisao,nullif(btrim(p_comentario),''),'pendente',null,null,null,null,null,now())
  on conflict (candidatura_id,empresa_id) do update set
    user_id=excluded.user_id,
    decisao=excluded.decisao,
    comentario=excluded.comentario,
    status_atendimento='pendente',
    lido_em=null,
    lido_por=null,
    atendimento_iniciado_em=null,
    concluido_em=null,
    tratado_por=null,
    updated_at=now()
  returning id into v_feedback_id;

  return v_feedback_id;
end;
$$;

revoke all on function public.portal_submit_client_feedback(uuid,text,text) from public;
revoke all on function public.portal_submit_client_feedback(uuid,text,text) from anon;
grant execute on function public.portal_submit_client_feedback(uuid,text,text) to authenticated;

create or replace function public.portal_list_client_feedbacks(
  p_candidatura_ids uuid[]
)
returns table (
  id uuid,
  candidatura_id uuid,
  decisao text,
  comentario text,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path=public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Autenticação necessária' using errcode='42501';
  end if;

  if coalesce(cardinality(p_candidatura_ids),0)=0 then
    return;
  end if;

  return query
  select
    f.id,
    f.candidatura_id,
    f.decisao,
    f.comentario,
    f.created_at,
    f.updated_at
  from public.feedbacks_cliente f
  join public.candidaturas ca on ca.id=f.candidatura_id
  join public.vagas v on v.id=ca.vaga_id
  where f.candidatura_id=any(p_candidatura_ids)
    and ca.portal_liberado
    and f.empresa_id=v.empresa_id
    and exists (
      select 1
      from public.empresa_usuarios eu
      where eu.empresa_id=v.empresa_id
        and eu.user_id=v_user_id
        and eu.ativo
    )
  order by f.updated_at desc;
end;
$$;

revoke all on function public.portal_list_client_feedbacks(uuid[]) from public;
revoke all on function public.portal_list_client_feedbacks(uuid[]) from anon;
grant execute on function public.portal_list_client_feedbacks(uuid[]) to authenticated;

-- O cliente lê e escreve somente pelas RPCs com projeção e autorização controladas.
drop policy if exists client_read_feedbacks on public.feedbacks_cliente;
drop policy if exists client_insert_feedbacks on public.feedbacks_cliente;
drop policy if exists client_update_feedbacks on public.feedbacks_cliente;

notify pgrst, 'reload schema';
