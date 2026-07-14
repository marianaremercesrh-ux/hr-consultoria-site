import type { Candidato } from "./candidates";
import type { Job } from "./jobs";

export type EmpresaStatus = "ativo" | "inativo";

export type Empresa = {
  id: string;
  nome: string;
  cnpj: string | null;
  logo_url: string | null;
  contato_nome: string | null;
  contato_cargo: string | null;
  telefone: string | null;
  whatsapp: string | null;
  email: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  observacoes: string | null;
  status: EmpresaStatus;
  created_at: string;
  updated_at: string;
};

export type EmpresaForm = Omit<Empresa, "id" | "created_at" | "updated_at">;
export type InterviewStatus = "agendada" | "confirmada" | "realizada" | "reagendada" | "cancelada" | "nao_compareceu";

export type Entrevista = {
  id: string;
  candidato_id: string | null;
  candidato_nome_manual: string | null;
  vaga_id: string | number | null;
  empresa_id: string | null;
  data: string;
  horario: string;
  entrevistador: string | null;
  local: string | null;
  observacoes: string | null;
  status: InterviewStatus;
  created_at: string;
  updated_at: string;
  candidato?: Pick<Candidato, "id" | "nome"> | null;
  vaga?: Pick<Job, "id" | "titulo"> | null;
  empresa?: Pick<Empresa, "id" | "nome"> | null;
};

export type HistoricoCandidato = { id: string; candidato_id: string; candidatura_id: string | null; evento: string; observacao: string | null; responsavel: string | null; created_at: string };
export type ObservacaoInterna = { id: string; candidato_id: string; usuario_id: string | null; texto: string; created_at: string };
