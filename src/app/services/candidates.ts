import { supabase } from "../lib/supabase";
import type { Candidato, CandidatoComTotal, CandidatoForm } from "../types/candidates";

export async function listCandidates(): Promise<CandidatoComTotal[]> {
  const { data, error } = await supabase
    .from("candidatos")
    .select("*, candidaturas(count)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((item) => {
    const candidate = item as Candidato & { candidaturas?: Array<{ count: number }> };
    const { candidaturas, ...fields } = candidate;
    return { ...fields, total_processos: candidaturas?.[0]?.count ?? 0 };
  });
}

export async function getCandidate(id: string): Promise<Candidato> {
  const { data, error } = await supabase.from("candidatos").select("*").eq("id", id).single();
  if (error) throw error;
  return data as Candidato;
}

export async function createCandidate(form: CandidatoForm): Promise<Candidato> {
  const now = new Date().toISOString();
  const { data, error } = await supabase.from("candidatos").insert({ ...form, created_at: now, updated_at: now }).select("*").single();
  if (error) throw error;
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
