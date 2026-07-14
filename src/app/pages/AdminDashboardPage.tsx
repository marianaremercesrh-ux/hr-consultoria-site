import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { deleteJob, listJobs, updateJobStatus } from "../services/jobs";
import type { Job, JobStatus } from "../types/jobs";

export default function AdminDashboardPage() {
  const [vagas, setVagas] = useState<Job[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [processando, setProcessando] = useState<string | number | null>(null);

  const carregarVagas = useCallback(async () => {
    setErro("");
    try {
      setVagas(await listJobs());
    } catch (error) {
      if (import.meta.env.DEV) console.error(error);
      setErro("Não foi possível carregar as vagas.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        window.location.href = "/admin/login";
        return;
      }
      void carregarVagas();
    });
  }, [carregarVagas]);

  const totais = useMemo(() => ({
    publicada: vagas.filter((vaga) => vaga.status === "publicada").length,
    rascunho: vagas.filter((vaga) => vaga.status === "rascunho").length,
    encerrada: vagas.filter((vaga) => vaga.status === "encerrada").length,
  }), [vagas]);

  async function alterarStatus(id: string | number, status: JobStatus) {
    setProcessando(id);
    setMensagem("");
    setErro("");
    try {
      await updateJobStatus(id, status);
      setMensagem(`Vaga alterada para ${status} com sucesso.`);
      await carregarVagas();
    } catch (error) {
      if (import.meta.env.DEV) console.error(error);
      setErro("Não foi possível alterar o status da vaga.");
    } finally {
      setProcessando(null);
    }
  }

  async function excluir(id: string | number) {
    if (!window.confirm("Tem certeza que deseja excluir esta vaga?")) return;
    setProcessando(id);
    setMensagem("");
    setErro("");
    try {
      await deleteJob(id);
      setMensagem("Vaga excluída com sucesso.");
      await carregarVagas();
    } catch (error) {
      if (import.meta.env.DEV) console.error(error);
      setErro("Não foi possível excluir a vaga.");
    } finally {
      setProcessando(null);
    }
  }

  async function sair() {
    await supabase.auth.signOut();
    window.location.href = "/vagas";
  }

  if (carregando) {
    return <main className="min-h-screen bg-[#052656] flex flex-col items-center justify-center px-5"><img src="/assets/hr-consultoria-logo-white.png" alt="HR Consultoria de RH" className="mb-6 h-auto w-[170px] max-w-full"/><p className="text-white text-lg">Carregando painel...</p></main>;
  }

  return (
    <main className="min-h-screen bg-[#F5F7FA]">
      <header className="bg-[#052656] px-5 py-5"><div className="mx-auto flex max-w-7xl items-center justify-between"><img src="/assets/hr-consultoria-logo-white.png" alt="HR Consultoria de RH" className="h-auto w-[110px] max-w-[35vw] sm:w-[140px]"/><button type="button" onClick={sair} className="bg-[#D4A62A] px-5 py-2 font-semibold text-[#052656]">Sair</button></div></header>
      <section className="mx-auto max-w-7xl px-5 py-10">
        <h1 className="font-['Playfair_Display',serif] text-3xl font-semibold text-[#052656]">Bem-vinda ao painel administrativo</h1>
        <p className="mt-3 text-lg text-gray-600">Aqui você poderá cadastrar, editar, publicar e encerrar as vagas.</p>
        {erro && <p className="mt-6 bg-red-50 p-4 text-red-700" role="alert">{erro}</p>}
        {mensagem && <p className="mt-6 bg-green-50 p-4 text-green-700" role="status">{mensagem}</p>}
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <Contador titulo="Vagas abertas" total={totais.publicada}/>
          <Contador titulo="Vagas pendentes" total={totais.rascunho}/>
          <Contador titulo="Vagas encerradas" total={totais.encerrada}/>
        </div>
        <a href="/admin/nova-vaga" className="mt-8 inline-block bg-[#D4A62A] px-6 py-3 font-semibold text-[#052656]">Nova vaga</a>
        <div className="mt-8 overflow-x-auto bg-white shadow-sm">
          {vagas.length === 0 ? <p className="p-8 text-center text-gray-600">Nenhuma vaga cadastrada.</p> : (
            <table className="w-full min-w-[980px] text-left">
              <thead className="bg-[#052656] text-white"><tr>{["Título", "Cidade", "Contrato", "Modalidade", "Status", "Criação", "Ações"].map((item) => <th key={item} className="px-4 py-3">{item}</th>)}</tr></thead>
              <tbody>{vagas.map((vaga) => <tr key={vaga.id} className={`border-b border-gray-200 ${vaga.status === "encerrada" || vaga.status === "excluida" ? "bg-gray-200 text-gray-500" : ""}`}>
                <td className="px-4 py-4 font-semibold text-[#052656]">{vaga.titulo}</td><td className="px-4 py-4">{vaga.cidade}</td><td className="px-4 py-4">{vaga.tipo_contrato || "—"}</td><td className="px-4 py-4">{vaga.modalidade || "—"}</td><td className={`px-4 py-4 font-semibold capitalize ${vaga.status === "publicada" ? "text-green-600" : vaga.status === "encerrada" ? "text-[#D4A62A]" : vaga.status === "excluida" ? "text-red-700" : ""}`}>{vaga.status === "excluida" ? "Excluída" : vaga.status}</td><td className="px-4 py-4">{new Intl.DateTimeFormat("pt-BR").format(new Date(vaga.created_at))}</td>
                <td className="px-4 py-4">{vaga.status === "excluida" ? <span className="font-semibold text-red-700">Vaga excluída</span> : <div className="flex flex-wrap gap-2"><a href={`/admin/vagas/${vaga.id}/editar`} className="inline-flex items-center gap-2 border border-[#052656] px-3 py-2 text-sm font-semibold text-[#052656]"><Pencil size={15} aria-hidden="true"/>Editar</a>{vaga.status !== "publicada" && <Acao onClick={() => alterarStatus(vaga.id, "publicada")} disabled={processando === vaga.id} verde>Publicar</Acao>}{vaga.status !== "encerrada" && <Acao onClick={() => alterarStatus(vaga.id, "encerrada")} disabled={processando === vaga.id}>Encerrar</Acao>}<button type="button" onClick={() => excluir(vaga.id)} disabled={processando === vaga.id} className="inline-flex items-center gap-2 bg-red-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"><Trash2 size={15} aria-hidden="true"/>Excluir</button></div>}</td>
              </tr>)}</tbody>
            </table>
          )}
        </div>
      </section>
    </main>
  );
}

function Contador({ titulo, total }: { titulo: string; total: number }) { return <article className="bg-white p-6 shadow-sm"><p className="text-sm font-semibold uppercase tracking-wide text-gray-500">{titulo}</p><p className="mt-3 text-4xl font-bold text-[#052656]">{total}</p></article>; }
function Acao({ children, onClick, disabled, verde = false }: { children: React.ReactNode; onClick: () => void; disabled: boolean; verde?: boolean }) { return <button type="button" onClick={onClick} disabled={disabled} className={`${verde ? "bg-green-600 text-white" : "bg-[#D4A62A] text-[#052656]"} px-3 py-2 text-sm font-semibold disabled:opacity-60`}>{children}</button>; }
