import type { Job } from "./jobs";

export type EtapaProcesso =
  | "novo"
  | "triagem"
  | "entrevista_agendada"
  | "entrevista_reagendada"
  | "nao_compareceu"
  | "entrevista_cancelada"
  | "entrevistado"
  | "encaminhado_cliente"
  | "aprovado"
  | "reprovado"
  | "desistente"
  | "contratado"
  | "banco_talentos";

export type EtapaTone = "positive" | "info" | "warning" | "neutral";

export const ETAPAS: Array<{ value: EtapaProcesso; label: string; tone: EtapaTone }> = [
  { value: "novo", label: "Novo candidato", tone: "info" },
  { value: "triagem", label: "Triagem", tone: "info" },
  { value: "entrevista_agendada", label: "Entrevista agendada", tone: "positive" },
  { value: "entrevista_reagendada", label: "Entrevista reagendada", tone: "warning" },
  { value: "nao_compareceu", label: "Não compareceu à entrevista", tone: "warning" },
  { value: "entrevista_cancelada", label: "Entrevista cancelada", tone: "neutral" },
  { value: "entrevistado", label: "Entrevistado", tone: "positive" },
  { value: "encaminhado_cliente", label: "Encaminhado ao cliente", tone: "positive" },
  { value: "aprovado", label: "Aprovado", tone: "positive" },
  { value: "reprovado", label: "Reprovado", tone: "warning" },
  { value: "desistente", label: "Desistente", tone: "neutral" },
  { value: "contratado", label: "Contratado", tone: "positive" },
  { value: "banco_talentos", label: "Banco de talentos", tone: "info" },
];

export const ETAPAS_COM_MOTIVO: readonly EtapaProcesso[] = ["nao_compareceu", "entrevista_cancelada", "reprovado", "desistente"];

export function etapaPermiteMotivo(etapa: EtapaProcesso): boolean {
  return ETAPAS_COM_MOTIVO.includes(etapa);
}

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
  area?: string | null;
  experiencia?: string | null;
  disponibilidade?: string | null;
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
  vaga: (Pick<Job, "id" | "titulo" | "status"> & { empresa?: string | null; empresa_id?: string | null }) | null;
};
