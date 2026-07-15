import { supabase } from "../lib/supabase";
import { reportSupabaseError } from "../lib/supabaseError";
import type { ClientAccessRequest } from "../types/clientAccess";

const COLUMNS = "id,usuario_id,nome,empresa_informada,cnpj_informado,cargo,telefone,email,status,empresa_id,motivo_recusa,analisado_por,analisado_em,created_at,updated_at";

export async function listAccessRequests() {
  const { data, error } = await supabase.from("solicitacoes_acesso_cliente").select(COLUMNS).order("created_at", { ascending: false });
  if (error) {
    reportSupabaseError("listar solicitações de acesso", error);
    throw error;
  }
  return (data ?? []) as ClientAccessRequest[];
}

async function notifyDecision(requestId: string, decision: "approved" | "rejected") {
  const { error } = await supabase.functions.invoke("notify-client-access", { body: { requestId, decision } });
  if (error) console.warn("[E-mail de acesso] A decisão foi salva, mas a notificação não foi enviada.", error);
}

export async function approveAccessRequest(id: string, empresaId: string) {
  const { data, error } = await supabase.rpc("approve_client_access_request", { request_id: id, company_id: empresaId });
  if (error) {
    reportSupabaseError("aprovar solicitação de acesso", error);
    throw error;
  }
  await notifyDecision(id, "approved");
  return data as ClientAccessRequest;
}

export async function rejectAccessRequest(id: string, motivo: string) {
  const { data, error } = await supabase.rpc("reject_client_access_request", { request_id: id, reason: motivo });
  if (error) {
    reportSupabaseError("recusar solicitação de acesso", error);
    throw error;
  }
  await notifyDecision(id, "rejected");
  return data as ClientAccessRequest;
}
