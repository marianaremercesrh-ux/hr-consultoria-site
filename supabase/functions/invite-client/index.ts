import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const portalUrl = Deno.env.get("CLIENT_PORTAL_URL");
    if (!portalUrl) return json({ error: "CLIENT_PORTAL_URL não configurada na Edge Function." }, 500);
    const authorization = request.headers.get("Authorization") ?? "";
    const caller = createClient(url, anon, { global: { headers: { Authorization: authorization } } });
    const { data: { user }, error: userError } = await caller.auth.getUser();
    if (userError || !user) return json({ error: "Sessão inválida." }, 401);
    const { data: profile } = await caller.from("perfis_usuarios").select("perfil").eq("usuario_id", user.id).maybeSingle();
    if (!profile || !["administrador", "recrutador"].includes(profile.perfil)) return json({ error: "Acesso administrativo necessário." }, 403);

    const { empresa_id, nome, email } = await request.json();
    if (!empresa_id || !nome?.trim() || !email?.trim()) return json({ error: "Empresa, nome e e-mail são obrigatórios." }, 400);
    const admin = createClient(url, serviceRole, { auth: { autoRefreshToken: false, persistSession: false } });
    const normalizedEmail = String(email).trim().toLowerCase();
    let target = null;
    for (let page=1;page<=20&&!target;page++) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 100 });
      if (error) throw error;
      target = data.users.find((item) => item.email?.toLowerCase() === normalizedEmail) ?? null;
      if (data.users.length < 100) break;
    }
    if (!target) {
      const { data, error } = await admin.auth.admin.inviteUserByEmail(normalizedEmail, { redirectTo: portalUrl, data: { nome: nome.trim(), tipo: "cliente" } });
      if (error) throw error;
      target = data.user;
    } else {
      const mailClient = createClient(url, anon);
      const { error } = await mailClient.auth.signInWithOtp({ email: normalizedEmail, options: { shouldCreateUser: false, emailRedirectTo: portalUrl } });
      if (error) throw error;
    }
    if (!target) throw new Error("Não foi possível localizar ou criar o usuário Auth.");
    const { error: linkError } = await admin.from("empresa_usuarios").upsert({ empresa_id, user_id: target.id, nome: nome.trim(), email: normalizedEmail, ativo: true, updated_at: new Date().toISOString() }, { onConflict: "empresa_id,user_id" });
    if (linkError) throw linkError;
    return json({ ok: true, user_id: target.id });
  } catch (error) {
    console.error("invite-client", error);
    return json({ error: error instanceof Error ? error.message : "Não foi possível enviar o acesso." }, 400);
  }
});
function json(body: unknown, status=200) { return new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } }); }
