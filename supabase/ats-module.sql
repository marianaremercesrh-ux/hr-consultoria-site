-- Migração aditiva do ATS. Execute após candidates-module.sql.
create table if not exists public.empresas (
  id uuid primary key default gen_random_uuid(), nome text not null, contato_nome text, contato_cargo text,
  telefone text, whatsapp text, email text, endereco text, cidade text, estado text, observacoes text,
  status text not null default 'ativo' check (status in ('ativo','inativo')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.vagas add column if not exists empresa_id uuid references public.empresas(id) on delete set null;
alter table public.vagas add column if not exists valor_previsto numeric(12,2) not null default 0;
alter table public.vagas add column if not exists valor_recebido numeric(12,2) not null default 0;
alter table public.vagas add column if not exists garantia_ate date;
alter table public.vagas add column if not exists encerramento_previsto date;
alter table public.candidatos add column if not exists area text;
alter table public.candidatos add column if not exists experiencia text;
alter table public.candidatos add column if not exists disponibilidade text;

create table if not exists public.entrevistas (
  id uuid primary key default gen_random_uuid(), candidato_id uuid not null references public.candidatos(id) on delete cascade,
  vaga_id bigint references public.vagas(id) on delete set null, empresa_id uuid references public.empresas(id) on delete set null,
  data date not null, horario time not null, entrevistador text, local text, observacoes text,
  status text not null default 'agendada' check (status in ('agendada','realizada','cancelada','nao_compareceu')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.historico_candidatos (
  id uuid primary key default gen_random_uuid(), candidato_id uuid not null references public.candidatos(id) on delete cascade,
  candidatura_id uuid references public.candidaturas(id) on delete set null, evento text not null, observacao text,
  responsavel uuid references auth.users(id) on delete set null, created_at timestamptz not null default now()
);
create table if not exists public.observacoes_internas (
  id uuid primary key default gen_random_uuid(), candidato_id uuid not null references public.candidatos(id) on delete cascade,
  usuario_id uuid references auth.users(id) on delete set null, texto text not null, created_at timestamptz not null default now()
);
create table if not exists public.perfis_usuarios (
  usuario_id uuid primary key references auth.users(id) on delete cascade,
  perfil text not null default 'administrador' check (perfil in ('administrador','recrutador','visualizador')),
  nome text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create index if not exists empresas_nome_idx on public.empresas(nome);
create index if not exists entrevistas_data_idx on public.entrevistas(data, horario);
create index if not exists historico_candidato_idx on public.historico_candidatos(candidato_id, created_at desc);
create index if not exists observacoes_internas_candidato_idx on public.observacoes_internas(candidato_id, created_at desc);

alter table public.empresas enable row level security;
alter table public.entrevistas enable row level security;
alter table public.historico_candidatos enable row level security;
alter table public.observacoes_internas enable row level security;
alter table public.perfis_usuarios enable row level security;
grant select, insert, update, delete on public.empresas, public.entrevistas, public.historico_candidatos, public.observacoes_internas to authenticated;
grant select on public.perfis_usuarios to authenticated;
do $$ declare tabela text; begin
  foreach tabela in array array['empresas','entrevistas','historico_candidatos','observacoes_internas'] loop
    execute format('drop policy if exists authenticated_manage on public.%I', tabela);
    execute format('create policy authenticated_manage on public.%I for all to authenticated using ((select auth.uid()) is not null) with check ((select auth.uid()) is not null)', tabela);
  end loop;
end $$;
drop policy if exists authenticated_read_own_profile on public.perfis_usuarios;
create policy authenticated_read_own_profile on public.perfis_usuarios for select to authenticated using (usuario_id = (select auth.uid()));
