-- Teste manual de isolamento. Substitua os UUIDs e execute APÓS a migração, em ambiente de homologação.
begin;
set local role authenticated;

-- Cliente A
select set_config('request.jwt.claims','{"sub":"UUID_USER_CLIENTE_A","role":"authenticated"}',true);
select id,nome from public.empresas; -- esperado: somente empresas vinculadas e ativas do Cliente A
select id,titulo,empresa_id from public.vagas; -- esperado: nenhuma vaga da Empresa B
select id,candidato_id,vaga_id from public.candidaturas; -- esperado: somente liberações da Empresa A
select id,nome from public.candidatos; -- esperado: somente candidatos explicitamente liberados da Empresa A
select * from public.candidaturas where id='UUID_CANDIDATURA_NAO_LIBERADA'; -- esperado: zero linhas
select * from public.candidaturas where id='UUID_CANDIDATURA_EMPRESA_B'; -- esperado: zero linhas

-- Cliente desativado
select set_config('request.jwt.claims','{"sub":"UUID_USER_CLIENTE_DESATIVADO","role":"authenticated"}',true);
select id,nome from public.empresas; -- esperado: zero linhas
select id,titulo from public.vagas; -- esperado: zero linhas
select id,nome from public.candidatos; -- esperado: zero linhas

-- Administrador
select set_config('request.jwt.claims','{"sub":"UUID_USER_ADMIN","role":"authenticated"}',true);
select public.portal_is_admin(); -- esperado: true
select count(*) from public.empresas; -- esperado: acesso administrativo preservado

rollback;
