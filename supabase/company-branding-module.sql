-- Logo e CNPJ de empresas. Migração aditiva e segura para dados existentes.
alter table public.empresas add column if not exists cnpj text;
alter table public.empresas add column if not exists logo_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('logos-empresas', 'logos-empresas', false, 5242880, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Authenticated users can read company logos" on storage.objects;
create policy "Authenticated users can read company logos" on storage.objects
for select to authenticated using (bucket_id = 'logos-empresas' and auth.uid() is not null);

drop policy if exists "Authenticated users can upload company logos" on storage.objects;
create policy "Authenticated users can upload company logos" on storage.objects
for insert to authenticated with check (bucket_id = 'logos-empresas' and auth.uid() is not null);

drop policy if exists "Authenticated users can update company logos" on storage.objects;
create policy "Authenticated users can update company logos" on storage.objects
for update to authenticated using (bucket_id = 'logos-empresas' and auth.uid() is not null)
with check (bucket_id = 'logos-empresas' and auth.uid() is not null);

drop policy if exists "Authenticated users can delete company logos" on storage.objects;
create policy "Authenticated users can delete company logos" on storage.objects
for delete to authenticated using (bucket_id = 'logos-empresas' and auth.uid() is not null);

notify pgrst, 'reload schema';
