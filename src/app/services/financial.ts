import { supabase } from "../lib/supabase";
import type { FinancialForm, FinancialTransaction } from "../types/financial";

const BUCKET = "financeiro-anexos";
const COLUMNS = "id,tipo,descricao,contraparte,empresa_id,vaga_servico,categoria,valor,data_vencimento,data_pagamento,forma_pagamento,status,observacoes,anexo_nome,anexo_caminho,anexo_tipo,created_at,updated_at";
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const EXTENSIONS = ["pdf", "jpg", "jpeg", "png"];
const MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"];

export function validateFinancialAttachment(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (file.size > MAX_FILE_SIZE) throw new Error("O anexo deve ter no máximo 10 MB.");
  if (!EXTENSIONS.includes(extension) || !MIME_TYPES.includes(file.type)) throw new Error("Envie um arquivo PDF, JPG, JPEG ou PNG.");
}

export async function listFinancialTransactions() {
  const { data, error } = await supabase.from("movimentacoes_financeiras").select(COLUMNS).order("data_vencimento", { ascending: false });
  if (error) throw error;
  return (data ?? []) as FinancialTransaction[];
}

export async function saveFinancialTransaction(form: FinancialForm, id?: string) {
  const payload = {
    ...form,
    contraparte: form.contraparte.trim(),
    empresa_id: form.empresa_id || null,
    vaga_servico: form.vaga_servico?.trim() || null,
    data_pagamento: form.data_pagamento || null,
    forma_pagamento: form.forma_pagamento?.trim() || null,
    observacoes: form.observacoes?.trim() || null,
    updated_at: new Date().toISOString(),
  };
  const query = id
    ? supabase.from("movimentacoes_financeiras").update(payload).eq("id", id).select(COLUMNS).single()
    : supabase.from("movimentacoes_financeiras").insert(payload).select(COLUMNS).single();
  const { data, error } = await query;
  if (error) throw error;
  return data as FinancialTransaction;
}

export async function uploadFinancialAttachment(transaction: FinancialTransaction, file: File) {
  validateFinancialAttachment(file);
  const safeName = file.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]/g, "-");
  const path = `${transaction.id}/${crypto.randomUUID()}-${safeName}`;
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
  if (uploadError) throw uploadError;
  const oldPath = transaction.anexo_caminho;
  const { data, error } = await supabase.from("movimentacoes_financeiras").update({ anexo_nome: file.name, anexo_caminho: path, anexo_tipo: file.type, updated_at: new Date().toISOString() }).eq("id", transaction.id).select(COLUMNS).single();
  if (error) { await supabase.storage.from(BUCKET).remove([path]); throw error; }
  if (oldPath) await supabase.storage.from(BUCKET).remove([oldPath]);
  return data as FinancialTransaction;
}

export async function financialAttachmentUrl(path: string, download = false) {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 300, { download });
  if (error) throw error;
  return data.signedUrl;
}

export async function deleteFinancialAttachment(transaction: FinancialTransaction) {
  if (!transaction.anexo_caminho) return;
  const { error: storageError } = await supabase.storage.from(BUCKET).remove([transaction.anexo_caminho]);
  if (storageError) throw storageError;
  const { error } = await supabase.from("movimentacoes_financeiras").update({ anexo_nome: null, anexo_caminho: null, anexo_tipo: null, updated_at: new Date().toISOString() }).eq("id", transaction.id);
  if (error) throw error;
}

export async function deleteFinancialTransaction(transaction: FinancialTransaction) {
  if (transaction.anexo_caminho) {
    const { error } = await supabase.storage.from(BUCKET).remove([transaction.anexo_caminho]);
    if (error) throw error;
  }
  const { error } = await supabase.from("movimentacoes_financeiras").delete().eq("id", transaction.id);
  if (error) throw error;
}
