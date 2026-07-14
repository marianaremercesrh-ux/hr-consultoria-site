import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import AdminNav from "../components/AdminNav";
import { AdminNotice, AdminSkeleton, adminButtonClass, adminInputClass, adminTableHeadClass, adminTableRowClass } from "../components/AdminUI";
import { useAdminSession } from "../hooks/useAdminSession";
import { listApplications, updateApplicationStage } from "../services/applications";
import { ETAPAS, type CandidaturaDetalhada, type EtapaProcesso } from "../types/candidates";

export default function AdminProcessesPage() {
  const checkingSession = useAdminSession();
  const [applications, setApplications] = useState<CandidaturaDetalhada[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobFilter, setJobFilter] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");

  async function load() { try { setApplications(await listApplications()); } catch (error) { if (import.meta.env.DEV) console.error(error); setMessage("Não foi possível carregar os processos seletivos."); } finally { setLoading(false); } }
  useEffect(() => { if (!checkingSession) void load(); }, [checkingSession]);
  const filtered = useMemo(() => applications.filter((item) => (!jobFilter || String(item.vaga_id) === jobFilter) && (!stageFilter || item.etapa === stageFilter) && item.candidato.nome.toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR"))), [applications, jobFilter, stageFilter, query]);
  const jobs = [...new Map(applications.filter((item) => item.vaga).map((item) => [String(item.vaga_id), item.vaga])).entries()];
  const groups = [...new Map(filtered.map((item) => [String(item.vaga_id), item.vaga])).entries()];
  async function changeStage(id: string, stage: EtapaProcesso) { try { await updateApplicationStage(id, stage); setApplications((current) => current.map((item) => item.id === id ? { ...item, etapa: stage, updated_at: new Date().toISOString() } : item)); setMessage("Etapa atualizada com sucesso."); } catch (error) { if (import.meta.env.DEV) console.error(error); setMessage("Não foi possível atualizar a etapa."); } }

  if (checkingSession) return <main className="flex min-h-screen items-center justify-center bg-[#052656] text-white">Verificando acesso...</main>;
  return <main className="min-h-screen bg-[#F5F7FA]"><AdminNav/><section className="mx-auto max-w-7xl px-5 py-10"><a href="/admin" className={`${adminButtonClass("secondary")} mb-6`}><ArrowLeft size={17} aria-hidden="true"/>Dashboard</a><h1 className="text-3xl font-semibold text-[#052656]">Processos seletivos</h1>{message && <AdminNotice>{message}</AdminNotice>}
    <div className="mt-8 grid gap-4 border border-gray-200 bg-white p-5 shadow-sm md:grid-cols-3"><label><span className="mb-2 block font-semibold text-[#052656]">Buscar candidato</span><input value={query} onChange={(event) => setQuery(event.target.value)} className={adminInputClass}/></label><label><span className="mb-2 block font-semibold text-[#052656]">Vaga</span><select value={jobFilter} onChange={(event) => setJobFilter(event.target.value)} className={adminInputClass}><option value="">Todas</option>{jobs.map(([id, job]) => <option key={id} value={id}>{job?.titulo}</option>)}</select></label><label><span className="mb-2 block font-semibold text-[#052656]">Etapa</span><select value={stageFilter} onChange={(event) => setStageFilter(event.target.value)} className={adminInputClass}><option value="">Todas</option>{ETAPAS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label></div>
    {loading ? <div className="mt-8"><AdminSkeleton rows={4}/></div> : groups.length === 0 ? <p className="mt-8 bg-white p-8 text-center text-gray-600">Nenhum processo encontrado.</p> : <div className="mt-8 space-y-7">{groups.map(([jobId, job]) => { const group = filtered.filter((item) => String(item.vaga_id) === jobId); return <article key={jobId} className="border border-gray-200 bg-white p-6 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-2xl font-semibold text-[#052656]">{job?.titulo ?? "Vaga removida"}</h2><p className="mt-1 capitalize text-gray-600">Status: {job?.status ?? "indisponível"}</p></div><strong className="text-[#052656]">{group.length} {group.length === 1 ? "candidato" : "candidatos"}</strong></div><div className="mt-4 flex flex-wrap gap-2">{ETAPAS.map((stage) => { const total = group.filter((item) => item.etapa === stage.value).length; return total ? <span key={stage.value} className="bg-gray-100 px-3 py-2 text-sm">{stage.label}: {total}</span> : null; })}</div><div className="mt-5 overflow-x-auto border border-gray-200"><table className="w-full min-w-[650px] text-left"><thead className={adminTableHeadClass}><tr><th className="p-3">Candidato</th><th className="p-3">Etapa</th><th className="p-3">Ações</th></tr></thead><tbody>{group.map((application) => <tr key={application.id} className={adminTableRowClass}><td className="p-3 font-semibold text-[#052656]">{application.candidato.nome}</td><td className="p-3"><select value={application.etapa} onChange={(event) => changeStage(application.id, event.target.value as EtapaProcesso)} className={adminInputClass} aria-label={`Etapa de ${application.candidato.nome}`}>{ETAPAS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></td><td className="p-3"><a href={`/admin/candidatos/${application.candidato_id}`} className="font-semibold text-[#052656] underline transition hover:text-[#D4A62A]">Abrir perfil</a></td></tr>)}</tbody></table></div></article>; })}</div>}
  </section></main>;
}
