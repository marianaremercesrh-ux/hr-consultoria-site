-- Vitrine pública de vagas: interface mínima e independente de sessão.
-- Migração incremental. Não reaplica nem altera módulos do Portal do Cliente.

create or replace function public.public_list_published_jobs(p_slug text default null)
returns table (
  titulo text,
  slug text,
  empresa text,
  cidade text,
  estado text,
  modalidade text,
  tipo_contrato text,
  salario text,
  descricao text,
  atividades text,
  requisitos text,
  beneficios text,
  horario text,
  quantidade_vagas integer
)
language sql
stable
security definer
set search_path = pg_catalog, public
as $function$
  select
    v.titulo::text,
    v.slug::text,
    v.empresa::text,
    v.cidade::text,
    v.estado::text,
    v.modalidade::text,
    v.tipo_contrato::text,
    case when v.exibir_salario then v.salario::text else null end as salario,
    v.descricao::text,
    v.atividades::text,
    v.requisitos::text,
    v.beneficios::text,
    v.horario::text,
    v.quantidade_vagas::integer
  from public.vagas as v
  where v.status = 'publicada'
    and (p_slug is null or v.slug = p_slug)
  order by v.created_at desc;
$function$;

drop policy if exists "Leitura pública de vagas publicadas" on public.vagas;
revoke all on table public.vagas from anon;

revoke all on function public.public_list_published_jobs(text) from public;
grant execute on function public.public_list_published_jobs(text) to anon, authenticated;

notify pgrst, 'reload schema';
