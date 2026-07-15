import { supabase } from "../lib/supabase";
import type { Entrevista, InterviewModality, InterviewStatus } from "../types/ats";
import type { EtapaProcesso } from "../types/candidates";

const CLIENT_INTERVIEW_COLUMNS = "id,candidato_id,candidatura_id,vaga_id,empresa_id,tipo_entrevista,modalidade,data,horario,entrevistador,local,observacoes,observacoes_cliente,status,created_at,updated_at";

export async function getClientInterview(applicationId: string) {
  const { data, error } = await supabase.from("entrevistas").select(CLIENT_INTERVIEW_COLUMNS).eq("candidatura_id", applicationId).eq("tipo_entrevista", "cliente").maybeSingle();
  if (error) throw error;
  return data as Entrevista | null;
}

export async function saveClientInterview(input: {
  applicationId: string; candidateId: string; jobId: string | number; companyId: string;
  status: InterviewStatus; modality: InterviewModality; date: string; time: string; location: string; notes: string;
}) {
  const payload = {
    candidatura_id: input.applicationId, candidato_id: input.candidateId, vaga_id: input.jobId,
    empresa_id: input.companyId, tipo_entrevista: "cliente", modalidade: input.modality,
    data: input.date, horario: input.time, local: input.location.trim() || null,
    observacoes_cliente: input.notes.trim() || null, status: input.status, updated_at: new Date().toISOString(),
  };
  const current = await getClientInterview(input.applicationId);
  const query = current
    ? supabase.from("entrevistas").update(payload).eq("id", current.id)
    : supabase.from("entrevistas").insert(payload);
  const { data, error } = await query.select(CLIENT_INTERVIEW_COLUMNS).single();
  if (error) throw error;
  return data as Entrevista;
}

export async function saveAdmission(applicationId: string, stage: EtapaProcesso, admissionDate: string) {
  const { data, error } = await supabase.from("candidaturas")
    .update({ etapa: stage, data_admissao: admissionDate || null, updated_at: new Date().toISOString() })
    .eq("id", applicationId)
    .select("id,etapa,data_admissao,updated_at")
    .single();
  if (error) throw error;
  return data as { id: string; etapa: EtapaProcesso; data_admissao: string | null; updated_at: string };
}
