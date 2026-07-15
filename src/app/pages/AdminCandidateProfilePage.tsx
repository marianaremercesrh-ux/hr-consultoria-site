import { useEffect, useState } from "react";
import AdminNav from "../components/AdminNav";
import ApplicationStageControl from "../components/ApplicationStageControl";
import CandidateHistoryPanel from "../components/CandidateHistoryPanel";
import CandidateProcessTracking from "../components/CandidateProcessTracking";
import PortalReleaseControl from "../components/PortalReleaseControl";
import { useAdminSession } from "../hooks/useAdminSession";
import { createApplication, deleteApplication, listCandidateApplications, updateApplicationStage } from "../services/applications";
import { getCandidate } from "../services/candidates";
import { listJobs } from "../services/jobs";
import { createResumeSignedUrl } from "../services/storage";
import { supabaseErrorDetails } from "../lib/supabaseError";
import { ETAPAS, etapaPermiteMotivo, type Candidato, type CandidaturaDetalhada, type EtapaProcesso } from "../types/candidates";
import type { Job } from "../types/jobs";
import { Pencil, UserPlus } from "lucide-react";
import { AdminNotice, AdminSkeleton, adminButtonClass, adminInputClass, adminTableHeadClass, adminTableRowClass } from "../components/AdminUI";

