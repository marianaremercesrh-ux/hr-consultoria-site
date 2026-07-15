import { clientPortalSupabase as supabase } from "../lib/clientPortalSupabase";
import { reportSupabaseError } from "../lib/supabaseError";
import type { ClientAccessRequest, ClientAccessSignup } from "../types/clientAccess";

const COLUMNS = "id,usuario_id,nome,empresa_informada,cnpj_informado,cargo,telefone,email,status,empresa_id,motivo_recusa,analisado_por,analisado_em,created_at,updated_at";

export async function signUpClientAccess(form: ClientAccessSignup) {
  const { data, error } = await supabase.auth.signUp({
    email: form.email.trim().toLowerCase(),
    password: form.password,
    options: {
      emailRedirectTo: `${window.location.origin}/cliente/auth/callback?next=confirmed`,
      data: {
        access_request: "true",
        nome: form.nome.trim(),
        empresa_informada: form.empresa_informada.trim(),
        cnpj_informado: form.cnpj_informado.replace(/\D/g, ""),
        cargo: form.cargo.trim(),
        telefone: form.telefone.trim(),
      },
    },
  });
  if (error) {
    reportSupabaseError("cadastrar acesso de cliente", error);
    throw error;
  }
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    throw new Error("EMAIL_ALREADY_REGISTERED");
  }
  return data;
}

export async function ownAccessRequest() {
  const { data, error } = await supabase.from("solicitacoes_acesso_cliente").select(COLUMNS).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (error) {
    reportSupabaseError("consultar solicitação própria", error);
    throw error;
  }
  return data as ClientAccessRequest | null;
}

export async function ownCompanyLinks() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase.from("empresa_usuarios").select("id,empresa_id,ativo").eq("user_id", user.id);
  if (error) throw error;
  return (data ?? []) as { id: string; empresa_id: string; ativo: boolean }[];
}
