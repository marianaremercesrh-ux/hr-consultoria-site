import { supabase } from "../lib/supabase";

const BUCKET = "curriculos";
const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const ALLOWED_EXTENSIONS = ["pdf", "doc", "docx"];

export function validateResume(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXTENSIONS.includes(extension) || !ALLOWED_TYPES.includes(file.type)) throw new Error("Envie um currículo em PDF, DOC ou DOCX.");
  if (file.size > MAX_SIZE) throw new Error("O currículo deve ter no máximo 10 MB.");
}

export async function uploadResume(candidateId: string, file: File) {
  validateResume(file);
  const extension = file.name.split(".").pop()?.toLowerCase();
  const path = `${candidateId}/${Date.now()}.${extension}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw error;
  return path;
}

export async function deleteResume(path: string) {
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw error;
}

export async function createResumeSignedUrl(path: string) {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60);
  if (error) throw error;
  return data.signedUrl;
}
