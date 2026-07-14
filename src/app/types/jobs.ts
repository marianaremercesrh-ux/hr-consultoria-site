export type JobStatus = "publicada" | "rascunho" | "encerrada" | "excluida";

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
  status: "publicada",
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
