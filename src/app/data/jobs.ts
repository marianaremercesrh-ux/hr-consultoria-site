// Dados exclusivamente temporários para desenvolvimento visual.
// Remova este arquivo quando a fonte real de vagas for integrada.
export type DevelopmentJob = {
  slug: string;
  title: string;
  city: string;
  contract: "CLT" | "PJ" | "Estágio";
  modality: "Presencial" | "Híbrido" | "Remoto";
  salary?: string;
  summary: string;
  benefits: string[];
  description: string;
  activities: string[];
  requirements: string[];
  schedule: string;
};

export const DEVELOPMENT_JOBS: DevelopmentJob[] = [
  {
    slug: "vaga-exemplo-assistente-administrativo",
    title: "Vaga de exemplo — Assistente Administrativo",
    city: "Cidade de exemplo, MG",
    contract: "CLT",
    modality: "Presencial",
    salary: "Valor de exemplo",
    summary: "Conteúdo temporário criado apenas para validar o layout da página de vagas.",
    benefits: ["Benefício de exemplo", "Benefício de exemplo"],
    description: "Descrição temporária para desenvolvimento. Esta oportunidade não está aberta e não representa uma vaga real.",
    activities: ["Atividade ilustrativa para teste do componente.", "Atividade ilustrativa para teste da responsividade."],
    requirements: ["Requisito temporário de demonstração.", "Requisito temporário de demonstração."],
    schedule: "Horário de exemplo",
  },
  {
    slug: "vaga-exemplo-analista-de-rh",
    title: "Vaga de exemplo — Analista de RH",
    city: "Cidade de exemplo, SP",
    contract: "PJ",
    modality: "Híbrido",
    summary: "Conteúdo temporário criado apenas para testar busca, filtros e estado responsivo.",
    benefits: ["Benefício de exemplo"],
    description: "Descrição temporária para desenvolvimento. Esta oportunidade não está aberta e não representa uma vaga real.",
    activities: ["Atividade ilustrativa para teste do componente."],
    requirements: ["Requisito temporário de demonstração."],
    schedule: "Horário de exemplo",
  },
];
