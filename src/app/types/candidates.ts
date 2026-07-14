import type { Job } from "./jobs";

export type EtapaProcesso =
  | "novo"
  | "triagem"
  | "entrevista_agendada"
  | "entrevistado"
  | "encaminhado_cliente"
  | "aprovado"
  | "reprovado"
  | "banco_talentos";

export const ETAPAS: Array<{ value: EtapaProcesso; label: string }> = [
  { value: "novo", label: "Novo candidato" },
  { value: "triagem", label: "Triagem" },
  { value: "entrevista_agendada", label: "Entrevista agendada" },
  { value: "entrevistado", label: "Entrevistado" },
  { value: "encaminhado_cliente", label: "Encaminhado ao cliente" },
  { value: "aprovado", label: "Aprovado" },
  { value: "reprovado", label: "Reprovado" },
  { value: "banco_talentos", label: "Banco de talentos" },
];

export function etapaLabel(etapa: EtapaProcesso) {
  return ETAPAS.find((item) => item.value === etapa)?.label ?? etapa;
}

export type Candidato = {
  id: string;
  nome: string;
  telefone: string | null;
  cidade: string | null;
  estado: string | null;
  linkedin: string | null;
  observacoes: string | null;
  curriculo_url: string | null;
  created_at: string;
  updated_at: string;
};

export type CandidatoForm = {
  nome: string;
  telefone: string;
  cidade: string;
  estado: string;
  linkedin: string;
  observacoes: string;
};

export type CandidatoComTotal = Candidato & { total_processos: number };

export type Candidatura = {
  id: string;
  candidato_id: string;
  vaga_id: string | number | null;
  etapa: EtapaProcesso;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
};

export type CandidaturaDetalhada = Candidatura & {
  candidato: Candidato;
  vaga: Pick<Job, "id" | "titulo" | "status"> | null;
};
