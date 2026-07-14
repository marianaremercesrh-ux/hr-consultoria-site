export function normalizarQuantidadeVagas(quantidade: number | null | undefined): number {
  if (quantidade === null || quantidade === undefined || !Number.isFinite(quantidade) || quantidade < 1) {
    return 1;
  }

  return Math.trunc(quantidade);
}

export function formatarQuantidadeVagas(quantidade: number | null | undefined): string {
  const quantidadeNormalizada = normalizarQuantidadeVagas(quantidade);
  return `${quantidadeNormalizada} ${quantidadeNormalizada === 1 ? "vaga" : "vagas"}`;
}

export function formatarQuantidadeVagasDisponiveis(quantidade: number | null | undefined): string {
  const quantidadeNormalizada = normalizarQuantidadeVagas(quantidade);
  return `${formatarQuantidadeVagas(quantidadeNormalizada)} ${quantidadeNormalizada === 1 ? "disponível" : "disponíveis"}`;
}
