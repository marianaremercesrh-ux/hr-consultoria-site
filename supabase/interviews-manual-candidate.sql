alter table public.entrevistas alter column candidato_id drop not null;
alter table public.entrevistas add column if not exists candidato_nome_manual text;
alter table public.entrevistas drop constraint if exists entrevistas_candidato_or_manual_check;
alter table public.entrevistas add constraint entrevistas_candidato_or_manual_check check (
  candidato_id is not null or nullif(btrim(candidato_nome_manual), '') is not null
);
notify pgrst, 'reload schema';
