export const JOB_STATUS = {
  OPEN: "publicada",
  DRAFT: "rascunho",
  CLOSED: "encerrada",
  DELETED: "excluida",
} as const;

export type JobStatus = typeof JOB_STATUS[keyof typeof JOB_STATUS];

export const JOB_STATUS_OPTIONS: ReadonlyArray<{ value: Exclude<JobStatus, "excluida">; label: string }> = [
  { value: JOB_STATUS.OPEN, label: "Publicada" },
  { value: JOB_STATUS.DRAFT, label: "Rascunho" },
  { value: JOB_STATUS.CLOSED, label: "Encerrada" },
];

export type JobStatusCategory = "aberta" | "pendente" | "encerrada" | "ignorada";

function normalizeJobStatus(status: string) {
  return status.trim().toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[_-]+/g, " ").replace(/\s+/g, " ");
}

const OPEN_JOB_STATUSES = new Set(["publicada", "publicado", "ativa", "ativo", "aberta", "aberto", "em andamento", "andamento"]);
const PENDING_JOB_STATUSES = new Set(["rascunho", "pendente", "pendencia", "pausada", "pausado", "em pausa", "aguardando", "aguardando publicacao"]);
const CLOSED_JOB_STATUSES = new Set(["encerrada", "encerrado", "concluida", "concluido", "preenchida", "preenchido", "cancelada", "cancelado", "fechada", "fechado"]);

export function jobStatusCategory(status: string): JobStatusCategory {
  const normalized = normalizeJobStatus(status);
  if (OPEN_JOB_STATUSES.has(normalized)) return "aberta";
  if (PENDING_JOB_STATUSES.has(normalized)) return "pendente";
  if (CLOSED_JOB_STATUSES.has(normalized)) return "encerrada";
  return "ignorada";
}

export function jobStatusLabel(status: string) {
  const normalized = normalizeJobStatus(status).replace(/ /g, "_");
  return JOB_STATUS_OPTIONS.find((item) => item.value === normalized)?.label ?? (normalized === "excluida" ? "Excluída" : status);
}

export type Job = {
  id: string | number;
  titulo: string;
  slug: string;
  empresa: string | null;
  empresa_id?: string | null;
  valor_previsto?: number;
  valor_recebido?: number;
  garantia_ate?: string | null;
  encerramento_previsto?: string | null;
  cidade: string;
  estado: string;
  modalidade: string | null;
  tipo_contrato: string | null;
  salario: string | null;
  exibir_salario: boolean;
  descricao: string | null;
  atividades: string | null;
  requisitos: string | null;
  beneficios: string | null;
  horario: string | null;
  quantidade_vagas: number;
  status: JobStatus;
  created_at: string;
  updated_at: string;
};

export type JobFormData = {
  empresa_id?: string | null;
  titulo: string;
  empresa: string;
  cidade: string;
  estado: string;
  modalidade: string;
  tipo_contrato: string;
  salario: string;
  exibir_salario: boolean;
  descricao: string;
  atividades: string;
  requisitos: string;
  beneficios: string;
  horario: string;
  quantidade_vagas: number;
  status: JobStatus;
};

export const EMPTY_JOB_FORM: JobFormData = {
  empresa_id: null,
  titulo: "",
  empresa: "",
  cidade: "",
  estado: "MG",
  modalidade: "",
  tipo_contrato: "",
  salario: "",
  exibir_salario: true,
  descricao: "",
  atividades: "",
  requisitos: "",
  beneficios: "",
  horario: "",
  quantidade_vagas: 1,
  status: JOB_STATUS.OPEN,
};

export function jobToForm(job: Job): JobFormData {
  return {
    empresa_id: job.empresa_id ?? null,
    titulo: job.titulo,
    empresa: job.empresa ?? "",
    cidade: job.cidade,
    estado: job.estado,
    modalidade: job.modalidade ?? "",
    tipo_contrato: job.tipo_contrato ?? "",
    salario: job.salario ?? "",
    exibir_salario: job.exibir_salario,
    descricao: job.descricao ?? "",
    atividades: job.atividades ?? "",
    requisitos: job.requisitos ?? "",
    beneficios: job.beneficios ?? "",
    horario: job.horario ?? "",
    quantidade_vagas: job.quantidade_vagas,
    status: job.status,
  };
}
