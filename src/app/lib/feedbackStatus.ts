export function normalizeFeedbackStatus(status_atendimento: unknown) {
  return String(status_atendimento ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function feedbackActionVisibility(status_atendimento: unknown) {
  const normalizedStatus = normalizeFeedbackStatus(status_atendimento);
  return {
    normalizedStatus,
    showStart: normalizedStatus === "pendente",
    showFinish: normalizedStatus === "pendente" || normalizedStatus === "em_andamento",
    completed: normalizedStatus === "concluido",
  };
}
