import { useEffect, useState } from "react";
import { Building2, Plus, Save, Upload } from "lucide-react";
import AdminNav from "../components/AdminNav";
import { AdminNotice, AdminSkeleton, adminButtonClass, adminInputClass } from "../components/AdminUI";
import { getEmpresa, listEmpresas, saveEmpresa } from "../services/ats";
import { listJobs } from "../services/jobs";
import { listApplications } from "../services/applications";
import { listCompanyContracts } from "../services/companyContracts";
import { signedCompanyLogo, uploadCompanyLogo, validateCompanyLogo } from "../services/companyLogos";
import type { Empresa, EmpresaForm } from "../types/ats";
import type { Job } from "../types/jobs";
import type { CandidaturaDetalhada } from "../types/candidates";
import type { CompanyContract } from "../types/companyContracts";

const EMPTY: EmpresaForm = {
  nome: "", cnpj: "", logo_url: null, contato_nome: "", contato_cargo: "", telefone: "",
  whatsapp: "", email: "", endereco: "", cidade: "", estado: "", observacoes: "", status: "ativo",
};

function cnpjDigits(value: string) { return value.replace(/\D/g, "").slice(0, 14); }
function formatCnpj(value: string) {
  return cnpjDigits(value).replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2").replace(/(\d{4})(\d)/, "$1-$2");
}

