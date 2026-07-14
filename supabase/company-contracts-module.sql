-- Contratos privados de clientes. Execute após ats-module.sql.
create table if not exists public.contratos_clientes (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  nome_arquivo text,
  caminho_arquivo text,
  valor_por_vaga numeric(10,2) not null default 0 check (valor_por_vaga >= 0),
  moeda text not null default 'BRL',
  valor_recebido numeric(10,2) not null default 0 check (valor_recebido >= 0),
  forma_cobranca text,
  status_pagamento text not null default 'pendente' check (status_pagamento in ('pendente','pago','parcialmente_pago','atrasado','cancelado')),
  data_vencimento date,
  observacoes text,
  contrato_data_upload timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists contratos_clientes_empresa_idx on public.contratos_clientes(empresa_id, created_at desc);
create index if not exists contratos_clientes_status_idx on public.contratos_clientes(status_pagamento, data_vencimento);
alter table public.contratos_clientes enable row level security;
revoke all on public.contratos_clientes from anon;
grant select, insert, update, delete on public.contratos_clientes to authenticated;
drop policy if exists authenticated_manage_contracts on public.contratos_clientes;
create policy authenticated_manage_contracts on public.contratos_clientes for all to authenticated
using ((select auth.uid()) is not null) with check ((select auth.uid()) is not null);

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('contratos-clientes','contratos-clientes',false,10485760,array[
  'application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]) on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists authenticated_read_client_contracts on storage.objects;
create policy authenticated_read_client_contracts on storage.objects for select to authenticated
using (bucket_id='contratos-clientes' and (select auth.uid()) is not null);
drop policy if exists authenticated_upload_client_contracts on storage.objects;
create policy authenticated_upload_client_contracts on storage.objects for insert to authenticated
with check (bucket_id='contratos-clientes' and (select auth.uid()) is not null);
drop policy if exists authenticated_update_client_contracts on storage.objects;
create policy authenticated_update_client_contracts on storage.objects for update to authenticated
using (bucket_id='contratos-clientes' and (select auth.uid()) is not null)
with check (bucket_id='contratos-clientes' and (select auth.uid()) is not null);
drop policy if exists authenticated_delete_client_contracts on storage.objects;
create policy authenticated_delete_client_contracts on storage.objects for delete to authenticated
using (bucket_id='contratos-clientes' and (select auth.uid()) is not null);
