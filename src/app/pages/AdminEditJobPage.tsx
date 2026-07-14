import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { getJobById, updateJob } from "../services/jobs";
import { EMPTY_JOB_FORM, jobToForm, type JobFormData } from "../types/jobs";

export default function AdminEditJobPage({ id }: { id: string }) {
  const [form, setForm] = useState<JobFormData>(EMPTY_JOB_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) { window.location.href = "/admin/login"; return; }
      try { setForm(jobToForm(await getJobById(id))); }
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

  if (loading) return <main className="min-h-screen bg-[#052656] flex items-center justify-center"><p className="text-lg text-white">Carregando vaga...</p></main>;

  const fields: Array<{ label: string; name: keyof JobFormData; required?: boolean; type?: string }> = [
    { label: "Título da vaga", name: "titulo", required: true }, { label: "Empresa", name: "empresa" }, { label: "Cidade", name: "cidade", required: true }, { label: "Estado", name: "estado", required: true }, { label: "Modalidade", name: "modalidade" }, { label: "Tipo de contrato", name: "tipo_contrato" }, { label: "Salário", name: "salario" }, { label: "Quantidade de vagas", name: "quantidade_vagas", type: "number" }, { label: "Horário", name: "horario" },
  ];
  const areas: Array<{ label: string; name: keyof JobFormData }> = [{ label: "Descrição", name: "descricao" }, { label: "Atividades", name: "atividades" }, { label: "Requisitos", name: "requisitos" }, { label: "Benefícios", name: "beneficios" }];

  return <main className="min-h-screen bg-[#F5F7FA]">
    <header className="bg-[#052656] px-5 py-5"><div className="mx-auto flex max-w-5xl items-center justify-between"><img src="/assets/hr-consultoria-logo-white.png" alt="HR Consultoria de RH" className="h-auto w-[110px] max-w-[35vw] sm:w-[140px]"/><a href="/admin" className="bg-[#D4A62A] px-5 py-2 font-semibold text-[#052656]">Voltar</a></div></header>
    <section className="mx-auto max-w-5xl px-5 py-10"><h1 className="mb-6 text-3xl font-semibold text-[#052656]">Editar vaga</h1>
      <form onSubmit={save} className="grid gap-6 bg-white p-6 shadow-sm md:grid-cols-2">
        {fields.map((field) => <label key={field.name} className="block"><span className="mb-2 block text-sm font-semibold text-[#052656]">{field.label}</span><input name={field.name} type={field.type || "text"} min={field.type === "number" ? 1 : undefined} step={field.type === "number" ? 1 : undefined} required={field.required} value={String(form[field.name])} onChange={change} className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-[#D4A62A]"/></label>)}
        <label><span className="mb-2 block text-sm font-semibold text-[#052656]">Status</span><select name="status" value={form.status} onChange={change} className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-[#D4A62A]"><option value="publicada">Publicada</option><option value="rascunho">Rascunho</option><option value="encerrada">Encerrada</option></select></label>
        <label className="md:col-span-2 flex items-center gap-3 text-sm font-semibold text-[#052656]"><input type="checkbox" name="exibir_salario" checked={form.exibir_salario} onChange={change}/>Exibir salário no site</label>
        {areas.map((field) => <label key={field.name} className="md:col-span-2"><span className="mb-2 block text-sm font-semibold text-[#052656]">{field.label}</span><textarea name={field.name} value={String(form[field.name])} onChange={change} rows={4} className="w-full resize-y border border-gray-300 px-4 py-3 outline-none focus:border-[#D4A62A]"/></label>)}
        {message && <p className="md:col-span-2 text-sm font-medium text-[#052656]">{message}</p>}
        <div className="md:col-span-2"><button type="submit" disabled={saving} className="bg-[#D4A62A] px-6 py-3 font-semibold text-[#052656] disabled:opacity-60">{saving ? "Salvando..." : "Salvar alterações"}</button></div>
      </form>
    </section>
  </main>;
}
