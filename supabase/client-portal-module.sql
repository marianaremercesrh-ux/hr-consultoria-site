-- Portal do Cliente — migração aditiva e não destrutiva.
-- PRÉ-REQUISITOS, nesta ordem:
-- 1. client-portal-foundation.sql
-- 2. client-portal-bootstrap-admin.sql
create extension if not exists pgcrypto;

do $$ begin
  if not exists (select 1 from public.perfis_usuarios where perfil = 'administrador') then
    raise exception 'Portal não aplicado: cadastre ao menos um administrador em public.perfis_usuarios antes desta migração.';
  end if;
end $$;

alter table public.vagas add column if not exists empresa_id uuid references public.empresas(id) on delete set null;
create index if not exists vagas_empresa_id_idx on public.vagas(empresa_id);

-- Vincula automaticamente apenas nomes com uma única correspondência inequívoca.
with nomes_unicos as (
  select lower(btrim(nome)) nome_normalizado, min(id::text)::uuid empresa_id
  from public.empresas where nullif(btrim(nome),'') is not null
  group by lower(btrim(nome)) having count(*) = 1
)
update public.vagas v set empresa_id = n.empresa_id
from nomes_unicos n
where v.empresa_id is null and lower(btrim(v.empresa)) = n.nome_normalizado;

create table if not exists public.empresa_usuarios (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  email text not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (empresa_id, user_id)
);
create index if not exists empresa_usuarios_user_idx on public.empresa_usuarios(user_id) where ativo;
create index if not exists empresa_usuarios_empresa_idx on public.empresa_usuarios(empresa_id) where ativo;

alter table public.candidaturas add column if not exists portal_liberado boolean not null default false;
alter table public.candidaturas add column if not exists portal_liberado_em timestamptz;
alter table public.candidaturas add column if not exists portal_liberado_por uuid references auth.users(id) on delete set null;
alter table public.candidaturas add column if not exists resumo_cliente text;
alter table public.candidaturas add column if not exists pontos_positivos_cliente text;
alter table public.candidaturas add column if not exists pontos_atencao_cliente text;
alter table public.candidaturas add column if not exists curriculo_liberado boolean not null default false;
create index if not exists candidaturas_portal_idx on public.candidaturas(vaga_id, portal_liberado) where portal_liberado;

create table if not exists public.feedbacks_cliente (
  id uuid primary key default gen_random_uuid(),
  candidatura_id uuid not null references public.candidaturas(id) on delete cascade,
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete restrict,
  decisao text not null check (decisao in ('quero_entrevistar','aprovado_empresa','nao_aprovado','solicitar_informacoes')),
  comentario text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (candidatura_id, empresa_id)
);
create index if not exists feedbacks_cliente_empresa_idx on public.feedbacks_cliente(empresa_id, updated_at desc);
create index if not exists feedbacks_cliente_candidatura_idx on public.feedbacks_cliente(candidatura_id);

create or replace function public.portal_is_admin() returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.perfis_usuarios p where p.usuario_id=auth.uid() and p.perfil in ('administrador','recrutador')) $$;
create or replace function public.portal_has_company(company_id uuid) returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.empresa_usuarios eu where eu.user_id=auth.uid() and eu.empresa_id=company_id and eu.ativo) $$;
create or replace function public.portal_can_view_application(application_id uuid) returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.candidaturas ca join public.vagas v on v.id=ca.vaga_id join public.empresa_usuarios eu on eu.empresa_id=v.empresa_id where ca.id=application_id and ca.portal_liberado and eu.user_id=auth.uid() and eu.ativo) $$;
revoke all on function public.portal_is_admin() from public;
revoke all on function public.portal_has_company(uuid) from public;
revoke all on function public.portal_can_view_application(uuid) from public;
grant execute on function public.portal_is_admin(), public.portal_has_company(uuid), public.portal_can_view_application(uuid) to authenticated;

alter table public.empresa_usuarios enable row level security;
alter table public.feedbacks_cliente enable row level security;
alter table public.empresas enable row level security;
alter table public.vagas enable row level security;
alter table public.candidaturas enable row level security;
alter table public.candidatos enable row level security;
alter table public.entrevistas enable row level security;
alter table public.perfis_usuarios enable row level security;

-- Substitui políticas amplas das tabelas compartilhadas por isolamento explícito.
do $$ declare t text; p record; begin
  foreach t in array array['empresa_usuarios','feedbacks_cliente','empresas','vagas','candidaturas','candidatos','entrevistas','perfis_usuarios'] loop
    for p in select policyname from pg_policies where schemaname='public' and tablename=t loop
      execute format('drop policy if exists %I on public.%I',p.policyname,t);
    end loop;
  end loop;
end $$;

