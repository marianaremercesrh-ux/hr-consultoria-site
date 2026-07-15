import type { InterviewStatus } from "../types/ats";

const INTERVIEW_STATUSES: readonly InterviewStatus[] = [
  "solicitada",
  "agendada",
  "confirmada",
  "realizada",
  "reagendada",
  "cancelada",
  "nao_compareceu",
];

export function normalizeInterviewStatus(value: unknown): InterviewStatus | "" {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s-]+/g, "_");
  return INTERVIEW_STATUSES.includes(normalized as InterviewStatus)
    ? normalized as InterviewStatus
    : "";
}

export function interviewStatusLabel(value: unknown) {
  const labels: Record<InterviewStatus, string> = {
    solicitada: "Solicitada",
    agendada: "Agendada",
    confirmada: "Confirmada",
    realizada: "Realizada",
    reagendada: "Reagendada",
    cancelada: "Cancelada",
    nao_compareceu: "Não compareceu",
  };
  const normalized = normalizeInterviewStatus(value);
  return normalized ? labels[normalized] : "Status não informado";
}
