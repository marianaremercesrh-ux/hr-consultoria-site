-- Corrige a leitura da vitrine pública sem abrir operações de escrita.
-- O status publicado usado pelo projeto é exatamente: publicada

alter table public.vagas enable row level security;

-- Substitui somente esta política pública, caso uma versão anterior exista.
drop policy if exists "Leitura pública de vagas publicadas" on public.vagas;

create policy "Leitura pública de vagas publicadas"
on public.vagas
for select
to anon, authenticated
using (status = 'publicada');

-- A política só é avaliada se o papel tiver privilégio SELECT na tabela.
grant select on table public.vagas to anon;

-- Visitantes nunca recebem operações de escrita.
revoke insert, update, delete, truncate, references, trigger
on table public.vagas from anon;

notify pgrst, 'reload schema';
