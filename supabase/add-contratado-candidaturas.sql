-- Amplia de forma segura os status aceitos em public.candidaturas.
-- Preserva a tabela, os dados, as chaves estrangeiras, os índices, o RLS e as políticas.
begin;

alter table public.candidaturas
  drop constraint if exists candidaturas_etapa_check;

alter table public.candidaturas
  add constraint candidaturas_etapa_check check (etapa in (
    'novo',
    'triagem',
    'entrevista_agendada',
    'entrevista_reagendada',
    'nao_compareceu',
    'entrevista_cancelada',
    'entrevistado',
    'encaminhado_cliente',
    'aprovado',
    'reprovado',
    'desistente',
    'contratado',
    'banco_talentos'
  ));

commit;

notify pgrst, 'reload schema';
