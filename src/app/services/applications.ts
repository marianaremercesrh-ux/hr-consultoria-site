import { supabase } from "../lib/supabase";
import type { Candidatura, CandidaturaDetalhada, EtapaProcesso } from "../types/candidates";

const DETAIL_SELECT = "*, candidato:candidatos(*), vaga:vagas(id,titulo,status,empresa_id)";

export async function listApplications(): Promise<CandidaturaDetalhada[]> {
  const { data, error } = await supabase.from("candidaturas").select(DETAIL_SELECT).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as CandidaturaDetalhada[];
}

export async function listCandidateApplications(candidateId: string): Promise<CandidaturaDetalhada[]> {
  const { data, error } = await supabase.from("candidaturas").select(DETAIL_SELECT).eq("candidato_id", candidateId).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as CandidaturaDetalhada[];
}

export async function createApplication(candidateId: string, jobId: string | number, etapa: EtapaProcesso, observacoes = "") {
  const now = new Date().toISOString();
  const { error } = await supabase.from("candidaturas").insert({ candidato_id: candidateId, vaga_id: jobId, etapa, observacoes: observacoes.trim() || null, created_at: now, updated_at: now });
  if (error) throw error;
}

export async function updateApplicationStage(id: string, etapa: EtapaProcesso, observacoes?: string | null) {
  const changes: { etapa: EtapaProcesso; updated_at: string; observacoes?: string | null } = { etapa, updated_at: new Date().toISOString() };
  if (observacoes !== undefined) changes.observacoes = observacoes?.trim() || null;
  const { error } = await supabase.from("candidaturas").update(changes).eq("id", id);
  if (error) throw error;
  const { data: application } = await supabase.from("candidaturas").select("candidato_id").eq("id", id).maybeSingle();
  if (application?.candidato_id) {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("historico_candidatos").insert({ candidato_id: application.candidato_id, candidatura_id: id, evento: `Mudança de etapa: ${etapa}`, observacao: observacoes?.trim() || null, responsavel: user?.id ?? null });
  }
}

export async function deleteApplication(id: string) {
  const { error } = await supabase.from("candidaturas").delete().eq("id", id);
  if (error) throw error;
}

export async function applicationCounts() {
  const { data, error } = await supabase.from("candidaturas").select("etapa");
  if (error) throw error;
  return (data ?? []) as Pick<Candidatura, "etapa">[];
}
