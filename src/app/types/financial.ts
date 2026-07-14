export type FinancialType = "entrada" | "saida";
export type FinancialStatus = "pago" | "pendente" | "atrasado";

export type FinancialTransaction = {
  id: string;
  tipo: FinancialType;
  descricao: string;
  contraparte: string;
  empresa_id: string | null;
  vaga_servico: string | null;
  categoria: string;
  valor: number;
  data_vencimento: string;
  data_pagamento: string | null;
  forma_pagamento: string | null;
  status: FinancialStatus;
  observacoes: string | null;
  anexo_nome: string | null;
  anexo_caminho: string | null;
  anexo_tipo: string | null;
  created_at: string;
  updated_at: string;
};

export type FinancialForm = Pick<FinancialTransaction, "tipo" | "descricao" | "contraparte" | "empresa_id" | "vaga_servico" | "categoria" | "valor" | "data_vencimento" | "data_pagamento" | "forma_pagamento" | "status" | "observacoes">;
