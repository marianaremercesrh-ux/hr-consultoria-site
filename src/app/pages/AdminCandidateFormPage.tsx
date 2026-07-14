import { useEffect, useState } from "react";
import AdminNav from "../components/AdminNav";
import { useAdminSession } from "../hooks/useAdminSession";
import { createApplication, deleteApplication, listCandidateApplications, updateApplicationProcess } from "../services/applications";
import { createCandidate, getCandidate, setCandidateResume, updateCandidate } from "../services/candidates";
import { listJobs } from "../services/jobs";
import { deleteResume, uploadResume, validateResume } from "../services/storage";
import { readableSupabaseError, reportSupabaseError } from "../lib/supabaseError";
import { ETAPAS, etapaPermiteMotivo, type CandidatoForm, type EtapaProcesso } from "../types/candidates";
import type { Job } from "../types/jobs";
import { Save, X } from "lucide-react";
import { AdminNotice, AdminSkeleton, adminButtonClass, adminInputClass } from "../components/AdminUI";

const EMPTY_FORM: CandidatoForm = { nome: "", telefone: "", cidade: "", estado: "", linkedin: "", observacoes: "" };

export default function AdminCandidateFormPage({ id }: { id?: string }) {
  const checkingSession = useAdminSession();
  const [form, setForm] = useState<CandidatoForm>(EMPTY_FORM);
  const [oldResume, setOldResume] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobId, setJobId] = useState(() => new URLSearchParams(window.location.search).get("vaga") ?? "");
  const [stage, setStage] = useState<EtapaProcesso | "">(() => jobId ? "triagem" : "");
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  useEffect(() => { if (checkingSession) return; void (async () => {
    try {
      if (id) {
        const candidate = await getCandidate(id);
        if (!candidate) { setMessageType("error"); setMessage("Candidato não encontrado."); return; }
        setForm({ nome: candidate.nome, telefone: candidate.telefone ?? "", cidade: candidate.cidade ?? "", estado: candidate.estado ?? "", linkedin: candidate.linkedin ?? "", observacoes: candidate.observacoes ?? "" });
        setOldResume(candidate.curriculo_url);
      }
      const [vacancies, applications] = await Promise.all([listJobs(), id ? listCandidateApplications(id) : Promise.resolve([])]);
      setJobs(vacancies);
      const latest = applications[0];
      if (latest) {
        setApplicationId(latest.id);
        setJobId(latest.vaga_id == null ? "" : String(latest.vaga_id));
        setStage(latest.etapa);
        setReason(latest.observacoes ?? "");
      }
    } catch (error) { reportSupabaseError("carregar formulário do candidato", error); setMessageType("error"); setMessage("Não foi possível carregar todos os dados do formulário."); }
    finally { setLoading(false); }
  })(); }, [checkingSession, id]);

  function change(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) { setForm((current) => ({ ...current, [event.target.name]: event.target.value })); }
  function selectFile(event: React.ChangeEvent<HTMLInputElement>) { const selected = event.target.files?.[0] ?? null; try { if (selected) validateResume(selected); setFile(selected); setMessage(""); } catch (error) { setFile(null); setMessageType("error"); setMessage(error instanceof Error ? error.message : "Currículo inválido."); } }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (saving) return;
    if (stage && !jobId) { setMessageType("error"); setMessage("Selecione uma vaga para o status informado."); return; }
    setSaving(true); setMessage("");
    try {
      const candidate = id ? (await updateCandidate(id, form), await getCandidate(id)) : await createCandidate(form);
      if (!candidate) throw new Error("Candidato não encontrado após salvar.");
      if (file) {
        const path = await uploadResume(candidate.id, file);
        await setCandidateResume(candidate.id, path);
        if (oldResume) await deleteResume(oldResume);
      }
      if (!stage) {
        if (applicationId) await deleteApplication(applicationId);
      } else if (applicationId) {
        await updateApplicationProcess(applicationId, jobId, stage, etapaPermiteMotivo(stage) ? reason : "");
      } else {
        await createApplication(candidate.id, jobId, stage, etapaPermiteMotivo(stage) ? reason : "");
      }
      setMessageType("success");
      setMessage("Candidato salvo com sucesso");
      window.setTimeout(() => { window.location.href = "/admin/candidatos"; }, 700);
    } catch (error) {
      reportSupabaseError("salvar candidato", error);
      setMessageType("error");
      setMessage(`Não foi possível salvar o candidato: ${readableSupabaseError(error)}`);
      setSaving(false);
    }
  }

  if (checkingSession || loading) return <main className="min-h-screen bg-[#F5F7FA]"><AdminNav/><div className="mx-auto max-w-5xl px-5 py-10"><AdminSkeleton rows={6}/></div></main>;
  return <main className="min-h-screen bg-[#F5F7FA]"><AdminNav/><section className="mx-auto max-w-5xl px-5 py-10"><h1 className="mb-6 text-3xl font-semibold text-[#052656]">{id ? "Editar candidato" : "Novo candidato"}</h1><form onSubmit={save} className="grid gap-6 bg-white p-6 shadow-sm md:grid-cols-2">
    <Field label="Nome completo" name="nome" value={form.nome} onChange={change} required/><Field label="Telefone" name="telefone" value={form.telefone} onChange={change}/><Field label="Cidade" name="cidade" value={form.cidade} onChange={change}/><Field label="Estado" name="estado" value={form.estado} onChange={change}/><Field label="LinkedIn" name="linkedin" value={form.linkedin} onChange={change} type="url"/><label className="block"><span className="mb-2 block font-semibold text-[#052656]">Currículo (PDF, DOC ou DOCX — até 10 MB)</span><input type="file" accept=".pdf,.doc,.docx" onChange={selectFile} className={adminInputClass}/><small className="mt-2 block text-gray-500">O arquivo ficará disponível apenas no painel autenticado.</small></label><label className="md:col-span-2"><span className="mb-2 block font-semibold text-[#052656]">Observações</span><textarea name="observacoes" value={form.observacoes} onChange={change} rows={5} className={adminInputClass}/></label>
    <fieldset className="grid gap-5 border border-gray-200 p-5 md:col-span-2 md:grid-cols-2"><legend className="px-2 text-xl font-semibold text-[#052656]">Processo seletivo</legend><label><span className="mb-2 block font-semibold text-[#052656]">Vaga ou processo</span><select value={jobId} onChange={(event) => setJobId(event.target.value)} disabled={!stage} required={Boolean(stage)} className={adminInputClass}><option value="">Selecione uma vaga</option>{jobs.filter((job) => job.status !== "excluida").map((job) => <option key={job.id} value={job.id}>{job.titulo}</option>)}</select></label><label><span className="mb-2 block font-semibold text-[#052656]">Status atual</span><select value={stage} onChange={(event) => { const value = event.target.value as EtapaProcesso | ""; setStage(value); if (!value) { setJobId(""); setReason(""); } }} className={adminInputClass}><option value="">Sem processo</option>{ETAPAS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>{stage && etapaPermiteMotivo(stage) && <label className="md:col-span-2"><span className="mb-2 block font-semibold text-[#052656]">Motivo (opcional)</span><textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={4} className={`${adminInputClass} resize-y`} placeholder="Adicione uma observação, se necessário."/></label>}<p className="text-sm text-gray-500 md:col-span-2">O status é salvo no vínculo do candidato com a vaga. Selecione “Sem processo” para não criar vínculo.</p></fieldset>
    {message && <div className="md:col-span-2"><AdminNotice type={messageType === "error" ? "error" : undefined}>{message}</AdminNotice></div>}<div className="md:col-span-2 flex flex-wrap gap-3"><button type="submit" disabled={saving} className={adminButtonClass("primary")}><Save size={17}/>{saving ? "Salvando..." : "Salvar candidato"}</button><a href="/admin/candidatos" className={adminButtonClass("secondary")}><X size={17}/>Cancelar</a></div>
  </form></section></main>;
}

function Field({ label, name, value, onChange, required, type = "text" }: { label: string; name: string; value: string; onChange: (event: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean; type?: string }) { return <label><span className="mb-2 block font-semibold text-[#052656]">{label}{required && <span className="ml-1 text-red-700" aria-hidden="true">*</span>}</span><input name={name} value={value} onChange={onChange} required={required} type={type} className={adminInputClass}/></label>; }
