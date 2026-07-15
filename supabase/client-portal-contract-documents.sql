-- Migração incremental: contratos privados liberados no Portal do Cliente.
-- Preserva contratos, arquivos, policies administrativas e o bucket privado existentes.

alter table public.contratos_clientes
  add column if not exists portal_liberado boolean not null default false,
  add column if not exists portal_liberado_em timestamptz,
  add column if not exists portal_liberado_por uuid references auth.users(id) on delete set null;

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='contratos_clientes' and column_name='status_contrato'
  ) then
    alter table public.contratos_clientes
      add column status_contrato text not null default 'pendente';
    update public.contratos_clientes
      set status_contrato=case
        when caminho_arquivo is null then 'pendente'
        when status_pagamento='cancelado' then 'cancelado'
        else 'vigente'
      end;
  end if;
end;
$$;

alter table public.contratos_clientes
  drop constraint if exists contratos_clientes_status_contrato_check;
alter table public.contratos_clientes
  add constraint contratos_clientes_status_contrato_check
  check (status_contrato in ('pendente','vigente','encerrado','cancelado'));

create index if not exists contratos_clientes_portal_idx
  on public.contratos_clientes(empresa_id, portal_liberado, contrato_data_upload desc);

create table if not exists public.portal_contratos_auditoria (
  id uuid primary key default gen_random_uuid(),
  contrato_id uuid not null references public.contratos_clientes(id) on delete cascade,
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  usuario_id uuid not null references auth.users(id) on delete cascade,
  acao text not null check (acao in ('visualizacao','download')),
  created_at timestamptz not null default now()
);

create index if not exists portal_contratos_auditoria_contrato_idx
  on public.portal_contratos_auditoria(contrato_id, created_at desc);

alter table public.portal_contratos_auditoria enable row level security;
revoke all on table public.portal_contratos_auditoria from anon;
revoke all on table public.portal_contratos_auditoria from authenticated;
grant select on table public.portal_contratos_auditoria to authenticated;

drop policy if exists admin_read_contract_portal_audit on public.portal_contratos_auditoria;
create policy admin_read_contract_portal_audit
on public.portal_contratos_auditoria
for select
to authenticated
using (public.portal_is_admin());

create or replace function public.portal_list_released_contracts(p_empresa_id uuid)
returns table (
  id uuid,
  nome text,
  nome_arquivo text,
  status text,
  data_envio timestamptz,
  data_validade date,
  caminho_arquivo text
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

  if not exists (
    select 1 from public.empresa_usuarios eu
    where eu.empresa_id=p_empresa_id and eu.user_id=v_user_id and eu.ativo
  ) then
    raise exception 'Empresa não autorizada' using errcode='42501';
  end if;

  return query
  select
    c.id,
    coalesce(nullif(btrim(c.nome_arquivo),''),'Contrato') as nome,
    c.nome_arquivo,
    c.status_contrato as status,
    coalesce(c.contrato_data_upload,c.created_at) as data_envio,
    null::date as data_validade,
    c.caminho_arquivo
  from public.contratos_clientes c
  where c.empresa_id=p_empresa_id
    and c.portal_liberado
    and c.caminho_arquivo is not null
  order by coalesce(c.contrato_data_upload,c.created_at) desc;
end;
$$;

create or replace function public.portal_can_view_released_contract(p_object_path text)
returns boolean
language sql
stable
security definer
set search_path=public
as $$
  select auth.uid() is not null and exists (
    select 1
    from public.contratos_clientes c
    join public.empresa_usuarios eu on eu.empresa_id=c.empresa_id
    where c.caminho_arquivo=p_object_path
      and c.portal_liberado
      and eu.user_id=auth.uid()
      and eu.ativo
  );
$$;

create or replace function public.portal_record_contract_access(
  p_contrato_id uuid,
  p_acao text
)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare
  v_user_id uuid := auth.uid();
  v_empresa_id uuid;
begin
  if v_user_id is null then
    raise exception 'Autenticação necessária' using errcode='42501';
  end if;
  if p_acao not in ('visualizacao','download') then
    raise exception 'Ação inválida' using errcode='22023';
  end if;

  select c.empresa_id into v_empresa_id
  from public.contratos_clientes c
  join public.empresa_usuarios eu on eu.empresa_id=c.empresa_id
  where c.id=p_contrato_id
    and c.portal_liberado
    and c.caminho_arquivo is not null
    and eu.user_id=v_user_id
    and eu.ativo
  limit 1;

  if v_empresa_id is null then
    raise exception 'Contrato não autorizado' using errcode='42501';
  end if;

  insert into public.portal_contratos_auditoria(contrato_id,empresa_id,usuario_id,acao)
  values(p_contrato_id,v_empresa_id,v_user_id,p_acao);
end;
$$;

revoke all on function public.portal_list_released_contracts(uuid) from public, anon;
revoke all on function public.portal_can_view_released_contract(text) from public, anon;
revoke all on function public.portal_record_contract_access(uuid,text) from public, anon;
grant execute on function public.portal_list_released_contracts(uuid) to authenticated;
grant execute on function public.portal_can_view_released_contract(text) to authenticated;
grant execute on function public.portal_record_contract_access(uuid,text) to authenticated;

-- Nenhuma leitura direta é concedida ao cliente. Remove somente policies desta funcionalidade, se existirem.
drop policy if exists client_read_released_contracts on public.contratos_clientes;
drop policy if exists client_read_contracts on public.contratos_clientes;

-- Mantém admin_manage_private_files e adiciona somente a leitura validada do contrato liberado.
drop policy if exists client_read_released_contract_files on storage.objects;
create policy client_read_released_contract_files
on storage.objects
for select
to authenticated
using (
  bucket_id='contratos-clientes'
  and public.portal_can_view_released_contract(name)
);

notify pgrst, 'reload schema';
