import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { createJob } from "../services/jobs";
import type { JobFormData } from "../types/jobs";

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
    status: "publicada",
  });

  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) window.location.href = "/admin/login";
    });
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
    setCarregando(true);
    setMensagem("");

    try {
      await createJob(formulario);
      setMensagem("Vaga salva com sucesso.");
      window.setTimeout(() => {
        window.location.href = "/admin";
      }, 700);
      return;
    } catch (error) {
      if (import.meta.env.DEV) console.error(error);
      setMensagem("Não foi possível salvar a vaga.");
      setCarregando(false);
      return;
    }

  }

  return (
    <main className="min-h-screen bg-[#F5F7FA]">
      <header className="bg-[#052656] px-5 py-5">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <img
            src="/assets/hr-consultoria-logo-white.png"
            alt="HR Consultoria de RH"
            className="h-auto w-[110px] max-w-[35vw] sm:w-[140px]"
          />

          <a
            href="/admin"
            className="bg-[#D4A62A] px-5 py-2 font-semibold text-[#052656]"
          >
            Voltar
          </a>
        </div>
      </header>

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

          <Campo
            label="Empresa"
            name="empresa"
            value={formulario.empresa}
            onChange={alterarCampo}
          />

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
              className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-[#D4A62A]"
            >
              <option value="publicada">Publicada</option>
              <option value="rascunho">Rascunho</option>
              <option value="encerrada">Encerrada</option>
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
            <p className="md:col-span-2 text-sm font-medium text-red-600">
              {mensagem}
            </p>
          )}

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={carregando}
              className="bg-[#D4A62A] px-6 py-3 font-semibold text-[#052656] disabled:opacity-60"
            >
              {carregando ? "Salvando..." : "Salvar vaga"}
            </button>
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
        {label}
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
        className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-[#D4A62A]"
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
        className="w-full resize-y border border-gray-300 px-4 py-3 outline-none focus:border-[#D4A62A]"
      />
    </div>
  );
}
