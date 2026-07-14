import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, ArrowRight, Ban, BriefcaseBusiness, CheckCircle2, ChevronDown, ChevronUp, FilterX, MessageCircle, Pencil, Plus, RefreshCw, Trash2, UserRound, UsersRound } from "lucide-react";
import AdminNav from "../components/AdminNav";
import { AdminNotice, AdminSkeleton, ConfirmDialog, adminButtonClass, adminInputClass, adminTableHeadClass, adminTableRowClass } from "../components/AdminUI";
import { supabase } from "../lib/supabase";
import { formatarQuantidadeVagas } from "../lib/formatarQuantidadeVagas";
import { applicationCounts, listApplications, updateApplicationStage } from "../services/applications";
import { listCandidates } from "../services/candidates";
import { deleteJob, listJobs, updateJobStatus } from "../services/jobs";
import type { Job, JobStatus } from "../types/jobs";
import { ETAPAS, type CandidaturaDetalhada, type EtapaProcesso } from "../types/candidates";

export default function AdminDashboardPage() {
  const [vagas, setVagas] = useState<Job[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [processando, setProcessando] = useState<string | number | null>(null);
  const [totalCandidatos, setTotalCandidatos] = useState(0);
  const [etapas, setEtapas] = useState<EtapaProcesso[]>([]);
  const [candidaturas, setCandidaturas] = useState<CandidaturaDetalhada[]>([]);
  const [vagaParaExcluir, setVagaParaExcluir] = useState<Job | null>(null);
  const [buscaCandidato, setBuscaCandidato] = useState("");
  const [filtroVaga, setFiltroVaga] = useState("");
  const [filtroEtapa, setFiltroEtapa] = useState("");
  const [vagaDetalhada, setVagaDetalhada] = useState<string | null>(null);
  const [erroResumo, setErroResumo] = useState("");
  const [candidaturaAtualizando, setCandidaturaAtualizando] = useState<string | null>(null);

  const carregarVagas = useCallback(async () => {
    setErro("");
    try {
      const jobs = await listJobs();
      setVagas(jobs);
      try {
        const [candidates, stages, applications] = await Promise.all([listCandidates(), applicationCounts(), listApplications()]);
        setTotalCandidatos(candidates.length);
        setEtapas(stages.map((item) => item.etapa));
        setCandidaturas(applications);
      } catch (candidateError) {
        if (import.meta.env.DEV) console.error(candidateError);
        setErroResumo("Não foi possível carregar o resumo de candidatos por vaga.");
      }
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

  const candidaturasFiltradas = useMemo(() => candidaturas.filter((item) => {
    const correspondeNome = item.candidato.nome.toLocaleLowerCase("pt-BR").includes(buscaCandidato.toLocaleLowerCase("pt-BR"));
    const correspondeVaga = !filtroVaga || String(item.vaga_id) === filtroVaga;
    const correspondeEtapa = !filtroEtapa || item.etapa === filtroEtapa;
    return correspondeNome && correspondeVaga && correspondeEtapa;
  }), [candidaturas, buscaCandidato, filtroVaga, filtroEtapa]);

  const vagasDoResumo = useMemo(() => vagas.filter((vaga) => {
    if (vaga.status === "excluida") return false;
    if (filtroVaga && String(vaga.id) !== filtroVaga) return false;
    if ((buscaCandidato || filtroEtapa) && !candidaturasFiltradas.some((item) => String(item.vaga_id) === String(vaga.id))) return false;
    return true;
  }), [vagas, filtroVaga, buscaCandidato, filtroEtapa, candidaturasFiltradas]);

  async function alterarStatus(id: string | number, status: JobStatus, mensagemSucesso?: string) {
    setProcessando(id);
    setMensagem("");
    setErro("");
    try {
      await updateJobStatus(id, status);
      setMensagem(mensagemSucesso ?? `Vaga alterada para ${status} com sucesso.`);
      await carregarVagas();
    } catch (error) {
      if (import.meta.env.DEV) console.error(error);
      setErro("Não foi possível alterar o status da vaga.");
    } finally {
      setProcessando(null);
    }
  }

  async function excluir() {
    if (!vagaParaExcluir) return;
    const id = vagaParaExcluir.id;
    setProcessando(id);
    setMensagem("");
    setErro("");
    try {
      await deleteJob(id);
      setMensagem("Vaga excluída com sucesso.");
      setVagaParaExcluir(null);
      await carregarVagas();
    } catch (error) {
      if (import.meta.env.DEV) console.error(error);
      setErro("Não foi possível excluir a vaga.");
    } finally {
      setProcessando(null);
    }
  }

  async function alterarEtapaCandidatura(id: string, etapa: EtapaProcesso) {
    setCandidaturaAtualizando(id);
    setErroResumo("");
    try {
      await updateApplicationStage(id, etapa);
      const atualizadas = candidaturas.map((item) => item.id === id ? { ...item, etapa, updated_at: new Date().toISOString() } : item);
      setCandidaturas(atualizadas);
      setEtapas(atualizadas.map((item) => item.etapa));
      setMensagem("Etapa do candidato atualizada com sucesso.");
    } catch (error) {
      if (import.meta.env.DEV) console.error(error);
      setErroResumo("Não foi possível atualizar a etapa do candidato.");
    } finally {
      setCandidaturaAtualizando(null);
    }
  }

  function limparFiltrosResumo() {
    setBuscaCandidato("");
    setFiltroVaga("");
    setFiltroEtapa("");
  }

  if (carregando) {
    return <main className="min-h-screen bg-[#F5F7FA]"><AdminNav/><div className="mx-auto max-w-7xl px-5 py-10"><AdminSkeleton rows={6}/></div></main>;
  }

  return (
    <main className="min-h-screen bg-[#F5F7FA]">
      <AdminNav/>
      <section className="mx-auto max-w-7xl px-5 py-10">
        <h1 className="font-['Playfair_Display',serif] text-3xl font-semibold text-[#052656]">Bem-vinda ao painel administrativo</h1>
        <p className="mt-3 text-lg text-gray-600">Aqui você poderá cadastrar, editar, publicar e encerrar as vagas e saber detalhes dos candidatos.</p>
        {erro && <AdminNotice type="error">{erro}</AdminNotice>}
        {mensagem && <AdminNotice>{mensagem}</AdminNotice>}
        <section className="mt-10 border border-gray-200 bg-white p-5 shadow-sm sm:p-7" aria-labelledby="resumo-vagas">
          <h2 id="resumo-vagas" className="flex items-center gap-3 text-2xl font-semibold text-[#052656]"><BriefcaseBusiness className="text-[#D4A62A]"/>Resumo de vagas</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-3">
            <Contador titulo="Vagas abertas" total={totais.publicada}/>
            <Contador titulo="Vagas pendentes" total={totais.rascunho}/>
            <Contador titulo="Vagas encerradas" total={totais.encerrada}/>
          </div>
        </section>
        <section className="mt-8 border border-gray-200 bg-white p-5 shadow-sm sm:p-7" aria-labelledby="resumo-candidatos">
          <h2 id="resumo-candidatos" className="flex items-center gap-3 text-2xl font-semibold text-[#052656]"><UsersRound className="text-[#D4A62A]"/>Resumo de candidatos</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Contador titulo="Total de candidatos" total={totalCandidatos}/>
            <Contador titulo="Em triagem" total={etapas.filter((item) => item === "triagem").length}/>
            <Contador titulo="Entrevistas agendadas" total={etapas.filter((item) => item === "entrevista_agendada").length}/>
            <Contador titulo="Encaminhados ao cliente" total={etapas.filter((item) => item === "encaminhado_cliente").length}/>
            <Contador titulo="Aprovados" total={etapas.filter((item) => item === "aprovado").length}/>
            <Contador titulo="Banco de talentos" total={etapas.filter((item) => item === "banco_talentos").length}/>
          </div>
        </section>
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <section className="border border-gray-200 bg-white p-6 shadow-sm"><h2 className="flex items-center gap-3 text-xl font-semibold text-[#052656]"><Activity className="text-[#D4A62A]"/>Atividade recente</h2><p className="mt-6 text-gray-600">Nenhuma atividade recente.</p></section>
          <section className="border border-gray-200 bg-white p-6 shadow-sm"><h2 className="flex items-center gap-3 text-xl font-semibold text-[#052656]"><BriefcaseBusiness className="text-[#D4A62A]"/>Últimas vagas</h2><div className="mt-5 space-y-3">{vagas.slice(0, 4).map((vaga) => <article key={vaga.id} className="border-b border-gray-100 pb-3 last:border-0"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="break-words font-semibold text-[#052656]">{vaga.titulo} — {formatarQuantidadeVagas(vaga.quantidade_vagas)}</h3><p className="mt-1 text-sm text-gray-600">{vaga.cidade} · <span className="capitalize">{vaga.status === "excluida" ? "Excluída" : vaga.status}</span></p></div><a href={`/admin/vagas/${vaga.id}/editar`} className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[#052656] hover:text-[#D4A62A]">Ver vaga<ArrowRight size={15}/></a></div></article>)}{vagas.length === 0 && <p className="text-gray-600">Nenhuma vaga cadastrada.</p>}</div></section>
          <section className="border border-gray-200 bg-white p-6 shadow-sm"><h2 className="flex items-center gap-3 text-xl font-semibold text-[#052656]"><UsersRound className="text-[#D4A62A]"/>Últimos candidatos</h2><div className="mt-5 space-y-3">{candidaturas.filter((item, index, list) => list.findIndex((other) => other.candidato_id === item.candidato_id) === index).slice(0, 4).map((item) => <article key={item.candidato_id} className="border-b border-gray-100 pb-3 last:border-0"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-[#052656]">{item.candidato.nome}</h3><p className="mt-1 text-sm text-gray-600">{item.vaga?.titulo ?? "Sem vaga"} · {item.etapa.replaceAll("_", " ")}</p></div><a href={`/admin/candidatos/${item.candidato_id}`} className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[#052656] hover:text-[#D4A62A]">Ver perfil<ArrowRight size={15}/></a></div></article>)}{candidaturas.length === 0 && <p className="text-gray-600">Nenhum candidato recente.</p>}</div></section>
        </div>
        <ResumoPorVaga
          vagas={vagasDoResumo}
          candidaturas={candidaturasFiltradas}
          todasAsVagas={vagas}
          busca={buscaCandidato}
          filtroVaga={filtroVaga}
          filtroEtapa={filtroEtapa}
          vagaDetalhada={vagaDetalhada}
          atualizando={candidaturaAtualizando}
          erro={erroResumo}
          onBusca={setBuscaCandidato}
          onFiltroVaga={setFiltroVaga}
          onFiltroEtapa={setFiltroEtapa}
          onDetalhes={setVagaDetalhada}
          onLimpar={limparFiltrosResumo}
          onAlterarEtapa={alterarEtapaCandidatura}
        />
        <a href="/admin/nova-vaga" className={`mt-8 ${adminButtonClass("primary")}`}><Plus size={17}/>Nova vaga</a>
        <div id="vagas" className="mt-8 scroll-mt-6 overflow-x-auto bg-white shadow-sm">
          {vagas.length === 0 ? <p className="p-8 text-center text-gray-600">Nenhuma vaga cadastrada.</p> : (
            <table className="w-full min-w-[980px] text-left">
              <thead className={adminTableHeadClass}><tr>{["Título", "Cidade", "Contrato", "Modalidade", "Status", "Criação", "Ações"].map((item) => <th key={item} className="px-4 py-3">{item}</th>)}</tr></thead>
              <tbody>{vagas.map((vaga) => <tr key={vaga.id} className={`${adminTableRowClass} ${vaga.status === "encerrada" || vaga.status === "excluida" ? "bg-gray-200 text-gray-500" : ""}`}>
                <td className="px-4 py-4 font-semibold text-[#052656]">{vaga.titulo} — {formatarQuantidadeVagas(vaga.quantidade_vagas)}</td><td className="px-4 py-4">{vaga.cidade}</td><td className="px-4 py-4">{vaga.tipo_contrato || "—"}</td><td className="px-4 py-4">{vaga.modalidade || "—"}</td><td className={`px-4 py-4 font-semibold capitalize ${vaga.status === "publicada" ? "text-green-600" : vaga.status === "encerrada" ? "text-[#D4A62A]" : vaga.status === "excluida" ? "text-red-700" : ""}`}>{vaga.status === "excluida" ? "Excluída" : vaga.status}</td><td className="px-4 py-4">{new Intl.DateTimeFormat("pt-BR").format(new Date(vaga.created_at))}</td>
                <td className="px-4 py-4">{vaga.status === "excluida" ? <span className="font-semibold text-red-700">Vaga excluída</span> : <div className="flex flex-wrap gap-2"><a href={`/admin/vagas/${vaga.id}/editar`} className={adminButtonClass("secondary")}><Pencil size={15} aria-hidden="true"/>Editar</a>{vaga.status === "rascunho" && <Acao onClick={() => alterarStatus(vaga.id, "publicada")} disabled={processando === vaga.id} verde><CheckCircle2 size={15}/>Publicar</Acao>}{vaga.status === "publicada" && <Acao onClick={() => alterarStatus(vaga.id, "encerrada")} disabled={processando === vaga.id}><Ban size={15}/>Encerrar</Acao>}{vaga.status === "encerrada" && <Acao onClick={() => alterarStatus(vaga.id, "publicada", "Vaga reaberta com sucesso.")} disabled={processando === vaga.id} verde><RefreshCw size={15}/>Reabrir vaga</Acao>}<button type="button" onClick={() => setVagaParaExcluir(vaga)} disabled={processando === vaga.id} className={adminButtonClass("danger")}><Trash2 size={15} aria-hidden="true"/>Excluir</button></div>}</td>
              </tr>)}</tbody>
            </table>
          )}
        </div>
      </section>
      <ConfirmDialog open={Boolean(vagaParaExcluir)} title="Excluir vaga" description={`Tem certeza que deseja excluir a vaga “${vagaParaExcluir?.titulo ?? ""}”? Ela ficará marcada como excluída.`} loading={processando === vagaParaExcluir?.id} onCancel={() => setVagaParaExcluir(null)} onConfirm={() => void excluir()}/>
    </main>
  );
}

function ResumoPorVaga({ vagas, candidaturas, todasAsVagas, busca, filtroVaga, filtroEtapa, vagaDetalhada, atualizando, erro, onBusca, onFiltroVaga, onFiltroEtapa, onDetalhes, onLimpar, onAlterarEtapa }: {
  vagas: Job[];
  candidaturas: CandidaturaDetalhada[];
  todasAsVagas: Job[];
  busca: string;
  filtroVaga: string;
  filtroEtapa: string;
  vagaDetalhada: string | null;
  atualizando: string | null;
  erro: string;
  onBusca: (value: string) => void;
  onFiltroVaga: (value: string) => void;
  onFiltroEtapa: (value: string) => void;
  onDetalhes: (value: string | null) => void;
  onLimpar: () => void;
  onAlterarEtapa: (id: string, etapa: EtapaProcesso) => Promise<void>;
}) {
  return <section className="mt-8 border border-gray-200 bg-white p-5 shadow-sm sm:p-7" aria-labelledby="resumo-por-vaga">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 id="resumo-por-vaga" className="text-2xl font-semibold text-[#052656]">Resumo por vaga</h2><p className="mt-1 text-gray-600">Acompanhe candidatos e etapas de cada processo.</p></div><button type="button" onClick={onLimpar} className={adminButtonClass("secondary")}><FilterX size={17}/>Limpar filtros</button></div>
    <div className="mt-6 grid gap-4 md:grid-cols-3"><label><span className="mb-2 block font-semibold text-[#052656]">Buscar candidato</span><input value={busca} onChange={(event) => onBusca(event.target.value)} placeholder="Nome do candidato" className={adminInputClass}/></label><label><span className="mb-2 block font-semibold text-[#052656]">Filtrar por vaga</span><select value={filtroVaga} onChange={(event) => onFiltroVaga(event.target.value)} className={adminInputClass}><option value="">Todas as vagas</option>{todasAsVagas.filter((vaga) => vaga.status !== "excluida").map((vaga) => <option key={vaga.id} value={vaga.id}>{vaga.titulo}</option>)}</select></label><label><span className="mb-2 block font-semibold text-[#052656]">Filtrar por etapa</span><select value={filtroEtapa} onChange={(event) => onFiltroEtapa(event.target.value)} className={adminInputClass}><option value="">Todas as etapas</option>{ETAPAS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label></div>
    {erro && <AdminNotice type="error">{erro}</AdminNotice>}
    {vagas.length === 0 ? <p className="mt-6 border border-dashed border-gray-300 p-8 text-center text-gray-600">Nenhuma vaga ou candidato corresponde aos filtros selecionados.</p> : <div className="mt-6 space-y-5">{vagas.map((vaga) => {
      const items = candidaturas.filter((item) => String(item.vaga_id) === String(vaga.id));
      const aberta = vagaDetalhada === String(vaga.id);
      return <article key={vaga.id} className="w-full border border-gray-200 bg-[#F5F7FA] p-5 transition hover:border-[#D4A62A] sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4"><button type="button" onClick={() => onDetalhes(aberta ? null : String(vaga.id))} className="min-w-0 text-left"><h3 className="break-words text-xl font-semibold text-[#052656] hover:text-[#D4A62A]">{vaga.titulo} — {formatarQuantidadeVagas(vaga.quantidade_vagas)}</h3><p className="mt-1 text-gray-600">{items.length} {items.length === 1 ? "candidato vinculado" : "candidatos vinculados"}</p></button><button type="button" onClick={() => onDetalhes(aberta ? null : String(vaga.id))} className={adminButtonClass("secondary")}>{aberta ? <ChevronUp size={17}/> : <ChevronDown size={17}/>}Ver detalhes</button></div>
        <div className="mt-4 flex flex-wrap gap-2">{ETAPAS.map((etapa) => { const total = items.filter((item) => item.etapa === etapa.value).length; return total > 0 ? <span key={etapa.value} className="border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-[#052656]">{etapa.label}: {total}</span> : null; })}{items.length === 0 && <span className="text-sm text-gray-500">Nenhum candidato nesta vaga.</span>}</div>
        {aberta && <div className="mt-6 border-t border-gray-200 pt-5">{items.length === 0 ? <p className="text-gray-600">Nenhum candidato para exibir.</p> : <div className="grid gap-4">{items.map((item) => {
          const rawPhone = item.candidato.telefone?.replace(/\D/g, "") ?? "";
          const phone = rawPhone.startsWith("55") ? rawPhone : rawPhone ? `55${rawPhone}` : "";
          return <div key={item.id} className="grid gap-4 border border-gray-200 bg-white p-4 md:grid-cols-[1fr_220px_auto] md:items-center"><div><h4 className="font-semibold text-[#052656]">{item.candidato.nome}</h4><p className="mt-1 text-sm text-gray-600">{item.candidato.telefone || "Telefone não informado"} · Cadastro em {new Intl.DateTimeFormat("pt-BR").format(new Date(item.candidato.created_at))}</p></div><label><span className="sr-only">Etapa de {item.candidato.nome}</span><select value={item.etapa} onChange={(event) => void onAlterarEtapa(item.id, event.target.value as EtapaProcesso)} disabled={atualizando === item.id} className={adminInputClass}>{ETAPAS.map((etapa) => <option key={etapa.value} value={etapa.value}>{etapa.label}</option>)}</select></label><div className="flex flex-wrap gap-2"><a href={`/admin/candidatos/${item.candidato_id}`} className={adminButtonClass("secondary")}><UserRound size={16}/>Ver perfil</a>{phone && <a href={`https://wa.me/${phone}`} target="_blank" rel="noopener noreferrer" className={adminButtonClass("success")}><MessageCircle size={16}/>WhatsApp</a>}</div></div>;
        })}</div>}</div>}
      </article>;
    })}</div>}
  </section>;
}

function Contador({ titulo, total }: { titulo: string; total: number }) { return <article className="border border-gray-100 bg-[#F5F7FA] p-6 transition hover:-translate-y-0.5 hover:shadow-md"><p className="text-sm font-semibold uppercase tracking-wide text-gray-500">{titulo}</p><p className="mt-3 text-4xl font-bold text-[#052656]">{total}</p></article>; }
function Acao({ children, onClick, disabled, verde = false }: { children: React.ReactNode; onClick: () => void; disabled: boolean; verde?: boolean }) { return <button type="button" onClick={onClick} disabled={disabled} className={adminButtonClass(verde ? "success" : "primary")}>{children}</button>; }
