# Criação de login administrativo

Este fluxo atende somente e-mails que já existem em `auth.users` e possuem perfil `administrador` ou `recrutador` em `public.perfis_usuarios`. Ele não cria perfis administrativos automaticamente.

## Configuração

1. No SQL Editor do Supabase, execute `admin-login-creation.sql`.
2. Configure um domínio remetente verificado no Resend.
3. Configure os secrets das Edge Functions:

```bash
supabase secrets set RESEND_API_KEY="SUA_CHAVE_RESEND"
supabase secrets set ADMIN_LOGIN_FROM_EMAIL="HR Consultoria de RH <login@SEU_DOMINIO_VERIFICADO>"
```

Não coloque esses valores no frontend, no `.env.local` ou no Git.

## Deploy

```bash
supabase functions deploy request-admin-login-code --no-verify-jwt
supabase functions deploy verify-admin-login-code --no-verify-jwt
supabase functions deploy create-admin-password --no-verify-jwt
```

As funções recebem apenas dados públicos do fluxo, mas usam `SUPABASE_SERVICE_ROLE_KEY` somente no ambiente seguro da Edge Function. Nunca exponha essa chave no navegador.

## Teste ponta a ponta

1. Confirme que o e-mail de teste existe em `auth.users` e tem perfil `recrutador` ou `administrador`.
2. Acesse `/admin/login` e clique em `Solicitar criação de login`.
3. Informe o e-mail e confirme o código recebido por e-mail em até 10 minutos.
4. Teste código inválido, código expirado, cinco tentativas inválidas e reenvio antes/depois de 60 segundos.
5. Crie uma senha que tenha 8 caracteres, maiúscula, minúscula, número e caractere especial.
6. Volte ao login e entre com o e-mail e a nova senha.

Os códigos são armazenados somente como SHA-256, têm uso único, expiram em 10 minutos e não são gravados no console. O token temporário de autorização permanece apenas em memória no navegador e é invalidado quando a senha é criada.
