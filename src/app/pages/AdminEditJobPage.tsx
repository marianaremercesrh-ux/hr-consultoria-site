import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { generateJobSlug, getJobById, updateJob } from "../services/jobs";
import { EMPTY_JOB_FORM, JOB_STATUS_OPTIONS, jobToForm, type JobFormData } from "../types/jobs";
import AdminNav from "../components/AdminNav";
import ApplicationStageControl, { EtapaBadge } from "../components/ApplicationStageControl";
import JobShareActions from "../components/JobShareActions";
import { listEmpresas } from "../services/ats";
import type { Empresa } from "../types/ats";
import { listApplications, updateApplicationStage } from "../services/applications";
import { ETAPAS, type CandidaturaDetalhada, type EtapaProcesso } from "../types/candidates";
import { Save, UserPlus, X } from "lucide-react";
import { AdminNotice, adminButtonClass, adminInputClass, adminTableHeadClass, adminTableRowClass } from "../components/AdminUI";

export default function AdminEditJobPage({ id }: { id: string }) {
  const [form, setForm] = useState<JobFormData>(EMPTY_JOB_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [applications, setApplications] = useState<CandidaturaDetalhada[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) { window.location.href = "/admin/login"; return; }
      try {
        setForm(jobToForm(await getJobById(id)));
        void listEmpresas().then(setEmpresas).catch(() => undefined);
        try { setApplications((await listApplications()).filter((item) => String(item.vaga_id) === id)); }
        catch (applicationError) { if (import.meta.env.DEV) console.error(applicationError); }
      }
      catch (error) { if (import.meta.env.DEV) console.error(error); setMessage("Não foi possível carregar a vaga."); }
      finally { setLoading(false); }
    }
    void load();
  }, [id]);

  function change(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? (event.target as HTMLInputElement).checked : name === "quantidade_vagas" ? Number(value) : value }));
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setMessage("");
    try { await updateJob(id, form); setMessage("Vaga atualizada com sucesso."); window.setTimeout(() => { window.location.href = "/admin"; }, 700); }
    catch (error) { if (import.meta.env.DEV) console.error(error); setMessage("Não foi possível atualizar a vaga."); setSaving(false); }
  }

  async function changeStage(applicationId: string, stage: EtapaProcesso, motivo?: string | null) {
    try { await updateApplicationStage(applicationId, stage, motivo); setApplications((current) => current.map((item) => item.id === applicationId ? { ...item, etapa: stage, observacoes: motivo === undefined ? item.observacoes : motivo } : item)); setMessage("Etapa do candidato atualizada."); }
    catch (error) { if (import.meta.env.DEV) console.error(error); setMessage("Não foi possível atualizar a etapa."); }
  }

  if (loading) return <main className="min-h-screen bg-[#052656] flex items-center justify-center"><p className="text-lg text-white">Carregando vaga...</p></main>;

  const fields: Array<{ label: string; name: keyof JobFormData; required?: boolean; type?: string }> = [
    { label: "Título da vaga", name: "titulo", required: true }, { label: "Empresa", name: "empresa" }, { label: "Cidade", name: "cidade", required: true }, { label: "Estado", name: "estado", required: true }, { label: "Modalidade", name: "modalidade" }, { label: "Tipo de contrato", name: "tipo_contrato" }, { label: "Salário", name: "salario" }, { label: "Quantidade de vagas", name: "quantidade_vagas", type: "number" }, { label: "Horário", name: "horario" },
  ];
  const areas: Array<{ label: string; name: keyof JobFormData }> = [{ label: "Descrição", name: "descricao" }, { label: "Atividades", name: "atividades" }, { label: "Requisitos", name: "requisitos" }, { label: "Benefícios", name: "beneficios" }];

  return <main className="min-h-screen bg-[#F5F7FA]">
    <AdminNav/>
    <section className="mx-auto max-w-5xl px-5 py-10"><div className="mb-6 flex flex-wrap items-center justify-between gap-4"><h1 className="text-3xl font-semibold text-[#052656]">Editar vaga</h1><JobShareActions slug={generateJobSlug(form.titulo, form.cidade)} title={form.titulo}/></div>
      <form onSubmit={save} className="grid gap-6 bg-white p-6 shadow-sm md:grid-cols-2">
        <label className="block"><span className="mb-2 block text-sm font-semibold text-[#052656]">Empresa cliente</span><select name="empresa_id" value={form.empresa_id ?? ""} onChange={(event) => { const selected = empresas.find((item) => item.id === event.target.value); setForm((current) => ({ ...current, empresa_id: event.target.value || null, empresa: selected?.nome ?? current.empresa })); }} className={adminInputClass}><option value="">Sem empresa vinculada</option>{empresas.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</select></label>
        {fields.map((field) => <label key={field.name} className="block"><span className="mb-2 block text-sm font-semibold text-[#052656]">{field.label}{field.required && <span className="ml-1 text-red-700">*</span>}</span><input name={field.name} type={field.type || "text"} min={field.type === "number" ? 1 : undefined} step={field.type === "number" ? 1 : undefined} required={field.required} value={String(form[field.name])} onChange={change} className={adminInputClass}/></label>)}
        <label><span className="mb-2 block text-sm font-semibold text-[#052656]">Status</span><select name="status" value={form.status} onChange={change} className={adminInputClass}>{JOB_STATUS_OPTIONS.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></label>
        <label className="md:col-span-2 flex items-center gap-3 text-sm font-semibold text-[#052656]"><input type="checkbox" name="exibir_salario" checked={form.exibir_salario} onChange={change}/>Exibir salário no site</label>
        {areas.map((field) => <label key={field.name} className="md:col-span-2"><span className="mb-2 block text-sm font-semibold text-[#052656]">{field.label}</span><textarea name={field.name} value={String(form[field.name])} onChange={change} rows={4} className={`${adminInputClass} resize-y`}/></label>)}
        {message && <div className="md:col-span-2"><AdminNotice>{message}</AdminNotice></div>}
        <div className="md:col-span-2 flex flex-wrap gap-3"><button type="submit" disabled={saving} className={adminButtonClass("primary")}><Save size={17}/>{saving ? "Salvando..." : "Salvar alterações"}</button><a href="/admin" className={adminButtonClass("secondary")}><X size={17}/>Cancelar</a></div>
      </form>
      <section className="mt-8 border border-gray-200 bg-white p-6 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-2xl font-semibold text-[#052656]">Candidatos vinculados</h2><p className="mt-1 text-gray-600">{applications.length} {applications.length === 1 ? "candidato" : "candidatos"}</p></div><a href={`/admin/candidatos/novo?vaga=${encodeURIComponent(id)}`} className={adminButtonClass("primary")}><UserPlus size={17}/>Adicionar candidato</a></div><div className="mt-4 flex flex-wrap gap-2">{ETAPAS.map((stage) => { const total = applications.filter((item) => item.etapa === stage.value).length; return total ? <span key={stage.value} className="inline-flex items-center gap-2"><EtapaBadge etapa={stage.value}/><span className="text-sm font-semibold">{total}</span></span> : null; })}</div>{applications.length === 0 ? <p className="mt-5 text-gray-600">Nenhum candidato vinculado a esta vaga.</p> : <div className="mt-5 overflow-x-auto border border-gray-200"><table className="w-full min-w-[760px] text-left"><thead className={adminTableHeadClass}><tr><th className="p-3">Candidato</th><th className="p-3">Etapa</th><th className="p-3">Ações</th></tr></thead><tbody>{applications.map((application) => <tr key={application.id} className={adminTableRowClass}><td className="p-3 font-semibold text-[#052656]">{application.candidato.nome}</td><td className="p-3 align-top"><ApplicationStageControl application={application} onSave={changeStage} ariaLabel={`Etapa de ${application.candidato.nome}`}/></td><td className="p-3"><a href={`/admin/candidatos/${application.candidato_id}`} className="font-semibold text-[#052656] underline transition hover:text-[#D4A62A]">Abrir perfil</a></td></tr>)}</tbody></table></div>}</section>
    </section>
  </main>;
}