export default function AdminCandidateProfilePage({ id }: { id: string }) {
  const checkingSession = useAdminSession();
  const [candidate, setCandidate] = useState<Candidato | null>(null);
  const [applications, setApplications] = useState<CandidaturaDetalhada[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobId, setJobId] = useState("");
  const [stage, setStage] = useState<EtapaProcesso>("novo");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  async function load() {
    setNotFound(false); setLoadFailed(false);
    try {
      const person = await getCandidate(id);
      if (!person) { setCandidate(null); setNotFound(true); return; }
      setCandidate(person);
    } catch (error) {
      const details = supabaseErrorDetails(error);
      console.error("[Supabase] Falha ao buscar public.candidatos por id", details);
      setLoadFailed(true);
      return;
    } finally {
      setLoading(false);
    }
    try {
      const [links, vacancies] = await Promise.all([listCandidateApplications(id), listJobs()]);
      setApplications(links); setJobs(vacancies);
    } catch (error) {
      const details = supabaseErrorDetails(error);
      console.error("[Supabase] Falha ao carregar processos do candidato", details);
      setMessage("O candidato foi localizado, mas não foi possível carregar todos os dados dos processos.");
    }
  }
  useEffect(() => { if (!checkingSession) void load(); }, [checkingSession, id]);

  async function changeStage(applicationId: string, value: EtapaProcesso, motivo?: string | null) { try { const saved=await updateApplicationStage(applicationId, value, motivo); setMessage("Etapa atualizada com sucesso."); await load(); return saved; } catch (error) { if (import.meta.env.DEV) console.error(error); setMessage("Não foi possível atualizar a etapa."); throw error; } }
  async function addApplication() { if (!jobId) return; try { await createApplication(id, jobId, stage, etapaPermiteMotivo(stage) ? reason : ""); setJobId(""); setReason(""); setMessage("Candidato adicionado à vaga."); await load(); } catch (error) { if (import.meta.env.DEV) console.error(error); setMessage("Não foi possível adicionar o candidato à vaga."); } }
  async function removeApplication(applicationId: string) { if (!window.confirm("Remover o candidato deste processo seletivo?")) return; try { await deleteApplication(applicationId); setMessage("Candidato removido do processo."); await load(); } catch (error) { if (import.meta.env.DEV) console.error(error); setMessage("Não foi possível remover a candidatura."); } }
  async function openResume() { if (!candidate?.curriculo_url) return; try { window.open(await createResumeSignedUrl(candidate.curriculo_url), "_blank", "noopener,noreferrer"); } catch (error) { if (import.meta.env.DEV) console.error(error); setMessage("Não foi possível abrir o currículo."); } }

  if (checkingSession || loading) return <main className="min-h-screen bg-[#F5F7FA]"><AdminNav/><div className="mx-auto max-w-6xl px-5 py-10"><AdminSkeleton rows={5}/></div></main>;
  if (notFound) return <main className="min-h-screen bg-[#F5F7FA]"><AdminNav/><p className="p-10 text-center">Candidato não encontrado.</p></main>;
  if (loadFailed || !candidate) return <main className="min-h-screen bg-[#F5F7FA]"><AdminNav/><div className="mx-auto max-w-3xl p-10"><AdminNotice type="error">Não foi possível consultar o candidato. Tente novamente.</AdminNotice></div></main>;
  const rawPhone = candidate.telefone?.replace(/\D/g, "");
  const phone = rawPhone?.startsWith("55") ? rawPhone : rawPhone ? `55${rawPhone}` : "";
  const openedFromNotifications = new URLSearchParams(window.location.search).get("from") === "notificacoes";
  return <main className="min-h-screen bg-[#F5F7FA]"><AdminNav/><section className="mx-auto max-w-6xl px-5 py-10">
    {openedFromNotifications && <a href="/admin/notificacoes" className="mb-5 inline-block font-semibold text-[#052656] underline">Voltar às notificações</a>}
    <div className="flex flex-wrap justify-between gap-4"><div><h1 className="text-3xl font-semibold text-[#052656]">{candidate.nome}</h1><p className="mt-2 text-gray-600">Cadastrado em {new Intl.DateTimeFormat("pt-BR").format(new Date(candidate.created_at))}</p></div><a href={`/admin/candidatos/${id}/editar`} className={adminButtonClass("primary")}><Pencil size={17}/>Editar candidato</a></div>
    {message && <AdminNotice>{message}</AdminNotice>}
    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]"><section className="bg-white p-6 shadow-sm"><h2 className="text-2xl font-semibold text-[#052656]">Dados do candidato</h2><dl className="mt-5 grid gap-4 sm:grid-cols-2"><Info label="Telefone" value={candidate.telefone}/><Info label="Localização" value={[candidate.cidade, candidate.estado].filter(Boolean).join(", ")}/><Info label="LinkedIn" value={candidate.linkedin}/><Info label="Observações" value={candidate.observacoes}/></dl><div className="mt-6 flex flex-wrap gap-3">{phone && <a href={`https://wa.me/${phone}`} target="_blank" rel="noopener noreferrer" className="bg-green-600 px-4 py-2 font-semibold text-white">Abrir WhatsApp</a>}{candidate.linkedin && <a href={candidate.linkedin} target="_blank" rel="noopener noreferrer" className="border border-[#052656] px-4 py-2 font-semibold text-[#052656]">Abrir LinkedIn</a>}{candidate.curriculo_url && <button type="button" onClick={openResume} className="bg-[#D4A62A] px-4 py-2 font-semibold text-[#052656]">Ver currículo</button>}</div></section>
      <aside className="border border-gray-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-semibold text-[#052656]">Adicionar a outra vaga</h2><label className="mt-4 block"><span className="mb-2 block font-semibold">Vaga</span><select value={jobId} onChange={(event) => setJobId(event.target.value)} className={adminInputClass}><option value="">Selecione</option>{jobs.filter((job) => job.status !== "excluida").map((job) => <option key={job.id} value={job.id}>{job.titulo}</option>)}</select></label><label className="mt-4 block"><span className="mb-2 block font-semibold">Etapa</span><select value={stage} onChange={(event) => setStage(event.target.value as EtapaProcesso)} className={adminInputClass}>{ETAPAS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>{etapaPermiteMotivo(stage) && <label className="mt-4 block"><span className="mb-2 block font-semibold">Motivo (opcional)</span><textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={3} className={`${adminInputClass} resize-y`}/></label>}<button type="button" onClick={addApplication} disabled={!jobId} className={`mt-4 w-full ${adminButtonClass("primary")}`}><UserPlus size={17}/>Adicionar candidato</button></aside>
    </div>
    <section className="mt-8 border border-gray-200 bg-white p-6 shadow-sm"><h2 className="text-2xl font-semibold text-[#052656]">Histórico dos processos seletivos</h2>{applications.length === 0 ? <p className="mt-5 text-gray-600">Este candidato ainda não participa de processos.</p> : <div className="mt-5 overflow-x-auto border border-gray-200"><table className="w-full min-w-[980px] text-left"><thead className={adminTableHeadClass}><tr><th className="p-3">Vaga</th><th className="p-3">Empresa</th><th className="p-3">Status</th><th className="p-3">Entrada</th><th className="p-3">Atualização</th><th className="p-3">Ações</th></tr></thead><tbody>{applications.map((application) => <tr key={application.id} className={adminTableRowClass}><td className="p-3 font-semibold text-[#052656]">{application.vaga?.titulo ?? "Vaga removida"}</td><td className="p-3">{application.vaga?.empresa_cliente?.nome ?? "Não informada"}</td><td className="p-3 align-top"><ApplicationStageControl application={application} onSave={changeStage} ariaLabel={`Etapa em ${application.vaga?.titulo ?? "vaga"}`}/></td><td className="p-3">{new Intl.DateTimeFormat("pt-BR").format(new Date(application.created_at))}</td><td className="p-3">{new Intl.DateTimeFormat("pt-BR").format(new Date(application.updated_at))}</td><td className="p-3"><button type="button" onClick={() => removeApplication(application.id)} className="font-semibold text-red-700 underline hover:text-red-900">Remover do processo</button></td></tr>)}</tbody></table></div>}</section>
    {applications.map(application=><section key={application.id} id={`candidatura-${application.id}`} className="mt-8 scroll-mt-24"><PortalReleaseControl application={application} onChanged={load}/><CandidateProcessTracking application={application} candidateId={id} onSaved={load}/></section>)}
    <CandidateHistoryPanel candidateId={id}/>
  </section></main>;
}

function Info({ label, value }: { label: string; value: string | null | undefined }) { return <div><dt className="text-sm font-semibold uppercase text-gray-500">{label}</dt><dd className="mt-1 whitespace-pre-wrap text-[#052656]">{value || "Não informado"}</dd></div>; }
