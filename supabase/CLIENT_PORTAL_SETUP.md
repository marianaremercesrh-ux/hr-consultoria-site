# Configuração do Portal do Cliente

1. Em Authentication > URL Configuration, adicione `https://SEU-DOMINIO/cliente` às Redirect URLs.
2. Execute `client-portal-foundation.sql`. Ela cria somente a estrutura mínima de `public.perfis_usuarios`, sem depender de administrador.
3. Revise o e-mail e execute `client-portal-bootstrap-admin.sql`.
4. Confirme que a consulta final retorna seu e-mail com o perfil `administrador`.
5. Execute `client-portal-module.sql` no SQL Editor.
6. Revise a consulta final de vagas sem `empresa_id` e vincule-as pelo painel administrativo.
7. Execute `client-portal-rls-tests.sql` somente depois de criar os usuários de teste e substituir os UUIDs de exemplo.
8. Publique a função:

   `supabase functions deploy invite-client --no-verify-jwt`

9. Configure na função: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` e `CLIENT_PORTAL_URL=https://hr-consultoria-site.vercel.app/cliente`.
10. Faça o deploy do frontend somente depois do SQL e da Edge Function, pois o código exige as novas colunas e políticas.
11. No perfil de uma empresa, use “Acesso ao Portal” para autorizar e convidar o primeiro responsável.
12. Na edição de uma vaga vinculada por `empresa_id`, revise o conteúdo e use “Liberar para o cliente” nas candidaturas desejadas.

Não adicione `SUPABASE_SERVICE_ROLE_KEY` ao `.env.local` ou a qualquer variável `VITE_*`.
