import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { createJob, findJobBySlug, generateJobSlug } from "../services/jobs";
import { JOB_STATUS, JOB_STATUS_OPTIONS, type JobFormData } from "../types/jobs";
import AdminNav from "../components/AdminNav";
import { Save, X } from "lucide-react";
import { AdminNotice, adminButtonClass, adminInputClass } from "../components/AdminUI";
import { listEmpresas } from "../services/ats";
import type { Empresa } from "../types/ats";
import { supabaseErrorDetails } from "../lib/supabaseError";

export default function AdminNewJobPage() {
  const [formulario, setFormulario] = useState<JobFormData>({
    titulo: "",
    empresa: "",
    cidade: "",
    estado: "MG",
    modalidade: "",
    tipo_contrato: "",
    salario: "",
    exibir_salario: true,
    descricao: "",
    atividades: "",
    requisitos: "",
    beneficios: "",
    horario: "",
    quantidade_vagas: 1,
    status: JOB_STATUS.OPEN,
  });

  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [mensagemErro, setMensagemErro] = useState(false);
  const [erroTecnico, setErroTecnico] = useState<{ message: string; details: string | null; hint: string | null; code: string | null } | null>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);

  useEffect(() => {
    console.info("[HR] Cadastro de vagas com diagnóstico Supabase v2 carregado.");
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) window.location.href = "/admin/login";
    });
    void listEmpresas().then(setEmpresas).catch(() => undefined);
  }, []);

  function alterarCampo(
    evento: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value, type } = evento.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]:
        type === "checkbox"
          ? (evento.target as HTMLInputElement).checked
          : name === "quantidade_vagas"
            ? Number(value)
            : value,
    }));
  }

  async function salvarVaga(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (carregando) return;
    if (!formulario.titulo.trim() || !formulario.cidade.trim() || !formulario.estado.trim()) {
      setMensagemErro(true);
      setMensagem("Preencha título, cidade e estado.");
      return;
    }
    if (!Number.isInteger(formulario.quantidade_vagas) || formulario.quantidade_vagas < 1) {
      setMensagemErro(true);
      setMensagem("A quantidade de vagas deve ser um número inteiro maior que zero.");
      return;
    }
    setCarregando(true);
    setMensagem("");
    setErroTecnico(null);

    try {
      const slug = generateJobSlug(formulario.titulo, formulario.cidade);
      let existing = null;
      try {
        existing = await findJobBySlug(slug);
      } catch (duplicateCheckError) {
        const duplicateDetails = supabaseErrorDetails(duplicateCheckError);
        console.error("[Supabase] verificação de duplicidade por slug falhou; o INSERT continuará", duplicateDetails);
      }
      if (existing) {
        setMensagemErro(true);
        setMensagem(`Esta vaga já existe no Supabase (ID ${existing.id}). Verifique a listagem antes de tentar novamente.`);
        setCarregando(false);
        return;
      }
      const created = await createJob(formulario);
      setMensagemErro(false);
      setMensagem(`Vaga cadastrada com sucesso (ID ${created.id}).`);
      window.setTimeout(() => {
        window.location.href = "/admin";
      }, 700);
      return;
    } catch (error) {
      const { message, details, hint, code } = supabaseErrorDetails(error);
      console.error("[Supabase] cadastrar vaga em public.vagas", { message, details, hint, code });
      setErroTecnico({ message, details, hint, code });
      setMensagemErro(true);
      setMensagem(`Não foi possível cadastrar a vaga: ${message}${code ? ` (código ${code})` : ""}`);
      setCarregando(false);
      return;
    }

  }

  return (
    <main className="min-h-screen bg-[#F5F7FA]">
      <AdminNav/>

      <section className="mx-auto max-w-5xl px-5 py-10">
        <h1 className="mb-6 text-3xl font-semibold text-[#052656]">
          Nova vaga
        </h1>

        <form
          onSubmit={salvarVaga}
          className="grid gap-6 bg-white p-6 shadow-sm md:grid-cols-2"
        >
          <Campo
            label="Título da vaga"
            name="titulo"
            value={formulario.titulo}
            onChange={alterarCampo}
            required
          />

          <label><span className="mb-2 block font-semibold text-[#052656]">Empresa cliente</span><select name="empresa" value={formulario.empresa} onChange={(event) => setFormulario((current) => ({ ...current, empresa: event.target.value }))} className={adminInputClass}><option value="">Sem empresa vinculada</option>{empresas.filter((item) => item.status === "ativo").map((item) => <option key={item.id} value={item.nome}>{item.nome}</option>)}</select></label>

          <Campo
            label="Cidade"
            name="cidade"
            value={formulario.cidade}
            onChange={alterarCampo}
            required
          />

          <Campo
            label="Estado"
            name="estado"
            value={formulario.estado}
            onChange={alterarCampo}
            required
          />

          <Campo
            label="Modalidade"
            name="modalidade"
            value={formulario.modalidade}
            onChange={alterarCampo}
            placeholder="Ex.: Presencial"
          />

          <Campo
            label="Tipo de contrato"
            name="tipo_contrato"
            value={formulario.tipo_contrato}
            onChange={alterarCampo}
            placeholder="Ex.: CLT"
          />

          <Campo
            label="Salário"
            name="salario"
            value={formulario.salario}
            onChange={alterarCampo}
            placeholder="Ex.: R$ 1.800,00"
          />

          <Campo
            label="Quantidade de vagas"
            name="quantidade_vagas"
            value={String(formulario.quantidade_vagas)}
            onChange={alterarCampo}
            type="number"
            min="1"
          />

          <Campo
            label="Horário"
            name="horario"
            value={formulario.horario}
            onChange={alterarCampo}
          />

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#052656]">
              Status
            </label>
            <select
              name="status"
              value={formulario.status}
              onChange={alterarCampo}
              className={adminInputClass}
            >
              {JOB_STATUS_OPTIONS.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-3 text-sm font-semibold text-[#052656]">
              <input
                type="checkbox"
                name="exibir_salario"
                checked={formulario.exibir_salario}
                onChange={alterarCampo}
              />
              Exibir salário no site
            </label>
          </div>

          <AreaTexto
            label="Descrição"
            name="descricao"
            value={formulario.descricao}
            onChange={alterarCampo}
          />

          <AreaTexto
            label="Atividades"
            name="atividades"
            value={formulario.atividades}
            onChange={alterarCampo}
          />

          <AreaTexto
            label="Requisitos"
            name="requisitos"
            value={formulario.requisitos}
            onChange={alterarCampo}
          />

          <AreaTexto
            label="Benefícios"
            name="beneficios"
            value={formulario.beneficios}
            onChange={alterarCampo}
          />

          {mensagem && (
            <div className="md:col-span-2"><AdminNotice type={mensagemErro ? "error" : undefined}><span>{mensagem}{import.meta.env.DEV && erroTecnico && <small className="mt-2 block whitespace-pre-wrap font-mono">{JSON.stringify(erroTecnico, null, 2)}</small>}</span></AdminNotice></div>
          )}

          <div className="md:col-span-2 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={carregando}
              className={adminButtonClass("primary")}
            >
              <Save size={17}/>{carregando ? "Salvando..." : "Salvar vaga"}
            </button>
            <a href="/admin" className={adminButtonClass("secondary")}><X size={17}/>Cancelar</a>
          </div>
        </form>
      </section>
    </main>
  );
}

function Campo({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
  min,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (
    evento: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  min?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[#052656]">
        {label}{required && <span className="ml-1 text-red-700" aria-hidden="true">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        min={min}
        step={type === "number" ? "1" : undefined}
        className={adminInputClass}
      />
    </div>
  );
}

function AreaTexto({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (
    evento: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
}) {
  return (
    <div className="md:col-span-2">
      <label className="mb-2 block text-sm font-semibold text-[#052656]">
        {label}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={4}
        className={`${adminInputClass} resize-y`}
      />
    </div>
  );
}
