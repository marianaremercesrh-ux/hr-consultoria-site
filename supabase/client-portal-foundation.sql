-- Fundação mínima do Portal do Cliente.
-- Pode ser executada repetidamente e não depende de administrador prévio.

create table if not exists public.perfis_usuarios (
  usuario_id uuid primary key references auth.users(id) on delete cascade,
  perfil text not null default 'visualizador',
  nome text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Compatibilidade com instalações parciais anteriores.
alter table public.perfis_usuarios add column if not exists perfil text;
alter table public.perfis_usuarios add column if not exists nome text;
alter table public.perfis_usuarios add column if not exists created_at timestamptz;
alter table public.perfis_usuarios add column if not exists updated_at timestamptz;

alter table public.perfis_usuarios alter column perfil set default 'visualizador';
update public.perfis_usuarios set perfil = 'visualizador' where perfil is null;
update public.perfis_usuarios set created_at = now() where created_at is null;
update public.perfis_usuarios set updated_at = now() where updated_at is null;
alter table public.perfis_usuarios alter column perfil set not null;
alter table public.perfis_usuarios alter column created_at set default now();
alter table public.perfis_usuarios alter column created_at set not null;
alter table public.perfis_usuarios alter column updated_at set default now();
alter table public.perfis_usuarios alter column updated_at set not null;

-- ON CONFLICT (usuario_id) depende desta PK/unique.
do $$
begin
  if not exists (
    select 1
    from pg_constraint c
    join pg_attribute a
      on a.attrelid = c.conrelid
     and a.attnum = any(c.conkey)
    where c.conrelid = 'public.perfis_usuarios'::regclass
      and c.contype in ('p', 'u')
      and a.attname = 'usuario_id'
  ) then
    raise exception 'public.perfis_usuarios existe sem PRIMARY KEY ou UNIQUE em usuario_id; revise a estrutura antes do bootstrap.';
  end if;
end $$;

-- Confirma explicitamente os valores aceitos, incluindo administrador.
alter table public.perfis_usuarios
  drop constraint if exists perfis_usuarios_perfil_check;
alter table public.perfis_usuarios
  add constraint perfis_usuarios_perfil_check
  check (perfil in ('administrador', 'recrutador', 'visualizador'));

create index if not exists perfis_usuarios_perfil_idx
  on public.perfis_usuarios(perfil);

create or replace function public.client_portal_touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists perfis_usuarios_touch_updated_at
  on public.perfis_usuarios;
create trigger perfis_usuarios_touch_updated_at
before update on public.perfis_usuarios
for each row
execute function public.client_portal_touch_updated_at();

alter table public.perfis_usuarios enable row level security;
revoke all on table public.perfis_usuarios from anon, authenticated;

-- Nenhuma política para usuários comuns é criada nesta etapa.
-- O bootstrap roda no SQL Editor e as políticas finais ficam no módulo principal.
