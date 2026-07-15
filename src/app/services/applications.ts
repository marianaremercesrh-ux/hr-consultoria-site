import { supabase } from "../lib/supabase";
import type { Candidatura, CandidaturaDetalhada, EtapaProcesso } from "../types/candidates";

type ApplicationDatabaseRow = Pick<Candidatura, "id" | "candidato_id" | "vaga_id" | "etapa" | "observacoes" | "created_at" | "updated_at" | "data_admissao">;
export type JobSummaryApplicationRow = Pick<Candidatura, "id" | "candidato_id" | "vaga_id" | "etapa" | "observacoes" | "created_at" | "updated_at">;

const APPLICATION_COLUMNS = "id,candidato_id,vaga_id,etapa,observacoes,data_admissao,created_at,updated_at";
const DETAIL_SELECT = `${APPLICATION_COLUMNS},portal_liberado,portal_liberado_em,portal_liberado_por,resumo_cliente,pontos_positivos_cliente,pontos_atencao_cliente,curriculo_liberado,candidato:candidatos(id,nome,telefone,cidade,estado,linkedin,observacoes,curriculo_url,created_at,updated_at),vaga:vagas(id,titulo,status,empresa,empresa_id,empresa_cliente:empresas(id,nome))`;

function normalizeApplication(row: ApplicationDatabaseRow): Candidatura {
  return { portal_liberado:false,portal_liberado_em:null,portal_liberado_por:null,resumo_cliente:null,pontos_positivos_cliente:null,pontos_atencao_cliente:null,curriculo_liberado:false,...row };
}

export async function listApplications(): Promise<CandidaturaDetalhada[]> {
  const { data, error } = await supabase.from("candidaturas").select(DETAIL_SELECT).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => {
    const detailed = row as unknown as ApplicationDatabaseRow & Pick<CandidaturaDetalhada, "candidato" | "vaga">;
    return { ...normalizeApplication(detailed), candidato: detailed.candidato, vaga: detailed.vaga };
  });
}

export async function listApplicationReferencesForJobs(jobIds: Array<string | number>): Promise<Array<Pick<Candidatura, "candidato_id" | "vaga_id">>> {
  if (jobIds.length === 0) return [];
  const { data, error } = await supabase.from("candidaturas").select("candidato_id,vaga_id").in("vaga_id", jobIds);
  if (error) throw error;
  return (data ?? []) as Array<Pick<Candidatura, "candidato_id" | "vaga_id">>;
}

export async function listApplicationsForJobSummary(): Promise<JobSummaryApplicationRow[]> {
  const { data, error } = await supabase
    .from("candidaturas")
    .select(APPLICATION_COLUMNS)
    .not("vaga_id", "is", null)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => normalizeApplication(row as ApplicationDatabaseRow));
}

export async function listApplicationsForCandidateReport(): Promise<JobSummaryApplicationRow[]> {
  const { data, error } = await supabase.from("candidaturas").select(APPLICATION_COLUMNS).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => normalizeApplication(row as ApplicationDatabaseRow));
}

export async function listCandidateLatestStages(): Promise<Array<Pick<Candidatura, "candidato_id" | "etapa" | "updated_at">>> {
  const { data, error } = await supabase
    .from("candidaturas")
    .select("candidato_id,etapa,created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({ candidato_id: row.candidato_id, etapa: row.etapa, updated_at: row.created_at })) as Array<Pick<Candidatura, "candidato_id" | "etapa" | "updated_at">>;
}

export async function listCandidateApplications(candidateId: string): Promise<CandidaturaDetalhada[]> {
  const { data, error } = await supabase.from("candidaturas").select(DETAIL_SELECT).eq("candidato_id", candidateId).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => {
    const detailed = row as unknown as ApplicationDatabaseRow & Pick<CandidaturaDetalhada, "candidato" | "vaga">;
    return { ...normalizeApplication(detailed), candidato: detailed.candidato, vaga: detailed.vaga };
  });
}

export async function getCandidateLatestApplication(candidateId: string): Promise<Pick<Candidatura, "id" | "vaga_id" | "etapa" | "observacoes" | "updated_at"> | null> {
  const { data, error } = await supabase
    .from("candidaturas")
    .select(APPLICATION_COLUMNS)
    .eq("candidato_id", candidateId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? normalizeApplication(data as ApplicationDatabaseRow) : null;
}

export async function createApplication(candidateId: string, jobId: string | number, etapa: EtapaProcesso, observacoes = "") {
  const { data, error } = await supabase.from("candidaturas").insert({ candidato_id: candidateId, vaga_id: jobId, etapa, observacoes: observacoes.trim() || null }).select("id,candidato_id,vaga_id").single();
  if (error) throw error;
  if (!data.candidato_id || data.vaga_id == null) throw new Error("O Supabase criou a candidatura sem candidato_id ou vaga_id.");
  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from("historico_candidatos").insert({ candidato_id: candidateId, candidatura_id: data.id, evento: `Entrada no processo: ${etapa}`, observacao: observacoes.trim() || null, responsavel: user?.id ?? null });
}

export async function updateApplicationStage(id: string, etapa: EtapaProcesso, observacoes?: string | null) {
  const changes: { etapa: EtapaProcesso; observacoes?: string | null } = { etapa };
  if (observacoes !== undefined) changes.observacoes = observacoes?.trim() || null;
  const { error } = await supabase.from("candidaturas").update(changes).eq("id", id);
  if (error) throw error;
  const { data: application } = await supabase.from("candidaturas").select("candidato_id").eq("id", id).maybeSingle();
  if (application?.candidato_id) {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("historico_candidatos").insert({ candidato_id: application.candidato_id, candidatura_id: id, evento: `Mudança de etapa: ${etapa}`, observacao: observacoes?.trim() || null, responsavel: user?.id ?? null });
  }
}

export async function updateApplicationProcess(id: string, jobId: string | number, etapa: EtapaProcesso, observacoes?: string | null) {
  const changes = {
    vaga_id: jobId,
    etapa,
    observacoes: observacoes?.trim() || null,
  };
  const { data, error } = await supabase.from("candidaturas").update(changes).eq("id", id).select("candidato_id").single();
  if (error) throw error;
  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from("historico_candidatos").insert({ candidatura_id: id, candidato_id: data.candidato_id, evento: `Processo atualizado: ${etapa}`, observacao: observacoes?.trim() || null, responsavel: user?.id ?? null });
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
