import { supabase } from "../lib/supabase";
import type { Job, JobFormData, JobStatus } from "../types/jobs";

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
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Job[];
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
    .select("*")
    .eq("status", "publicada")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Job[];
}

export async function getJobById(id: string | number) {
  const { data, error } = await supabase
    .from("vagas")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Job;
}

export async function getPublishedJobBySlug(slug: string) {
  const { data, error } = await supabase
    .from("vagas")
    .select("*")
    .eq("slug", slug)
    .eq("status", "publicada")
    .maybeSingle();
  if (error) throw error;
  return data as Job | null;
}

export async function createJob(form: JobFormData) {
  const now = new Date().toISOString();
  const { error } = await supabase.from("vagas").insert({
    ...form,
    slug: generateJobSlug(form.titulo, form.cidade),
    created_at: now,
    updated_at: now,
  });
  if (error) throw error;
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
    .update({ status: "excluida", updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}
