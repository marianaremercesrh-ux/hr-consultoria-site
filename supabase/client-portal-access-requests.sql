-- Solicitações públicas controladas de acesso ao Portal do Cliente.
-- Migração incremental: pressupõe o Portal do Cliente já instalado e não reaplica o módulo antigo.

create table if not exists public.solicitacoes_acesso_cliente (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  empresa_informada text not null,
  cnpj_informado text,
  cargo text not null,
  telefone text not null,
  email text not null,
  status text not null default 'pendente' check (status in ('pendente','aprovada','recusada','cancelada')),
  empresa_id uuid references public.empresas(id) on delete set null,
  motivo_recusa text,
  analisado_por uuid references auth.users(id) on delete set null,
  analisado_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists solicitacoes_acesso_cliente_pendente_usuario_idx
  on public.solicitacoes_acesso_cliente(usuario_id) where status='pendente';
create index if not exists solicitacoes_acesso_cliente_status_idx
  on public.solicitacoes_acesso_cliente(status, created_at desc);

alter table public.solicitacoes_acesso_cliente enable row level security;

drop policy if exists client_read_own_access_requests on public.solicitacoes_acesso_cliente;
create policy client_read_own_access_requests on public.solicitacoes_acesso_cliente
  for select to authenticated using (usuario_id=auth.uid());

drop policy if exists client_create_own_access_request on public.solicitacoes_acesso_cliente;
create policy client_create_own_access_request on public.solicitacoes_acesso_cliente
  for insert to authenticated with check (
    usuario_id=auth.uid() and status='pendente' and empresa_id is null
    and analisado_por is null and analisado_em is null and motivo_recusa is null
    and email=lower(btrim(email)) and email=lower(coalesce(auth.jwt()->>'email',''))
  );

drop policy if exists admin_read_client_access_requests on public.solicitacoes_acesso_cliente;
create policy admin_read_client_access_requests on public.solicitacoes_acesso_cliente
  for select to authenticated using (public.portal_is_admin());

-- Permite ao cliente identificar que seu próprio vínculo foi desativado, sem liberar dados da empresa.
drop policy if exists client_read_all_own_company_links on public.empresa_usuarios;
create policy client_read_all_own_company_links on public.empresa_usuarios
  for select to authenticated using (user_id=auth.uid());

revoke all on table public.solicitacoes_acesso_cliente from anon;
revoke all on table public.solicitacoes_acesso_cliente from authenticated;
grant select, insert on table public.solicitacoes_acesso_cliente to authenticated;

-- Cria a solicitação junto com auth.signUp mesmo quando confirmação de e-mail está habilitada
-- e o cadastro ainda não devolve uma sessão autenticada.
create or replace function public.create_client_access_request_from_signup()
returns trigger language plpgsql security definer set search_path=public
as $$
declare m jsonb := coalesce(new.raw_user_meta_data,'{}'::jsonb);
begin
  if coalesce(m->>'access_request','false') <> 'true' then return new; end if;
  if nullif(btrim(m->>'nome'),'') is null or nullif(btrim(m->>'empresa_informada'),'') is null
     or nullif(btrim(m->>'cargo'),'') is null or nullif(btrim(m->>'telefone'),'') is null then
    raise exception 'Dados obrigatórios da solicitação de acesso não informados.';
  end if;
  insert into public.solicitacoes_acesso_cliente
    (usuario_id,nome,empresa_informada,cnpj_informado,cargo,telefone,email,status)
  values
    (new.id,btrim(m->>'nome'),btrim(m->>'empresa_informada'),nullif(regexp_replace(coalesce(m->>'cnpj_informado',''),'\D','','g'),''),
     btrim(m->>'cargo'),btrim(m->>'telefone'),lower(btrim(new.email)),'pendente')
  on conflict do nothing;
  return new;
end $$;

drop trigger if exists create_client_access_request_after_signup on auth.users;
create trigger create_client_access_request_after_signup
  after insert on auth.users for each row execute function public.create_client_access_request_from_signup();

revoke all on function public.create_client_access_request_from_signup() from public, anon, authenticated;

create or replace function public.approve_client_access_request(request_id uuid, company_id uuid)
returns public.solicitacoes_acesso_cliente language plpgsql security definer set search_path=public
as $$
declare r public.solicitacoes_acesso_cliente;
begin
  if not public.portal_is_admin() then raise exception 'Acesso administrativo necessário' using errcode='42501'; end if;
  if company_id is null or not exists(select 1 from public.empresas where id=company_id) then raise exception 'Empresa inválida'; end if;
  select * into r from public.solicitacoes_acesso_cliente where id=request_id for update;
  if not found then raise exception 'Solicitação não encontrada'; end if;
  if r.status <> 'pendente' then raise exception 'Solicitação já analisada'; end if;
  insert into public.empresa_usuarios(empresa_id,user_id,nome,email,ativo,updated_at)
  values(company_id,r.usuario_id,r.nome,r.email,true,now())
  on conflict(empresa_id,user_id) do update set nome=excluded.nome,email=excluded.email,ativo=true,updated_at=now();
  update public.solicitacoes_acesso_cliente set status='aprovada',empresa_id=company_id,motivo_recusa=null,
    analisado_por=auth.uid(),analisado_em=now(),updated_at=now() where id=request_id returning * into r;
  return r;
end $$;

create or replace function public.reject_client_access_request(request_id uuid, reason text)
returns public.solicitacoes_acesso_cliente language plpgsql security definer set search_path=public
as $$
declare r public.solicitacoes_acesso_cliente;
begin
  if not public.portal_is_admin() then raise exception 'Acesso administrativo necessário' using errcode='42501'; end if;
  select * into r from public.solicitacoes_acesso_cliente where id=request_id for update;
  if not found then raise exception 'Solicitação não encontrada'; end if;
  if r.status <> 'pendente' then raise exception 'Solicitação já analisada'; end if;
  update public.solicitacoes_acesso_cliente set status='recusada',empresa_id=null,motivo_recusa=nullif(btrim(reason),''),
    analisado_por=auth.uid(),analisado_em=now(),updated_at=now() where id=request_id returning * into r;
  return r;
end $$;

revoke all on function public.approve_client_access_request(uuid,uuid), public.reject_client_access_request(uuid,text) from public, anon;
grant execute on function public.approve_client_access_request(uuid,uuid), public.reject_client_access_request(uuid,text) to authenticated;

notify pgrst, 'reload schema';
