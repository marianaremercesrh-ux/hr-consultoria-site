# E-mails do acesso de clientes

## Supabase Auth

No Dashboard do Supabase, habilite confirmação de e-mail e configure SMTP próprio em **Authentication > Email/SMTP** antes do uso real. O SMTP padrão do Supabase tem limite baixo e não é indicado para produção.

Configure as URLs permitidas para produção e desenvolvimento, incluindo:

- `https://SEU-DOMINIO/cliente/login?confirmed=1`
- `https://SEU-DOMINIO/cliente/login?recovery=1`

Personalize os templates de **Confirm signup** e **Reset password**. O cadastro e a recuperação já usam esses fluxos nativos; nenhuma senha é enviada ou armazenada fora do Supabase Auth.

## Decisões administrativas

A função `notify-client-access` prepara os e-mails de aprovação e recusa. Ela valida o JWT do recrutador e chama `portal_is_admin()` antes de usar a service role. A mensagem de recusa não inclui o motivo interno.

Secrets necessários:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `CLIENT_ACCESS_FROM_EMAIL` (remetente verificado, por exemplo `HR Consultoria <portal@seudominio.com>`)

A função foi apenas criada localmente. Faça deploy manual somente depois de configurar domínio, Resend e secrets. Se ela não estiver publicada, aprovação/recusa continuam sendo salvas, e o console registra apenas que a notificação não foi enviada.

O e-mail “solicitação recebida” é representado imediatamente pela tela de confirmação/pendência. Para envio transacional adicional, configure um Database Webhook de `INSERT` em `solicitacoes_acesso_cliente` para uma função dedicada; não use service role no navegador.
