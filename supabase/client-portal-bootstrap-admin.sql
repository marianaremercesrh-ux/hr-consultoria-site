-- Execute DEPOIS de client-portal-foundation.sql.
-- Este arquivo não cria usuário Auth; apenas classifica um usuário existente.

insert into public.perfis_usuarios (usuario_id, perfil, nome)
select
  id,
  'administrador',
  coalesce(raw_user_meta_data->>'nome', email)
from auth.users
where lower(email) = lower('SUBSTITUA_PELO_EMAIL_ADMINISTRADOR')
on conflict (usuario_id)
do update set
  perfil = 'administrador',
  updated_at = now();

select
  p.usuario_id,
  u.email,
  p.perfil
from public.perfis_usuarios p
join auth.users u on u.id = p.usuario_id
where p.perfil = 'administrador';
