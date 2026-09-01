import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const headers = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json" } });
async function hash(value: string) { return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)))).map(x => x.toString(16).padStart(2, "0")).join(""); }
function strongPassword(value: string) { return value.length >= 8 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value) && /[^A-Za-z0-9]/.test(value); }
Deno.serve(async request => {
  if (request.method === "OPTIONS") return new Response("ok", { headers });
  try {
    const { email: rawEmail, verification_token: token, password } = await request.json();
    const email = String(rawEmail ?? "").trim().toLowerCase();
    if (!strongPassword(String(password ?? ""))) return json({ error: "A senha deve ter 8 caracteres, maiúscula, minúscula, número e caractere especial." }, 400);
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: challenge, error } = await admin.from("admin_login_creation_challenges").select("*").eq("email", email).eq("verification_token_hash", await hash(String(token ?? ""))).is("password_set_at", null).order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (error) throw error;
    if (!challenge || !challenge.verification_expires_at || new Date(challenge.verification_expires_at).getTime() < Date.now()) return json({ error: "Sua autorização expirou. Solicite um novo código." }, 410);
    const { error: passwordError } = await admin.auth.admin.updateUserById(challenge.usuario_id, { password: String(password) });
    if (passwordError) throw passwordError;
    const { error: markError } = await admin.from("admin_login_creation_challenges").update({ password_set_at: new Date().toISOString(), verification_token_hash: null }).eq("id", challenge.id).is("password_set_at", null);
    if (markError) throw markError;
    return json({ ok: true });
  } catch (error) { console.error("create-admin-password", error); return json({ error: "Não foi possível criar o login. Tente novamente." }, 500); }
});