export default function AdminCompaniesPage({ id, newCompany = false }: { id?: string; newCompany?: boolean }) {
  const [items, setItems] = useState<Empresa[]>([]);
  const [form, setForm] = useState<EmpresaForm>(EMPTY);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [apps, setApps] = useState<CandidaturaDetalhada[]>([]);
  const [contracts, setContracts] = useState<CompanyContract[]>([]);
  const [logoUrls, setLogoUrls] = useState<Record<string, string>>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        const companies = await listEmpresas();
        setItems(companies);
        try { setContracts(await listCompanyContracts()); } catch { setContracts([]); }
        const signed = await Promise.all(companies.map(async (company) => {
          if (!company.logo_url) return null;
          try { return [company.id, await signedCompanyLogo(company.logo_url)] as const; } catch { return null; }
        }));
        setLogoUrls(Object.fromEntries(signed.filter((entry): entry is readonly [string, string] => entry !== null)));

        if (id) {
          const company = await getEmpresa(id);
          const { id: _id, created_at: _created, updated_at: _updated, ...fields } = company;
          setForm(fields);
          if (company.logo_url) {
            try { setLogoPreview(await signedCompanyLogo(company.logo_url)); } catch { setLogoPreview(""); }
          }
          setJobs((await listJobs()).filter((job) => job.empresa_id === id));
          setApps(await listApplications());
        }
      } catch {
        setMessage("Não foi possível carregar as empresas. Verifique a conexão e tente novamente.");
      } finally { setLoading(false); }
    })();
  }, [id]);

  function selectLogo(file: File | null) {
    try {
      if (file) validateCompanyLogo(file);
      if (logoPreview.startsWith("blob:")) URL.revokeObjectURL(logoPreview);
      setLogoFile(file);
      setLogoPreview(file ? URL.createObjectURL(file) : "");
      setMessage("");
    } catch (reason) {
      setLogoFile(null);
      setMessage(reason instanceof Error ? reason.message : "Imagem inválida.");
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const digits = cnpjDigits(form.cnpj ?? "");
    if (digits.length > 0 && digits.length !== 14) {
      setMessage("Informe os 14 números do CNPJ.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const saved = await saveEmpresa({ ...form, cnpj: digits ? formatCnpj(digits) : null }, id);
      if (logoFile) await uploadCompanyLogo(saved.id, logoFile, saved.logo_url);
      window.location.href = `/admin/empresas/${saved.id}`;
    } catch {
      setMessage("Não foi possível salvar a empresa. Tente novamente.");
      setSaving(false);
    }
  }

  if (loading) return <main className="min-h-screen bg-[#F5F7FA]"><AdminNav/><div className="mx-auto max-w-7xl p-8"><AdminSkeleton/></div></main>;

  if (newCompany || id) return <main className="min-h-screen bg-[#F5F7FA]"><AdminNav/><section className="mx-auto max-w-5xl px-5 py-10">
    <a href="/admin/empresas" className={adminButtonClass("secondary")}>← Empresas</a>
    <h1 className="my-6 text-3xl font-semibold text-[#052656]">{id ? "Empresa" : "Nova empresa"}</h1>
    {message && <AdminNotice type="error">{message}</AdminNotice>}
    <form onSubmit={submit} className="grid gap-5 bg-white p-6 shadow-sm md:grid-cols-2">
      <label className="md:col-span-2"><span className="mb-2 block font-semibold text-[#052656]">Logo da empresa</span>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-[#F5F7FA]">
            {logoPreview ? <img src={logoPreview} alt="Pré-visualização da logo" className="h-full w-full object-contain p-2"/> : <Building2 size={38} className="text-[#D4A62A]"/>}
          </div>
          <div className="w-full"><input type="file" accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp" onChange={(event) => selectLogo(event.target.files?.[0] ?? null)} className={adminInputClass}/><small className="mt-2 block text-gray-500">PNG, JPG, JPEG ou WebP, até 5 MB.</small></div>
        </div>
      </label>
      <Field label="Nome da empresa" value={form.nome} required onChange={(value) => setForm({ ...form, nome: value })}/>
      <Field label="CNPJ" value={formatCnpj(form.cnpj ?? "")} inputMode="numeric" maxLength={18} placeholder="00.000.000/0000-00" onChange={(value) => setForm({ ...form, cnpj: formatCnpj(value) })}/>
      <Field label="Nome do responsável" value={form.contato_nome ?? ""} onChange={(value) => setForm({ ...form, contato_nome: value })}/>
      <Field label="Cargo" value={form.contato_cargo ?? ""} onChange={(value) => setForm({ ...form, contato_cargo: value })}/>
      <Field label="Telefone" value={form.telefone ?? ""} onChange={(value) => setForm({ ...form, telefone: value })}/>
      <Field label="WhatsApp" value={form.whatsapp ?? ""} onChange={(value) => setForm({ ...form, whatsapp: value })}/>
      <Field label="Email" value={form.email ?? ""} type="email" onChange={(value) => setForm({ ...form, email: value })}/>
      <Field label="Endereço" value={form.endereco ?? ""} onChange={(value) => setForm({ ...form, endereco: value })}/>
      <Field label="Cidade" value={form.cidade ?? ""} onChange={(value) => setForm({ ...form, cidade: value })}/>
      <Field label="Estado" value={form.estado ?? ""} onChange={(value) => setForm({ ...form, estado: value })}/>
      <label><span className="mb-2 block font-semibold text-[#052656]">Status</span><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as EmpresaForm["status"] })} className={adminInputClass}><option value="ativo">Ativo</option><option value="inativo">Inativo</option></select></label>
      <label className="md:col-span-2"><span className="mb-2 block font-semibold text-[#052656]">Observações</span><textarea value={form.observacoes ?? ""} onChange={(event) => setForm({ ...form, observacoes: event.target.value })} className={adminInputClass}/></label>
      <button disabled={saving} className={adminButtonClass("primary")}><Save size={17}/>{saving ? "Salvando..." : logoFile ? <><Upload size={17}/>Salvar e enviar logo</> : "Salvar"}</button>
    </form>
    {id && <div className="mt-8 grid gap-5 sm:grid-cols-3"><Metric label="Vagas abertas" value={jobs.filter((job) => job.status === "publicada").length}/><Metric label="Vagas encerradas" value={jobs.filter((job) => job.status === "encerrada").length}/><Metric label="Candidatos" value={new Set(apps.filter((app) => jobs.some((job) => String(job.id) === String(app.vaga_id))).map((app) => app.candidato_id)).size}/></div>}
  </section></main>;

  return <main className="min-h-screen bg-[#F5F7FA]"><AdminNav/><section className="mx-auto max-w-7xl px-5 py-10">
    <div className="flex flex-wrap justify-between gap-4"><h1 className="text-3xl font-semibold text-[#052656]">Empresas</h1><a href="/admin/empresas/nova" className={adminButtonClass("primary")}><Plus/>Nova empresa</a></div>
    {message && <AdminNotice type="error">{message}</AdminNotice>}
    <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{items.map((company) => {
      const hasContract = contracts.some((contract) => contract.empresa_id === company.id && Boolean(contract.caminho_arquivo));
      return <a key={company.id} href={`/admin/empresas/${company.id}`} className="border border-gray-200 bg-white p-6 shadow-sm transition hover:border-[#D4A62A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4A62A]">
        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-[#F5F7FA]">{logoUrls[company.id] ? <img src={logoUrls[company.id]} alt={`Logo da ${company.nome}`} className="h-full w-full object-contain p-2"/> : <Building2 size={34} className="text-[#D4A62A]"/>}</div>
        <h2 className="mt-4 break-words text-xl font-semibold text-[#052656]">{company.nome}</h2>
        <p className="mt-1 break-words text-sm text-gray-500">{company.cnpj ? `CNPJ ${formatCnpj(company.cnpj)}` : "CNPJ não informado"}</p>
        <p className="mt-3 break-words text-gray-700"><span className="font-semibold">Responsável:</span> {company.contato_nome || "Não informado"}</p>
        <div className="mt-4 flex flex-wrap gap-2"><span className={`rounded-full px-3 py-1 text-sm font-semibold ${hasContract ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{hasContract ? "Contrato anexado" : "Contrato pendente"}</span><span className={`rounded-full px-3 py-1 text-sm font-semibold ${company.status === "ativo" ? "bg-blue-100 text-[#052656]" : "bg-gray-100 text-gray-600"}`}>{company.status === "ativo" ? "Ativa" : "Inativa"}</span></div>
      </a>;
    })}</div>
  </section></main>;
}

function Field({ label, value, onChange, ...props }: { label: string; value: string; onChange: (value: string) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return <label><span className="mb-2 block font-semibold text-[#052656]">{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} className={adminInputClass} {...props}/></label>;
}

function Metric({ label, value }: { label: string; value: number }) { return <div className="bg-white p-5 shadow-sm"><p className="text-sm text-gray-500">{label}</p><strong className="text-3xl text-[#052656]">{value}</strong></div>; }
