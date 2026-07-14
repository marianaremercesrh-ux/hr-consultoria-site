import { supabase } from "../lib/supabase";
import { supabaseErrorDetails } from "../lib/supabaseError";
import { JOB_STATUS, type Job, type JobFormData, type JobStatus } from "../types/jobs";

const JOB_COLUMNS = "id,titulo,slug,empresa,cidade,estado,modalidade,tipo_contrato,salario,exibir_salario,descricao,atividades,requisitos,beneficios,horario,quantidade_vagas,status,created_at,updated_at";
const CREATED_JOB_COLUMNS = "id,titulo,slug,empresa,status,created_at";

export type SelectableJob = Pick<Job, "id" | "titulo" | "status" | "empresa">;
export type JobStatusRecord = Pick<Job, "id" | "status">;
export type JobCandidateSummary = Pick<Job, "id" | "titulo" | "quantidade_vagas" | "status">;

export function generateJobSlug(title: string, city: string) {
  return `${title}-${city}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function listJobs() {
  const { data, error } = await supabase
    .from("vagas")
    .select(JOB_COLUMNS)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Job[];
}

export async function listJobStatuses(): Promise<JobStatusRecord[]> {
  const { data, error } = await supabase
    .from("vagas")
    .select("id,status");
  if (error) throw error;
  return (data ?? []) as JobStatusRecord[];
}

export async function listJobsForCandidateSummary(): Promise<JobCandidateSummary[]> {
  const { data, error } = await supabase
    .from("vagas")
    .select("id,titulo,quantidade_vagas,status")
    .order("titulo", { ascending: true });
  if (error) throw error;
  return (data ?? []) as JobCandidateSummary[];
}

export async function listSelectableJobs(): Promise<SelectableJob[]> {
  const { data, error } = await supabase
    .from("vagas")
    .select("id,titulo,status,empresa")
    .in("status", [JOB_STATUS.OPEN, JOB_STATUS.DRAFT])
    .order("titulo", { ascending: true });
  if (error) throw error;
  return (data ?? []) as SelectableJob[];
}

export async function listJobsByCompanyId(empresaId: string) {
  const { data, error } = await supabase
    .from("vagas")
    .select("id,status,empresa_id")
    .eq("empresa_id", empresaId);
  if (error) throw error;
  return (data ?? []) as Array<Pick<Job, "id" | "status" | "empresa_id">>;
}

export async function listPublishedJobs() {
  const { data, error } = await supabase
    .from("vagas")
    .select(JOB_COLUMNS)
    .eq("status", JOB_STATUS.OPEN)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Job[];
}

export async function getJobById(id: string | number) {
  const { data, error } = await supabase
    .from("vagas")
    .select(JOB_COLUMNS)
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Job;
}

export async function getPublishedJobBySlug(slug: string) {
  const { data, error } = await supabase
    .from("vagas")
    .select(JOB_COLUMNS)
    .eq("slug", slug)
    .eq("status", JOB_STATUS.OPEN)
    .maybeSingle();
  if (error) throw error;
  return data as Job | null;
}

export async function findJobBySlug(slug: string): Promise<Pick<Job, "id" | "titulo" | "slug" | "empresa" | "status" | "created_at"> | null> {
  const { data, error } = await supabase
    .from("vagas")
    .select(CREATED_JOB_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data as Pick<Job, "id" | "titulo" | "slug" | "empresa" | "status" | "created_at"> | null;
}

export async function createJob(form: JobFormData): Promise<Pick<Job, "id" | "titulo" | "slug" | "empresa" | "status" | "created_at">> {
  const now = new Date().toISOString();
  const optionalText = (value: string) => value.trim() || null;
  const payload = {
    titulo: form.titulo.trim(),
    slug: generateJobSlug(form.titulo, form.cidade),
    empresa: optionalText(form.empresa),
    cidade: form.cidade.trim(),
    estado: form.estado.trim(),
    modalidade: optionalText(form.modalidade),
    tipo_contrato: optionalText(form.tipo_contrato),
    salario: optionalText(form.salario),
    exibir_salario: form.exibir_salario,
    descricao: optionalText(form.descricao),
    atividades: optionalText(form.atividades),
    requisitos: optionalText(form.requisitos),
    beneficios: optionalText(form.beneficios),
    horario: optionalText(form.horario),
    quantidade_vagas: form.quantidade_vagas,
    status: form.status,
    created_at: now,
    updated_at: now,
  };
  if (import.meta.env.DEV) console.info("[Supabase] payload do INSERT em public.vagas", payload);
  const { data, error } = await supabase.from("vagas").insert(payload).select(CREATED_JOB_COLUMNS).single();
  if (error) {
    const { message, details, hint, code } = supabaseErrorDetails(error);
    console.error("[Supabase] INSERT em public.vagas falhou", { message, details, hint, code, payload: import.meta.env.DEV ? payload : undefined });
    throw error;
  }
  if (import.meta.env.DEV) console.info("[Supabase] vaga confirmada pelo INSERT", data);
  return data as Pick<Job, "id" | "titulo" | "slug" | "empresa" | "status" | "created_at">;
}

export async function updateJob(id: string | number, form: JobFormData) {
  const { error } = await supabase
    .from("vagas")
    .update({
      ...form,
      slug: generateJobSlug(form.titulo, form.cidade),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw error;
}

export async function updateJobStatus(id: string | number, status: JobStatus) {
  const { error } = await supabase
    .from("vagas")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteJob(id: string | number) {
  const { error } = await supabase
    .from("vagas")
    .update({ status: JOB_STATUS.DELETED, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}
