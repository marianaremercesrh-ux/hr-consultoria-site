import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, FilterX, Pencil, Trash2, UserRound } from "lucide-react";
import AdminNav from "../components/AdminNav";
import { EtapaBadge } from "../components/ApplicationStageControl";
import { AdminNotice, AdminSkeleton, ConfirmDialog, adminButtonClass, adminInputClass, adminTableHeadClass, adminTableRowClass } from "../components/AdminUI";
import { useAdminSession } from "../hooks/useAdminSession";
import { listCandidateLatestStages } from "../services/applications";
import { deleteCandidate, listCandidates } from "../services/candidates";
import { deleteResume } from "../services/storage";
import { ETAPAS, type CandidatoComTotal, type EtapaProcesso } from "../types/candidates";

export default function AdminCandidatesPage() {
  const checkingSession = useAdminSession();
  const [candidates, setCandidates] = useState<CandidatoComTotal[]>([]);
  const [latestStages, setLatestStages] = useState<Record<string, EtapaProcesso>>({});
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [processFilter, setProcessFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [candidateToDelete, setCandidateToDelete] = useState<CandidatoComTotal | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setError("");
    try {
      const [people, stages] = await Promise.all([listCandidates(), listCandidateLatestStages()]);
      setCandidates(people);
      const latestByCandidate: Record<string, EtapaProcesso> = {};
      stages.forEach((item) => { latestByCandidate[item.candidato_id] ??= item.etapa; });
      setLatestStages(latestByCandidate);
    }
    catch (loadError) { if (import.meta.env.DEV) console.error(loadError); setError("Não foi possível carregar os candidatos. Confirme a configuração do módulo no Supabase."); }
    finally { setLoading(false); }
  }
  useEffect(() => { if (!checkingSession) void load(); }, [checkingSession]);

  const cities = [...new Set(candidates.map((item) => item.cidade).filter(Boolean))];
  const filtered = useMemo(() => candidates.filter((item) => {
    const matchesQuery = `${item.nome} ${item.telefone ?? ""}`.toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR"));
    const matchesCity = !city || item.cidade === city;
    const matchesProcess = !processFilter || (processFilter === "com" ? item.total_processos > 0 : item.total_processos === 0);
    const latestStage = latestStages[item.id];
    const matchesStatus = !statusFilter || (statusFilter === "sem_processo" ? !latestStage : latestStage === statusFilter);
    return matchesQuery && matchesCity && matchesProcess && matchesStatus;
  }), [candidates, query, city, processFilter, statusFilter, latestStages]);

  function clearFilters() { setQuery(""); setCity(""); setProcessFilter(""); setStatusFilter(""); }

  async function remove() {
    if (!candidateToDelete) return;
    const candidate = candidateToDelete;
    setDeleting(true);
    setError(""); setMessage("");
    try {
      if (candidate.curriculo_url) await deleteResume(candidate.curriculo_url);
      await deleteCandidate(candidate.id);
      setMessage("Candidato excluído com sucesso.");
      setCandidateToDelete(null);
      await load();
    } catch (removeError) { if (import.meta.env.DEV) console.error(removeError); setError("Não foi possível excluir o candidato."); }
    finally { setDeleting(false); }
  }

  if (checkingSession) return <Loading/>;
  return <main className="min-h-screen bg-[#F5F7FA]"><AdminNav/><section className="mx-auto max-w-7xl px-5 py-10">
    <a href="/admin" className={`${adminButtonClass("secondary")} mb-6`}><ArrowLeft size={17} aria-hidden="true"/>Dashboard</a>
    <div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-3xl font-semibold text-[#052656]">Candidatos</h1><p className="mt-2 text-gray-600">Cadastro e acompanhamento dos profissionais.</p></div><a href="/admin/candidatos/novo" className={adminButtonClass("primary")}><UserRound size={17}/>Novo candidato</a></div>
    {message && <AdminNotice>{message}</AdminNotice>}{error && <AdminNotice type="error">{error}</AdminNotice>}
    <div className="mt-8 border border-gray-200 bg-white p-5 shadow-sm"><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><label><span className="mb-2 block font-semibold text-[#052656]">Buscar por nome ou telefone</span><input value={query} onChange={(event) => setQuery(event.target.value)} className={adminInputClass}/></label><label><span className="mb-2 block font-semibold text-[#052656]">Filtrar por cidade</span><select value={city} onChange={(event) => setCity(event.target.value)} className={adminInputClass}><option value="">Todas as cidades</option>{cities.map((value) => <option key={value ?? ""}>{value}</option>)}</select></label><label><span className="mb-2 block font-semibold text-[#052656]">Filtrar por processos</span><select value={processFilter} onChange={(event) => setProcessFilter(event.target.value)} className={adminInputClass}><option value="">Todos</option><option value="com">Com processo</option><option value="sem">Sem processo</option></select></label><label><span className="mb-2 block font-semibold text-[#052656]">Filtrar por status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className={adminInputClass}><option value="">Todos os status</option><option value="sem_processo">Sem processo</option>{ETAPAS.map((stage) => <option key={stage.value} value={stage.value}>{stage.label}</option>)}</select></label></div><div className="mt-4 flex justify-end"><button type="button" onClick={clearFilters} className={adminButtonClass("secondary")}><FilterX size={17}/>Limpar filtros</button></div></div>
    {loading ? <div className="mt-8"><AdminSkeleton rows={4}/></div> : filtered.length === 0 ? <p className="mt-8 bg-white p-8 text-center text-gray-600">Nenhum candidato encontrado.</p> : <div className="mt-8 overflow-x-auto border border-gray-200 bg-white shadow-sm"><table className="w-full min-w-[1050px] text-left"><thead className={adminTableHeadClass}><tr>{["Nome", "Telefone", "Cidade", "LinkedIn", "Processos", "Status", "Cadastro", "Ações"].map((title) => <th key={title} className="px-4 py-3">{title}</th>)}</tr></thead><tbody>{filtered.map((candidate) => <tr key={candidate.id} className={adminTableRowClass}><td className="px-4 py-4 font-semibold text-[#052656]">{candidate.nome}</td><td className="px-4 py-4">{candidate.telefone || "—"}</td><td className="px-4 py-4">{candidate.cidade || "—"}</td><td className="px-4 py-4">{candidate.linkedin ? <a href={candidate.linkedin} target="_blank" rel="noopener noreferrer" className="text-[#052656] underline">Abrir</a> : "—"}</td><td className="px-4 py-4">{candidate.total_processos}</td><td className="px-4 py-4">{latestStages[candidate.id] ? <EtapaBadge etapa={latestStages[candidate.id]}/> : <span className="text-sm text-gray-500">Sem processo</span>}</td><td className="px-4 py-4">{new Intl.DateTimeFormat("pt-BR").format(new Date(candidate.created_at))}</td><td className="px-4 py-4"><div className="flex flex-wrap gap-2"><a href={`/admin/candidatos/${candidate.id}`} className={adminButtonClass("secondary")}><UserRound size={15}/>Ver perfil</a><a href={`/admin/candidatos/${candidate.id}/editar`} className={adminButtonClass("primary")}><Pencil size={15}/>Editar</a><button type="button" onClick={() => setCandidateToDelete(candidate)} className={adminButtonClass("danger")}><Trash2 size={15}/>Excluir</button></div></td></tr>)}</tbody></table></div>}
  </section><ConfirmDialog open={Boolean(candidateToDelete)} title="Excluir candidato" description={`Tem certeza que deseja excluir “${candidateToDelete?.nome ?? ""}”? Os vínculos com processos também serão removidos.`} loading={deleting} onCancel={() => setCandidateToDelete(null)} onConfirm={() => void remove()}/></main>;
}

function Loading() { return <main className="flex min-h-screen items-center justify-center bg-[#052656] text-white">Verificando acesso...</main>; }
