-- Sincroniza public.candidaturas.etapa com os identificadores usados pela interface.
-- Não exclui/recria a tabela e não altera outras colunas.

-- 1. Antes da alteração, estas consultas mostram a definição real e os valores atuais.
select pg_get_constraintdef(oid) as definicao_anterior
from pg_constraint
where conrelid = 'public.candidaturas'::regclass
  and conname = 'candidaturas_etapa_check';

select etapa, count(*) as quantidade
from public.candidaturas
group by etapa
order by etapa;

begin;

-- 2. Remove somente a restrição de domínio da etapa.
alter table public.candidaturas
  drop constraint if exists candidaturas_etapa_check;

-- 3. Normaliza somente grafias antigas conhecidas para os identificadores internos.
update public.candidaturas
set etapa = case lower(btrim(etapa))
  when 'novo candidato' then 'novo'
  when 'triagem' then 'triagem'
  when 'entrevista agendada' then 'entrevista_agendada'
  when 'entrevista reagendada' then 'entrevista_reagendada'
  when 'não compareceu' then 'nao_compareceu'
  when 'nao compareceu' then 'nao_compareceu'
  when 'não compareceu à entrevista' then 'nao_compareceu'
  when 'nao compareceu a entrevista' then 'nao_compareceu'
  when 'entrevista cancelada' then 'entrevista_cancelada'
  when 'entrevistado' then 'entrevistado'
  when 'encaminhado ao cliente' then 'encaminhado_cliente'
  when 'aprovado' then 'aprovado'
  when 'reprovado' then 'reprovado'
  when 'desistente' then 'desistente'
  when 'contratado' then 'contratado'
  when 'banco de talentos' then 'banco_talentos'
  else lower(btrim(etapa))
end
where etapa is distinct from case lower(btrim(etapa))
  when 'novo candidato' then 'novo'
  when 'triagem' then 'triagem'
  when 'entrevista agendada' then 'entrevista_agendada'
  when 'entrevista reagendada' then 'entrevista_reagendada'
  when 'não compareceu' then 'nao_compareceu'
  when 'nao compareceu' then 'nao_compareceu'
  when 'não compareceu à entrevista' then 'nao_compareceu'
  when 'nao compareceu a entrevista' then 'nao_compareceu'
  when 'entrevista cancelada' then 'entrevista_cancelada'
  when 'entrevistado' then 'entrevistado'
  when 'encaminhado ao cliente' then 'encaminhado_cliente'
  when 'aprovado' then 'aprovado'
  when 'reprovado' then 'reprovado'
  when 'desistente' then 'desistente'
  when 'contratado' then 'contratado'
  when 'banco de talentos' then 'banco_talentos'
  else lower(btrim(etapa))
end;

-- 4. Interrompe e desfaz tudo se houver um valor não reconhecido.
do $$
declare
  valores_invalidos text;
begin
  select string_agg(distinct etapa, ', ' order by etapa)
  into valores_invalidos
  from public.candidaturas
  where etapa not in (
    'novo', 'triagem', 'entrevista_agendada', 'entrevista_reagendada',
    'nao_compareceu', 'entrevista_cancelada', 'entrevistado',
    'encaminhado_cliente', 'aprovado', 'reprovado', 'desistente',
    'contratado', 'banco_talentos'
  );

  if valores_invalidos is not null then
    raise exception 'Valores desconhecidos em public.candidaturas.etapa: %', valores_invalidos
      using errcode = '23514',
            hint = 'Normalize esses valores explicitamente antes de executar novamente a migração.';
  end if;
end $$;

-- 5. Recria a única restrição com todos os valores usados pela interface.
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

-- 6. Atualiza o cache de esquema da API.
notify pgrst, 'reload schema';

-- 7. Confirma a definição e a distribuição final.
select pg_get_constraintdef(oid) as definicao_final
from pg_constraint
where conrelid = 'public.candidaturas'::regclass
  and conname = 'candidaturas_etapa_check';

select etapa, count(*) as quantidade
from public.candidaturas
group by etapa
order by etapa;
