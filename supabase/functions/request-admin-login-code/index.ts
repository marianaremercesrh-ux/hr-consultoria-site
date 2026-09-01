import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const headers = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json" } });
const normalizeEmail = (value: unknown) => String(value ?? "").trim().toLowerCase();
async function hash(value: string) { return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)))).map(x => x.toString(16).padStart(2, "0")).join(""); }
function validEmail(value: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }
function escapeHtml(value: string) { return value.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char] ?? char)); }

Deno.serve(async request => {
  if (request.method === "OPTIONS") return new Response("ok", { headers });
  try {
    const email = normalizeEmail((await request.json()).email);
    if (!validEmail(email)) return json({ error: "Informe um e-mail válido." }, 400);
    const url = Deno.env.get("SUPABASE_URL")!;
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const from = Deno.env.get("ADMIN_LOGIN_FROM_EMAIL");
    if (!resendKey || !from) return json({ error: "O serviço de e-mail ainda não está configurado." }, 500);
    const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: users, error: usersError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (usersError) throw usersError;
    const user = users.users.find(item => item.email?.toLowerCase() === email);
    const { data: profile, error: profileError } = user ? await admin.from("perfis_usuarios").select("usuario_id,nome,perfil").eq("usuario_id", user.id).in("perfil", ["administrador", "recrutador"]).maybeSingle() : { data: null, error: null };
    if (profileError) throw profileError;
    // Mensagem genérica evita confirmar se um e-mail tem acesso administrativo.
    if (!user || !profile) return json({ ok: true, message: "Se o e-mail estiver autorizado, você receberá um código." });
    const { data: recent } = await admin.from("admin_login_creation_challenges").select("created_at").eq("email", email).is("code_used_at", null).order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (recent && Date.now() - new Date(recent.created_at).getTime() < 60_000) return json({ error: "Aguarde 60 segundos antes de solicitar outro código." }, 429);
    const code = String(crypto.getRandomValues(new Uint32Array(1))[0] % 10000).padStart(4, "0");
    const { data: challenge, error: insertError } = await admin.from("admin_login_creation_challenges").insert({ usuario_id: user.id, email, code_hash: await hash(code), expires_at: new Date(Date.now() + 10 * 60_000).toISOString() }).select("id").single();
    if (insertError) throw insertError;
    const greeting = escapeHtml(profile.nome || "");
    const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ from, to: [email], subject: "Código para criação do seu login", html: `<p>Olá${greeting ? `, ${greeting}` : ""}!</p><p>Recebemos uma solicitação para criação do seu acesso administrativo.</p><p>Seu código de verificação é:</p><p style="font-size:28px;font-weight:bold;letter-spacing:8px">${code}</p><p>Esse código é válido por 10 minutos.</p><p>Se você não solicitou esse acesso, ignore este e-mail.</p><p>HR Consultoria de RH</p>` }) });
    if (!response.ok) { await admin.from("admin_login_creation_challenges").delete().eq("id", challenge.id); return json({ error: "Não foi possível enviar o e-mail. Tente novamente." }, 502); }
    return json({ challenge_id: challenge.id, message: "Se o e-mail estiver autorizado, você receberá um código." });
  } catch (error) { console.error("request-admin-login-code", error); return json({ error: "Não foi possível processar a solicitação." }, 500); }
});
