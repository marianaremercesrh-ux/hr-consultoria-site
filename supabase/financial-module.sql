create extension if not exists pgcrypto;

create table if not exists public.movimentacoes_financeiras (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('entrada', 'saida')),
  descricao text not null,
  contraparte text not null,
  empresa_id uuid references public.empresas(id) on delete set null,
  vaga_servico text,
  categoria text not null,
  valor numeric(14,2) not null check (valor >= 0),
  data_vencimento date not null,
  data_pagamento date,
  forma_pagamento text,
  status text not null check (status in ('pago', 'pendente', 'atrasado')),
  observacoes text,
  anexo_nome text,
  anexo_caminho text,
  anexo_tipo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists movimentacoes_financeiras_vencimento_idx on public.movimentacoes_financeiras(data_vencimento desc);
create index if not exists movimentacoes_financeiras_empresa_idx on public.movimentacoes_financeiras(empresa_id);
create index if not exists movimentacoes_financeiras_tipo_status_idx on public.movimentacoes_financeiras(tipo, status);

alter table public.movimentacoes_financeiras enable row level security;
revoke all on table public.movimentacoes_financeiras from anon;
grant select, insert, update, delete on table public.movimentacoes_financeiras to authenticated;
drop policy if exists "authenticated_manage_financial_transactions" on public.movimentacoes_financeiras;
create policy "authenticated_manage_financial_transactions" on public.movimentacoes_financeiras for all to authenticated
using ((select auth.uid()) is not null) with check ((select auth.uid()) is not null);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('financeiro-anexos', 'financeiro-anexos', false, 10485760, array['application/pdf','image/jpeg','image/png'])
on conflict (id) do update set public=excluded.public, file_size_limit=excluded.file_size_limit, allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists "authenticated_read_financial_attachments" on storage.objects;
create policy "authenticated_read_financial_attachments" on storage.objects for select to authenticated using (bucket_id='financeiro-anexos' and (select auth.uid()) is not null);
drop policy if exists "authenticated_upload_financial_attachments" on storage.objects;
create policy "authenticated_upload_financial_attachments" on storage.objects for insert to authenticated with check (bucket_id='financeiro-anexos' and (select auth.uid()) is not null);
drop policy if exists "authenticated_update_financial_attachments" on storage.objects;
create policy "authenticated_update_financial_attachments" on storage.objects for update to authenticated using (bucket_id='financeiro-anexos' and (select auth.uid()) is not null) with check (bucket_id='financeiro-anexos' and (select auth.uid()) is not null);
drop policy if exists "authenticated_delete_financial_attachments" on storage.objects;
create policy "authenticated_delete_financial_attachments" on storage.objects for delete to authenticated using (bucket_id='financeiro-anexos' and (select auth.uid()) is not null);
