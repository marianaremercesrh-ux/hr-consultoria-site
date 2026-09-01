import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const headers = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json" } });
async function hash(value: string) { return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)))).map(x => x.toString(16).padStart(2, "0")).join(""); }
Deno.serve(async request => {
  if (request.method === "OPTIONS") return new Response("ok", { headers });
  try {
    const { email: rawEmail, challenge_id: challengeId, code } = await request.json();
    const email = String(rawEmail ?? "").trim().toLowerCase();
    if (!challengeId || !/^\d{4}$/.test(String(code ?? ""))) return json({ error: "Código inválido. Verifique os números digitados e tente novamente." }, 400);
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: challenge, error } = await admin.from("admin_login_creation_challenges").select("*").eq("id", challengeId).eq("email", email).maybeSingle();
    if (error) throw error;
    if (!challenge || challenge.code_used_at || new Date(challenge.expires_at).getTime() < Date.now()) return json({ error: "Esse código expirou. Solicite um novo código." }, 410);
    if (challenge.attempts >= 5) return json({ error: "Limite de tentativas excedido. Solicite um novo código." }, 429);
    const matches = await hash(String(code)) === challenge.code_hash;
    if (!matches) { await admin.from("admin_login_creation_challenges").update({ attempts: challenge.attempts + 1 }).eq("id", challenge.id); return json({ error: "Código inválido. Verifique os números digitados e tente novamente." }, 400); }
    const token = `${crypto.randomUUID()}-${crypto.randomUUID()}`;
    const { error: updateError } = await admin.from("admin_login_creation_challenges").update({ code_used_at: new Date().toISOString(), verification_token_hash: await hash(token), verification_expires_at: new Date(Date.now() + 10 * 60_000).toISOString() }).eq("id", challenge.id).is("code_used_at", null);
    if (updateError) throw updateError;
    return json({ verification_token: token });
  } catch (error) { console.error("verify-admin-login-code", error); return json({ error: "Não foi possível validar o código." }, 500); }
});
