import { useEffect, useMemo, useState } from "react";
import AdminNav from "../components/AdminNav";
import { adminInputClass } from "../components/AdminUI";
import { listEmpresas } from "../services/ats";
import { listApplications } from "../services/applications";
import { listCandidates } from "../services/candidates";
import type { Empresa } from "../types/ats";
import { ETAPAS, etapaLabel, type CandidatoComTotal, type CandidaturaDetalhada } from "../types/candidates";

const INITIAL_FILTERS = { area: "", cidade: "", estado: "", experiencia: "", etapa: "", disponibilidade: "", empresa: "" };

export default function AdminTalentPoolPage() {
  const [candidates, setCandidates] = useState<CandidatoComTotal[]>([]);
  const [applications, setApplications] = useState<CandidaturaDetalhada[]>([]);
  const [companies, setCompanies] = useState<Empresa[]>([]);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  useEffect(() => { void Promise.all([listCandidates(), listApplications(), listEmpresas()]).then(([people, links, clients]) => { setCandidates(people); setApplications(links); setCompanies(clients); }); }, []);
  const results = useMemo(() => candidates.filter((candidate) => {
    const links = applications.filter((item) => item.candidato_id === candidate.id);
    return (!filters.area || candidate.area?.toLocaleLowerCase("pt-BR").includes(filters.area.toLocaleLowerCase("pt-BR")))
      && (!filters.cidade || candidate.cidade?.toLocaleLowerCase("pt-BR").includes(filters.cidade.toLocaleLowerCase("pt-BR")))
      && (!filters.estado || candidate.estado?.toLocaleLowerCase("pt-BR").includes(filters.estado.toLocaleLowerCase("pt-BR")))
      && (!filters.experiencia || candidate.experiencia?.toLocaleLowerCase("pt-BR").includes(filters.experiencia.toLocaleLowerCase("pt-BR")))
      && (!filters.disponibilidade || candidate.disponibilidade?.toLocaleLowerCase("pt-BR").includes(filters.disponibilidade.toLocaleLowerCase("pt-BR")))
      && (!filters.etapa || links.some((item) => item.etapa === filters.etapa))
      && (!filters.empresa || links.some((item) => item.vaga?.empresa_id === filters.empresa));
  }), [applications, candidates, filters]);
  function setFilter(name: keyof typeof INITIAL_FILTERS, value: string) { setFilters((current) => ({ ...current, [name]: value })); }
  return <main className="min-h-screen bg-[#F5F7FA]"><AdminNav/><section className="mx-auto max-w-7xl px-5 py-10"><h1 className="text-3xl font-semibold text-[#052656]">Banco de talentos</h1><div className="mt-7 grid gap-4 bg-white p-5 md:grid-cols-3">{(["area", "cidade", "estado", "experiencia", "disponibilidade"] as const).map((name) => <label key={name}><span className="mb-2 block font-semibold capitalize">{name}</span><input value={filters[name]} onChange={(event) => setFilter(name, event.target.value)} className={adminInputClass}/></label>)}<label><span className="mb-2 block font-semibold">Etapa</span><select value={filters.etapa} onChange={(event) => setFilter("etapa", event.target.value)} className={adminInputClass}><option value="">Todas</option>{ETAPAS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label><label><span className="mb-2 block font-semibold">Empresa</span><select value={filters.empresa} onChange={(event) => setFilter("empresa", event.target.value)} className={adminInputClass}><option value="">Todas</option>{companies.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</select></label></div><p className="my-5 text-gray-600">{results.length} profissionais encontrados</p><div className="grid gap-4 md:grid-cols-2">{results.map((candidate) => { const latest = applications.find((item) => item.candidato_id === candidate.id); return <a key={candidate.id} href={`/admin/candidatos/${candidate.id}`} className="bg-white p-5 shadow-sm hover:ring-1 hover:ring-[#D4A62A]"><h2 className="text-xl font-semibold text-[#052656]">{candidate.nome}</h2><p>{candidate.area || "Área não informada"} · {candidate.cidade || "Cidade não informada"}</p><p className="mt-2 text-sm text-gray-600">{latest ? etapaLabel(latest.etapa) : "Sem processo"}</p></a>; })}</div></section></main>;
}
