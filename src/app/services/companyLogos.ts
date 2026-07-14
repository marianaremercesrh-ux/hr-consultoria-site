import { supabase } from "../lib/supabase";

const BUCKET = "logos-empresas";
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const ALLOWED_EXTENSIONS = ["png", "jpg", "jpeg", "webp"];

export function validateCompanyLogo(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (file.size > MAX_SIZE) throw new Error("A logo deve ter no máximo 5 MB.");
  if (!ALLOWED_TYPES.includes(file.type) || !ALLOWED_EXTENSIONS.includes(extension)) {
    throw new Error("Envie uma imagem PNG, JPG, JPEG ou WebP.");
  }
}

export async function signedCompanyLogo(path: string) {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600);
  if (error) throw error;
  return data.signedUrl;
}

export async function uploadCompanyLogo(empresaId: string, file: File, oldPath?: string | null) {
  validateCompanyLogo(file);
  const safeName = file.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]/g, "-");
  const path = `${empresaId}/${crypto.randomUUID()}-${safeName}`;
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
  if (uploadError) throw uploadError;

  const { error: updateError } = await supabase.from("empresas").update({ logo_url: path, updated_at: new Date().toISOString() }).eq("id", empresaId);
  if (updateError) {
    await supabase.storage.from(BUCKET).remove([path]);
    throw updateError;
  }
  if (oldPath && oldPath !== path) await supabase.storage.from(BUCKET).remove([oldPath]);
  return path;
}
