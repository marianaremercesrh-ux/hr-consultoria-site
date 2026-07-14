import { useEffect, useState } from "react";
import AdminNav from "../components/AdminNav";
import { useAdminSession } from "../hooks/useAdminSession";
import { createApplication } from "../services/applications";
import { createCandidate, getCandidate, setCandidateResume, updateCandidate } from "../services/candidates";
import { listJobs } from "../services/jobs";
import { deleteResume, uploadResume, validateResume } from "../services/storage";
import { ETAPAS, type CandidatoForm, type EtapaProcesso } from "../types/candidates";
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
  const [stage, setStage] = useState<EtapaProcesso>("novo");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => { if (checkingSession) return; void (async () => { try { setJobs(await listJobs()); if (id) { const candidate = await getCandidate(id); setForm({ nome: candidate.nome, telefone: candidate.telefone ?? "", cidade: candidate.cidade ?? "", estado: candidate.estado ?? "", linkedin: candidate.linkedin ?? "", observacoes: candidate.observacoes ?? "" }); setOldResume(candidate.curriculo_url); } } catch (error) { if (import.meta.env.DEV) console.error(error); setMessage("Não foi possível carregar o formulário."); } finally { setLoading(false); } })(); }, [checkingSession, id]);

  function change(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) { setForm((current) => ({ ...current, [event.target.name]: event.target.value })); }
  function selectFile(event: React.ChangeEvent<HTMLInputElement>) { const selected = event.target.files?.[0] ?? null; try { if (selected) validateResume(selected); setFile(selected); setMessage(""); } catch (error) { setFile(null); setMessage(error instanceof Error ? error.message : "Currículo inválido."); } }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (saving) return; setSaving(true); setMessage("");
    try {
      const candidate = id ? (await updateCandidate(id, form), await getCandidate(id)) : await createCandidate(form);
      if (file) {
        const path = await uploadResume(candidate.id, file);
        await setCandidateResume(candidate.id, path);
        if (oldResume) await deleteResume(oldResume);
      }
      if (!id && jobId) await createApplication(candidate.id, jobId, stage);
      setMessage("Candidato salvo com sucesso.");
      window.setTimeout(() => { window.location.href = `/admin/candidatos/${candidate.id}`; }, 700);
    } catch (error) { if (import.meta.env.DEV) console.error(error); setMessage("Não foi possível salvar o candidato."); setSaving(false); }
  }

  if (checkingSession || loading) return <main className="min-h-screen bg-[#F5F7FA]"><AdminNav/><div className="mx-auto max-w-5xl px-5 py-10"><AdminSkeleton rows={6}/></div></main>;
  return <main className="min-h-screen bg-[#F5F7FA]"><AdminNav/><section className="mx-auto max-w-5xl px-5 py-10"><h1 className="mb-6 text-3xl font-semibold text-[#052656]">{id ? "Editar candidato" : "Novo candidato"}</h1><form onSubmit={save} className="grid gap-6 bg-white p-6 shadow-sm md:grid-cols-2">
    <Field label="Nome completo" name="nome" value={form.nome} onChange={change} required/><Field label="Telefone" name="telefone" value={form.telefone} onChange={change}/><Field label="Cidade" name="cidade" value={form.cidade} onChange={change}/><Field label="Estado" name="estado" value={form.estado} onChange={change}/><Field label="LinkedIn" name="linkedin" value={form.linkedin} onChange={change} type="url"/><label className="block"><span className="mb-2 block font-semibold text-[#052656]">Currículo (PDF, DOC ou DOCX — até 10 MB)</span><input type="file" accept=".pdf,.doc,.docx" onChange={selectFile} className={adminInputClass}/><small className="mt-2 block text-gray-500">O arquivo ficará disponível apenas no painel autenticado.</small></label><label className="md:col-span-2"><span className="mb-2 block font-semibold text-[#052656]">Observações</span><textarea name="observacoes" value={form.observacoes} onChange={change} rows={5} className={adminInputClass}/></label>
    {!id && <><label><span className="mb-2 block font-semibold text-[#052656]">Vaga relacionada</span><select value={jobId} onChange={(event) => setJobId(event.target.value)} className={adminInputClass}><option value="">Nenhuma vaga</option>{jobs.filter((job) => job.status !== "excluida").map((job) => <option key={job.id} value={job.id}>{job.titulo}</option>)}</select></label><label><span className="mb-2 block font-semibold text-[#052656]">Etapa inicial</span><select value={stage} onChange={(event) => setStage(event.target.value as EtapaProcesso)} className={adminInputClass}>{ETAPAS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label></>}
    {message && <div className="md:col-span-2"><AdminNotice>{message}</AdminNotice></div>}<div className="md:col-span-2 flex flex-wrap gap-3"><button type="submit" disabled={saving} className={adminButtonClass("primary")}><Save size={17}/>{saving ? "Salvando..." : "Salvar candidato"}</button><a href="/admin/candidatos" className={adminButtonClass("secondary")}><X size={17}/>Cancelar</a></div>
  </form></section></main>;
}

function Field({ label, name, value, onChange, required, type = "text" }: { label: string; name: string; value: string; onChange: (event: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean; type?: string }) { return <label><span className="mb-2 block font-semibold text-[#052656]">{label}{required && <span className="ml-1 text-red-700" aria-hidden="true">*</span>}</span><input name={name} value={value} onChange={onChange} required={required} type={type} className={adminInputClass}/></label>; }
