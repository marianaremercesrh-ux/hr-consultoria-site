# invite-client

Publicação:

```bash
supabase functions deploy invite-client --no-verify-jwt
```

O JWT ainda é validado dentro da função e o solicitante precisa possuir perfil `administrador` ou `recrutador`.
Configure os secrets `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` e `CLIENT_PORTAL_URL` somente no ambiente da função. Em produção, use `CLIENT_PORTAL_URL=https://www.hrconsultoriaderh.com.br/cliente`. Nunca use `service_role` no Vite.

Inclua `https://SEU-DOMINIO/cliente` nas Redirect URLs permitidas em Authentication > URL Configuration.
