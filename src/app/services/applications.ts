import { supabase } from "../lib/supabase";
import type { Candidatura, CandidaturaDetalhada, EtapaProcesso } from "../types/candidates";

const DETAIL_SELECT = "*, candidato:candidatos(*), vaga:vagas(id,titulo,status)";

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

export async function createApplication(candidateId: string, jobId: string | number, etapa: EtapaProcesso) {
  const now = new Date().toISOString();
  const { error } = await supabase.from("candidaturas").insert({ candidato_id: candidateId, vaga_id: jobId, etapa, created_at: now, updated_at: now });
  if (error) throw error;
}

export async function updateApplicationStage(id: string, etapa: EtapaProcesso) {
  const { error } = await supabase.from("candidaturas").update({ etapa, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
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
