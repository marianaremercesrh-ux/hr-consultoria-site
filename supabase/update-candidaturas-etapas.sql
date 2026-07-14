-- Execute no SQL Editor do Supabase para liberar as novas etapas.
-- Preserva dados, tabela, RLS e políticas existentes.
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

notify pgrst, 'reload schema';