create policy admin_manage_empresa_usuarios on public.empresa_usuarios for all to authenticated using (public.portal_is_admin()) with check (public.portal_is_admin());
create policy client_read_own_company_links on public.empresa_usuarios for select to authenticated using (user_id=auth.uid() and ativo);
create policy admin_manage_empresas on public.empresas for all to authenticated using (public.portal_is_admin()) with check (public.portal_is_admin());
create policy client_read_linked_empresas on public.empresas for select to authenticated using (public.portal_has_company(id));
create policy admin_manage_vagas on public.vagas for all to authenticated using (public.portal_is_admin()) with check (public.portal_is_admin());
create policy client_read_linked_vagas on public.vagas for select to authenticated using (public.portal_has_company(empresa_id));
create policy admin_manage_candidaturas on public.candidaturas for all to authenticated using (public.portal_is_admin()) with check (public.portal_is_admin());
create policy client_read_released_candidaturas on public.candidaturas for select to authenticated using (portal_liberado and public.portal_can_view_application(id));
create policy admin_manage_candidatos on public.candidatos for all to authenticated using (public.portal_is_admin()) with check (public.portal_is_admin());
create policy client_read_released_candidatos on public.candidatos for select to authenticated using (exists(select 1 from public.candidaturas ca where ca.candidato_id=candidatos.id and ca.portal_liberado and public.portal_can_view_application(ca.id)));
create policy admin_manage_entrevistas on public.entrevistas for all to authenticated using (public.portal_is_admin()) with check (public.portal_is_admin());
create policy client_read_released_entrevistas on public.entrevistas for select to authenticated using (exists(select 1 from public.candidaturas ca where ca.candidato_id=entrevistas.candidato_id and ca.vaga_id=entrevistas.vaga_id and ca.portal_liberado and public.portal_can_view_application(ca.id)));
create policy admin_read_profiles on public.perfis_usuarios for select to authenticated using (public.portal_is_admin() or usuario_id=auth.uid());
create policy admin_manage_feedbacks on public.feedbacks_cliente for all to authenticated using (public.portal_is_admin()) with check (public.portal_is_admin());
create policy client_read_feedbacks on public.feedbacks_cliente for select to authenticated using (public.portal_has_company(empresa_id) and public.portal_can_view_application(candidatura_id));
create policy client_insert_feedbacks on public.feedbacks_cliente for insert to authenticated with check (user_id=auth.uid() and public.portal_has_company(empresa_id) and public.portal_can_view_application(candidatura_id));
create policy client_update_feedbacks on public.feedbacks_cliente for update to authenticated using (public.portal_has_company(empresa_id) and public.portal_can_view_application(candidatura_id)) with check (user_id=auth.uid() and public.portal_has_company(empresa_id) and public.portal_can_view_application(candidatura_id));

-- Privilégios de tabela necessários para que as políticas RLS sejam avaliadas.
-- authenticated recebe somente SELECT em perfis; todas as operações continuam
-- limitadas pelas políticas acima.
revoke all on table public.empresa_usuarios, public.feedbacks_cliente,
  public.empresas, public.vagas, public.candidaturas, public.candidatos,
  public.entrevistas, public.perfis_usuarios from anon;
grant select, insert, update, delete on table public.empresa_usuarios,
  public.feedbacks_cliente, public.empresas, public.vagas, public.candidaturas,
  public.candidatos, public.entrevistas to authenticated;
grant select on table public.perfis_usuarios to authenticated;
grant select, insert, update on table public.empresa_usuarios to service_role;

-- Tabelas exclusivamente administrativas, quando instaladas.
do $$ declare t text; p record; begin
  foreach t in array array['movimentacoes_financeiras','contratos_clientes','observacoes_internas','historico_candidatos'] loop
    if to_regclass('public.'||t) is not null then
      execute format('alter table public.%I enable row level security',t);
      for p in select policyname from pg_policies where schemaname='public' and tablename=t loop execute format('drop policy if exists %I on public.%I',p.policyname,t); end loop;
      execute format('create policy admin_only on public.%I for all to authenticated using (public.portal_is_admin()) with check (public.portal_is_admin())',t);
      execute format('revoke all on table public.%I from anon',t);
      execute format('grant select, insert, update, delete on table public.%I to authenticated',t);
    end if;
  end loop;
end $$;

-- Storage: escrita sempre administrativa; leitura de currículo só para admin ou candidato liberado.
do $$ declare p record; begin
  for p in select policyname from pg_policies where schemaname='storage' and tablename='objects' and (coalesce(qual,'')||coalesce(with_check,'')) ~ '(curriculos|contratos-clientes|financeiro-anexos|logos-empresas)' loop
    execute format('drop policy if exists %I on storage.objects',p.policyname);
  end loop;
end $$;
create policy admin_manage_private_files on storage.objects for all to authenticated
using (bucket_id in ('curriculos','contratos-clientes','financeiro-anexos','logos-empresas') and public.portal_is_admin())
with check (bucket_id in ('curriculos','contratos-clientes','financeiro-anexos','logos-empresas') and public.portal_is_admin());
create policy client_read_released_resumes on storage.objects for select to authenticated using (
  bucket_id='curriculos' and exists(
    select 1 from public.candidaturas ca
    where ca.candidato_id::text=(storage.foldername(name))[1] and ca.portal_liberado and ca.curriculo_liberado and public.portal_can_view_application(ca.id)
  )
);

notify pgrst, 'reload schema';

-- Auditoria após execução: vagas retornadas aqui não serão visíveis no portal até vínculo manual.
select id,titulo,empresa from public.vagas where empresa_id is null and status <> 'excluida' order by titulo;
