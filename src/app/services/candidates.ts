import { supabase } from "../lib/supabase";
import type { Candidato, CandidatoComTotal, CandidatoForm } from "../types/candidates";

const CANDIDATE_COLUMNS = "id,nome,telefone,cidade,estado,linkedin,observacoes,curriculo_url,created_at,updated_at";
export type JobSummaryCandidate = Pick<Candidato, "id" | "nome" | "telefone" | "cidade" | "created_at">;
export type CandidateReportCandidate = Pick<Candidato, "id" | "nome" | "observacoes" | "created_at"> & Partial<Pick<Candidato, "telefone" | "cidade" | "estado" | "linkedin">> & { total_processos: number };

export async function listCandidates(): Promise<CandidatoComTotal[]> {
  const { data, error } = await supabase
    .from("candidatos")
    .select(`${CANDIDATE_COLUMNS},candidaturas(count)`)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((item) => {
    const candidate = item as Candidato & { candidaturas?: Array<{ count: number }> };
    const { candidaturas, ...fields } = candidate;
    return { ...fields, total_processos: candidaturas?.[0]?.count ?? 0 };
  });
}

export async function getCandidate(id: string): Promise<Candidato | null> {
  const { data, error } = await supabase.from("candidatos").select(CANDIDATE_COLUMNS).eq("id", id).maybeSingle();
  if (error) throw error;
  return data as Candidato | null;
}

export async function listCandidatesByIds(ids: string[]): Promise<JobSummaryCandidate[]> {
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from("candidatos")
    .select("id,nome,telefone,cidade,created_at")
    .in("id", ids);
  if (error) throw error;
  return (data ?? []) as JobSummaryCandidate[];
}

export async function listCandidatesForReport(includeContact: boolean, includeCity = false): Promise<CandidateReportCandidate[]> {
  const columns = includeContact ? "id,nome,telefone,cidade,estado,linkedin,observacoes,created_at" : includeCity ? "id,nome,cidade,observacoes,created_at" : "id,nome,observacoes,created_at";
  const { data, error } = await supabase.from("candidatos").select(`${columns},candidaturas(count)`).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => {
    const candidate = row as unknown as CandidateReportCandidate & { candidaturas?: Array<{ count: number }> };
    const { candidaturas, ...fields } = candidate;
    return { ...fields, total_processos: candidaturas?.[0]?.count ?? 0 };
  });
}

export async function createCandidate(form: CandidatoForm): Promise<Candidato> {
  const now = new Date().toISOString();
  const { data, error } = await supabase.from("candidatos").insert({ ...form, created_at: now, updated_at: now }).select(CANDIDATE_COLUMNS).single();
  if (error) throw error;
  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from("historico_candidatos").insert({ candidato_id: data.id, evento: "Cadastro do candidato", responsavel: user?.id ?? null });
  return data as Candidato;
}

export async function updateCandidate(id: string, form: CandidatoForm, curriculoUrl?: string | null) {
  const update = { ...form, updated_at: new Date().toISOString(), ...(curriculoUrl !== undefined ? { curriculo_url: curriculoUrl } : {}) };
  const { error } = await supabase.from("candidatos").update(update).eq("id", id);
  if (error) throw error;
}

export async function setCandidateResume(id: string, path: string) {
  const { error } = await supabase.from("candidatos").update({ curriculo_url: path, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}

export async function deleteCandidate(id: string) {
  const { error } = await supabase.from("candidatos").delete().eq("id", id);
  if (error) throw error;
}
