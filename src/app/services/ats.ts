import { supabase } from "../lib/supabase";
import type { Empresa, EmpresaForm, Entrevista, HistoricoCandidato, ObservacaoInterna } from "../types/ats";
const EMPRESA_COLUMNS="id,nome,cnpj,logo_url,contato_nome,contato_cargo,telefone,whatsapp,email,endereco,cidade,estado,observacoes,status,created_at,updated_at";
const ENTREVISTA_COLUMNS="id,candidato_id,candidato_nome_manual,vaga_id,empresa_id,candidatura_id,tipo_entrevista,modalidade,data,horario,entrevistador,local,observacoes,observacoes_cliente,status,created_at,updated_at";
export async function listEmpresas(){ const {data,error}=await supabase.from("empresas").select(EMPRESA_COLUMNS).order("nome",{ascending:true}); if(error)throw error; return (data??[]) as Empresa[]; }
export async function getEmpresa(id:string){ const {data,error}=await supabase.from("empresas").select(EMPRESA_COLUMNS).eq("id",id).single(); if(error)throw error; return data as Empresa; }
export async function saveEmpresa(form:EmpresaForm,id?:string){
  const optionalText=(value:string|null)=>value?.trim()||null;
  const payload={
    nome:form.nome.trim(),
    cnpj:optionalText(form.cnpj),
    contato_nome:optionalText(form.contato_nome),
    contato_cargo:optionalText(form.contato_cargo),
    telefone:optionalText(form.telefone),
    whatsapp:optionalText(form.whatsapp),
    email:optionalText(form.email),
    endereco:optionalText(form.endereco),
    cidade:optionalText(form.cidade),
    estado:optionalText(form.estado),
    observacoes:optionalText(form.observacoes),
    status:form.status,
    updated_at:new Date().toISOString(),
  };
  const query=id?supabase.from("empresas").update(payload).eq("id",id).select(EMPRESA_COLUMNS).single():supabase.from("empresas").insert(payload).select(EMPRESA_COLUMNS).single();
  const {data,error}=await query;
  if(error)throw error;
  return data as Empresa;
}
export async function listEntrevistas(){ const {data,error}=await supabase.from("entrevistas").select("*,candidato:candidatos(id,nome),vaga:vagas(id,titulo),empresa:empresas(id,nome)").order("data").order("horario"); if(error)throw error; return (data??[]) as unknown as Entrevista[]; }
export async function createEntrevista(form:Omit<Entrevista,"id"|"created_at"|"updated_at"|"candidato"|"vaga"|"empresa">){ const {data,error}=await supabase.from("entrevistas").insert(form).select(ENTREVISTA_COLUMNS).single(); if(error)throw error; return data as Entrevista; }
export async function updateEntrevista(id:string,form:Omit<Entrevista,"id"|"created_at"|"updated_at"|"candidato"|"vaga"|"empresa">){const{data,error}=await supabase.from("entrevistas").update({...form,updated_at:new Date().toISOString()}).eq("id",id).select(ENTREVISTA_COLUMNS).single();if(error)throw error;return data as Entrevista;}
export async function updateInterviewStatus(id:string,status:Entrevista["status"]){const{error}=await supabase.from("entrevistas").update({status,updated_at:new Date().toISOString()}).eq("id",id);if(error)throw error;}
export async function deleteEntrevista(id:string){const{error}=await supabase.from("entrevistas").delete().eq("id",id);if(error)throw error;}
export async function listHistorico(candidateId:string){ const {data,error}=await supabase.from("historico_candidatos").select("id,candidato_id,candidatura_id,evento,observacao,responsavel,created_at").eq("candidato_id",candidateId).order("created_at",{ascending:false}); if(error)throw error; return (data??[]) as HistoricoCandidato[]; }
export async function addHistorico(candidateId:string,evento:string,observacao?:string,candidaturaId?:string){ const {data:{user}}=await supabase.auth.getUser(); const {error}=await supabase.from("historico_candidatos").insert({candidato_id:candidateId,candidatura_id:candidaturaId??null,evento,observacao:observacao?.trim()||null,responsavel:user?.id??null}); if(error)throw error; }
export async function listNotas(candidateId:string){ const {data,error}=await supabase.from("observacoes_internas").select("id,candidato_id,usuario_id,texto,created_at").eq("candidato_id",candidateId).order("created_at",{ascending:false}); if(error)throw error; return (data??[]) as ObservacaoInterna[]; }
export async function addNota(candidateId:string,texto:string){ const {data:{user},error:authError}=await supabase.auth.getUser(); if(authError)throw authError; if(!user)throw new Error("Sessão administrativa não encontrada."); const {data,error}=await supabase.from("observacoes_internas").insert({candidato_id:candidateId,usuario_id:user.id,texto:texto.trim()}).select("id,candidato_id,usuario_id,texto,created_at").single(); if(error)throw error; return data as ObservacaoInterna; }
